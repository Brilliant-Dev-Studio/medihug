import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import type { Prisma } from '@/app/generated/prisma/client';
import type { Role } from '@/app/generated/prisma/enums';

/* One phone number = one User row, but each role on it (patient / doctor / partner) has its
 * own password. The role a User was first created with keeps using User.password (so every
 * existing login keeps working untouched); roles added later store theirs in RoleCredential.
 * Login routes must go through these helpers instead of comparing User.password directly. */

type DbClient = typeof db | Prisma.TransactionClient;

export interface RoleUser { id: string; role: Role; password: string }

export class RoleAlreadyGrantedError extends Error {
  constructor(public role: Role) {
    super(`Phone already has the ${role} role`);
  }
}

/** The bcrypt hash guarding `role` for this user, or null if they don't hold that role. */
export async function getRoleHash(user: RoleUser, role: Role, client: DbClient = db): Promise<string | null> {
  const credential = await client.roleCredential.findUnique({
    where: { userId_role: { userId: user.id, role } },
    select: { password: true },
  });
  if (credential) return credential.password;
  return user.role === role ? user.password : null;
}

export async function hasRole(user: RoleUser, role: Role, client: DbClient = db): Promise<boolean> {
  return (await getRoleHash(user, role, client)) !== null;
}

/** True only when the user holds `role` AND `password` is that role's password. */
export async function verifyRolePassword(user: RoleUser, role: Role, password: string): Promise<boolean> {
  const hash = await getRoleHash(user, role);
  return hash !== null && bcrypt.compare(password, hash);
}

/** Every role this user holds: the one they were created with plus any added credentials. */
export async function rolesOf(user: { id: string; role: Role }, client: DbClient = db): Promise<Role[]> {
  const extra = await client.roleCredential.findMany({ where: { userId: user.id }, select: { role: true } });
  return [...new Set<Role>([user.role, ...extra.map(c => c.role)])];
}

/** Sets/replaces the password for one role, leaving the user's other roles' passwords alone. */
export async function setRolePassword(userId: string, role: Role, plainPassword: string, client: DbClient = db): Promise<void> {
  const user = await client.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return;
  const hash = await bcrypt.hash(plainPassword, 12);
  if (user.role === role) {
    await client.user.update({ where: { id: userId }, data: { password: hash } });
    return;
  }
  await client.roleCredential.upsert({
    where: { userId_role: { userId, role } },
    create: { userId, role, password: hash },
    update: { password: hash },
  });
}

/** Gives `role` to the user with this phone — creating the user if the phone is new, or adding a
 * separate credential if the phone already belongs to someone with other roles. Throws
 * RoleAlreadyGrantedError if the phone already holds that role. Run inside the caller's
 * transaction so the user row and the profile row it belongs to are created together. */
export async function grantRole(
  tx: Prisma.TransactionClient,
  input: { name: string; phone: string; role: Role; password: string },
): Promise<{ id: string; created: boolean }> {
  const existing = await tx.user.findUnique({ where: { phone: input.phone }, select: { id: true, role: true, password: true } });
  const hash = await bcrypt.hash(input.password, 12);

  if (!existing) {
    const user = await tx.user.create({
      data: { name: input.name, phone: input.phone, password: hash, role: input.role, isActive: true },
      select: { id: true },
    });
    return { id: user.id, created: true };
  }

  if (await hasRole(existing, input.role, tx)) throw new RoleAlreadyGrantedError(input.role);

  await tx.roleCredential.create({ data: { userId: existing.id, role: input.role, password: hash } });
  return { id: existing.id, created: false };
}

/** Maps the "which account?" choice on the forgot-password screen to a concrete role the user
 * actually holds — 'ADMIN' means whichever admin-tier role their account was created with.
 * Returns null if they don't hold it. Omitting `requested` keeps the old behaviour: the role the
 * account was created with, as long as it isn't a plain patient (patients have no password). */
export async function resolveResetRole(
  user: { id: string; role: Role; password: string },
  requested: string | undefined,
  isAdminRole: (r: string) => boolean,
  client: DbClient = db,
): Promise<Role | null> {
  let target: Role | null;
  if (requested === 'DOCTOR' || requested === 'PARTNER') target = requested;
  else if (requested === 'ADMIN') target = isAdminRole(user.role) ? user.role : null;
  else if (requested === undefined) target = user.role;
  else target = null;

  if (!target || target === 'PATIENT') return null;
  return (await hasRole(user, target, client)) ? target : null;
}

/** Users who are patients: created as one, or who registered as a patient on a phone that
 * already held another role (doctor/partner...). Use instead of `{ role: 'PATIENT' }`. */
export const patientWhere: Prisma.UserWhereInput = {
  OR: [{ role: 'PATIENT' }, { roleCredentials: { some: { role: 'PATIENT' } } }],
};

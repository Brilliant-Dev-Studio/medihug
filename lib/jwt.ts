import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'medihug_fallback_secret'
);

export interface AdminTokenPayload {
  id:       string;
  name:     string;
  phone:    string;
  role:     string;
  doctorId?: string;
  clinicId?: string;
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('60d')
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

// Doctor and Partner sessions reuse the same JWT shape/secret, just a different cookie name.
export const signDoctorToken   = signAdminToken;
export const verifyDoctorToken = verifyAdminToken;
export const signPartnerToken   = signAdminToken;
export const verifyPartnerToken = verifyAdminToken;

export interface ResetTokenPayload {
  userId: string;
  phone:  string;
  purpose: 'password_reset';
}

// Short-lived token proving OTP was verified — presented to /reset to actually change the password.
export async function signResetToken(payload: ResetTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(SECRET);
}

export async function verifyResetToken(token: string): Promise<ResetTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.purpose !== 'password_reset') return null;
    return payload as unknown as ResetTokenPayload;
  } catch {
    return null;
  }
}

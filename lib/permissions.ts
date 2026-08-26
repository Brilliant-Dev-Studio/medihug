export type Permission =
  | 'admins.manage'
  | 'settings.manage'
  | 'partners.manage'
  | 'pos.manage'
  | 'pos.delete'
  | 'support.manage'
  | 'video.moderate'
  | 'dashboard.view';

export const ADMIN_ROLES = [
  'SUPER_ADMIN', 'CO_ADMIN', 'PARTNER_MANAGER', 'POS_ADMIN', 'SUPPORT_ADMIN', 'MODERATOR',
] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export function isAdminRole(role: string): role is AdminRole {
  return (ADMIN_ROLES as readonly string[]).includes(role);
}

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    'admins.manage', 'settings.manage', 'partners.manage',
    'pos.manage', 'pos.delete', 'support.manage', 'video.moderate', 'dashboard.view',
  ],
  CO_ADMIN: [
    'partners.manage', 'pos.manage', 'support.manage', 'video.moderate', 'dashboard.view',
  ],
  PARTNER_MANAGER: ['partners.manage'],
  POS_ADMIN: ['pos.manage'],
  SUPPORT_ADMIN: ['support.manage'],
  MODERATOR: ['video.moderate'],
};

/** Roles allowed to review/approve POS/Finance deletion requests — must match whoever
 * actually holds the 'pos.delete' permission above, or approvers get notified but 403
 * when they try to act. */
export const DELETION_APPROVER_ROLES: AdminRole[] = ['SUPER_ADMIN'];

export function hasPermission(role: string, perm: Permission): boolean {
  if (!isAdminRole(role)) return false;
  return ROLE_PERMISSIONS[role].includes(perm);
}

/** Nav sections a role can see, for sidebar scoping in app/admin/layout.tsx. */
export function permissionsForRole(role: string): Permission[] {
  return isAdminRole(role) ? ROLE_PERMISSIONS[role] : [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission / RBAC types — Phase 3 enterprise architecture.
//
// Current production state: admin | member (DB column 'role').
// This file maps the current model onto a full role hierarchy and defines the
// permission matrix for clean future expansion to manager, viewer, department
// roles — without breaking existing admin/member logic.
// ─────────────────────────────────────────────────────────────────────────────

// ── Role hierarchy — owner > admin > manager > contributor > viewer ───────────
export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'contributor' | 'viewer'

/** Current values stored in the DB profiles.role column */
export type DBRole = 'admin' | 'member'

/** Maps current DB roles to the extended role model */
export function dbRoleToWorkspaceRole(role: DBRole): WorkspaceRole {
  return role === 'admin' ? 'admin' : 'contributor'
}

// ── Granular permission actions ───────────────────────────────────────────────
export type PermissionAction =
  // Ideas
  | 'ideas:create'
  | 'ideas:edit_own'
  | 'ideas:edit_any'
  | 'ideas:delete_own'
  | 'ideas:delete_any'
  | 'ideas:mark_planned'
  // IdeaFlows
  | 'flows:create'
  | 'flows:edit'
  | 'flows:delete'
  | 'flows:open'
  | 'flows:close'
  // Members
  | 'members:invite'
  | 'members:remove'
  | 'members:view_all'
  | 'members:assign_role'
  // Analytics
  | 'analytics:view'
  | 'analytics:export'
  // Reports
  | 'reports:generate'
  | 'reports:schedule'
  | 'reports:view_all'
  // Billing
  | 'billing:view'
  | 'billing:manage'
  // Workspace
  | 'workspace:settings'
  | 'workspace:delete'

// ── Role → permission matrix ──────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<WorkspaceRole, Set<PermissionAction>> = {
  owner: new Set<PermissionAction>([
    'ideas:create', 'ideas:edit_own', 'ideas:edit_any',
    'ideas:delete_own', 'ideas:delete_any', 'ideas:mark_planned',
    'flows:create', 'flows:edit', 'flows:delete', 'flows:open', 'flows:close',
    'members:invite', 'members:remove', 'members:view_all', 'members:assign_role',
    'analytics:view', 'analytics:export',
    'reports:generate', 'reports:schedule', 'reports:view_all',
    'billing:view', 'billing:manage',
    'workspace:settings', 'workspace:delete',
  ]),
  admin: new Set<PermissionAction>([
    'ideas:create', 'ideas:edit_own', 'ideas:edit_any',
    'ideas:delete_own', 'ideas:delete_any', 'ideas:mark_planned',
    'flows:create', 'flows:edit', 'flows:delete', 'flows:open', 'flows:close',
    'members:invite', 'members:remove', 'members:view_all', 'members:assign_role',
    'analytics:view', 'analytics:export',
    'reports:generate', 'reports:schedule', 'reports:view_all',
    'billing:view', 'billing:manage',
    'workspace:settings',
  ]),
  manager: new Set<PermissionAction>([
    'ideas:create', 'ideas:edit_own', 'ideas:mark_planned',
    'flows:create', 'flows:edit', 'flows:open', 'flows:close',
    'members:view_all',
    'analytics:view', 'analytics:export',
    'reports:generate', 'reports:view_all',
    'billing:view',
  ]),
  contributor: new Set<PermissionAction>([
    'ideas:create', 'ideas:edit_own', 'ideas:delete_own',
    'analytics:view',
  ]),
  viewer: new Set<PermissionAction>([
    'analytics:view',
  ]),
}

export function hasPermission(role: WorkspaceRole, action: PermissionAction): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false
}

export function hasPermissionFromDB(role: DBRole, action: PermissionAction): boolean {
  return hasPermission(dbRoleToWorkspaceRole(role), action)
}

// ── Department model (Phase 3 future) ────────────────────────────────────────
export interface Department {
  id:          string
  name:        string
  companyId:   string
  managerId:   string | null
  memberIds:   string[]
  createdAt:   string
}

export interface DepartmentAnalytics {
  departmentId:     string
  departmentName:   string
  participationRate: number   // 0–100
  ideasCount:       number
  avgLikesPerIdea:  number
  activeMembers:    number
  totalMembers:     number
  topThemes:        string[]
  trend:            'up' | 'down' | 'stable'
  periodStart:      string
  periodEnd:        string
}

/**
 * Frontend role-based permission helpers.
 * NOTE: These are UI-layer guards only.
 * The backend must enforce all permissions independently.
 */

export type UserRole = "ADMIN" | "COORDINATOR" | "OPERATOR" | "CITIZEN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ── Role checks ────────────────────────────────────────────
export const isAdmin       = (role: UserRole) => role === "ADMIN";
export const isCoordinator = (role: UserRole) => role === "COORDINATOR";
export const isOperator    = (role: UserRole) => role === "OPERATOR";
export const isCitizen     = (role: UserRole) => role === "CITIZEN";

// ── Feature permissions ────────────────────────────────────

/** Can create/edit/delete users and manage roles */
export const canManageUsers = (role: UserRole) => isAdmin(role);

/** Can create resources (Admin only) */
export const canCreateResource = (role: UserRole) => isAdmin(role);

/** Can view resources list (Admin + Coordinator) */
export const canViewAllResources = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can edit a resource — Admin always, Operator only if assigned */
export const canEditResource = (role: UserRole) =>
  isAdmin(role) || isOperator(role);

/** Can create hospitals (Admin only) */
export const canCreateHospital = (role: UserRole) => isAdmin(role);

/** Can view all hospitals (Admin + Coordinator) */
export const canViewAllHospitals = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can edit a hospital — Admin always, Operator only if assigned */
export const canEditHospital = (role: UserRole) =>
  isAdmin(role) || isOperator(role);

/** Can create/report an incident (Admin + Coordinator + Citizen) */
export const canCreateIncident = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role) || isCitizen(role);

/** Can view all incidents (Admin + Coordinator). Operator/Citizen see limited. */
export const canViewAllIncidents = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can approve/reject/validate incidents (Admin + Coordinator) */
export const canManageIncidents = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can assign resources to incidents (Admin + Coordinator) */
export const canAssignResources = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can complete/cancel assignments */
export const canManageAssignments = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role) || isOperator(role);

/** Can trigger re-optimization (Admin + Coordinator) */
export const canReoptimize = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can view audit/decision logs */
export const canViewAuditLogs = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role);

/** Can view assignments page */
export const canViewAssignments = (role: UserRole) =>
  isAdmin(role) || isCoordinator(role) || isOperator(role);

// ── Nav visibility ─────────────────────────────────────────
export interface NavPermissions {
  showIncidents:   boolean;
  showResources:   boolean;
  showHospitals:   boolean;
  showAssignments: boolean;
}

export function getNavPermissions(role: UserRole): NavPermissions {
  return {
    showIncidents:   true, // all roles see incidents (filtered by role)
    showResources:   canViewAllResources(role) || isOperator(role),
    showHospitals:   canViewAllHospitals(role) || isOperator(role),
    showAssignments: canViewAssignments(role),
  };
}

// ── Role display helpers ───────────────────────────────────
export const roleBadgeColor: Record<UserRole, { bg: string; text: string }> = {
  ADMIN:       { bg: "rgba(230,57,70,0.12)",   text: "#E63946" },
  COORDINATOR: { bg: "rgba(124,58,237,0.12)",  text: "#7C3AED" },
  OPERATOR:    { bg: "rgba(249,115,22,0.12)",  text: "#F97316" },
  CITIZEN:     { bg: "rgba(25,195,177,0.12)",  text: "#19C3B1" },
};

export const roleLabel: Record<UserRole, string> = {
  ADMIN:       "Admin",
  COORDINATOR: "Coordinator",
  OPERATOR:    "Operator",
  CITIZEN:     "Citizen",
};

// ── LocalStorage helpers ───────────────────────────────────
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

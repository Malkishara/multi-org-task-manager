// Two-tier permission model:
//   - user.role: "SUPER_ADMIN" bypasses all organization-level checks.
//   - user.organizations[].role: "OWNER" | "ADMIN" | "MEMBER" | null,
//     scoped to one organization.
//
// Rule for organizations specifically:
//   - SUPER_ADMIN: full access to every organization.
//   - Org OWNER: full access (edit/delete/toggle status) for their own organization.
//   - Org ADMIN / Org MEMBER: view-only, no manage actions on the organization itself.
//
// The user object (including per-org roles) is read straight from
// localStorage ("taskflow_user", the same key authSlice writes to on
// login/setUser) so these checks work anywhere without needing a
// Redux selector wired through every caller.

const USER_STORAGE_KEY = "taskflow_user";

export function getStoredUser() {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getOrganizationRole(organizationId) {
    const user = getStoredUser();
    return user?.organizations?.find(
        o => o.organizationId === organizationId
    )?.role;
}

export function getUserRole() {
    return getStoredUser()?.role;
}

export function isSuperAdmin() {
    return getUserRole() === "SUPER_ADMIN";
}

// Is the current user a member of the given organization at all (any role)?
// SUPER_ADMIN counts as a member of every organization for view purposes.
export function isOrganizationMember(organizationId) {
    if (isSuperAdmin()) return true;
    return Boolean(getOrganizationRole(organizationId));
}

// Can the current user edit / delete / toggle status of this specific
// organization? Only SUPER_ADMIN or that organization's OWNER.
// ADMIN and MEMBER are view-only.
export function canManageOrganization(organizationId) {
    if (isSuperAdmin()) return true;
    return getOrganizationRole(organizationId) === "OWNER";
}

// Can the current user remove members from this organization?
// Same rule as managing the organization itself: SUPER_ADMIN or OWNER only.
export function canManageMembers(organizationId) {
    return canManageOrganization(organizationId);
}


// Can the current user edit a project's details or update its status?
// Broader than create/delete - any org member (OWNER/ADMIN/MEMBER) can do this.
export function canEditProjectOrStatus(organizationId) {
    return isOrganizationMember(organizationId);
}

// Can the current user add/remove members of this specific organization?
// Only SUPER_ADMIN or that organization's OWNER - being an org ADMIN or
// MEMBER is not enough on its own.
export function canManageOrganizationMembers(organizationId) {
    if (isSuperAdmin()) return true;
    return getOrganizationRole(organizationId) === "OWNER";
}

// Can the current user create a new project, or delete an existing one,
// in this organization? Only SUPER_ADMIN or that organization's OWNER.
export function canCreateOrDeleteProject(organizationId) {
    if (isSuperAdmin()) return true;
    return getOrganizationRole(organizationId) === "OWNER";
}

// Can the current user create a new task, or delete an existing one, in
// this organization's projects? SUPER_ADMIN, org OWNER, or org ADMIN.
// Org MEMBER can still edit/update status of existing tasks, just not
// create or delete them.
export function canCreateOrDeleteTask(organizationId) {
    if (isSuperAdmin()) return true;
    const role = getOrganizationRole(organizationId);
    return role === "OWNER" || role === "ADMIN";
}

// Can the current user edit a project's details, or update its status,
// in this organization? Any membership role (OWNER/ADMIN/MEMBER) - this
// is intentionally looser than create/delete, since day-to-day project
// updates shouldn't require ownership.
export function canEditOrUpdateProjectStatus(organizationId) {
    if (isSuperAdmin()) return true;
    return Boolean(getOrganizationRole(organizationId));
}
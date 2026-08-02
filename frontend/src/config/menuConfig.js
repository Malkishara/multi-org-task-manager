// Menu items are keyed by the user's *global* role (User.role), which is
// only ever "SUPER_ADMIN" or "MEMBER" - there's no global ADMIN/LEAD role.
//
// Per-organization roles (OWNER/ADMIN/MEMBER on OrganizationMember) don't
// change which pages a user can navigate to - they change what they can
// *do* once they're on a page (e.g. Organization.jsx and ProjectsPage.jsx
// already hide Edit/Delete/Create controls per-row based on org role via
// permission.js). So every MEMBER-role user gets the same menu here.

export const menuConfig = {

    SUPER_ADMIN: [
        {
            name: "Organizations",
            path: "/organization"
        },
        {
            name: "Users",
            path: "/users"
        },
        {
            name: "Projects",
            path: "/projects"
        },
        {
            name: "Profile",
            path: "/profile"
        }
    ],

    MEMBER: [
        {
            name: "Organizations",
            path: "/organization"
        },
        {
            name: "Users",
            path: "/users"
        },
        {
            name: "Projects",
            path: "/projects"
        },
        {
            name: "Profile",
            path: "/profile"
        }
    ]

};
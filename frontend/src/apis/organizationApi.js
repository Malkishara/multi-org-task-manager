import axiosInstance from "./axios";

// Maps 1:1 to OrganizationController:
// GET    /api/organizations         -> paginated list (name filter, super admin sees all)
// GET    /api/organizations/{id}    -> single org
// POST   /api/organizations         -> create (creator becomes owner)
// PUT    /api/organizations/{id}    -> update (owner-only)
// PATCH  /api/organizations/{id}/status -> update just the active flag (owner-only)
// DELETE /api/organizations/{id}    -> delete (owner-only, no projects)

export const organizationApi = {

    // params: { name, page, size, sort } — all optional.
    // Backend defaults: page=0, size=10, sort=createdAt,desc when omitted.
    getOrganizations: async ({ name, page = 0, size = 10, sort = "createdAt,desc" } = {}) => {
        const response = await axiosInstance.get("/organizations", {
            params: {
                ...(name ? { name } : {}),
                page,
                size,
                sort,
            },
        });
        return response.data; // Spring Page: { content, totalElements, totalPages, number, size, ... }
    },

    getOrganization: async (id) => {
        const response = await axiosInstance.get(`/organizations/${id}`);
        return response.data;
    },

    createOrganization: async (payload) => {
        const response = await axiosInstance.post("/organizations", payload);
        return response.data;
    },

    updateOrganization: async (id, payload) => {
        const response = await axiosInstance.put(`/organizations/${id}`, payload);
        return response.data;
    },

    updateOrganizationStatus: async (id, active) => {
        const response = await axiosInstance.patch(`/organizations/${id}/status`, { active });
        return response.data;
    },

    deleteOrganization: async (id) => {
        await axiosInstance.delete(`/organizations/${id}`);
        return id;
    },

};
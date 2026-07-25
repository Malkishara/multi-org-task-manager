import axiosInstance from "./axios";

// Maps 1:1 to OrganizationController:
// GET    /api/organizations         -> list orgs owned by current user
// GET    /api/organizations/{id}    -> single org
// POST   /api/organizations         -> create (creator becomes owner)
// PUT    /api/organizations/{id}    -> update (owner-only)
// PATCH  /api/organizations/{id}/status -> update just the active flag (owner-only)
// DELETE /api/organizations/{id}    -> delete (owner-only, no projects)

export const organizationApi = {

    getOrganizations: async () => {
        const response = await axiosInstance.get("/organizations");
        return response.data;
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

    // Dedicated status-only endpoint - avoids resending name/description/logoUrl
    // just to flip the active flag.
    updateOrganizationStatus: async (id, active) => {
        const response = await axiosInstance.patch(`/organizations/${id}/status`, { active });
        return response.data;
    },

    deleteOrganization: async (id) => {
        await axiosInstance.delete(`/organizations/${id}`);
        return id;
    },

};
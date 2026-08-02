import axiosInstance from "./axios";

// Maps 1:1 to ProjectController:
// GET    /api/projects?organizationId=&search=&page=&size= -> paginated list (organizationId optional for SUPER_ADMIN)
// GET    /api/projects/{id}               -> single project
// POST   /api/projects                    -> create (owner/admin only)
// PUT    /api/projects/{id}               -> update name/description/dates (owner/admin only)
// PATCH  /api/projects/{id}/status        -> update status + progress (owner/admin only)
// DELETE /api/projects/{id}               -> delete (owner/admin only)

export const projectApi = {

    // organizationId is optional - required for non-super-admins, optional
    // (omit for "all orgs") for super admins.
    getProjects: async ({ organizationId, search, page = 0, size = 10 } = {}) => {
        const response = await axiosInstance.get("/projects", {
            params: {
                ...(organizationId != null && { organizationId }),
                ...(search && { search }),
                page,
                size,
            },
        });
        return response.data;
    },

    getProject: async (id) => {
        const response = await axiosInstance.get(`/projects/${id}`);
        return response.data;
    },

    // payload: { organizationId, name, description, startDate, endDate }
    createProject: async (payload) => {
        const response = await axiosInstance.post("/projects", payload);
        return response.data;
    },

    // payload: { name, description, startDate, endDate } - partial update
    updateProject: async (id, payload) => {
        const response = await axiosInstance.put(`/projects/${id}`, payload);
        return response.data;
    },

    // payload: { status, progress } - progress is optional
    updateProjectStatus: async (id, payload) => {
        const response = await axiosInstance.patch(`/projects/${id}/status`, payload);
        return response.data;
    },

    deleteProject: async (id) => {
        await axiosInstance.delete(`/projects/${id}`);
        return id;
    },

};
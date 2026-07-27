import axiosInstance from "./axios";

// Maps 1:1 to ProjectController:
// GET    /api/projects?organizationId=... -> list projects (omit for all)
// GET    /api/projects/{id}               -> single project
// POST   /api/projects                    -> create (owner/admin only)
// PUT    /api/projects/{id}               -> update name/description/dates (owner/admin only)
// PATCH  /api/projects/{id}/status        -> update status + progress (owner/admin only)
// DELETE /api/projects/{id}               -> delete (owner/admin only)

export const projectApi = {

    // organizationId is optional - pass undefined/null to list every
    // project across every organization.
    getProjects: async (organizationId) => {
        const response = await axiosInstance.get("/projects", {
            params: { organizationId },
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

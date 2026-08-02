import axiosInstance from "./axios";

// Maps 1:1 to TaskController:
// GET    /api/tasks/project/{projectId}            -> paginated tasks for one project
//        params: search, assignedToId, page, size, sort
// GET    /api/tasks/project/{projectId}/assignees  -> distinct users assigned to this project's tasks
// GET    /api/tasks/{id}                           -> single task
// POST   /api/tasks                                -> create (owner/admin only)
// PUT    /api/tasks/{id}                           -> update title/description/assignee/dates (owner/admin only)
// PATCH  /api/tasks/{id}/status                    -> update status (owner/admin or assignee)
// DELETE /api/tasks/{id}                           -> delete (owner/admin only)

export const taskApi = {

    // params: { search, assignedToId, page, size }
    getTasksByProject: async (projectId, params = {}) => {
        const response = await axiosInstance.get(`/tasks/project/${projectId}`, { params });
        return response.data;
    },

    getAssigneesForProject: async (projectId) => {
        const response = await axiosInstance.get(`/tasks/project/${projectId}/assignees`);
        return response.data;
    },

    getTask: async (id) => {
        const response = await axiosInstance.get(`/tasks/${id}`);
        return response.data;
    },

    // payload: { projectId, title, description, assignedToId, startDate, dueDate }
    createTask: async (payload) => {
        const response = await axiosInstance.post("/tasks", payload);
        return response.data;
    },

    // payload: { title, description, assignedToId, startDate, dueDate } - partial update
    updateTask: async (id, payload) => {
        const response = await axiosInstance.put(`/tasks/${id}`, payload);
        return response.data;
    },

    // payload: { status }
    updateTaskStatus: async (id, payload) => {
        const response = await axiosInstance.patch(`/tasks/${id}/status`, payload);
        return response.data;
    },

    deleteTask: async (id) => {
        await axiosInstance.delete(`/tasks/${id}`);
        return id;
    },

};
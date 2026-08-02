import axiosInstance from "./axios";

export const memberApi = {

    // GET /api/members?organizationId=&page=&size=
   getMembers: async ({ organizationId, search, page = 0, size = 10 }) => {

    const response = await axiosInstance.get("/members", {
        params: {
            ...(organizationId != null && { organizationId }),
            ...(search && { search }),
            page,
            size,
        },
    });

    return response.data;
},

    getMember: async (id) => {
        const response = await axiosInstance.get(`/members/${id}`);
        return response.data;
    },

    createMember: async (payload) => {
        const response = await axiosInstance.post("/members", payload);
        return response.data;
    },

    deleteMember: async (id) => {
        await axiosInstance.delete(`/members/${id}`);
        return id;
    },

};
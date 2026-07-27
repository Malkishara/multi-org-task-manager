import axiosInstance from "./axios";

// Maps 1:1 to MemberController:
// GET    /api/members?organizationId=... -> list members (omit organizationId for all)
// GET    /api/members/{id}               -> single membership by its own id
// POST   /api/members                    -> add member (owner-only, org id in body)
// DELETE /api/members/{id}                -> remove member (owner-only)

export const memberApi = {

    // organizationId is optional - pass undefined/null to list every member
    // across every organization.
    getMembers: async (organizationId) => {
        const response = await axiosInstance.get("/members", {
            params: { organizationId },
        });
        return response.data;
    },

    getMember: async (id) => {
        const response = await axiosInstance.get(`/members/${id}`);
        return response.data;
    },

    // payload: { organizationId, email, role }
    createMember: async (payload) => {
        const response = await axiosInstance.post("/members", payload);
        return response.data;
    },

    deleteMember: async (id) => {
        await axiosInstance.delete(`/members/${id}`);
        return id;
    },

};
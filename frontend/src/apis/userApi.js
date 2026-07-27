import axiosInstance from "./axios";

// Maps 1:1 to UserController:
// GET /api/users/profile -> current user's profile
// PUT /api/users/profile -> update firstName/lastName

export const userApi = {

    getProfile: async () => {
        const response = await axiosInstance.get("/users/profile");
        return response.data;
    },

    // payload: { firstName, lastName }
    updateProfile: async (payload) => {
        const response = await axiosInstance.put("/users/profile", payload);
        return response.data;
    },

};

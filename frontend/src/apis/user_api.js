import axiosInstance from "./axios";


export const userApi = {


    getCurrentUser: async () => {

        const response = await axiosInstance.get(
            "/users/profile"
        );

        return response.data;

    }


};
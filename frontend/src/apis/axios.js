import axios from "axios";


const axiosInstance = axios.create({

    baseURL:
        process.env.REACT_APP_API_URL ||
        "http://localhost:8080/api",

    headers:{
        "Content-Type":"application/json"
    }

});


// Attach JWT token automatically

axiosInstance.interceptors.request.use(

    (config)=>{


        const token =
            localStorage.getItem(
                "taskflow_token"
            );


        if(token){

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },


    (error)=>{

        return Promise.reject(error);

    }

);


export default axiosInstance;
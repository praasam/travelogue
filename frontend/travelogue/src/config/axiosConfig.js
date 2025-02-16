import axios from "axios";
import config from "./config";

const axiosInstance = axios.create({
  baseURL: config.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log(token);
    if (token) {
    //   config.headers["Authorization"] = `${token}`; 
      // if Bearer is not present in your token
      config.headers["Authorization"] = `Bearer ${token}`; 

    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
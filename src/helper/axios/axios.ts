import axios, { AxiosRequestConfig } from "axios";
import login from "../Login/login";


const instance = axios.create({ baseURL: "https://codeforces.com" });

instance.interceptors.request.use((config: AxiosRequestConfig) => {
  // console.log(config);


  return login()
    .then((cookie) => {
      // console.log(cookie)
      config.headers.Cookie =  cookie;
      return config;
    })
    .catch((error) => {
      return Promise.reject(error);
    });

});

export default instance;

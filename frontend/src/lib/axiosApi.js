import axios from 'axios';
import Helper from "../Helpers/helper"

var ax = axios.create({

    baseURL: `${Helper.GetInstance().GetEnvVariable("VITE_CONTROLLER_API_HOST")}:${Helper.GetInstance().GetEnvVariable("VITE_CONTROLLER_API_PORT")}`

})

ax.interceptors.request.use(function (config) {
    
    console.log("Axios midleware");
    
    // Do something before request is sent
    return config;

}, function (error) {
    return Promise.reject(error);
});


export default ax
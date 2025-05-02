import axios from "axios";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


let axiosBaseUrl = axios.create({
  baseURL: VITE_BACKEND_URL,
});


axiosBaseUrl.interceptors.request.use(
  (response) => {
    
    const token = JSON.parse(localStorage.getItem("token"));

    if (token) {
      response.headers["Authorization"] = `bearer ${token}`;
    }

    return response;
  },
  (error) => {
    console.log("axios request catch block error");
    return Promise.reject(error);
  }
);

//function to handle logout on
//Un-athurised access or 
// token expired:
const handluUnathorised=()=>{

  //keep adminData, remove rest:
  let keysToDelete = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key === "adminData") {
      continue;
    }

    keysToDelete.push(key);
}

keysToDelete.forEach(key => localStorage.removeItem(key));

navigate("/user/login");

}

axiosBaseUrl.interceptors.response.use(
  (response) => {
    
    let result = response.data;
    let userId = JSON.parse(localStorage.getItem("user"))?._id;
    
    if(result?.isBlocked === true && userId == result?.userId){
      //IF admin blocked the user
      // Who is currently using the 
      //Browser.
      // keep only the "adminData" in session
      // clear his all the info and
      for (let i = 0; i < localStorage.length; i++){
        console.log((localStorage.getItem(localStorage.key(i))));
      }

    } 
  
    return response;
  },
  (error) => {

    if (error.response && error.response.status == 401) {

      const erroroReponseMessage = error.response.data?.message;

      if(erroroReponseMessage == "Token has brrnexpired"){
        // window.alert("Token has been expired");
        // toast.loading("Token has been expired kindly login again");
        if(window.confirm("Token 🪙 has been expired Log in once again...")) {
          handluUnathorised();
        }

      } else {
        console.log("acces unathorised is not valid");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosBaseUrl;

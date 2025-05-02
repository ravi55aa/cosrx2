import { Navigate } from "react-router-dom";

export const Home = ({ children }) => {
  const token = window.localStorage.getItem("token");

  if (!token) {
    console.log("admin token is not-found in the localstorage");
  }
  return token ? children : <Navigate to="/user/login" />;
};

export const UserLogin = ({ children }) => {
  const token = window.localStorage.getItem("token");

  if (!token) {
    console.log("admin token is not-found in the localstorage");
  }
  return token ? <Navigate to="/user/homepage" /> : children;
};

export const UserRegister = ({ children }) => {
  const token = window.localStorage.getItem("token");

  if (!token) {
    console.log("admin token is not-found in the localstorage");
  }
  return token ? <Navigate to="/user/homepage" /> : children;
};


export const AdminLoginSession =({children})=>{
    const token = JSON.parse(window.localStorage.getItem("adminData"));
  
    if(!token){
      console.log("admin token is not-found in the localstorage");
    }
    return token ? <Navigate to="/admin/usersManage" /> : children  ;
  };


  export const AdminSession =({children})=>{
    const token = JSON.parse(window.localStorage.getItem("adminData"));
  
    if(!token){
      console.log("admin token is not-found in the localstorage");
    }
    return token ? children : <Navigate to="/admin/login"/>;
  };
  
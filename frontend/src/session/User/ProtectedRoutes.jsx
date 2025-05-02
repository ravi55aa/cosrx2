import {Outlet,Navigate} from "react-router-dom";

export const ProtectedRoute=()=>{
    const token=localStorage.getItem("token");

    return token?<Outlet/>:<Navigate to="/user/login"/>
}

export const AuthenticationProtect=()=>{
    const token=localStorage.getItem("token");

    if(!localStorage.getItem("token")){
        console.log("token iks not baqilale");
    }

    return token?<Navigate to="/user/homepage" />:<Outlet/> 
}

//code:
//two Session-Handler:
//1.Home and other tools
//2.Authentication and other handler


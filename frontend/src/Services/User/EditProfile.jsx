import axiosBaseUrl from "$/axios";
import {getUserId} from "../Reusable";
import {toast} from "react-toastify";

export const getProfileDetails=async()=>{
    try{
        const user = getUserId(); //{id:..., field:...}
        const response = await axiosBaseUrl.get("/profile/fetchUserProfile",{params:{id:user.id}}); 
        const data = await response.data;
        return data.user;
    } catch(err){
        console.log("The Error:-",err.message);
        return;
    }
}

export const fetchOTP = async () => {
    try {

    const token = JSON.parse(localStorage.getItem("token"));

    const res = await axiosBaseUrl.get("/user/verifyOTP",{
        params: { token }
    });

    const { otp, expiryTime } = await res.data;
    console.log("OTP generated is:", otp);
    
    return res.data;

    } catch (error) {
        toast.error("Failed to generate OTP: " + error.message);
        console.error(error);
    }
};

export const isEmailExist=async(email,id)=>{
    const emailForCheck = {params:{"email":email,id:id}}
    try{
        const res = await axiosBaseUrl.get("/profile/isEmailExist",emailForCheck);
        const data = await res.data;
        console.log
        return data;
    }catch(err){
        console.log("Server Error",err.message);
        return false;
    }
}

export const editPassword=async(id,data)=>{
    try{
        const res = await axiosBaseUrl.patch(`/profile/editPassword/${id}`,data);
        return res;
    }catch(err){
        toast.error(err?.response?.data?.message)
        return false;
    }
}
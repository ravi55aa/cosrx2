import axiosBaseUrl from "$/axios";
import {toast} from "react-toastify";
import {getUserId} from "../../Reusable";

export const deleteAddress=async(id)=>{
    try{
        const res = await axiosBaseUrl.delete(`/profile/address/delete/${id}`)
        return res;
    } catch(err){
        console.log(err.message);
        return false;
    }
}

export const fetchEditAddress=async(id)=>{
    try{
        const res = await 
        axiosBaseUrl.get(`/profile/address/edit/fetchData/${id}`,{params : getUserId()});
        return res;
    }catch(err){
        console.log(err.message);
        return false;
    }
}

export const editAddress=async(address)=>{

    try{
        const res = await axiosBaseUrl.patch(`/profile/address/edit/${address._id}`, address)
        return res;
    }catch(err){
        toast.error(err?.response?.data?.message);
        return false;
    }
}

export const address_primaryAddress_Service=async(addressId)=>{
    try{
        const res = await axiosBaseUrl.patch(`/profile/address/changeDefaultAddr/${addressId}`);
        return res;
    }catch(err){
        toast.error(err?.response?.data?.message);
        return false;
    }
}
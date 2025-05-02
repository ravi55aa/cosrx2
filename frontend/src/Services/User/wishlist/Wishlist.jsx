import axiosBaseUrl from "$/axios";
import {getUserId} from "../../Reusable";
import {toast} from "react-toastify";

export const fetchWishlist_Service = async()=>{
    try{
        const queryIs = {params :  getUserId()}; 

        const response = await axiosBaseUrl.get("/wishlist/fetchData",queryIs);

        if(response.status != 200){
            return toast.info(response.statusText);
        }

        return response;
        
    } catch(err){
        console.log(err);
        toast.info(err?.response?.data?.message || err?.message);
        return false;
    }
}

export const addToWishlist_Service = async(productId)=>{
    try{
        const queryIs = {params :  getUserId()}; 

        const response = await axiosBaseUrl.post(`/wishlist/add/${productId}`,{},queryIs);

        if(response.status != 200){
            return toast.info(response.statusText);
        }

        return response;
        
    } catch(err){
        console.log(err);
        toast.info(err?.response?.data?.message || err?.message);
        return false;
    }
}

export const removeProduct_wishlist_Service = async(productId)=>{
    try{
        const queryIs = {params :  getUserId()}; 

        const response = await axiosBaseUrl.delete(`/wishlist/remove/${productId}`,queryIs);

        if(response.status != 200){
            return toast.info(response.statusText);
        }

        return response;
        
    } catch(err){
        console.log(err);
        toast.info(err?.response?.data?.message || err?.message);
        return false;
    }
}
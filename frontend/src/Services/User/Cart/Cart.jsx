import axiosBaseUrl from "$/axios";
import {getUserId} from "../../Reusable";
import {toast} from "react-toastify";

export const getCartItems=async()=>{
    const queryIs = {params :  getUserId()}; 
    try{
        const response = await axiosBaseUrl.get("/cart/products",queryIs);

        if(response.status != 200){
            return toast.info(response.statusText);
        }

        return response;
        
    } catch(err){
        console.log(err);
        toast.error(err?.response?.data?.message || err?.message);
        return false;
    }
}

export const addToCart_Service=async(productId)=>{
    try{
        const queryIs = {params :  getUserId()}; 

        const response = await axiosBaseUrl.post(`/cart/addToCart/${productId}`,{},queryIs);

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

export const incQuantityCall= async(productId)=>{
    try{
        const queryIs = {params :  getUserId()}; 

        const response = await axiosBaseUrl.patch(`/cart/product/quantityInc/${productId}`,{},queryIs);

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

export const decQuantityCall = async(productId)=>{
    const queryIs = {params :  getUserId()}; 
    try{
        const response = await axiosBaseUrl.patch(`/cart/product/quantityDec/${productId}`,{},queryIs);

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

export const removeProduct_Service = async(productId)=>{
    const queryIs = {params :  getUserId()}; 
    try{
        const response = await axiosBaseUrl.patch(`/cart/product/remove/${productId}`,{},queryIs);

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

export const fetchAddressActive_Service = async()=>{
    try{
        const queryIs = {params :  getUserId()}; 

        const response = await axiosBaseUrl.get("/cart/product/address",queryIs);

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


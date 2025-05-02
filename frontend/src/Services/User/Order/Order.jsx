import axiosBaseUrl from "$/axios";
import {toast} from "react-toastify";
import {getUserId} from "../../Reusable";

export const addNewProduct_Service=async(orderedData)=>{
    try{
        const queryIs = {params : getUserId()};
        const response = await axiosBaseUrl.post("/order/new",orderedData,queryIs);
        
        return response;
    } catch(err){
        toast(err?.response?.data.message);
        return false;
    }
}

export const listALLuserOrders=async()=>{
    try{
        const queryIs = {params : getUserId()};
        const response = await axiosBaseUrl.get("/order/getAllOrders",queryIs);
        return response;

    } catch(err){
        return false;
    }
}


export const user_order_return_Service=async(productId,mode,returnReason)=>{
    try{
        const queryIs = {params : {itemId:productId,cancellingMode:mode}}
        
        const response = await axiosBaseUrl.patch("/order/cancelOrReturn",{reason:returnReason},queryIs);
        
        return response;

    } catch(err) {
        return false;
    }
}

export const user_order_delivered_return_Service=async(productId,mode,returnReason)=>{
    try{
        const queryIs = {params : {itemId:productId,cancellingMode:mode}}
        
        const response = await axiosBaseUrl.patch("/order/cancelOrReturn/deliveredOrder",{reason:returnReason},queryIs);
        
        return response;

    } catch(err) {
        return false;
    }
}
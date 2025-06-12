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


export const user_fetch_orderIntoThankingPage_success=async(orderId)=>{
    try{
        const response = await axiosBaseUrl.get(`/order/order/${orderId}`);
        
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

export const user_product_cancel_Service=async(productId)=>{
    try{
        const queryIs = {params : {itemId:productId}}
        
        const response = await axiosBaseUrl.patch("/order/cancelProduct",{},queryIs);
        
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
        toast.error(err.response.data.message);
        return false;
    }
}

export const user_checkout_getAllCoupons_Service=async(price)=>{
    try{
        const query = {params : {price:price}} ;
        
        const response = await axiosBaseUrl.get("/order/fetchCoupons",
            query);
            
        return response;

    } catch(err) {
        return false;
    }
}

export const walletPay_order_service = async (amount) => {
    try {

        const userData = getUserId();

        const orderData = { 
            amount:amount,
            ...userData
        } 

        console.log("orderData is the given",orderData);

        const response = await axiosBaseUrl.patch("/wallet/payWithWallet",orderData);
        return response;

    } catch (err) {
        toast.info(err.response.data.message);
        return false;
    }        
};

import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";


export const admin_getAllOrders=async()=>{
    try{
        const response = await axiosBaseUrl.get("/adminOrd/listOrders");
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast(err?.response?.data?.message);
        return false;
    }
}

export const admin_order_product_cancelRequest=async(productId)=>{
    try{
        const response = await axiosBaseUrl.patch(`/adminOrd/order/cancel/${productId}`);
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
}

export const admin_order_product_cancelRequest_reject=async(productId,reason)=>{
    try{
        const response = await axiosBaseUrl.patch(`/adminOrd/order/cancel/reject/${productId}`,{reason:reason});
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
}

export const admin_management_order_cancelRequest_accept_service=async(orderId)=>{
    try{
        const response = await axiosBaseUrl.patch(`/adminOrd/allOrder_cancel/accept/${orderId}`);
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
};

export const admin_management_order_cancelRequest_reject_service=async(orderId)=>{
    try{
        const response = await axiosBaseUrl.patch(`/adminOrd/allOrder_cancel/reject/${orderId}`);
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
};


export const admin_order_updateStatus=async(orderId,newStatus)=>{
    try{
        const response = await axiosBaseUrl.patch(`/adminOrd/order/status_update/${orderId}`,
            {newStatus:newStatus}
        );
        return response;

    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
};


export const admin_searchSubmit_Service=async(searchTerm)=>{
    try{

        if(!searchTerm.trim()){
            return ;
        }

        const response = await axiosBaseUrl.get(`/adminOrd/order/search/${searchTerm}`);
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
}


export const admin_management_order_delivered_accept_service=async(orderId)=>{
    try{

        if(!orderId){
            return ;
        }

        const response = await axiosBaseUrl.patch(`/adminOrd/order/returnRequest/${orderId}`);
        return response;
    } catch(err){
        console.log("The Error :",err.message);
        toast.info(err?.response?.data?.message);
        return false;
    }
}
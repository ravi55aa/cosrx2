import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";

const error = (err)=>{
    console.log("The Error :",err.message);
    toast.info(err?.response?.data?.message);
    return false;
}

export const admin_coupon_add_success=async(formData)=>{
    try{
        const response = await axiosBaseUrl.post("/coupon/add",formData);
        return response;
    } catch(err){
        error(err);
    }
}


export const admin_coupon_getAll_success=async()=>{
    try{
        const response = await axiosBaseUrl.get("/coupon/getAll");
        return response;
    } catch(err){
        error(err);
    }
}


export const admin_coupon_edit_fetchCouponData_success=async(offerId)=>{
    try{
        const response = await axiosBaseUrl
        .get(`/coupon/edit/${offerId}`);

        return response;
    } catch(err){
        error(err);
    }
} 

export const admin_coupon_edit_success=async(couponId,formData)=>{
    try{
        const response = await axiosBaseUrl.put(`/coupon/edit/${couponId}`,formData);
        return response;
    } catch(err){
        error(err);
    }
}

export const admin_removeCoupon_success=async(offerId)=>{ 
    try{
        const response = await axiosBaseUrl.delete(`/coupon/remove/${offerId}`);
        return response;
    } catch(err){
        error(err);
    }
}

export const admin_coupon_toggleListing_success =async(couponId,newStatus)=>{ 
    try{
        const response = await axiosBaseUrl.patch(`/coupon/toggle-listing/${couponId}`, 
            { isListed: newStatus}
        );

        return response;

    } catch(err){
        error(err);
    }
}

export const admin_coupon_search_success =async(sQuery)=>{ 
    const query = { params :{ searchQuery: sQuery}};
    try{
        const response = await axiosBaseUrl.get(`/coupon/search`,
            query
        );

        return response;

    } catch(err){
        error(err);
    }
}
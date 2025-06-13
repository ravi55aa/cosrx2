import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";

const error = (err)=>{
    console.log("The Error :",err.message);
    toast(err?.response?.data?.message);
    return false;
}

export const admin_getAllOffers_success=async()=>{
    try{
        const response = await axiosBaseUrl.get("/offer/getAll");
        return response;
    } catch(err){
        error(err);
    }
}


export const admin_addOffer_success=async(formData)=>{
    try{
        const query = {params : { applyTo:formData.offerType, id:formData.applyTo }}
        
        const response = await axiosBaseUrl.post("/offer/add",formData,query);
        return response;
    } catch(err){
        error(err);
    }
}

export const admin_editOffer_fetchOfferData=async(offerId)=>{
    try{
        const response = await axiosBaseUrl
        .get(`/offer/edit/fetchOffer/${offerId}`);

        return response;
    } catch(err){
        error(err);
    }
} 

export const  admin_editOffer_success=async(offerId,formData)=>{
    try{
        const response = await axiosBaseUrl.post(`/offer/edit/${offerId}`,formData);
        return response;
    } catch(err){
        error(err);
    }
}

export const admin_removeOffer_success=async(offerId)=>{ //softDelete
    try{
        const response = await axiosBaseUrl.delete(`/offer/remove/${offerId}`);
        return response;
    } catch(err){
        error(err);
    }
}

export const admin_updateListingOffer_success =async(offerId,newStatus)=>{ //softDelete
    try{
        
        const response = await axiosBaseUrl.patch(`/offer/toggle-listing/${offerId}`, 
            { isListed: newStatus}
        );

        return response;

    } catch(err){
        console.log(err.message);
        error(err);
    }
}

export const admin_fetchCategory_success=async()=> { 
    try{
        const response = await axiosBaseUrl.get("/productDetails/manageCategory");
        return response;
    } catch(err){
        error(err);
    }
}


export const admin_fetchProducts_success=async()=>{ 
    try{
        const response = await axiosBaseUrl.get("/productDetails/products");
        return response;
    } catch(err){
        error(err);
    }
}

export const admin_offer_search_success=async(sQuery)=>{ 
    const query = { params :{ searchQuery: sQuery}};
    try{
        const response = await axiosBaseUrl.get(`/offer/search`,
            query
        );

        return response;

    } catch(err){
        error(err);
    }
}
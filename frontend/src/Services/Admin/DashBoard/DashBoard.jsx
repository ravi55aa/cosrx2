import {getUserId} from "../../Reusable";
import {toast} from "react-toastify";
import axiosBaseUrl from "$/axios"


const error=(err)=>{
    console.log("The Error :",err.message);
    toast(err?.response?.data?.message);
    return false;
}


export const fetch_user_orderedProducts_service = async (filters = {}) => {
    try {
    // Remove undefined values from filters to avoid appending them as query params
    const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
    console.log("Sending filters to backend:", cleanedFilters);
    const response = await axiosBaseUrl.get('/dashboard/topData', {
        params: cleanedFilters,
    });
    return response;
    } catch (error) {
    console.error("Error in fetch_user_orderedProducts_service:", error);
    throw error;
    }
};
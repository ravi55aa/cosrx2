import axiosBaseUrl from "$/axios";
import {toast} from "react-toastify";

export const fetchOrders=async(credential)=>{
    try{
        const response = axiosBaseUrl.get("sales/fetch-reports",{params:credential}) ;
        return response
    } catch(err){
        toast.error(err.response.data.message);
        return false;
    }
}

export const downloadSalesReport=async(format,credential)=>{
    try{
        const response = axiosBaseUrl.get(`sales/sales-report/download/${format}`, {
        params:credential,
        responseType: 'blob',
    });

        return response
    } catch(err){
        toast.error(err.response.data.message);
        return false;
    }
}


export const downloadTestPdf = ()=>{
    try{
        const response = axiosBaseUrl.get("sales/test-pdf");
        return response
    } catch(err){
        toast.error(err.response.data.message);
        return false;
    }
}
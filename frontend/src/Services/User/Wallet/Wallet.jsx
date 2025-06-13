import axiosBaseUrl from "$/axios";
import {getUserId} from "../../Reusable";
import {toast} from "react-toastify";

/*
amount,
userID,
transactionType,[credit, debit],
description,
*/

 //{ field, id, amount, type, description} 
export const addFundsToWallet_Service=async(walletCredentials)=>{
    try{
        let user = getUserId();

        const credentials = {...walletCredentials,...user};
        console.log("razpay credentials",credentials);
        
        const response = await axiosBaseUrl.post("/wallet/add-funds",credentials ); 

        return response

    } catch(err){
        toast.error("The Error:-",err.message);
        return false;
    }
}


export const fetchWalletDetails_Service = async () => {
    try {
        const {field,id} = getUserId();

        const response = await axiosBaseUrl.get("/wallet/details", {
            params: { field,id }
        });

        return response;

    } catch (err) {
        toast.error(`Error: ${err.message}`);
        return false;
    }
};


//razor order creation
export const razorPay_order_service = async (a,c,r) => {
    try {
        console.log("credential in the createOrder_service",a,r,c);

        const orderData = { 
            amount:a,
            currency:c,
            receipt:r
        } 

        const response = await axiosBaseUrl.post("/wallet/create-order",orderData);
        return response;

    } catch (err) {
        toast.error(`Error: ${err.message}`);
        return false;
    }        
};

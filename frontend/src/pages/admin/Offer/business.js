import {toast} from "react-toastify";


export const validate_fields_business =(formData)=>{
    
    for (let key in formData) {
        if (!formData[key] || (typeof formData[key] === "string" && !formData[key].trim())) {
            toast.info(`${key} is required`);
            return false;
        }
    }
            
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    
    if (startDate > endDate) {
    toast.info("Start Date must be before End Date");
    return false;
    }
    
    if (endDate < today) {
    toast.info("End Date must be in the future");
    return false;   
    }
    
    const discount = parseFloat(formData.discountAmount);
    
    if (isNaN(discount) || discount <= 0) {
    toast.info("Discount % must be greater than 0");
    return false;
    }

    if(discount > 25){
        toast.info("Avoid adding offer more than 25%");
        return false;
    }
    
    if (formData.discountAmountType === "Percentage" && (discount > 100 || discount < 1)) {
    toast.info("Discount Percentage must be between 1 and 100");
    return false;
    }

    return true;
}

export const validate_fields_edit_business=(formData)=>{

    console.log(" business logic",formData);
    for (let key in formData) {
        if (!formData[key] || (typeof formData[key] === "string" && !formData[key].trim())) {
            toast.info(`${key} is required`);
            return false;
        }
    }
            
    const startDate = new Date(formData.validFrom);
    const endDate = new Date(formData.validUpto);
    const today = new Date();
    
    if (startDate > endDate) {
    toast.info("Start Date must be before End Date");
    return false;
    }
    
    if (endDate < today) {
    toast.info("End Date must be in the future");
    return false;   
    }
    
    const discount = parseFloat(formData.discountAmount);
    
    if (isNaN(discount) || discount <= 0) {
    toast.info("Discount Amount must be greater than 0");
    return false;
    }
    
    if (formData.discountType === "Percentage" && (discount > 100 || discount < 1)) {
    toast.info("Discount Percentage must be between 1 and 100");
    return false;
    }

    return true;
}
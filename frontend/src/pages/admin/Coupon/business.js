import { toast } from "react-toastify";
import Swal from "sweetalert2";

export const handleValidation = async (formData) => {
    const { code, name, startDate, expireOn, minimumPrice, offerPrice, usageLimit } = formData;
    const error = [];

    if (!code || !name || !startDate || !expireOn || !offerPrice || !minimumPrice || !usageLimit) {
        toast.error("Please fill in all required fields");
        error.push("code", "name", "startDate", "expireOn", "minimumPrice", "offerPrice", "usageLimit");
        return error;
    }
    
    if (Number(offerPrice) <= 0) {
        toast.error("Offer price must be greater than 0");
        error.push("offerPrice");
    }

    if (Number(minimumPrice) <= 0) {
        toast.error("Minimum purchase amount must be greater than 0");
        error.push("minimumPrice");
    }

    if (Number(usageLimit) <= 0) {
        toast.error("Usage limit must be greater than 0");
        error.push("usageLimit");
    }

    if (Number(minimumPrice) > 100000) {
        toast.error("Minimum purchase amount should be under ₹100000");
        error.push("minimumPrice");
    }

    if (Number(usageLimit) > 1000) {
        toast.error("Usage limit should not exceed 1000");
        error.push("usageLimit");
    }

    const validOfferLimit = Math.floor((Number(minimumPrice) * 25) / 100);
    if (Number(offerPrice) > validOfferLimit) {
        await Swal.fire({
        title: "Invalid Offer",
        text: `Offer price must be less than 25% of the minimum purchase amount. 25% of ₹${minimumPrice} is ₹${validOfferLimit}.`,
        icon: "warning",
        });
        error.push("offerPrice");
    }

    const start = new Date(startDate);
    const expiry = new Date(expireOn);

    if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
        toast.error("Invalid date format for start or expiry date");
        error.push("startDate", "expireOn");
    } else if (start >= expiry) {
        toast.error("Start date must be before expiry date");
        error.push("startDate");
    }

    return error.length > 0 ? error : true;
};

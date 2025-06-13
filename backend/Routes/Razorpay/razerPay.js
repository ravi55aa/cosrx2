const express = require("express");
const router = express.Router();
require("dotenv").config(); 

const Razorpay = require("razorpay");

router.post("/order", async (req, res) => {
    try {
        if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
            console.error("Razorpay credentials missing:", {
                key: process.env.RAZORPAY_KEY,
                secret: process.env.RAZORPAY_SECRET,
            });
            return res.status(500).json({
                mission: "failed",
                message: "Server configuration error: Razorpay credentials missing",
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const { amount, currency, receipt } = req.body;

        if (!amount || !currency || !receipt) {
            return res.status(400).json({
                mission: "failed",
                message: "Missing required fields: amount, currency, or receipt",
            });
        }

        const amountInRupees = Number(amount);
        if (isNaN(amountInRupees) || amountInRupees < 1) {
            return res.status(400).json({
                mission: "failed",
                message: "Amount must be a valid number and at least ₹1",
            });
        }


        const amountInPaisa = amountInRupees * 100;


        if (currency !== "INR") {
            return res.status(400).json({
                mission: "failed",
                message: "Only INR currency is supported",
            });
        }

        const options = {
            amount: amountInPaisa,
            currency,
            receipt,
        };

        console.log("Creating Razorpay order with options:", options);

        const order = await razorpay.orders.create(options);

        if (!order || !order.id) {
            console.error("Razorpay order creation failed:", order);
            return res.status(500).json({
                mission: "failed",
                message: "Failed to create Razorpay order",
            });
        }

        return res.status(200).json({
            mission: "success",
            message: "Order created successfully",
            order: order,
        });
    } catch (err) {
        console.error("Razorpay Error:", err); // Log the full error object
        return res.status(500).json({
            mission: "failed",
            message: "ServerError",
            error: err.message || "Unknown error",
        });
    }
});

module.exports = router;
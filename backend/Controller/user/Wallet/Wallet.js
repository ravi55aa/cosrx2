const walletModel = require("../../../Model/wallet");
const userModel = require("../../../Model/user");
const mongoose = require("mongoose");
const HttpStatus = require("../../../Config/HTTPstatusCodes");
const Razorpay = require("razorpay");
require("dotenv").config();


const getObjOfId=(id)=>{
    return new mongoose.Types.ObjectId(id);
}  

const checkWhichId=async(field,id)=>{
    let userId = "";
    
    if(field == "googleId"){
        const user = await userModel.findOne({[field]:id});
        userId = user._id ;
    } else {
        userId = getObjOfId(id);
    }

    return userId; 
}


const generateTheRandomId = (transactionCount) => {
const thePadStart = String(transactionCount + 1).padStart(3, "0");

const date = Date.now();

return "TRAN" + "-" + date + "-" + thePadStart;
};

const handleAddFund = async (req, res) => {
    try {
        const { field, id, amount, type, description} = req.body;

        if (!field || !id) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: 'failed',
                message: "User Not Found",
            });
        }

        let userId = await checkWhichId(field,id);

        const userWallet = await walletModel.findOne({ userId });

        const newTransaction = {
            type,
            amount,
            description,
            transactId:0
        };

        if (!userWallet) {
            const wallet = await new walletModel({
                userId,
                balance: amount,
                transactions: [newTransaction],
            }).save();

            if (!wallet || Object.keys(wallet).length === 0) {
                return res.status(HttpStatus.CONFLICT).json({
                    mission: "failed",
                    message: "Cannot add to wallet",
                    order:{id:newTransaction.transactId},
                });
            }

            
            return res.status(HttpStatus.OK).json({
                mission: "success",
                message: "Amount added to Wallet successfully",
                order:{id:newTransaction.transactId},
            });
        }

        const totalTrans = userWallet.transactions?.length
        newTransaction.transactId = generateTheRandomId(totalTrans);

        const updatedWallet = await walletModel.updateOne(
            { userId },
            {
                $inc: { balance: amount },
                $push: { transactions: newTransaction }
            }
        );

        if(updatedWallet.modifiedCount <= 0 ){
            return res.status(HttpStatus.CONFLICT).json({
                mission: "failed",
                message: "The amount is not added",
                order:{id:newTransaction.transactId},
            });
        }

        
        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Amount added to existing wallet successfully",
            order:{id:newTransaction.transactId},
        });

    } catch (err) {
        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "Server Error",
            error: err.message
        });
    }
};

const handleFetchingData=async(req,res)=>{
    try{
        
        const {field,id} = req.query;
    
        if(!field || !id){
            return res.status(HttpStatus.NOT_FOUND)
            .json({mission:"failed",message:"field or id is null"});
        }
    
        let userId = await checkWhichId(field,id);
    
        const walletDoc = await walletModel.aggregate([
                    { 
                        $match: { userId: userId } 
                    },
                    {
                        $addFields: {
                        transactions: {
                            $sortArray: {
                            input: "$transactions",
                            sortBy: { date: -1 } 
                            }
                        }
                        }
                    }
                ]);


        return res
            .status(HttpStatus.OK)
            .json({mission:"success",message:"Wallet details fetched successfully",
                walletDoc:walletDoc
            })
    }catch(err){
        
        return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"Server Error",Error:err.message});
    }
}

const createOrder_Service = async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;

        if (!amount || !currency || !receipt) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Missing required order options (amount, currency, receipt)",
            });
        }
        
        const amountInRupees = Number(amount);
        if (isNaN(amountInRupees) || amountInRupees < 1) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Amount must be a valid number and at least ₹1",
            });
        }

        const amountInPaisa = amountInRupees * 100;

        if (currency !== "INR") {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Only INR currency is supported",
            });
        }

        if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                mission: "failed",
                message: "Server configuration error: Razorpay credentials missing",
            });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });

        const options = {
            amount: amountInPaisa, 
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        if (!order || !order.id) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                mission: "failed",
                message: "Failed to create Razorpay order",
            });
        }

        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Order placed successfully",
            order: order,
        });
    } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "ServerError",
            error: err.message || "Unknown error",
        });
    }
};

const payWithWallet = async (req, res) => {
    try {
        const { field, id, amount } = req.body;
        let userId = await checkWhichId(field,id);

        if (!userId || !amount) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Missing required fields: userId or amount",
            });
        }


        const amountInRupees = Number(amount);
        if (isNaN(amountInRupees) || amountInRupees <= 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Amount must be a valid number greater than 0",
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "User not found",
            });
        }

        const userWallet = await walletModel.findOne({ userId });
        if (!userWallet) {
            return res.status(HttpStatus.NOT_FOUND).json({
                mission: "failed",
                message: "Wallet not found for this user",
            });
        }

        if (userWallet.balance < amountInRupees) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Insufficient wallet balance",
                currentBalance: userWallet.balance,
                requiredAmount: amountInRupees,
            });
        }

        const newTransaction = {
            type: "debit",
            amount: amountInRupees,
            description: `paid the amount via the wallet`,
            transactId: generateTheRandomId(userWallet.transactions.length),
        };

        const updatedWallet = await walletModel.updateOne(
            { userId },
            {
                $inc: { balance: -amountInRupees },
                $push: { transactions: newTransaction },
            }
        );

        if (updatedWallet.modifiedCount <= 0) {
            return res.status(HttpStatus.CONFLICT).json({
                mission: "failed",
                message: "Failed to deduct amount from wallet",
            });
        }

        return res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Payment successful using wallet",
            transaction: newTransaction,
        });
    } catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "Server Error",
            error: err.message || "Unknown error",
        });
    }
};

module.exports = { 
    handleAddFund,
    handleFetchingData,
    createOrder_Service,
    generateTheRandomId,
    payWithWallet
};
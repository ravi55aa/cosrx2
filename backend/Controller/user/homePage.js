const HttpStatus =  require("../../Config/HTTPstatusCodes");
const productModel = require("../../Model/product");
const categoryModel = require("../../Model/category");
const { default: mongoose } = require("mongoose");

const fetchData = async (req, res) => {
    try {

        const statusOfThProducts = ['available','out of stock']; 

        const category = await categoryModel.find({isListed:true,isDelete:false});

        const categoryID = category?.map((ele)=>ele._id);

        const products = await productModel.find({ category : {$in : categoryID } ,isBlocked: false,status:statusOfThProducts });

        const bestSellerProducts = products.slice(0,10);   

        const generateRandomNums = () => {
            let arrayOfNumS = new Set();
            while (arrayOfNumS.size < Math.min(10, products.length)) {
                arrayOfNumS.add(Math.floor(Math.random() * products.length));
            }    
            return Array.from(arrayOfNumS); 
        };

        let randomProducts = [];
        let arrayOfNumS = generateRandomNums();

        for (let i = 0; i < arrayOfNumS.length; i++) {
            const randomProduct = products[arrayOfNumS[i]];
            randomProducts.push(randomProduct);
        }

        

        let homePageProducts = [randomProducts,bestSellerProducts];

        res.status(HttpStatus.OK).json({
            mission: "success",
            message: "Both category Products fetched successfully",
            products: homePageProducts || []
        });

    } catch (err) {
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            mission: "failed",
            message: "Server Error",
            Error: err.message
        });
    }
}

module.exports = {fetchData};
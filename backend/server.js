const express =  require("express");
const app = express();
const port = 80; 
require("dotenv").config();
require("./Config/passport");

const mongoDBServer = require("./DB/mongoDB");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const cors = require("cors");
app.use(cors({origin:"*",credentials:true}));
//replace * with my frotnend URL
//if iam pushing the project into the github 
//Later you can access to into here;

mongoDBServer();

const adminCategory = require("./Routes/Admin/Category/category");
const adminUserManage = require("./Routes/Admin/UserManagement/user");
const adminProducts = require("./Routes/Admin/productsManag/products");
const adminOrders = require("./Routes/Admin/OrderMan/order");
const OfferManageMent = require("./Routes/Admin/Offer/index");
const couponManageMent = require("./Routes/Admin/Coupon/index");
const saleReportMange = require("./Routes/Admin/SaleReport/sale");
const dashboardMange = require("./Routes/Admin/Dashboard/dashboard");

const googlAuth = require("./Routes/googleAuth");
const user_Authentication = require("./Routes/User/Authenticate/authenticaton");
const userHomePageData = require("./Routes/User/Menu/homepage");
const categoryManage = require("./Routes/User/Menu/category");
const productDetails = require("./Routes/productDetails");

const profileInfo = require("./Routes/User/Profile/personal");
const manageCart = require("./Routes/User/Menu/cart");
const manageWishlist = require("./Routes/User/Menu/wishlist");
const orderManageMent = require("./Routes/User/order/order");
const walletManageMent = require("./Routes/User/Profile/Wallet/Wallet.js");

const razorPay = require("./Routes/Razorpay/razerPay.js");

app.use((req, res, next) => {
    console.log("Incoming:", req.method, req.path);
    next();
});


app.use("/adminCat",adminCategory);
app.use("/admin",adminUserManage);
app.use("/adminPro",adminProducts);
app.use("/adminOrd",adminOrders);
app.use("/offer",OfferManageMent)
app.use("/coupon",couponManageMent);
app.use("/sales",saleReportMange);
app.use("/dashboard",dashboardMange);

app.use("/auth",googlAuth);
app.use("/user",user_Authentication);

app.use("/authorised",userHomePageData);
app.use("/productDetails",productDetails);
app.use("/productDetails",categoryManage);
app.use("/cart",manageCart);
app.use("/wishlist",manageWishlist);
app.use("/order",orderManageMent);
app.use("/wallet",walletManageMent);

app.use("/razor",razorPay);
//user_profile
app.use("/profile",profileInfo);

app.get("/health", (req, res) => {
  return res.status(200).json({ status: "OK", message: "Backend is healthy!" });
});

app.get("/*",(req,res)=>{
    res.status(404).json({mission:"failed",message:"page not found"});
    return;
});

console.log(port);
app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
});



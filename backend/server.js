const express =  require("express");
const app = express();
const port = 4000;
require("dotenv").config();
require("./Config/passport");

const mongoDBServer = require("./DB/mongoDB");

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const cors = require("cors");
app.use(cors({origin:"http://localhost:5173",allowedHeaders:"Authorization,Content-Type",credentials:true}));
//replace * with my frotnend URL
//if iam pushing the project into the github 
//Later you can access to into here;

mongoDBServer();

const adminCategory = require("./Routes/Admin/Category/category");
const adminUserManage = require("./Routes/Admin/UserManagement/user");
const adminProducts = require("./Routes/Admin/productsManag/products");
const adminOrders = require("./Routes/Admin/OrderMan/order");

const googlAuth = require("./Routes/googleAuth");
const user_Authentication = require("./Routes/User/Authenticate/authenticaton");
const userHomePageData = require("./Routes/User/Menu/homepage");
const categoryManage = require("./Routes/User/Menu/category");
const productDetails = require("./Routes/productDetails");

const profileInfo = require("./Routes/User/Profile/personal");
const manageCart = require("./Routes/user/Menu/cart");
const manageWishlist = require("./Routes/user/Menu/wishlist");
const orderManageMent = require("./Routes/user/order/order");

app.use((req,res,next)=>{
    console.log(req.hostname)
    next();
})

app.use("/adminCat",adminCategory);
app.use("/admin",adminUserManage);
app.use("/adminPro",adminProducts);
app.use("/adminOrd",adminOrders);

app.use("/auth",googlAuth);
app.use("/user",user_Authentication);

app.use("/authorised",userHomePageData);
app.use("/productDetails",productDetails);
app.use("/productDetails",categoryManage);
app.use("/cart",manageCart);
app.use("/wishlist",manageWishlist);
app.use("/order",orderManageMent);

//user_profile
app.use("/profile",profileInfo);

app.get("/*",(req,res)=>{
    res.status(404).json({mission:"failed",message:"page not found"});
    return;
});

console.log(port);
app.listen(port,()=>{
    console.log(`http://localhost:${port}`);
});



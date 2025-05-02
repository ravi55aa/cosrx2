import {lazy} from "react";

//  *1-AUTHENTICATION
const GoogleAuth = lazy(()=>import("@/pages/user/Authentication/User_GoogleAuth.jsx"));
//Registration
const OTP = lazy(()=>import("@/pages/user/Authentication/Registration/Otp.jsx"));
const Registration = lazy(()=>import( "@/pages/user/Authentication/Registration/Registration.jsx"));
//Login
const Login = lazy(()=>import(`@/pages/user/Authentication/Login/Login.jsx`));
const EmailVerify = lazy(()=>import("@/pages/user/Authentication/Login/EmailVerify.jsx"));
const UploadPicture = lazy(()=>import( "@/pages/user/Authentication/Login/UploadPicture.jsx"));
const ReEnterPassword = lazy(()=>import("@/pages/user/Authentication/Login/ReEnterPassword.jsx"));

//*2-Menus
const About = lazy(()=>import("@/pages/user/Menu/About/About.jsx")); 
const Profile = lazy(()=>import("@/pages/user/Menu/Profile/Profile.jsx"));
const Homepage = lazy(()=>import("@/pages/user/Menu/HomePage/Homepage.jsx"));
//Shop
const ShopPage = lazy(()=>import("@/pages/user/Menu/shop/ShopPage.jsx"));
const Serum = lazy(()=>import("@/pages/user/Menu/shop/categories/Serum.jsx"));
const Tooner = lazy(()=>import("@/pages/user/Menu/shop/categories/Tooner.jsx"));
const DynamiCat = lazy(()=>import("@/pages/user/Menu/shop/categories/DynamiCat.jsx"));
const SunScreen = lazy(()=>import("@/pages/user/Menu/shop/categories/SunScreen.jsx"));
const ProductDetails = lazy(()=>import("@/pages/user/Menu/shop/ProductDetail/ProductDetails.jsx"));


//*3: User_Details[profile,address,]
const Profile_Edit = lazy(()=>import("@/pages/user/Menu/Profile/Profile_CRUD/EditProfile.jsx"));
const Profile_Edit_PasswordChange_EmailVerify = 
    lazy(()=>import("@/pages/user/Menu/Profile/Profile_CRUD/ForgotPassword/EmailVerify.jsx"));
const Profile_Edit_PasswordChange_PasswordChange = 
    lazy(()=>import("@/pages/user/Menu/Profile/Profile_CRUD/ForgotPassword/PasswordChagen.jsx"));

//address
const Address = lazy(()=>import("@/pages/user/Menu/Profile/Address/User.address.jsx"));
const Address_Add = lazy(()=>import("@/pages/user/Menu/Profile/Address/User.address.add.jsx"));
const Address_Add_OTP = lazy(()=>import("@/pages/user/Menu/Profile/Address/User.address.otp.model.jsx"));
const Address_Edit = lazy(()=>import("@/pages/user/Menu/Profile/Address/User.address.edit.jsx"));

//*4: 
const CartPage = lazy(()=>import("@/pages/user/Menu/Cart/Cart.jsx"));
//*5: 
const WishListPage = lazy(()=>import("@/pages/user/Menu/wishlist/wishlist.jsx"));
//*6 
const CheckOutPage = lazy(()=>import("@/pages/user/Orders/CheckoutPage.jsx"));
const ThankingPage = lazy(()=>import("@/pages/user/Orders/ThankingPage.jsx"));
const OrdersListing = lazy(()=>import("@/pages/user/Orders/OrdersListing.jsx"));
const ParticularOrderDetails = lazy(()=>import("@/pages/user/Orders/ParticularOrderDetails.jsx"));
const Invoice = lazy(()=>import("@/pages/user/Orders/Invoice.jsx"));


export default {
    GoogleAuth,
    OTP,
    Registration,
    Login,
    EmailVerify,
    UploadPicture,
    ReEnterPassword,
    About,
    Profile,
    Homepage,
    ShopPage,
    Serum,
    Tooner,
    SunScreen,
    DynamiCat,
    ProductDetails,

    //User_personal[address,edit,delete]
    Profile_Edit,
    Profile_Edit_PasswordChange_EmailVerify,
    Profile_Edit_PasswordChange_PasswordChange,
    Address,
    Address_Add,
    Address_Add_OTP,
    Address_Edit,

    CartPage,
    WishListPage,
    CheckOutPage,
    ThankingPage,
    OrdersListing,
    ParticularOrderDetails,
    Invoice,
}


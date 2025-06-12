import React,{ lazy,Suspense } from 'react'
import { ToastContainer } from "react-toastify";
import {Routes,Route} from "react-router-dom";
import { BounceLoader } from 'react-spinners';

import import_AdminComps from "./importStateMents/Import_AdminComps.jsx";
import import_UserComs from "./importStateMents/import_UserComs.jsx";
const NOT_FOUND = lazy(()=>import("@/components/Not_found.jsx" ));

//Route Protection
import { AdminLoginSession,AdminSession,UserLogin,UserRegister,Home } from './session/Admin/AdminSession';
import {ProtectedRoute,AuthenticationProtect} from './session/User/ProtectedRoutes';
import Import_AdminComps from './importStateMents/Import_AdminComps.jsx';

const App = () => {

  const override= {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  return (
    <div>
      <ToastContainer position='bottom-center' limit={5} theme="dark" />
      
      <Suspense fallback={<div className='bg-black h-[100vh] text-white flex justify-center items-center'>
        <BounceLoader
        color="#c2ffa9"
        loading={true}
        cssOverride={override}
        size={50}
        aria-label="Loading Spinner"
        data-testid="loader"
        speedMultiplier={2}
      />
      </div>}>

      <Routes>
{/* ADMIN SIDE */}
        <Route path='/admin/login' 
          element={ <AdminLoginSession> <import_AdminComps.AdminLogin/> </AdminLoginSession>} />
        <Route path='/admin/dashboard' 
          element={ <AdminSession> <import_AdminComps.Dashboard/> </AdminSession>} />
        <Route path='/admin/usersManage' 
          element={ <AdminSession> <import_AdminComps.UsersPage/> </AdminSession> }/>
        <Route path='/admin/category' 
          element={ <AdminSession> <import_AdminComps.CategoryPage/> </AdminSession>} />
        <Route path='/admin/products' 
          element={ <AdminSession> <import_AdminComps.ProductPage/> </AdminSession>} />
        <Route path='/admin/products/add' 
          element={<import_AdminComps.AddProduct/>} />
        <Route path='/admin/products/edit/:id' 
          element={<import_AdminComps.EditProduct/>} />
        <Route path='/admin/orders' 
          element={<AdminSession><import_AdminComps.Admin_OrdersPage/> </AdminSession>} />
        <Route path='/admin/orders/details/:orderId' 
          element={<AdminSession><import_AdminComps.Admin_OrderDetailsOfAOrder/></AdminSession>} />

        <Route path='/admin/offer' 
              element={<import_AdminComps.Admin_Offer/>} />
        <Route path='/admin/offer/add' 
              element={<import_AdminComps.Admin_Offer_Add/>} />
        <Route path='/admin/offer/edit/:offerId' 
              element={<import_AdminComps.Admin_Offer_Edit/>} />


        <Route path='/admin/coupon' 
            element={<import_AdminComps.Admin_Coupon/>} />
        <Route path='/admin/coupon/add' 
            element={<import_AdminComps.Admin_Coupon_Add/>} />
        <Route path='/admin/coupon/edit/:couponId' 
            element={<import_AdminComps.Admin_Coupon_Edit/>} />
        
        <Route path='/admin/sales' 
            element={<import_AdminComps.Admin_SalesReport/>} />

          

 {/* USER SIDE */}
        <Route element={<AuthenticationProtect/>}>
            <Route path='/user/register'  element={  <import_UserComs.Registration/> } />
            <Route path='/user/otp' element={  <import_UserComs.OTP/>  } />
            <Route path='/user/profilePic' element={<import_UserComs.UploadPicture/>} />
            <Route path="/user/google-auth" element={<import_UserComs.GoogleAuth />} />
            <Route path='/user/login' element={  <import_UserComs.Login/> } />
            <Route path='/user/reEnterPassword' element={ <import_UserComs.ReEnterPassword/>  } />
            <Route path='/user/verifyEmail' element={ <import_UserComs.EmailVerify/>  } />
        </Route>

        <Route element={<ProtectedRoute/>}>
            <Route path='/user/homepage' element={ <import_UserComs.Homepage/>} />
            <Route path='/user/shop' element={<import_UserComs.ShopPage/>} />
            <Route path='/user/aboutUs' element={<import_UserComs.About/>} />
            <Route path='/user/contactUs' element={<import_UserComs.Contact/>} />

            <Route path='/user/productDetails/:productId' element={  <import_UserComs.ProductDetails/>  } />
            <Route path='/user/product/serum' element={<import_UserComs.Serum/>} />
            <Route path='/user/product/sunscreen' element={<import_UserComs.SunScreen/>} />
            <Route path='/user/product/tooner' element={<import_UserComs.Tooner />} />
            <Route path='/user/special/:catName' element={< import_UserComs.DynamiCat />} />

            <Route path='/user/profile' element={<import_UserComs.Profile/>} />

        {/* WEEK 12 TASK */}
        {/* Profile */}
        <Route path='/user/profile/edit' element={<import_UserComs.Profile_Edit/>} />
        <Route path='/user/profile/edit/forgotPassword_emailVerify' element={<import_UserComs.Profile_Edit_PasswordChange_EmailVerify/>} />
        <Route path='/user/profile/edit/forgotPassword_ChangePassword' element={<import_UserComs.Profile_Edit_PasswordChange_PasswordChange/>} />

        {/* address */}
        <Route path='/user/profile/address' element={<import_UserComs.Address/>} />
        <Route path='/user/profile/address/add' element={<import_UserComs.Address_Add/>} />
        <Route path='/user/profile/address/add/otp' element={<import_UserComs.Address_Add_OTP/>} />
        <Route path='/user/profile/address/edit/:id' element={<import_UserComs.Address_Edit/>} />

        {/* CartPage*/}
        <Route path='/user/cart' element={<import_UserComs.CartPage/>} />

        <Route path='/user/wallet' element= {<import_UserComs.Wallet/>} />

        <Route path='/user/wishlist' element={<import_UserComs.WishListPage/>} />
        <Route path='/user/checkout' element={<import_UserComs.CheckOutPage/>} />
        <Route path='/user/orderCompleted/:order_Id' element={<import_UserComs.ThankingPage/>} />
        <Route path='/user/order/failed/:order_Id' element={<import_UserComs.OrderFailure/>} />
        <Route path='/user/list-of-order' element={<import_UserComs.OrdersListing/>} />
        <Route path='/user/order-details/:order_Id' element={<import_UserComs.ParticularOrderDetails/>} />
        <Route path='/user/order/invoice/:order_Id' element={<import_UserComs.Invoice/>} />

        </Route>

        <Route path='*' element={ <import_UserComs.Homepage/> }/> 
      </Routes>
      </Suspense>
    </div>  
  )
}

export default App;

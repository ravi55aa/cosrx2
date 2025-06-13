import { lazy } from "react";

const AdminLogin = lazy(() => import("@/pages/admin/Authentication/Login"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard/Dashboard"));
const ProductPage = lazy(() => import("@/pages/admin/product/Product"));
const AddProduct = lazy(() =>import("@/pages/admin/product/addProduct/AddProduct"));
const EditProduct = lazy(() =>import("@/pages/admin/product/EditProduct/EditProduct"));
const CategoryPage = lazy(() => import("@/pages/admin/Category/Category"));
const UsersPage = lazy(() => import("@/pages/admin/UserManage.jsx/User"));
const Admin_OrdersPage = lazy(()=>import("@/pages/admin/Order/Orders.jsx"));
const Admin_OrderDetailsOfAOrder = lazy(()=>import("@/pages/admin/Order/SpecificOrderDetail.jsx"));

const Admin_Offer = lazy(()=>import("@/pages/admin/Offer/Index.jsx"));
const Admin_Offer_Add = lazy(()=>import("@/pages/admin/Offer/Add/Add_Offer.jsx"));
const Admin_Offer_Edit = lazy(()=>import("@/pages/admin/Offer/Edit/Edit_Offer.jsx"));

const Admin_Coupon = lazy(()=>import("@/pages/admin/Coupon/Index.jsx"));
const Admin_Coupon_Add = lazy(()=>import("@/pages/admin/Coupon/Add/AddCoupon"));
const Admin_Coupon_Edit = lazy(()=>import("@/pages/admin/Coupon/Edit/EditCoupon"));

const Admin_SalesReport = lazy(()=>import("@/pages/admin/Sales/SalesReport.jsx"));

export default {
  AdminLogin,
  Dashboard,
  UsersPage,
  ProductPage,
  AddProduct,
  EditProduct,
  CategoryPage,
  Admin_OrdersPage,
  Admin_OrderDetailsOfAOrder,
  
  Admin_Offer,
  Admin_Offer_Add,
  Admin_Offer_Edit,

  Admin_Coupon,
  Admin_Coupon_Add,
  Admin_Coupon_Edit,

  Admin_SalesReport
};

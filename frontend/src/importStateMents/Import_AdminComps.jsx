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
};

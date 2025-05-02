
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Admin.sidebar";
import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {getInvoiceOfOrder} from "@/Services/User/Order/Invoice.jsx";
import { FaRegSadTear } from "react-icons/fa";
import {
    admin_order_product_cancelRequest,
    admin_order_product_cancelRequest_reject,
    admin_management_order_cancelRequest_accept_service,
    admin_management_order_cancelRequest_reject_service,
    admin_order_updateStatus,
    admin_management_order_delivered_accept_service
} from "@/Services/Admin/Order/Order.jsx";

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [orderObj, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [updater,setUpdater] = useState(0);
    const [returnReason,setReturnReason]=useState("");
    const [isModalOpen, setIsModalOpen] = useState({id:"",toggle:false,mode:""});
    
    const fetchOrderDetails = async () => {
        if(!orderId){
            console.log('No orderId');
            return false;
        }

        const response = await getInvoiceOfOrder(orderId);
        
        if(!response){
            return false;
        }

        
        setOrder(response?.data?.invoice);
        setLoading(false);
        setNewStatus(response?.data?.invoice?.order?.status)
        return true;
    }

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const handleStatusUpdate = async () => {
        if (newStatus === orderObj.order?.status) {
        toast.info("SAME STATUS");
        return;
        }

        if (!window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
        return;
        }
        
        const response = await admin_order_updateStatus(orderId,newStatus);
        
        if(!response){
            fetchOrderDetails();
            return false;
        }
        
        fetchOrderDetails();
        return true;
    };

    const handleAcceptProductCancellation=async(productId)=>{
        const isConfirm =  confirm("Are you sure");

        if(!isConfirm){
            return;
        }

        const productCancel = await admin_order_product_cancelRequest(productId);

        if(!productCancel){
            return false;
        }

        setReturnReason("");
        fetchOrderDetails();
        return true;
    };

    const handleRejectProductCancellation=async()=>{
        const isConfirm =  confirm("Are you sure");

        if(!isConfirm){
            return;
        }

        const productCancel = await 
        admin_order_product_cancelRequest_reject(isModalOpen.id,returnReason);

        if(!productCancel){
            return false;
        }

        setIsModalOpen({id:"",toggle:false,});
        setReturnReason("");
        fetchOrderDetails();
        return true;
    };

    const openModal = (orderItemId) => {
        setIsModalOpen({id:orderItemId,toggle:true,});
    };
    
    const closeModal = () => {
        setIsModalOpen({id:"",toggle:false,});
        setReturnReason("");
    };

    if (loading) {
        return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            <div className="flex-1 p-4 sm:p-6 md:p-8">
            <p>Loading order details...</p>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            <Sidebar />
            <div className="flex-1 p-4 sm:p-6 md:p-8">
            <p className="text-red-400">{error}</p>
            <button
                onClick={() => navigate("/admin/orders")}
                className="mt-4 px-5 bg-teal-600 text-white rounded-2xl"
            >
                Back to Orders
            </button>
            </div>
        </div>
        );
    }

    const handleAcceptOrderCancellation=async(orderId)=>{
        const response = await admin_management_order_cancelRequest_accept_service(orderId);
        
        if(!response){
            return false;
        }
        
        fetchOrderDetails();
        return true;
    }

    const handleRejectOrderCancellation=async(orderId)=>{
        const response = await admin_management_order_cancelRequest_reject_service(orderId);
        
        if(!response){
            return false;
        }
        
        fetchOrderDetails();
        return true;
    }

    const handleAcceptOrderReturnRequest=async(orderId)=>{
        const response = await admin_management_order_delivered_accept_service(orderId);
        
        if(!response){
            return false;
        }
        
        fetchOrderDetails();
        return true;
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl font-semibold mb-6">
            Order Details - #{orderObj?.order?.orderId}
            </h1>

            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 rounded-lg p-6"
            >
            {/* Customer and Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                <h2 className="text-lg font-semibold mb-2 text-white">Customer Information</h2>
                <p className="text-gray-400">
                    <span className="font-semibold">Name:</span> {orderObj.order.userId?.firstName || "N/A"}
                </p>
                <p className="text-gray-400">
                    <span className="font-semibold">Email:</span> {orderObj.order.userId?.email || "N/A"}
                </p>
                </div>
                <div>
                <h2 className="text-lg font-semibold mb-2 text-white">Order Information</h2>
                <p className="text-gray-400">
                    <span className="font-semibold">Order Date:</span>{" "}
                    {orderObj?.orderAddress?.createdAt?.split(":")[0]
                    ?  "02-05-2025"
                    : "N/A"}
                </p>
                <p className="text-gray-400">
                    <span className="font-semibold">Total Amount:</span>{" "}
                    ₹{orderObj.order.paymentAmount?.toFixed(2) || "0.00"}
                </p>
                <p className="text-gray-400">
                    <span className="font-semibold">Status:</span>{" "}
                    <span
                    className={`px-2 py-1 rounded text-xs ${
                        orderObj.order?.status === "Pending"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : orderObj.order?.status === "Shipped"
                        ? "bg-blue-500/20 text-blue-400"
                        : orderObj.order?.status === "Delivered"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                    >
                    {orderObj.order?.status}
                    </span>
                </p>
                </div>
                {/* Address */}
                <div>
                <h2 className="text-lg font-semibold mb-2 text-white">Order Address</h2>
                <p className="text-gray-400">
                        {orderObj.orderAddress.name   || "N/A"}
                </p>
                <p className="text-gray-400">
                        {orderObj?.orderAddress?.landMark}
                </p>
                <p className="text-gray-400">
                    {` ${orderObj.orderAddress.city} ,${orderObj.orderAddress.phone} `  || "N/A"}
                </p>
                <p className="text-gray-400">
                        {` ${orderObj.orderAddress.state} - ${orderObj.orderAddress.pincode} `  || "N/A"}
                </p>
                
                </div>
            </div>
            <hr className="mx-auto w-[85%] mb-5 opacity-45 " />

            {/* Order Items Table */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2 text-white">Order Items</h2>
                <table className="w-full text-left text-gray-400">
                <thead>
                    <tr className="border-b border-gray-700">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Product Image</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {orderObj.orderItems?.length > 0 ? (
                    orderObj.orderItems?.map((item, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-4">
                            {item.product?.productName.slice(0,40) || "N/A"}
                        <br />
                            {item.product?.productName.slice(40,80) || "N/A"}
                        <br />
                            {item.product?.productName.slice(80) || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                            <img className="rounded-xl !h-[50px] object-fit !w-[50px]" src={item?.product?.productImage[0] || "bantai"} alt={item.product?.productName} />
                        </td>
                        <td className="py-3 px-4">{item.quantity || 0}</td>
                        <td className="py-3 px-4">
                            ₹{item.product?.salePrice?.toFixed(2) || "0.00"}
                        </td>
                        <td>
                        <span
                        className={`px-2 py-1 rounded text-xs ${
                            item?.status === "Pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : item?.status === "Shipped"
                            ? "bg-blue-500/20 text-blue-400"
                            : item?.status === "Delivered"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                        >
                        {item?.status}
                        </span>
                        </td>
                        <td className="py-3 px-4">
                            ₹{(item.product?.salePrice * item.quantity)?.toFixed(2) || "0.00"}
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="4" className="py-3 px-4 text-center">
                        No items found
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>

            {/* Manage Order Status */}
            <div className="mb-20">
                <h2 className="text-lg font-semibold mb-2 text-white">Manage Order Status</h2>
                {
                Object.values(orderObj?.order).some(value=> ["Returned", "Cancelled","Delivered","Order Return Requested",'Order Returned','Order Rejected'].includes(value))
                ?(
                <span
                className={`px-2 py-1 rounded text-xl ${
                    (orderObj.order?.status === "Cancelled" || orderObj.order?.status?.includes("Order"))
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                    
                }`}
                >
                {orderObj.order?.status}
            </span>
                )
                :(
                    <div className="flex items-center space-x-4">
                <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                    <option value="Shipped">Shipped</option>
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStatusUpdate}
                    className="px-5 py-2 bg-teal-600 text-white rounded-2xl"
                >
                    Update Status
                </motion.button>
                </div>
                ) 
                }
                
            </div>
            <hr className="mx-auto w-[85%] mb-5 opacity-45 " />

            {/* Cancel-Order or Return-Product */}
            {(
                orderObj.orderItems?.some(product => ["Return Requested", "Cancel Requested","Order Return Requested"].includes(product.status)) 
                ||
                Object.values(orderObj?.order).some(value=> ["Return Requested", "Cancel requested","Order Return Requested"].includes(value))
                ) && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-white">Cancel Requests</h2>
                    <table className="w-full text-left text-gray-400">
                    <thead>
                        <tr className="border-b border-gray-700">
                        <th className="py-3 px-4">Product Name</th>
                        <th className="py-3 px-4">Reason</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {orderObj.orderItems
                        ?.filter(item => ["Return Requested", "Cancel Requested"].includes(item.status))
                        .map((item, index) => (
                            <tr key={`item-${index}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="py-3 px-4">
                                {item.product?.productName?.slice(0, 40) || "N/A"}<br />
                                {item.product?.productName?.slice(40, 80)}<br />
                                {item.product?.productName?.slice(80)}
                            </td>
                            <td className="py-3 px-4 ">
                            {item?.returnReason}
                            </td>
                            <td>
                                <span
                                className={`px-2 py-1 rounded text-xs ${
                                    item?.status === "Pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : item?.status === "Shipped"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : item?.status === "Delivered"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                                >
                                {item?.status}
                                </span>
                            </td>
                            <td className="text-white">
                                <button
                                onClick={() => handleAcceptProductCancellation(item._id)}
                                type="button"
                                className="px-2 py-1 hover:bg-green-800 bg-green-600 mr-3 rounded-md"
                                >
                                Accept
                                </button>
                                <button
                                onClick={() => openModal(item._id)}
                                type="button"
                                className="px-2 py-1 hover:bg-red-800 bg-red-600 rounded-md"
                                >
                                Reject
                                </button>
                            </td>
                            </tr>
                        ))}

                        {orderObj.order?.status?.includes("Order")
                        &&
                        (
                            <tr key={`item-${123}`} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="py-3 px-4">
                                {orderObj?.order?.orderId}
                            </td>
                            <td className="py-3 px-4 ">
                            {orderObj?.order?.cancellationReason}
                            </td>
                            <td>
                                <span
                                className={`px-2 py-1 rounded text-xs ${
                                    orderObj?.order?.status === "Order Return Requested "
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : orderObj?.order?.status === "Shipped"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : orderObj?.order?.status === "Delivered"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                                >
                                {orderObj?.order?.status}
                                </span>
                            </td>
                            <td className="text-white">
                                <button
                                onClick={() => handleAcceptOrderReturnRequest(orderObj?.order?.orderId)}
                                type="button"
                                className="px-2 py-1 hover:bg-green-800 bg-green-600 mr-3 rounded-md"
                                >
                                Accept
                                </button>
                                {/* <button
                                onClick={() => openModal(item._id)}
                                type="button"
                                className="px-2 py-1 hover:bg-red-800 bg-red-600 rounded-md"
                                >
                                Reject
                                </button> */}
                            </td>
                            </tr>
                        )}

                        {Object.values(orderObj?.order).some(value=> ["Return Requested", "Cancel requested"].includes(value))
                        &&(
                        <tr key="order-level" className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="py-3 px-4">
                            {orderObj.order.orderId}
                            </td>
                            <td className="py-3 px-4">
                                {orderObj?.order.cancellationReason || "N/A"}
                            </td>
                            <td>

                            <span
                                className={`px-2 py-1 rounded text-xs ${
                                orderObj?.order?.status === "Pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : orderObj?.order?.status === "Shipped"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : orderObj?.order?.status === "Delivered"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                            >
                                {orderObj?.order?.status}
                            </span>
                            </td>
                            <td className="text-white">
                            <button
                                onClick={() => handleAcceptOrderCancellation(orderObj?.order?.orderId)}
                                type="button"
                                className="px-2 py-1 hover:bg-green-800 bg-green-600 mr-3 rounded-md"
                            >
                                Accept
                            </button>
                            <button
                                onClick={() => handleRejectOrderCancellation(orderObj?.order?.orderId)}
                                type="button"
                                className="px-2 py-1 hover:bg-red-800 bg-red-600 rounded-md"
                            >
                                Reject
                            </button>
                            </td>
                        </tr>)
                        }    
                    </tbody>
                    </table>
                </div>
                )}


            {/* Back Button */}
            <div className="flex justify-end">
                <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/admin/orders")}
                className="px-5 py-2 bg-gray-700 text-white rounded-2xl"
                >
                Back to Orders
                </motion.button>
            </div>
            </motion.div>
        </div>

        {isModalOpen.toggle && (
                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    >
                    <motion.div
                        initial={{ y: 50, scale: 0.9 }}
                        animate={{ y: 0, scale: 1 }}
                        exit={{ y: 50, scale: 0.9 }}
                        className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4">
                        <span>Provide Reason </span><span><FaRegSadTear/></span>
                        </h3>
                        <textarea
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Reason here..."
                        className="w-full p-2 bg-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-teal-400"
                        rows="4"
                        />
                        <div className="flex justify-end space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRejectProductCancellation}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Submit
                        </motion.button>
                        </div>
                    </motion.div>
                    </motion.div>
                )}
        </div>
    );
};

export default OrderDetails;

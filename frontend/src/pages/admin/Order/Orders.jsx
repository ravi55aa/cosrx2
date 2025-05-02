
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

import ReactPaginate from "react-paginate";
import Sidebar from "@/components/Admin.sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, EyeIcon } from "@heroicons/react/24/outline";

import { useNavigate } from "react-router-dom";
import { 
    admin_getAllOrders,
    admin_searchSubmit_Service,
} from "@/Services/Admin/Order/Order.jsx";

const OrdersPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [listing, setListing] = useState(false);
    const [orderDataObj,setOrderDataObj] = useState([]);

    const manageOrders = useSelector((state) => state.orders);

    const fetchOrders = async () => {
        const response = await admin_getAllOrders();
        
        if(!response){
            return false;
        }

        setOrderDataObj(response?.data?.orderData);
    }
    useEffect(() => {
        fetchOrders();
    }, []);

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [successMessage, setSuccessMessage] = useState("");

    const itemsPerPage = 4;
    const pageCount = Math.ceil(orderDataObj?.orders?.length / itemsPerPage);
    const offset = currentPage * itemsPerPage;
    const currentItems = orderDataObj?.orders?.slice(offset, offset + itemsPerPage);

    const sidebarVariants = useMemo(
        () => ({
        open: {
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        closed: {
            x: "-100%",
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        }),
        []
    );

    const rowVariants = useMemo(
        () => ({
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
        }),
        []
    );

    const toastVariants = useMemo(
        () => ({
        hidden: { opacity: 0, y: -50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
        }),
        []
    );

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const handlePageClick = useCallback(({ selected }) => {
        setCurrentPage(selected);
    }, []);

    const handleSearchSubmit = useCallback(async (term) => {

        
        if(!term?.trim()){
            fetchOrders();
        } 
        
        let response = await admin_searchSubmit_Service(term);
        console.log(response);
    
        if (!response) return false;
    
        setOrderDataObj(response?.data?.orderData);
        return true;
    }, [searchTerm]);
    
    const handleSearchChange = useCallback((e) => {
        const term = e.target.value;
        setSearchTerm(term);
    
        (async () => {
            await handleSearchSubmit(term);
        })();
    
        setCurrentPage(0);
    }, [searchTerm]);
    


    const handleViewOrderDetails = useCallback((orderId) => {
        navigate(`/admin/orders/details/${orderId}`);
    }, [navigate]);


    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
        <Sidebar />

        
        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
                <div className="flex items-center justify-between w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-semibold">Orders</h1>
                <Bars3Icon
                    className="h-8 w-8 text-white cursor-pointer md:hidden"
                    onClick={toggleSidebar}
                />
                </div>
                <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Search for Orders (Order ID or Customer Name)"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="me-3 w-full mt-2 p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                {searchTerm.trim()
                &&
                <button
                    type="button"
                    onClick={()=>setSearchTerm("")}
                    className="px-5 bg-red-600 text-white rounded-2xl"
                >
                    Clear
                </button>
                }
                </div>
            </div>
            </div>

            {/* Success Message */}
            {successMessage && (
            <motion.div
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-4 p-4 bg-green-500/20 text-green-400 rounded-lg"
            >
                {successMessage}
            </motion.div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block bg-gray-800 rounded-lg p-6 overflow-x-auto">
            <table className="w-full text-left text-gray-400 min-w-[600px]">
                <thead>
                <tr className="border-b border-gray-700">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Order Date</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Actions</th>
                </tr>
                </thead>
                <tbody>
                {orderDataObj?.orders?.length > 0 ? (
                    <AnimatePresence>
                    {currentItems?.map((order) => (
                        <motion.tr
                        key={order._id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
                        >
                        <td className="py-3 px-4">
                            {order?.orderId}
                        </td>
                        <td className="py-3 px-4">
                            
                        {(() => {
                            const orderItem = orderDataObj?.items?.find(
                                (item) => String(item.orderId) == String(order._id)
                            );

                            return orderItem && ["Return Requested", "Cancel Requested"].includes(orderItem.status);
                            })() 

                            && (
                            <span className="h-[10px] w-[10px] bg-red-500 inline-block mr-1 rounded-full"></span>
                        )}

                            {order.userId?.firstName || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                            {order?.createdAt
                            ? new Date(order.createdAt)?.toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                            ₹{order.paymentAmount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="py-3 px-4">
                            <span
                            onClick={() =>
                                handleOrderStatusChange(order._id, order.status)
                            }
                            className={`px-2 py-1 hover:cursor-pointer rounded text-xs ${
                                order.status === "Pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : order.status === "Shipped"
                                ? "bg-blue-500/20 text-blue-400"
                                : order.status === "Delivered"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                            >
                            {order.status}
                            </span>
                        </td>
                        <td className="py-3 px-4">
                            <motion.div whileHover={{ scale: 1.1, color: "#26a69a" }}>
                            <EyeIcon
                                className="h-5 w-5 text-gray-400 cursor-pointer"
                                onClick={() => handleViewOrderDetails(order?.orderId)}
                            />
                            </motion.div>
                        </td>
                        </motion.tr>
                    ))}
                    </AnimatePresence>
                ) : (
                    <AnimatePresence>
                    <motion.tr
                        key={1}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <td colSpan="6" className="text-center py-20">
                        <span className="underline">No orders in the DATABASE</span>
                        </td>
                    </motion.tr>
                    </AnimatePresence>
                )}
                </tbody>
            </table>
            
            <div className="mt-4">
                <ReactPaginate
                previousLabel={"← Previous"}
                nextLabel={"Next →"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={"flex justify-center space-x-2 mt-4"}
                pageClassName={
                    "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
                }
                activeClassName={"bg-teal-500"}
                previousClassName={
                    "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
                }
                nextClassName={
                    "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
                }
                disabledClassName={"opacity-50 cursor-not-allowed"}
                />
            </div>
            </div>

            {/* Mobile Card View  */}
            <div className="block md:hidden space-y-4">
            {orderDataObj?.orders?.length > 0 ? (
                <AnimatePresence>
                {currentItems?.map((order) => (
                    <motion.div
                    key={order._id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">
                        Order #{order.orderId}
                        </h3>
                        <p className="text-gray-400">
                        Customer: {order?.userId?.firstName || "N/A"}
                        </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                        <span className="text-gray-400">Order Date:</span>{" "}
                        {order?.createdAt
                            ? new Date(order.createdAt)?.toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div>
                        <span className="text-gray-400">Total:</span>{" "}
                        ₹{order.paymentAmount?.toFixed(2) || "0.00"}
                        </div>
                        <div>
                        <span className="text-gray-400">Status:</span>{" "}
                        <span
                            onClick={() =>
                            handleOrderStatusChange(order._id, order.status)
                            }
                            className={`px-2 py-1 hover:cursor-pointer rounded text-xs ${
                            order.status === "Pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : order.status === "Shipped"
                                ? "bg-blue-500/20 text-blue-400"
                                : order.status === "Delivered"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                        >
                            {order.status}
                        </span>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <motion.div whileHover={{ scale: 1.1, color: "#26a69a" }}>
                        <EyeIcon
                            className="h-5 w-5 text-gray-400 cursor-pointer"
                            onClick={() => handleViewOrderDetails(order?.orderId)}
                        />
                        </motion.div>
                    </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            ) : (
                <AnimatePresence>
                <motion.div
                    key={1}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                >
                    <div className="flex justify-center underline px-2 py-20">
                    No orders in the DATABASE
                    </div>
                </motion.div>
                </AnimatePresence>
            )}

            {/* Pagination */}
            <div className="mt-4">
                <ReactPaginate
                previousLabel={"← Previous"}
                nextLabel={"Next →"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={"flex justify-center space-x-2 mt-4"}
                pageClassName={
                    "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
                }
                activeClassName={"bg-teal-500"}
                previousClassName={
                    "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
                }
                nextClassName={
                    "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
                }
                disabledClassName={"opacity-50 cursor-not-allowed"}
                />
            </div>
            </div>
        </div>
        </div>
    );
    };

export default OrdersPage;
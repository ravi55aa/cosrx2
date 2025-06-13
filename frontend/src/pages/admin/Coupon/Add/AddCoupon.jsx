
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    ShoppingBagIcon,
    UserIcon,
    TagIcon,
    TicketIcon,
    CogIcon,
    ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosBaseUrl from "$/axios";
import { ClipLoader } from "react-spinners";
import {handleValidation} from "../business";
import {
    admin_coupon_add_success,
} from "@/Services/Admin/Coupon/Coupon.jsx";

const AddCouponPage = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [formData, setFormData] = useState({
        code:"",
        name:"",
        startDate:"",
        expireOn:"",
        offerPrice:"",
        minimumPrice:"",
        isActive:true,
        usageLimit:"1",
    });

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback( async (e) => {
        e.preventDefault();
        setSpinner(true);
        
        const { code,name,startDate, expireOn, minimumPrice,offerPrice, usageLimit,isActive } = formData;

        const validated = await handleValidation(formData);
        
        if (Array.isArray(validated)) {
            setSpinner(false);
            const errorFields = validated.flatMap((name) => Array.from(document.getElementsByName(name)));
            errorFields.forEach((el) =>el.classList.add(" border-red"));
            
            return;
        }
        const payload = {
        code,
        name,
        startDate,
        expireOn,
        offerPrice: parseFloat(offerPrice),
        minimumPrice: parseFloat(minimumPrice),
        isActive,
        usageLimit: parseInt(usageLimit),
        };

        const response = await admin_coupon_add_success(payload);

        if (!response) {
            setSpinner(false);
            return false;
        }

        toast.success("New Coupon added successfully");
        navigate("/admin/coupon");
        return true;
        
    },[formData, navigate]);

    const sidebarVariants = useMemo(
        () => ({
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
        }),
        []
    );

    const containerVariants = useMemo(
        () => ({
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        }),
        []
    );

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
        <motion.div
            className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-6 z-20 md:static md:w-64 md:block ${
            isSidebarOpen ? "block" : "hidden md:block"
            }`}
            initial="closed"
            animate={isSidebarOpen ? "open" : "closed"}
            variants={sidebarVariants}
        >
            <div className="flex justify-between items-center mb-10">
            <div className="text-2xl font-bold text-teal-400">COSRX</div>
            <XMarkIcon
                className="h-6 w-6 text-white cursor-pointer md:hidden"
                onClick={toggleSidebar}
            />
            </div>
            <ul className="space-y-6">
            <li className="flex items-center space-x-3 text-teal-400">
                <HomeIcon className="h-6 w-6" />
                <span>Dashboard</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <ShoppingBagIcon className="h-6 w-6" />
                <span>Product</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <ShoppingBagIcon className="h-6 w-6" />
                <span>Orders</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <UserIcon className="h-6 w-6" />
                <span>Users</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <TagIcon className="h-6 w-6" />
                <span>Categories</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <TicketIcon className="h-6 w-6" />
                <span>Offers</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <TicketIcon className="h-6 w-6" />
                <span>Banner</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <TicketIcon className="h-6 w-6" />
                <span>Coupons</span>
            </li>
            <li className="flex items-center space-x-3 text-teal-400">
                <CogIcon className="h-6 w-6" />
                <span>Settings</span>
            </li>
            <li className="flex items-center space-x-3 text-red-400">
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                <span>Logout</span>
            </li>
            </ul>
        </motion.div>

        {isSidebarOpen && (
            <div
            className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
            ></div>
        )}

        <div className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold">Add Coupon</h1>
            <Bars3Icon
                className="h-8 w-8 text-white cursor-pointer md:hidden"
                onClick={toggleSidebar}
            />
            </div>

            <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1">Coupon Code:</label>
                    <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Enter coupon code"
                    required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Coupon Name:</label>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Enter coupon name"
                    required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Start Date:</label>
                    <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Expiry Date:</label>
                    <input
                    type="date"
                    name="expireOn"
                    value={formData.expireOn}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                    />
                </div>
                </div>
                <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1">Discount Amount (₹):</label>
                    <input
                    type="number"
                    name="offerPrice"
                    value={formData.offerPrice}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Enter discount amount"
                    required
                    min="1"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Minimum Purchase Amount (₹):</label>
                    <input
                    type="number"
                    name="minimumPrice"
                    value={formData.minimumPrice}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Enter minimum purchase amount"
                    required
                    min="1"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Usage Limit:</label>
                    <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Enter usage limit"
                    required
                    min="1"
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Status:</label>
                    <select
                    name="isActive"
                    value={formData.isActive}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                    </select>
                </div>
                <div className="gap-3 flex">
                    <motion.button
                    type="button"
                    onClick={() => navigate("/admin/coupon")}
                    whileHover={{ scale: 1.05, backgroundColor: "#00a61a" }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full lg:w-auto mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                    Cancel
                    </motion.button>
                    <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05, backgroundColor: "#26a69a" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e)=>handleSubmit(e)}
                    className="w-full lg:w-auto mt-4 bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition-colors"
                    >
                    {spinner ? <ClipLoader loading /> : "Submit"}
                    </motion.button>
                </div>
                </div>
            </form>
            </motion.div>
        </div>
        </div>
    );
};

export default AddCouponPage;

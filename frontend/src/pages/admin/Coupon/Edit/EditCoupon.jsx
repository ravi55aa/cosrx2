
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
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import axiosBaseUrl from "$/axios";
import { ClipLoader } from "react-spinners";
import {
    admin_coupon_edit_fetchCouponData_success,
    admin_coupon_edit_success,
} from "@/Services/Admin/Coupon/Coupon"

const EditCouponPage = () => {
    const navigate = useNavigate();
    const { couponId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [formData, setFormData] = useState({
        couponCode: "",
        couponName: "",
        startDate: "",
        expiryDate: "",
        discountAmount: "",
        minimumPrice: "",
        status: true,
        usageLimit: "1",
    });

    useEffect(() => {
        const fetchCoupon = async () => {
            const response = await admin_coupon_edit_fetchCouponData_success(couponId);
            
            if (!response) {
                return false;
            }

            const coupon = response?.data?.coupon;
            setFormData({
            couponCode: coupon.code || "",
            couponName: coupon.name || "",
            startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : "",
            expiryDate: coupon.expireOn ? new Date(coupon.expireOn).toISOString().split("T")[0] : "",
            discountAmount: coupon.offerPrice || "",
            minimumPrice: coupon.minimumPrice || "",
            status: coupon.isActive,
            usageLimit: coupon.usageLimit || "1",
            });
        };
        fetchCoupon();
    }, [couponId]);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
        e.preventDefault();
        setSpinner(true);

        const { couponCode, couponName, startDate, expiryDate, discountAmount, minimumPrice, usageLimit } = formData;

        // Validation
        if (!couponCode || !couponName || !startDate || !expiryDate || !discountAmount || !minimumPrice || !usageLimit) {
            toast.error("Please fill in all required fields");
            setSpinner(false);
            return;
        }

        if (discountAmount <= 0 || minimumPrice <= 0 || usageLimit <= 0) {
            toast.error("Discount amount, minimum price, and usage limit must be greater than 0");
            setSpinner(false);
            return;
        }

        if( minimumPrice > 100000){
                toast.error("minimum price should be under 100000");
                setSpinner(false);
                return false;
            }
        
            let valid = Math.floor((minimumPrice*25)/100)
        
            if(discountAmount > valid ){
                const response = await Swal.fire( 
                    {
                        title:"Offer Error",
                        text:`The offer price must be less than 25% of the minimum purchase amount. For your input, 25% of ₹${minimumPrice} is ₹${valid}. Please adjust the offer price accordingly.`,
                        icon:"error"
                    });
                
                setSpinner(false);
                if(response.isConfirmed){
                    return false;
                };
                
                return false;
            }
        
            if(usageLimit > 1000){
                toast.error("Usage-limit should be under the 1000 ");
                setSpinner(false);
                return false;
            }

        const start = new Date(startDate);
        const expiry = new Date(expiryDate);
        if (isNaN(start.getTime()) || isNaN(expiry.getTime())) {
            toast.error("Invalid date format for start or expiry date");
            setSpinner(false);
            return;
        }

        if (start >= expiry) {
            toast.error("Start date must be before expiry date");
            setSpinner(false);
            return;
        }

        const payload = {
        code: couponCode,
        name: couponName,
        startDate,
        expireOn: expiryDate,
        offerPrice: parseFloat(discountAmount),
        minimumPrice: parseFloat(minimumPrice),
        isActive: formData.status,
        usageLimit: parseInt(usageLimit),
        };

        const response = await admin_coupon_edit_success(couponId, payload);
        
        if (!response) {
            setSpinner(false);
            return;
        }

        setSpinner(false);
        toast.success("Coupon updated successfully");
        navigate("/admin/coupon");
        
    },
        [formData, couponId, navigate]
    );

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
            <h1 className="text-2xl sm:text-3xl font-semibold">Edit Coupon</h1>
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
                    name="couponCode"
                    value={formData.couponCode}
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
                    name="couponName"
                    value={formData.couponName}
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
                    name="expiryDate"
                    value={formData.expiryDate}
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
                    name="discountAmount"
                    value={formData.discountAmount}
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
                    name="status"
                    value={formData.status}
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
                    className="w-full lg:w-auto mt-4 bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition-colors"
                    >
                    {spinner ? <ClipLoader loading /> : "Update"}
                    </motion.button>
                </div>
                </div>
            </form>
            </motion.div>
        </div>
        </div>
    );
};

export default EditCouponPage;
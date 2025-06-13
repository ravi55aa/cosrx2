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
import { useNavigate, useParams } from "react-router-dom";
import axiosBaseUrl from "$/axios";
import { ClipLoader } from "react-spinners";

import {  
    admin_editOffer_fetchOfferData,
    admin_editOffer_success,
    admin_fetchCategory_success,
    admin_fetchProducts_success
} from "@/Services/Admin/Offer/Offer.jsx"

import {
    validate_fields_edit_business
} from "@/pages/admin/Offer/business.js";

const EditOfferPage = () => {
    const navigate = useNavigate();
    const { offerId } = useParams(); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [spinner, setSpinner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        offerName: "",
        description: "",
        discountType: "Percentage",
        discountAmount: "",
        validFrom: "",
        validUpto: "",
        offerType: "Product",
        applicableTo: "",
        offerTypeRef: "",
    });

//fetching the cat and pro;
//-------------------------
    const fetchProducts = async () => {
            const response = await admin_fetchProducts_success();
            
            if(!response) {
                return false;
            }

            const result = await response.data;

            if(!result?.products){
            console.log("products not found");
            return;
            }

            //USING STATE OVER STORE   
            //-------------------------------------
            // setTimeout(()=>{
            //   dispatch(loadProducts(result?.products));
            // },1000);
    
            setProducts(result?.products);
    };

    const fetchCategory = async () => {
            const response = await admin_fetchCategory_success();
            
            if (!response) {
            return false;
            }

            const categoryss = response.data?.category;
            setCategories((categoryss || []));
    };

    const fetchOfferDetails=async(offerId)=>{
        const response = await admin_editOffer_fetchOfferData(offerId);
        
        if(!response){
            return false;
        }

        for (let key in response?.data?.offer){
            if(formData.hasOwnProperty(key)) {
                formData[key] = response?.data?.offer[key]; 
            } 
        };

        return true;
    }

    useEffect(()=>{
        const fetchAllData=async()=>{
            await fetchOfferDetails(offerId)
            await fetchCategory();
            await fetchProducts();
            setSpinner(false)
            setLoading(false)
        }

        fetchAllData();
    }, []);


    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleFields = () => {
        if(!validate_fields_edit_business(formData)){
                    return false;
                }
        
        return true;
    };

    const handleSubmit = useCallback( async (e) => {
        e.preventDefault();
        setSpinner(true);
        const allFieldsAreOkay = handleFields();

        if (!allFieldsAreOkay) {
            setSpinner(false);
            return false;
        }
        
        const response = admin_editOffer_success(offerId,formData);
        
        if(!response){
            setSpinner(false);
            return;
        }

        setSpinner(false);
        toast.success("Offer updated successfully");
        navigate("/admin/offer");
        return true;

        },
        [formData, offerId, navigate]
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

    if (loading) {
        return (
        <div className="flex min-h-screen bg-gray-900 text-white justify-center items-center">
            <ClipLoader color="#26a69a" loading />
        </div>
        );
    }

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
            <h1 className="text-2xl sm:text-3xl font-semibold">Edit Offer</h1>
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
                    <label className="block text-gray-400 mb-1">Offer Name:</label>
                    <input
                    type="text"
                    name="offerName"
                    value={formData?.offerName}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    placeholder="Enter offer name"
                    required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Description:</label>
                    <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    rows="3"
                    placeholder="Enter offer description"
                    required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Discount Amount Type:</label>
                    <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                    <option value="Percentage">Percentage</option>
                    <option value="Flat">Flat</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">
                    Discount Amount {formData.discountType === "Percentage" ? "(%)" : "(₹)"}:
                    </label>
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
                    <label className="block text-gray-400 mb-1">Start Date:</label>
                    <input
                    type="date"
                    name="validFrom"
                    value={new Date(formData.validFrom).toISOString().slice(0, 10)}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                    />
                </div>
                </div>
                <div className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1">End Date:</label>
                    <input
                    type="date"
                    name="validUpto"
                    value={new Date(formData.validUpto).toISOString().slice(0,10)}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    required
                    />
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Offer Type:</label>
                    <select
                    name="offerType"
                    value={formData.offerType}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                    <option value="Product">Product</option>
                    <option value="Category">Category</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Apply To:</label>
                    <select
                    name="applicableTo"
                    value={formData.applicableTo}
                    onChange={handleChange}
                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                    <option value="">Select {formData.offerType}</option>
                    {formData.offerType === "Product"
                        ? products?.map((product) => (
                            <option key={product._id} value={product._id}>
                            {product.productName || "Unnamed Product"}
                            </option>
                        ))
                        : categories?.map((category) => (
                            <option 
                            key={category._id} 
                            value={category._id}>
                            {category.name || "Unnamed Category"}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-gray-400 mb-1">Status:</label>
                    <select
                    name="isListed"
                    value={formData.isListed}
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
                    onClick={() => navigate("/admin/offer")}
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

export default EditOfferPage;
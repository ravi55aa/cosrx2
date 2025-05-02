import { useEffect, useRef, useState } from "react";

import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";

import Footer from "@/components/Footer";
import HeaderSection from "@/components/HeaderSection";


import { FaRegSadTear } from "react-icons/fa";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getInvoiceOfOrder} from "@/Services/User/Order/Invoice.jsx";
import { 
    user_order_return_Service,
    user_order_delivered_return_Service,
} from "@/Services/User/Order/Order.jsx";


const demoOrder = {
    orderId: "ORD-06641-593071",
    orderDate: "2025-04-28",
    status: "Pending",
    items: [
        {
        productId: "1",
        productName: "Cristiano Ronaldo Origins",
        price: 2299.50,
        quantity: 1,
        productImage: "https://via.placeholder.com/200x300?text=CR7",
        },
    ],
    shippingAddress: {
        label: "shibil.k",
        details:
        "8111903193, 9744560634, near amapally masjid, neelancheri po, vazhakkili, Malappuram, karuvarakundu, kerala, 676525",
    },
    subtotal: 4599.00,
    discount: 0.00,
    offerDiscount: -2299.50,
    total: 2299.50,
};

const OrderDetails = () => {

    const { order_Id } = useParams();
    const navigate = useNavigate();
    const [invoiceData, setInvoiceData] = useState(null);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState({id:"",toggle:false,mode:""});
    const [isModal2Open, setIsModal2Open] = useState({id:"",toggle:false,mode:""});
    const [returnReason, setReturnReason] = useState("");
    const invoiceElement = useRef(null);
    const [updater,setUpdater ]= useState(0);

    const statusColorMap = {
        Pending: "bg-yellow-500",
        Processing: "bg-blue-500",
        Shipped: "bg-indigo-500",
        Delivered: "bg-green-600",
        Cancelled: "bg-gray-500",
        "Cancel requested": "bg-gray-400",
        "Return Requested": "bg-orange-500",
        Returned: "bg-teal-600",
        "Return Rejected": "bg-red-600",
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    useEffect(() => {
        const fetchInvoiceData = async () => {
        try {
            const response = await getInvoiceOfOrder(order_Id);
            if (!response || !response.data?.invoice) {
            setError("Failed to fetch invoice data");
            return;
            }
            setInvoiceData(response?.data?.invoice);
        } catch (err) {
            setError("Error fetching invoice: " + err.message);
        }
        };


        if (order_Id) {
        fetchInvoiceData();
        }
    }, [order_Id,updater]);

    
    const handleSubmitReturnRequest = async() => {
        if (!returnReason.trim()) {
        toast.error("Please provide a reason for the return.");
        return;
        }

        const response = await user_order_return_Service(isModalOpen.id,isModalOpen.mode,returnReason);

        if(!response){
            setIsModalOpen({id:"",toggle:false,mode:""});
            setReturnReason("");
            return false;
        }
        
        setIsModalOpen({id:"",toggle:false,mode:""});
        setReturnReason("");
        setUpdater((prev)=>prev+1)
        return true;
    }

    const handleSubmitReturnOrderRequest = async() => {
        if (!returnReason.trim()) {
        toast.error("Please provide a reason for the return.");
        return;
        }

        const response = await user_order_delivered_return_Service(isModal2Open.id,isModal2Open.mode,returnReason);

        if(!response){
            setIsModalOpen({id:"",toggle:false,mode:""});
            setIsModal2Open({id:"",toggle:false,mode:""});
            setReturnReason("");
            return false;
        }
        
        setIsModal2Open({id:"",toggle:false,mode:""});
        setReturnReason("");
        setUpdater((prev)=>prev+1)
        return true;
    }

    const openModal = (orderItemId,cancelMode) => {
        setIsModalOpen({id:orderItemId,toggle:true,mode:cancelMode});
    };

    const openModal2 = (orderItemId,cancelMode) => {
        setIsModal2Open({id:orderItemId,toggle:true,mode:cancelMode});
    };
    
    const closeModal = () => {
        setIsModalOpen({id:"",toggle:false,mode:""});
        setIsModal2Open({id:"",toggle:false,mode:""});
        setReturnReason("");
    };

    if (error) {
        return (
        <div className="bg-gray-50 min-h-screen">
            <HeaderSection />
            <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <p className="text-red-600">{error}</p>
                <button
                className="mt-4 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                onClick={() => navigate("/user/orders")}
                >
                Back to Orders
                </button>
            </div>
            </section>
            <Footer />
        </div>
        );
    }

    if (!invoiceData) {
        return (
        <div className="bg-gray-50 min-h-screen">
            <HeaderSection />
            <section className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <p className="text-gray-800">Loading order details...</p>
            </div>
            </section>
            <Footer />
        </div>
        );
    }

    const statusOrder = ["Processing", "Pending", "Shipped", "Delivered"];

    return (
        <div className="bg-gray-50">
        <HeaderSection />

        <section ref={invoiceElement} className="py-16 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Order Details {order_Id}
                </h2>
                <div className="space-x-2">
                {(invoiceData?.order.status !== "Cancelled" && 
                    invoiceData?.order.status !== "Delivered" &&
                    !invoiceData?.order?.status?.includes("Order")
                ) && (
                    <motion.button
                        className="py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openModal(order_Id, "cancelOrder")}
                    >
                        Cancel Order
                    </motion.button>
                    )}

                    {(invoiceData?.order.status == "Delivered" ||
                    invoiceData?.order?.status?.includes("Order")
                    )
                    && 
                            <motion.button
                            className="py-1 px-3 bg-orange-600 text-white rounded-md hover:orange-red-700 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openModal2(order_Id, "cancelDelivery")}
                        >
                            Return Order 
                        </motion.button>
                    }

                    <motion.button
                    className="py-1 px-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={()=>navigate(`/user/order/invoice/${order_Id}`)}
                    >
                    see Invoice
                    </motion.button>
                </div>
                </div>

                {/* Progress Tracker */}
                <div className="w-full mt-4">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                        {["Processing", "Pending", "Shipped", "Delivered"].map((step, index) => (
                        <div key={index} className="text-center flex-1">
                            <div className={`relative z-10 w-6 h-6 mx-auto rounded-full ${
                            invoiceData?.order?.status === step
                                ? 'bg-green-300 text-white'
                                : statusOrder.indexOf(invoiceData?.order?.status) > index
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-700'
                            } flex items-center justify-center`}>
                            {index + 1}
                            </div>
                            <div className="mt-2">{step}</div>
                        </div>
                        ))}
                        {invoiceData?.order?.status === "Cancelled" && (
                        <div className="text-center flex-1">
                            <div className="relative z-10 w-6 h-6 mx-auto rounded-full bg-red-500 text-white flex items-center justify-center">
                            ✖
                            </div>
                            <div className="mt-2">Cancelled</div>
                        </div>
                        )}
                    </div>

                    {/* Progress Line */}
                    <div className="relative h-1 mb-6 bg-gray-300 rounded">
                        <div
                        className={`absolute h-1 bg-blue-500 rounded transition-all duration-500 ease-in-out`}
                        style={{
                            width: invoiceData?.order?.status === "Cancelled"
                            ? "100%"
                            : `${(statusOrder.indexOf(invoiceData?.order?.status) + 1) * 25}%`,
                        }}
                        />
                    </div>
                    </div>


                {/* Order Status and Date */}
                <div
                className="flex items-center justify-between mb-6"
                data-aos="fade-up"
                data-aos-delay="100"
                >
                <span className="text-gray-600 shadow shadow-gray-800">{invoiceData?.order?.status} </span>
                <motion.button
                    className="py-1 px-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Order Date: {invoiceData?.order?.createdAt?.split(":")[0]}
                </motion.button>
                </div>

                {/* Shipping Address */}
                <div
                className="mb-6"
                data-aos="fade-up"
                data-aos-delay="200"
                >
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                    <svg
                    className="w-5 h-5 text-teal-600 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.243l-4.243-4.243m0 0L9.172 7.757M13.414 12H21m-7.586 4.243l4.243 4.243M6.343 17.657l4.243-4.243m0 0l4.243-4.243M10.586 13.414V21M6.343 6.343l4.243 4.243m0 0L14.828 6.343"
                    />
                    </svg>
                    Shipping Address
                </h3>
                <p className="text-gray-800">{invoiceData?.order.userId?.userName}</p>
                <p className="text-gray-600 text-sm">
                    {invoiceData?.orderAddress.name}
                    <span> {invoiceData?.orderAddress.state}</span>
                    <span> {invoiceData?.orderAddress.phone}</span>
                </p>
                <p className="text-gray-600 text-sm">
                {invoiceData?.orderAddress.landMark}
                </p>
                <p className="text-gray-600 text-sm">
                    <span>{invoiceData?.orderAddress.city}</span>{" "}
                    <span>{invoiceData?.orderAddress.pincode}</span>
                </p>
                </div>

                {/* Order Items */}
                <div
                className="mb-6"
                data-aos="fade-up"
                data-aos-delay="300"
                >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                {invoiceData?.orderItems?.map((item, index) => (
                    <motion.div
                    key={item._id}
                    className="bg-white rounded-lg shadow-md p-4 flex items-center mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                    <img
                        src={item.product.productImage[0]}
                        alt={item.name?.slice(0, 30)}
                        className="w-16 h-16 object-contain mr-4"
                    />
                    <div className="flex-1">
                        <p className="text-gray-800 font-semibold">{item.name?.slice(0, 30)}..</p>
                        <p className="text-gray-600 text-sm">
                        ₹{item?.product?.salePrice.toFixed(2)} x Qty: {item.quantity}
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-row gap-3">
                            <motion.button
                                className={`py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors 
                                ${["Pending","Processing","Shipped"].includes(item.status) ? "block opacity-80" :"hidden opacity-0" } `}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openModal(item._id, "returnProduct")}
                            >
                                Cancel Product
                            </motion.button>

                            <motion.div
                            className={`ml-4 py-1 px-3 text-white opacity-60 rounded-xl ${
                                statusColorMap[item?.status] || "bg-gray-300"
                            }`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                            >
                            {item?.status}
                            </motion.div>
                            </div>
                            
                            {item?.returnRejectReason?.trim() &&
                            <p className="text-sm bg-red-200 opacity-80 rounded-md px-1 text-red-600">
                                *Return Request cancelled due to :- <br />
                                <strong>{item?.returnRejectReason}</strong>
                            </p>}

                        </div>
                    </motion.div>
                ))}
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-800">
                    <span>Subtotal</span>
                    <span>₹{invoiceData?.order.paymentAmount}</span>
                    </div>
                    <div className="flex justify-between text-teal-600">
                    <span>Savings</span>
                    <span>₹{0}</span>
                    </div>
                    <div className="flex justify-between text-gray-800">
                    <span>Shipping</span>
                    <span className={invoiceData?.order?.paymentAmount >= 500 ? "text-green-500" : "text-gray-700"}>
                        {invoiceData?.order?.paymentAmount >= 500 ?  `₹40` : "Free"} 
                    </span>
                    </div>
                    <div className="flex justify-between text-gray-800 font-semibold text-lg border-t pt-2">
                    <span>Grand Total</span>
                    <span>₹{ invoiceData?.order?.paymentAmount + ( invoiceData?.order?.paymentAmount >= 500 ? 43 : 3) }  </span>
                    </div>
                </div>
            </div>
            </div>
        </section>

        {/* Footer */}
        <Footer />

        {/* Modal for Return/Cancel Reason */}
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
                    onClick={handleSubmitReturnRequest}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                    Submit
                </motion.button>
                </div>
            </motion.div>
            </motion.div>
        )}

{isModal2Open.toggle && (
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
                    onClick={handleSubmitReturnOrderRequest}
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

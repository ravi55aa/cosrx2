
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, useNavigate } from "react-router-dom";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import {listALLuserOrders} from "@/Services/User/Order/Order.jsx"


const OrderList = () => {
    const [orders, setOrders] = useState([]); 
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);


    useEffect(() => {
        const fetchAllOrderedItems = async()=> {
            const response = await listALLuserOrders();
            
            if(!response){
                return false;
            }
            const data = response?.data?.orderItems &&
    response.data.orderItems
    .map(subArray => {  
        const seen = new Set();
        return subArray.filter(ord => {
            console.log(ord)
            const productID = ord?.product
            
            if (!productID) return false;
            if (seen.has(productID)) {
                return false;
            } else {
                seen.add(productID);
                return true;
            }
        });
    })
    .filter(subArray => subArray.length > 0);

    console.log(data);

        
            setOrders(data);
            setFilteredOrders(data);
            return true;
        }

        fetchAllOrderedItems();
    }, [navigate]);

    useEffect(() => {
        if (!searchQuery.trim()) {
        setFilteredOrders(orders);
        return;
        }
        const filtered = orders?.map(subArray => 
            subArray?.filter(order => 
                order?.orderId?.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        ).filter(subArray => subArray.length > 0);         
        setFilteredOrders(filtered);
    }, [searchQuery, orders]);

    return (
        <div className="bg-gray-50">
        
        <HeaderSection />

        
        <section className="py-16 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4">
            <h2
                className="text-3xl font-bold text-gray-800 mb-6"
                data-aos="fade-up"
            >
                Your Orders
            </h2>

            {/* Search Bar */}
            <div
                className="mb-8 flex items-center bg-white rounded-lg shadow-md p-4"
                data-aos="fade-up"
                data-aos-delay="100"
            >
                <svg
                className="w-5 h-5 text-gray-600 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
                </svg>
                <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID..."
                className="w-full p-2 outline-none text-gray-800"
                />
            </div>

            {/* Orders List */}
            {filteredOrders?.length === 0 ? (   
                <div
                className="text-center text-gray-600 mt-8"
                data-aos="fade-up"
                data-aos-delay="200"
                >
                <p>No orders found. {searchQuery && "Try a different search term."}</p>
                <Link to="/user/shop" className="text-teal-600 hover:underline">
                    Explore products
                </Link>
                </div>
            ) : (
                <div className="space-y-6">
                {filteredOrders?.map((sOrders, index) => {
                    if (sOrders.length === 0) return null; 

                    const mainOrder = sOrders[0];

                    return (
                    <motion.div
                        key={mainOrder._id}
                        className="bg-white rounded-lg shadow-md p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                    >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                        <div>
                            <p className="text-gray-800 font-semibold">
                            Order ID: {mainOrder?.orderId?.orderId}
                            </p>
                            <p className="text-gray-600 text-sm">
                            Order Date: {new Date(mainOrder?.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                            <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                mainOrder.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : mainOrder.status === "Processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                            >
                            {mainOrder.status}
                            </span>
                        </div>
                        </div>

                        {/* Order Items */}
                        <div className="border-t pt-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-2">
                            Items
                        </h4>

                        {sOrders.map((item, idx) => (
                            <p key={idx} className="text-gray-600 text-sm">
                            {item?.name?.slice(0, 30)} (Qty: {item?.quantity})
                            </p>
                        ))}
            </div>

        {/* Footer */}
        <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <p className="text-gray-800 font-semibold">
            Total: 
            <span>₹{mainOrder?.price}  </span>
          </p>
          <Link to={`/user/order-details/${mainOrder?.orderId?.orderId}`}>
            <motion.button
              className="mt-2 sm:mt-0 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Details
            </motion.button>
          </Link>
        </div>
      </motion.div>
    );
  })}
</div>

            )}
            </div>
        </section>

        {/* Footer */}
        <Footer />
        </div>
    );
};

export default OrderList;

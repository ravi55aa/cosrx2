
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

const OrderFailure = () => {
    const navigate = useNavigate();
    const { order_Id } = useParams();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const handleRetryPayment = () => {
        navigate(`/user/checkout`);
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
            
            <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            data-aos="fade-up"
            >
            <svg
                className="w-32 h-32 text-red-500 mx-auto mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            </motion.div>

            <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            data-aos="fade-up"
            data-aos-delay="100"
            >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Payment Failed
            </h2>
            <p className="text-gray-600">
                We're sorry, but there was an issue processing your payment for Order ID:{" "}
                <span className="font-semibold">{order_Id}</span>. Please try again or check your payment details.
            </p>
            </motion.div>

            <div
            className="flex flex-col sm:flex-row justify-center gap-4"
            data-aos="fade-up"
            data-aos-delay="200"
            >
            <motion.button
                className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetryPayment}
            >
                Retry Payment
            </motion.button>
            <Link to={`/user/list-of-order`} onClick={() => window.scrollTo(0, 0)}>
                <motion.button
                className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                >
                View Order Details
                </motion.button>
            </Link>
            </div>
        </div>
        </div>
    );
};

export default OrderFailure;
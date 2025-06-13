import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { 
  getCartItems, fetchAddressActive_Service 
} from "@/Services/User/Cart/Cart.jsx";

import { 
  user_fetch_orderIntoThankingPage_success
} from "@/Services/User/Order/Order.jsx"

import { toast } from "react-toastify";
import axiosBaseUrl from "$/axios";
import Invoice from "./Invoice";

const ThankYou = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order_Id } = useParams();
  const [cartItems, setCartItems] = useState({ items: [] });
  const [address, setAddress] = useState({});
  const invoiceElement = useRef(null);
  const [offerOfProducts, setOffersOfProduct] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);

  const fetchCartItems = async () => {
    const response = await getCartItems();
    if (!response) {
      return false;
    }
    setCartItems(response?.data?.cartData || { items: [] });
    setOffersOfProduct(response?.data?.offersOfProducts || []);
    return true;
  };

  const fetchOrderDetails = async () => {

      const response = await user_fetch_orderIntoThankingPage_success(order_Id);

      if (!response) {
        toast.error("Failed to fetch order details");
        return false;
      }
      setOrderDetails(response.data?.order);
      return true;
  };

  useEffect(() => {
    fetchCartItems();
    fetchOrderDetails();
  }, []);

  useEffect(() => {
    const fetchActiveAddress = async () => {
      const response = await fetchAddressActive_Service();
      if (!response) {
        return;
      }
      setAddress(response?.data?.address || {});
    };
    fetchActiveAddress();
  }, []);

  const paymentMethod = orderDetails?.paymentMethod || "Cash on Delivery";

  const calculateSummary = () => {
  let originalTotal = 0;
  let finalTotal = 0;

  cartItems?.items?.forEach((item) => {
    const quantity = item?.quantity || 1;
    const product = item?.productId;

    const offerOfProduct = offerOfProducts.find(
      (offer) =>
        offer.applicableTo === product._id ||
        offer.applicableTo === product.category
    );

    const originalPrice = product?.salePrice;
    let basePrice = originalPrice;

    if (offerOfProduct) {
      basePrice =
        offerOfProduct.discountType === "Percentage"
          ? originalPrice - (offerOfProduct.discountAmount / 100) * originalPrice
          : originalPrice - offerOfProduct.discountAmount;
    }

    originalTotal += originalPrice * quantity;
    finalTotal += Math.floor(basePrice) * quantity;
  });

  return {
    originalTotal,
    finalTotal,
    discount: originalTotal - finalTotal,
  };
};


  const { originalTotal, finalTotal, discount } = calculateSummary();
  const shipping = finalTotal >= 500 ? 0 : 40;
  const fees = 3;
  const couponDiscount = orderDetails?.couponDiscount || 0;
  const grandTotal = (finalTotal + shipping + fees - couponDiscount).toFixed(2);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Thank You Section */}
      <section className="py-16 bg-green-200">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            data-aos="fade-up"
          >
            <svg
              className="w-16 h-16 text-teal-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-gray-800">
              Thank You! Your Order Has Been Placed Successfully
            </h2>
            <p className="mt-2 text-gray-600">
              Order ID: <span className="font-semibold">{order_Id}</span>
            </p>
          </motion.div>

          <div
            className="bg-white rounded-lg shadow-md p-6"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {/* Order Details */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Order Details
            </h3>
            <div className="space-y-4">
              {cartItems.items?.map((item, index) => {
                const product = item.productId;
                const offer = offerOfProducts.find(
                  (ele) =>
                    ele.applicableTo == product._id ||
                    ele.applicableTo == product.category
                );
                let finalPrice = product.salePrice;
                let originalPrice = product.salePrice;

                if (offer) {
                  finalPrice =
                    offer.discountType === "Percentage"
                      ? product.salePrice - (offer.discountAmount / 100) * product.salePrice
                      : product.salePrice - offer.discountAmount;
                  originalPrice = product.salePrice;
                }

                return (
                  <motion.div
                    key={item._id}
                    className="flex items-center border-b pb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <img
                      src={item?.productId.productImage[0]}
                      alt={item?.productId.productName}
                      className="w-16 h-16 object-contain mr-4"
                    />
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold">
                        {item?.productId.productName.length > 35
                          ? `${item?.productId.productName.slice(0, 35)}...`
                          : item?.productId.productName}
                      </p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-teal-900 text-sm">
                          {(Math.floor(finalPrice) + " X " + item.quantity) + "= "}
                          ₹{(Math.floor(finalPrice) * item.quantity).toFixed(2)}
                        </span>
                        {offer && (
                          <span className="text-teal-600 text-sm">
                            (Saved ₹{(originalPrice - Math.floor(finalPrice)) * item.quantity}.00)
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Shipping Address */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-2">
                Shipping Address
              </h4>
              <p className="text-gray-800">{address?.name}</p>
              <p className="text-gray-600 text-sm">{address?.city}</p>
              <p className="text-gray-600 text-sm">{address?.streetAddress}</p>
              <span className="text-gray-400">{address?.phone} </span>
              <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                {address?.pincode}
              </span>
            </div>

            {/* Payment Method */}
            <div className="mt-4 border-t pt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-2">
                Payment Method
              </h4>
              <p className="text-gray-800">{paymentMethod}</p>
            </div>

            {/* Order Summary */}
            <div className="mt-4 border-t pt-4">
              <h4 className="text-md font-semibold text-gray-800 mb-2">
                Order Summary
              </h4>
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotal ({cartItems?.items?.length} items)</span>
                  <span>₹{originalTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal-600">
                  <span>Product Discounts</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal-600">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-teal-600">
                  <span>Platform Fee</span>
                  <span>₹{fees}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Shipping</span>
                  <span className={finalTotal >= 500 ? "text-green-700" : "text-gray-500"}>
                    {finalTotal >= 500 ? "Free" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-800 font-semibold text-lg border-t pt-2">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <motion.button
              className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/user/order/invoice/${order_Id}`)}
            >
              See Invoice
            </motion.button>
            <Link to="/user/shop">
              <motion.button
                className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get to Shop Page
              </motion.button>
            </Link>
            <Link to={`/user/list-of-order`} onClick={() => window.scrollTo(0, 0)}>
              <motion.button
                className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                See Order Details
              </motion.button>
            </Link>
          </div>
        </div>

        <div className="hidden opacity-0">
          <Invoice ref={invoiceElement} />
        </div>
      </section>
    </div>
  );
};

export default ThankYou;
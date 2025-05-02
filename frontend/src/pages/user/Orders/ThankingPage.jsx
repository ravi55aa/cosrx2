import { useEffect, useState ,useRef} from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLocation, Link, useNavigate, useParams } from "react-router-dom";
import { getCartItems,fetchAddressActive_Service} from "@/Services/User/Cart/Cart.jsx"
import { toast } from "react-toastify";
import Invoice from "./Invoice";

const demoCartItems = [
  {
    _id: "1",
    productName: "COSRX Low pH Good Morning Gel Cleanser",
    salePrice: 850,
    quantity: 2,
    productImage: "12",
  },
  {
    _id: "2",
    productName: "COSRX Advanced Snail 96 Mucin Power Essence",
    salePrice: 1450,
    quantity: 1,
    productImage: "12",
  },
  {
    _id: "3",
    productName: "COSRX Oil-Free Ultra-Moisturizing Lotion",
    salePrice: 1200,
    quantity: 3,
    productImage: "12",
  },
];

const ThankYou = () => {
  const location = useLocation();
  const navigate =  useNavigate();
  const {order_Id} = useParams()
  const [cartItems,setCartItems] = useState([]);
  const [address,setAddress] = useState({});
  const invoiceElement = useRef(null);


    const fetchCartItems = async()=> {
      const response = await getCartItems();
      console.log(response);
      
      if(!response){
        return false;
      }
  
        setCartItems(response?.data?.cartData);
        console.log("cartItems",response?.data?.cartData);
        return true;
    }
  
    useEffect(()=>{
      fetchCartItems();
    },[]);

    useEffect(()=>{
        const fetchActiveAddress=async()=>{
          const response = await fetchAddressActive_Service();
          
          if(!response){
            return;
          }
          
          setAddress(response?.data?.address);
          return true;
        }
    
        fetchActiveAddress();
    },[]);

  const paymentMethod = "Cash on Delivery"; 
  const shipping = 50.0; 
  const savings = 150.0; 

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const calculateSubtotal = () => {
    return demoCartItems
      .reduce((total, item) => total + item.salePrice * item.quantity, 0)
      .toFixed(2);
  };

  const grandTotal = (parseFloat(calculateSubtotal()) + shipping - savings).toFixed(2);


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
              {cartItems.items?.map((item, index) => (
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
                    <p className="text-teal-600 text-sm">
                      ₹{(item?.productId.salePrice * item?.quantity).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))}
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
              <div className=" pt-4 space-y-2">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotal</span>
                  <span>₹{cartItems?.cartTotal}</span>
                </div>
                <div className="flex justify-between text-teal-600">
                  <span>Savings</span>
                  <span>₹{0}</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span>Shipping</span>
                  <span className={cartItems?.cartTotal >= 500 ? "text-green-500" : "text-gray-700"}>
                    {cartItems?.cartTotal >= 500 ?  `₹40` : "Free"} 
                  </span>
                </div>
                <div className="flex justify-between text-gray-800 font-semibold text-lg border-t pt-2">
                  <span>Grand Total</span>
                  <span>₹{ cartItems?.cartTotal + ( cartItems?.cartTotal >= 500 ? 43 : 3) }  </span>
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
              onClick={()=>navigate(`/user/order/invoice/${order_Id}`)}
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

        <div className=" hidden opacity-0">
        <Invoice ref={invoiceElement}/>
        </div>

      </section>

    </div>
  );
};

export default ThankYou;


import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

import { useNavigate, Link } from "react-router-dom";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import axiosBaseUrl from "$/axios";

import {getUserId} from "@/Services/Reusable.jsx"
import {getCartItems} from "@/Services/User/Cart/Cart.jsx";
import {address_primaryAddress_Service} from "@/Services/User/Profile/Address.jsx";

import {addNewProduct_Service} from "@/Services/User/Order/Order.jsx";


// Demo addresses
const demoAddresses = [
  {
    id: "1",
    label: "Muhammad shibil K",
    details:
      "8111903193, 9744560634, near amapally masjid, neelancheri po, vadakku, Malappuram, kanyakumari, kerala, 676452",
    type: "HOME",
  },
  {
    id: "2",
    label: "shibilK",
    details:
      "8111903193, 9744560634, near amapally masjid, neelancheri po, vadakku, Malappuram, kanyakumari, kerala, 676452",
    type: "HOME",
  },
];


const Checkout = () => {
  const [cartItems,setCartItems] = useState([]); 
  const [addresses,setAddress] = useState(demoAddresses); 
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [updater,setUpdater] = useState(0);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = JSON.parse(localStorage.getItem("token"));
        if (!token || !user?._id) {
        navigate("/user/login");
        return;
        }
        
        axiosBaseUrl.get(`/profile/getAddress`,{params : getUserId() }) //params : {key,value}
            .then((res)=>{
                if(res.hasOwnProperty("error")){
                    console.log("response is not okay");
                    return;
                }

                setAddress(res.data?.address?.address);
                console.log(res.data?.address?.address);
                return;

            }).catch((err)=>{
                console.log("error",err.message);
                return;
            })
    },[updater]);

    const fetchCartItems = async()=> {
      const response = await getCartItems();
      
      if(!response){
        return false;
      }
  
        setCartItems(response?.data?.cartData);
        console.log(response?.data?.cartData);
        return true;
    }
    
    useEffect(()=>{
      fetchCartItems();
    },[]);

    const handlePrimaryCheckBox=async(e,addrId)=>{
        if(!e.target.checked) return;

        const defaultAddressChange = await address_primaryAddress_Service(addrId);
        if(!defaultAddressChange){
        return false;
        }

        setUpdater((prev)=>prev+1);
        return true;
    }

    // Calculate totals
    const calculateSubtotal = () => {
        return cartItems.items
        ?.reduce((total, item) => total + item.salePrice * item.quantity, 0)
        .toFixed(2);
    };

    const shipping = 50.0; // Fixed shipping cost for demo
    const savings = 150.0; // Fixed savings for demo
    const grandTotal = (parseFloat(calculateSubtotal()) + shipping - savings).toFixed(2);

    const handlePlaceOrder = async() => {

        const orderedAddressIs = addresses?.find((addr=>addr.isPrimary));
        const arrayOfOrderedItems = cartItems.items?.map((ele)=>{
          return {
            name:ele.productId.productName,
            productId:ele.productId._id,
            quantity:ele.quantity,
            price:ele.price,
          }
        })

        const data ={
          orderData:{
            "totalPrice": cartItems?.total,
            "finalAmount": cartItems?.cartTotal ,
            "paymentAmount":cartItems?.cartTotal ,
          },
          orderItemsData:arrayOfOrderedItems,
          orderAddressData: {
              "addressType":orderedAddressIs.name,
              "name":orderedAddressIs.name,
              "city":orderedAddressIs.city,
              "state":orderedAddressIs.state,
              "pincode":orderedAddressIs.pincode,
              "phone":orderedAddressIs.phone,
              "altPhone":orderedAddressIs.altPhone,
              "landMark":orderedAddressIs.streetAddress,
            }
        }

        
        console.log("before navigating...")
        const orderSuccessful = await addNewProduct_Service(data);
        console.log("navigating...",orderSuccessful);
        if(!orderSuccessful){
          return false;
        }

        navigate(`/user/orderCompleted/${orderSuccessful?.data.order_id}`);

        window.scrollTo(0, 0)
        return ;
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
        setError("Please enter a coupon code.");
        return;
        }
        alert(`Coupon "${couponCode}" applied! (Demo)`);
        setCouponCode("");
    };

  return (
    <div className="bg-gray-50">
      
      <HeaderSection />

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2
            className="text-3xl font-bold text-gray-800 mb-8"
            data-aos="fade-up"
          >
            Complete Your Order
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Delivery Address and Payment Method */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <div
                className="bg-white rounded-lg shadow-md p-6"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
                  Delivery Address
                </h3>
                <p className="text-gray-600 mb-4">Select the address for delivery</p>
                {addresses?.map((address) => (
                  <div
                    key={address?._id}
                    className="flex items-start mb-4 border-b pb-4"
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address?._id}
                      checked={address?.isPrimary}
                      onChange={(e) => handlePrimaryCheckBox(e,address?._id)}
                      className="mt-1 mr-3 accent-teal-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{address?.name}</p>
                      <p className="text-gray-600 text-sm">{address?.streetAddress}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded"> 
                        {address?.city}
                      </span>
                      <Link to={`/user/profile/address/edit/${address._id}`}>
                      <button className="ml-4 text-teal-600 hover:underline text-sm">
                        Edit
                      </button>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link to="/user/profile/address/add">
                <motion.button
                    type="button"
                    className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors border border-teal-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  Add New Address 
                </motion.button>
                </Link>
              </div>

              {/* Payment Method */}
              <div
                className="bg-white rounded-lg shadow-md p-6"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  Payment Method
                </h3>
                <p className="text-gray-600 mb-4 flex items-center text-sm">
                  <svg
                    className="w-4 h-4 text-teal-600 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-1.104 0-2 .896-2 2v3h4v-3c0-1.104-.896-2-2-2z"
                    />
                  </svg>
                  All transactions are secure and encrypted
                </p>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 accent-teal-600"
                    />
                    <span className="text-gray-800">Cash on Delivery</span>
                    <span className="ml-auto text-teal-600 font-semibold">Pay with cash upon delivery</span>
                  </label>
                  {/* <label className="flex items-center p-4 border rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 accent-teal-600"
                    />
                    <span className="text-gray-800">Razorpay</span>
                    <span className="ml-auto text-teal-600 font-semibold">Pay securely online</span>
                  </label> */}
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div
              className="bg-white rounded-lg shadow-md p-6"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Order Summary
              </h3>
              {cartItems?.items?.map((item, index) => (
                <motion.div
                  key={item?.productId._id}
                  className="flex items-center mb-4 border- pb-4"
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
                    <p className="text-teal-900 text-sm">
                      <span>{(item?.productId?.salePrice + " X " + item.quantity)}= </span>
                      ₹{(item.totalPrice * item.quantity).toFixed(2)}
                      <span className="text-teal-600 ml-2">
                        (Saved ₹{(item.price-item.totalPrice) * item.quantity}.00)
                      </span>
                    </p>
                  </div>
                </motion.div>
              ))}
              <hr />
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-800">
                  <span>Subtotal</span>
                  <span>₹{cartItems?.cartTotal}</span>
                </div>
                <div className="flex justify-between text-teal-600">
                  <span>Savings</span>
                  <span>₹{0}</span>
                </div>
                <div className="flex justify-between text-teal-600">
                  <span>Fees</span>
                  <span>₹{3}</span>
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
              {/* <div className="mt-6 flex items-center space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter Coupon Code"
                  className="flex-1 p-2 border rounded-md outline-none focus:border-teal-600"
                />
                <motion.button
                  className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApplyCoupon}
                >
                  Apply
                </motion.button>
              </div> */}
              {/* <button className="mt-2 text-teal-600 hover:underline text-sm">
                View Available Coupons
              </button> */}
              {error && (
                <div className="mt-4 text-red-600 text-center">{error}</div>
              )}
              <motion.button
                className="mt-6 w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePlaceOrder}
              >
                Place Order
              </motion.button>

              <div className="mt-4 flex justify-center items-center text-gray-600 text-sm">
                <svg
                  className="w-4 h-4 text-teal-600 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-1.104 0-2 .896-2 2v3h4v-3c0-1.104-.896-2-2-2z"
                  />
                </svg>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Checkout;
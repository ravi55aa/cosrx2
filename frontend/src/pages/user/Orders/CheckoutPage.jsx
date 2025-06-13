import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate, Link } from "react-router-dom";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import axiosBaseUrl from "$/axios";
import { getUserId } from "@/Services/Reusable.jsx";
import { getCartItems } from "@/Services/User/Cart/Cart.jsx";
import { address_primaryAddress_Service } from "@/Services/User/Profile/Address.jsx";
import { 
  addNewProduct_Service, 
  user_checkout_getAllCoupons_Service,
  walletPay_order_service
} from "@/Services/User/Order/Order.jsx";
import { toast } from "react-toastify";

const demoAddresses = [
  {
    id: "1",
    label: "Muhammad shibil K",
    details: "8111903193, 9744560634, near amapally masjid, neelancheri po, vadakku, Malappuram, kanyakumari, kerala, 676452",
    type: "HOME",
  },
  {
    id: "2",
    label: "shibilK",
    details: "8111903193, 9744560634, near amapally masjid, neelancheri po, vadakku, Malappuram, kanyakumari, kerala, 676452",
    type: "HOME",
  },
];

const loadRazorpayScript = () => { 
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      resolve();
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      reject(new Error("Failed to load Razorpay SDK"));
    };
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const [cartItems, setCartItems] = useState({ items: [], cartTotal: 0 });
  const [offerOfProducts, setOffersOfProduct] = useState([]);
  const [addresses, setAddress] = useState(demoAddresses);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [error, setError] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);
  const [isLoading, setIsLoading] = useState({ cart: true, address: true, order: false });
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [walletBal, setWalletBal] = useState(0); 
  const [walletError, setWalletError] = useState(false); // Added state for wallet error border
  const navigate = useNavigate();
  const [updater, setUpdater] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    loadRazorpayScript()
      .then(() => setIsRazorpayReady(true))
      .catch((err) => {
        console.error("Razorpay script error:", err);
        toast.error("Failed to load payment gateway. Please try again later.");
      });
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = JSON.parse(localStorage.getItem("token"));
    if (!token || !user.id && !user?._id) {
      navigate("/user/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        setIsLoading((prev) => ({ ...prev, address: true }));
        const res = await axiosBaseUrl.get(`/profile/getAddress`, { params: getUserId() });
        if (res.hasOwnProperty("error")) {
          toast.error("Failed to fetch addresses");
          return;
        }
        setAddress(res.data?.address?.address || demoAddresses);
        console.log("the given address ----",res?.data?.address?.address);
        setWalletBal(res.data?.walletAmt || 0);
      } catch (err) {
        toast.error("Error fetching addresses: " + err.message);
      } finally {
        setIsLoading((prev) => ({ ...prev, address: false }));
      }
    };

    fetchAddresses();
  }, [updater, navigate]);

  const fetchCartItems = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, cart: true }));
      const response = await getCartItems();
      if (!response) {
        toast.error("Failed to fetch cart items");
        return false;
      }
      setCartItems(response?.data?.cartData || { items: [], cartTotal: 0 });
      setOffersOfProduct(response?.data?.offersOfProducts || []);
      return true;
    } catch (err) {
      toast.error("Error fetching cart items: " + err.message);
      return false;
    } finally {
      setIsLoading((prev) => ({ ...prev, cart: false }));
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handlePrimaryCheckBox = async (e, addrId) => {
    if (!e.target.checked) return;

    const defaultAddressChange = await address_primaryAddress_Service(addrId);
    if (!defaultAddressChange) {
      toast.error("Failed to set primary address");
      return false;
    }

    setUpdater((prev) => prev + 1);
    return true;
  };

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

      let basePrice = product?.salePrice;
      let originalPrice = product?.salePrice;

      if (offerOfProduct) {
        basePrice =
          offerOfProduct.discountType === "Percentage"
            ? product.salePrice - (offerOfProduct.discountAmount / 100) * product.salePrice
            : product.salePrice - offerOfProduct.discountAmount;
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
  const grandTotal = (finalTotal + shipping + fees - couponDiscount).toFixed(2);

  const handlePlaceOrder = async (razorpayOrderId) => {
    setIsLoading((prev) => ({ ...prev, order: true }));

    const orderedAddressIs = addresses?.find((addr) => addr.isPrimary);

    if (!orderedAddressIs) {
      toast.error("Please select a delivery address");
      setIsLoading((prev) => ({ ...prev, order: false }));
      return false;
    }

    const arrayOfOrderedItems = cartItems.items?.map((ele) => {
      const product = ele.productId;
      const offerOfProduct = offerOfProducts.find(
        (offer) =>
          offer.applicableTo == product._id ||
          offer.applicableTo == product.category
      );

      let finalPrice = product?.salePrice;
      if (offerOfProduct) {
        finalPrice =
          offerOfProduct.discountType === "Percentage"
            ? product.salePrice - (offerOfProduct.discountAmount / 100) * product.salePrice
            : product.salePrice - offerOfProduct.discountAmount;
      }

      return {
        name: product.productName,
        productId: product._id,
        quantity: ele.quantity,
        price: Math.floor(finalPrice),
      };
    });

    const data = {
      orderData: {
        totalPrice: originalTotal,
        finalAmount: grandTotal,
        paymentAmount: grandTotal,
        couponId: appliedCoupon?._id || null,
        paymentMethod: paymentMethod,
        couponDiscount: couponDiscount,
        shippingFee: grandTotal > 500 ? 40 : 0,
        razorpayOrderId: razorpayOrderId || null,
        offerDiscount: discount
      },
      orderItemsData: arrayOfOrderedItems,
      orderAddressData: {
        addressType: orderedAddressIs.name,
        name: orderedAddressIs.name,
        city: orderedAddressIs.city,
        state: orderedAddressIs.state,
        pincode: orderedAddressIs.pincode,
        phone: orderedAddressIs.phone,
        altPhone: orderedAddressIs.altPhone,
        landMark: orderedAddressIs.streetAddress,
      },
    };

    try {
      const orderSuccessful = await addNewProduct_Service(data);
      if (!orderSuccessful) {
        toast.error("Failed to place order. Please try again.");
        navigate(`/user/order/failed/unknown`);
        return false;
      }

      navigate(`/user/orderCompleted/${orderSuccessful?.data.order_id}`);
      window.scrollTo(0, 0);
      return true;
    } catch (err) {
      toast.error("Error placing order: " + err.message);
      navigate(`/user/order/failed/unknown`);
      return false;
    } finally {
      setIsLoading((prev) => ({ ...prev, order: false }));
    }
  };

  const handleSearchCoupon = async () => {
    try {
      const response = await user_checkout_getAllCoupons_Service(finalTotal);
      if (!response || response.data?.mission === "failed") {
        toast.error(response?.data?.message || "Failed to fetch coupons");
        return false;
      }
      setAvailableCoupons(response?.data?.coupons || []);
      setShowCoupons(true);
      return true;
    } catch (err) {
      toast.error("Error fetching coupons: " + err.message);
      return false;
    }
  };

  const handleSelectCoupon = (coupon) => {
    setCouponCode(coupon.code);
    setShowCoupons(false);
    applyCoupon(coupon.code);
  };

  const handleApplyCoupon = (e) => {
    const code = e.target.value;
    setCouponCode(code);
    setError("");
  };

  const applyCoupon = (code = couponCode) => {
    if (!code.trim()) {
      setError("Please enter a coupon code.");
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    setError("");

    const coupon = availableCoupons.find((c) => c.code === code);
    if (!coupon) {
      setError("Invalid coupon code.");
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    const currentDate = new Date();
    const startDate = new Date(coupon.startDate);
    const expiryDate = new Date(coupon.expireOn);
    if (!coupon.isActive || currentDate > expiryDate || currentDate < startDate) {
      setError("Coupon is inactive, not yet valid, or expired.");
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    const userId = JSON.parse(localStorage.getItem("user"))?._id;
    const timesUsedByUser = coupon.usedBy?.find((entry) => entry.userId === userId)?.timesUsed || 0;
    if (timesUsedByUser >= coupon.usageLimit) {
      setError("You have already used this coupon the maximum number of times.");
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    if (finalTotal < coupon.minimumPrice) {
      setError(`Cart total must be at least ₹${coupon.minimumPrice} to apply this coupon.`);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponDiscount(coupon.offerPrice);
    toast.success("Coupon applied successfully!");
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setError("");
    toast.success("Coupon removed successfully!");
  };

  const handleRazor = async () => {
    if (!isRazorpayReady) {
      toast.error("Payment gateway is not ready. Please try again later.");
      return;
    }

    try {
      const receiptId = `order_${Date.now()}`; 
      const response = await axiosBaseUrl.post("/razor/order", {
        amount: grandTotal.toString(),
        currency: "INR",
        receipt: receiptId,
      });

      if (!response.data || response.data.mission !== "success" || !response.data.order) {
        toast.error(response.data?.message || "Failed to create Razorpay order. Please try again.");
        navigate(`/user/order/failed/unknown`);
        return;
      }

      const orderId = response.data.order.id;

      const options = {
        key: "rzp_test_NApmrqN6oZV4Yy",
        amount: (grandTotal * 100).toString(), 
        currency: "INR",
        name: "COSRX",
        description: "Test Transaction",
        image: "https://example.com/your_logo",
        order_id: orderId,
        handler: function (response) {
          console.log("Razorpay payment response:", response);
          toast.success("Payment successful!");
          handlePlaceOrder(orderId);
        },
        prefill: {
          name: "bantai channel",
          email: "ravisha@gmail.com",
          contact: "8296406086",
        },
        notes: {
          address: "Razorpay Corporate Office",
        },
        theme: {
          color: "#3399cc",
        },
      };

      console.log("Razorpay options:", options);

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on("payment.failed", function (response) {
        console.log("Razorpay payment failed:", response);
        const errorCode = response.error.code;
        const errorDescription = response.error.description;
        console.log(`Error Code: ${errorCode}, Description: ${errorDescription}`);
        if (errorCode === "BAD_REQUEST_ERROR" && errorDescription.includes("cancelled")) {
          navigate(`/user/order/failed/${orderId}`);
        } else {
          navigate(`/user/order/failed/${orderId}`);
        }
        rzp1.close();
      });

      rzp1.on("payment.error", function (response) {
        console.log("Razorpay payment error:", response);
        toast.error("An error occurred during payment.");
        navigate(`/user/order/failed/${orderId}`);
        rzp1.close();
      });

      rzp1.open();
    } catch (err) {
      console.error("Error initiating Razorpay payment:", err);
      toast.error("Error initiating Razorpay payment: " + err.message);
      navigate(`/user/order/failed/unknown`);
    }
  };

  const handleWalletPayment = async () => {
    if (parseFloat(grandTotal) > walletBal) {
      let count = 0;
      toast.error("Insufficient wallet balance to complete this order.",count++);
      setWalletError(true);
      return false;
    }

    setWalletError(false); // Reset wallet error state if balance is sufficient
    const paymentResponse = await walletPay_order_service(grandTotal);

    if (!paymentResponse) {
      return false;
    }

    toast.success("Payment successful using wallet!");
    await handlePlaceOrder(null); 
  };

  const handlePlaceOrderWithPayment = () => {

    if(addresses.length <= 0 || !addresses ){
      toast.warn('Kindly Add a Address..');
      return false;
    }

    if (paymentMethod === "razorpay") {
      handleRazor();
    } else if (paymentMethod === "cod") {
      handlePlaceOrder();
    } else {
      handleWalletPayment();
    }
  };

  if (isLoading.cart || isLoading.address) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-16">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v1m0 14v1m8-9h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.021 0l-.707-.707M6.343 6.343l-.707-.707"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <HeaderSection />

      <section className="py-16 bg-green-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8" data-aos="fade-up">
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
                      onChange={(e) => handlePrimaryCheckBox(e, address?._id)}
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
                  
                  {finalTotal < 1000  &&
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
                    <span className="ml-auto text-teal-600 font-semibold">
                      Pay with cash upon delivery
                    </span>
                  </label>
                  }

                  <label
                    className={`flex items-center p-4 border rounded-md cursor-pointer ${
                      walletError ? "border-red-500" : ""
                    }`} // Add red border if walletError is true
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setWalletError(false); // Reset error border when selecting wallet
                      }}
                      className="mr-3 accent-teal-600"
                    />
                    <span className="text-gray-800">Wallet - </span>
                    <span
                      className={`ml-1 ${
                        walletBal < 100 ? "text-red-500" : "text-gray-800"
                      }`} // Red if wallet balance < 100
                    >
                      ₹{walletBal.toFixed(2)}
                    </span>
                  </label>
                  <label className="flex items-center p-4 border rounded-md cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 accent-teal-600"
                    />
                    <span className="text-gray-800">Razorpay</span>
                    <span className="ml-auto text-teal-600 font-semibold">
                      Pay securely online
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div
              className="bg-white rounded-lg max-h-max shadow-md p-6"
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

              {cartItems?.items?.map((item, index) => {
                const product = item.productId;
                const offer = offerOfProducts.find(
                  (ele) =>
                    ele.applicableTo === product._id ||
                    ele.applicableTo === product.category
                );

                let finalPrice = product.salePrice;
                let originalPrice = product.salePrice;

                if (offer) {
                  finalPrice =
                    offer.discountType === "Percentage"
                      ? product.salePrice - (offer.discountAmount / 100) * product.salePrice
                      : product.salePrice - offer.discountAmount;
                }

                return (
                  <motion.div
                    key={product._id}
                    className="flex items-center mb-4 border-b pb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <img
                      src={product.productImage[0]}
                      alt={product.productName}
                      className="w-16 h-16 object-contain mr-4"
                    />
                    <div className="flex-1">
                      <p className="text-gray-800 font-semibold">
                        {product.productName.length > 35
                          ? `${product.productName.slice(0, 35)}...`
                          : product.productName}
                      </p>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-teal-900 text-sm">
                          {`${Math.floor(finalPrice)} X ${item.quantity} = ₹${(
                            Math.floor(finalPrice) * item.quantity
                          ).toFixed(2)}`}
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

              <hr />
              <div className="border-t pt-4 space-y-2">
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
                  <span className={finalTotal >= 500 ? "text-gray-700" : "text-green-500"}>
                    {finalTotal >= 500 ? "Free" : `₹${shipping}` }
                  </span>
                </div>
                <div className="flex justify-between text-gray-800 font-semibold text-lg border-t pt-2">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={handleApplyCoupon}
                  placeholder="Enter Coupon Code"
                  className="flex-1 p-2 border rounded-md outline-none focus:border-teal-600"
                />
                {appliedCoupon ? (
                  <motion.button
                    className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={removeCoupon}
                  >
                    Remove
                  </motion.button>
                ) : (
                  <motion.button
                    className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => applyCoupon()}
                  >
                    Apply
                  </motion.button>
                )}
              </div>
              <button
                type="button"
                onClick={handleSearchCoupon}
                className="mt-2 text-teal-600 hover:underline text-sm"
              >
                View Available Coupons
              </button>

              {showCoupons && availableCoupons.length > 0 && (
                <div className="mt-4 max-h-40 overflow-y-auto border rounded-md p-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Available Coupons
                  </h4>
                  {availableCoupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="flex justify-between items-center p-2 border-b cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSelectCoupon(coupon)}
                    >
                      <div>
                        <p className="text-gray-800 font-semibold">{coupon.code}</p>
                        <p className="text-gray-600 text-sm">
                          Save ₹{coupon.offerPrice} (Min. ₹{coupon.minimumPrice})
                        </p>
                        <p className="text-gray-500 text-xs">
                          Expires: {new Date(coupon.expireOn).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="text-teal-600 hover:underline text-sm">
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="mt-4 text-red-600 text-center">{error}</div>
              )}
              <motion.button
                className="mt-6 w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                id="pay"
                type="button"
                onClick={handlePlaceOrderWithPayment}
                disabled={isLoading.order}
              >
                {isLoading.order ? (
                  <>
                    <svg
                      className="w-5 h-5 mr-2 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v1m0 14v1m8-9h-1M5 12H4m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.021 0l-.707-.707M6.343 6.343l-.707-.707"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
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

      <Footer />
    </div>
  );
};

export default Checkout;
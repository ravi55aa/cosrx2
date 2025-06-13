import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HeaderSection from "@/components/HeaderSection";
import {
  addFundsToWallet_Service,
  fetchWalletDetails_Service,
  razorPay_order_service,
} from "@/Services/User/Wallet/Wallet.jsx";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY;

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

const WalletManagement = () => {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addFundAmount, setAddFundAmount] = useState("");
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Added to trigger wallet fetch

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    return () => AOS.refresh();
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
    const fetchWallet = async () => {
      setIsLoading(true);
      const response = await fetchWalletDetails_Service();

      if (!response || !response.data || !response.data.walletDoc) {
        setIsLoading(false);
        toast.error("Failed to fetch wallet details.");
        return;
      }

      setWallet(response?.data?.walletDoc[0]);
      setIsLoading(false);
      console.log("Wallet details fetched:", response.data.walletDoc);
    };
    fetchWallet();
  }, [updateTrigger]); // Re-fetch wallet when updateTrigger changes

  const handleAddFunds = async () => {
    if (!isRazorpayReady) {
      toast.error("Payment gateway is not ready. Please try again later");
      return;
    }

    if (!addFundAmount || isNaN(addFundAmount) || parseFloat(addFundAmount) <= 0) {
      toast.info("Please enter a valid amount");
      return;
    }

    if (!RAZORPAY_KEY) {
      toast.error("Razorpay key is missing. Please contact support.");
      console.error("RAZORPAY_KEY is not set:", RAZORPAY_KEY);
      return;
    }

    setIsAddingFunds(true);
    const amount = parseFloat(addFundAmount);

    try {
      const orderCredentials = {
        amount: amount.toString(),
        currency: "INR",
        receipt: "wallet_fund",
      };

      console.log("Creating Razorpay order with:", orderCredentials);
      const orderResponse = await razorPay_order_service(
        orderCredentials.amount,
        orderCredentials.currency,
        orderCredentials.receipt
      );

      console.log("Order response:", orderResponse);

      if (!orderResponse || !orderResponse.data || !orderResponse.data.order || !orderResponse.data.order.id) {
        console.error("Invalid order response:", orderResponse);
        toast.error("Failed to initiate payment. Please try again.");
        setIsAddingFunds(false);
        return;
      }

      const orderId = orderResponse.data.order.id;
      console.log("Razorpay order ID:", orderId);

      const options = {
        key: RAZORPAY_KEY,
        amount: (amount * 100).toString(), // Convert to paisa for Razorpay modal
        currency: "INR",
        name: "COSRX Wallet",
        description: "Add Funds to Wallet",
        image: "https://example.com/your_logo",
        order_id: orderId,
        handler: async function (response) {
          console.log("Razorpay payment response:", response);

          if (response.razorpay_payment_id && response.razorpay_order_id && response.razorpay_signature) {
            const walletCredentials = {
              amount: amount.toString(),
              description: "Adding the amount In the Wallet",
              type: "credit",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };

            console.log("Updating wallet with:", walletCredentials);
            const walletResponse = await addFundsToWallet_Service(walletCredentials);
            console.log("Wallet update response:", JSON.stringify(walletResponse, null, 2));

            if (!walletResponse || !walletResponse.data) {
              console.error("Failed to update wallet:", walletResponse);
              toast.error("Payment succeeded, but failed to update wallet. Please contact support.");
              setAddFundAmount("");
              setIsAddingFunds(false);
              return;
            }

            toast.success("Funds added successfully!");
            setAddFundAmount("");
            setIsAddingFunds(false);
            setUpdateTrigger((prev) => prev + 1); // Trigger wallet fetch
          } else {
            toast.error("Payment verification failed");
            setAddFundAmount("");
            setIsAddingFunds(false);
          }
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "8296406086",
        },
        notes: {
          address: "COSRX Wallet",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response) {
        toast.error(`Payment failed: ${response.error.description || "Unknown error"}`);
        setIsAddingFunds(false);
        setAddFundAmount("");
      });

      rzp1.open();
    } catch (err) {
      console.error("Error in handleAddFunds:", err.message);
      toast.error("An error occurred while initiating payment. Please try again.");
      setIsAddingFunds(false);
    }
  };

  if (isLoading) {
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
    <div className="bg-gray-50 min-h-screen pb-16">
      <HeaderSection />
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
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <h2 className="text-3xl font-bold text-gray-800">Wallet Management</h2>
          <p className="mt-2 text-gray-600">
            Current Balance: <span className="font-semibold">₹{wallet?.balance?.toFixed(2) || "0.00"}</span>
          </p>
        </motion.div>

        <div
          className="bg-white rounded-lg shadow-md p-6 mb-6"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Funds to Wallet</h3>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={addFundAmount}
              onChange={(e) => setAddFundAmount(e.target.value)}
              placeholder="Enter amount (₹)"
              className="flex-1 p-2 border rounded-md outline-none focus:border-teal-600"
              min="1"
            />
            <motion.button
              className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleAddFunds}
              disabled={isAddingFunds || !isRazorpayReady}
            >
              {isAddingFunds ? (
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
                "Add Funds"
              )}
            </motion.button>
          </div>
        </div>

        <div
          className="bg-white rounded-lg shadow-md p-6"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
          {wallet?.transactions?.length === 0 || !wallet?.transactions ? (
            <p className="text-gray-600 text-center">No transactions yet.</p>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map((transaction, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between border-b pb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div>
                    <p className="text-gray-800 font-semibold">
                      {transaction?.description}
                      <span className="ms-2 text-violet-400">{transaction?.transactId}</span>
                    </p>
                    <p className="text-gray-600 text-sm">{transaction?.date?.split("T")[0]}</p>
                  </div>
                  <p
                    className={`text-lg font-semibold ${
                      transaction?.type === "credit" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {transaction?.type === "credit" ? "+" : "-"}₹{transaction?.amount?.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletManagement;
import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaTrash, FaHeart, FaShoppingCart, FaChevronDown, FaMapMarkerAlt } from "react-icons/fa";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import Swal from 'sweetalert2';
import { toast } from "react-toastify";
import { 
  getCartItems,
  incQuantityCall,
  decQuantityCall,
  removeProduct_Service,
  fetchAddressActive_Service
} from "@/Services/User/Cart/Cart.jsx";

const CartPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [address, setAddress] = useState({});
  const [offerOfProducts, setOffersOfProduct] = useState([]);
  const [cartItems, setCartItems] = useState({ items: [] });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  async function fetchCartItems(showToast = true) {
    try {
      const response = await getCartItems();
      if (!response || !response.data) {
        showToast && toast.error("Failed to fetch cart items.");
        navigate("/user/shop");
        return false;
      }

      const { cartData, offersOfProducts, message, outOfStockProducts } = response.data;

      // Always set cart items, even if there's a stock error
      setCartItems(cartData || { items: [] });
      setOffersOfProduct(offersOfProducts || []);

      // Handle stock mismatch
      if (message === "stock error" && outOfStockProducts?.length > 0) {
        showToast && showStockMismatchAlert(outOfStockProducts);
      }

      return true;
    } catch (err) {
      console.error("Error fetching cart:", err);
      showToast && toast.error("Error fetching cart items.");
      navigate("/user/shop");
      return false;
    }
  }

  const handleRemoveProduct = useCallback(async (id) => {
    const sureToDel = await Swal.fire({
      title: "Sure to Delete",
      icon: "question",
      iconHtml: "؟",
      confirmButtonText: "Remove",
      cancelButtonText: "Not",
      showCancelButton: true,
      showCloseButton: true
    });

    if (!sureToDel.isConfirmed) {
      return;
    }

    try {
      const response = await removeProduct_Service(id);
      if (!response) {
        toast.error("Failed to remove item.");
        return;
      }
      await fetchCartItems();
      toast.success("Item removed from cart.");
    } catch (err) {
      console.error("Error removing product:", err);
      toast.error("Error removing item.");
    }
  }, []);

  const showStockMismatchAlert = async (mismatchProducts) => {
    const formattedMessage = mismatchProducts.map(item => {
      return `
        <div style="text-align:left;">
          <strong>${item.product.productName}</strong><br/>
          - Available stock: <strong>${item.product.quantity}</strong><br/>
          - You requested: <strong>${item.cartQuantity}</strong>
        </div><br/>
      `;
    }).join('');

    Swal.fire({
      title: 'Stock Mismatch Detected!',
      html: `
        <p>The following items in your cart exceed available stock:</p>
        ${formattedMessage}
        <p>What would you like to do?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Edit Cart',
      cancelButtonText: 'Remove Item(s)',
      reverseButtons: true,
      customClass: {
        htmlContainer: 'swal-custom-html'
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Stay on cart page to edit
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const item = mismatchProducts[0];
        await handleRemoveProduct(item.product._id);
        Swal.fire(
          'Removed!',
          'Unavailable items were removed from your cart.',
          'success'
        );
      }
    });
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    const fetchActiveAddress = async () => {
      try {
        const response = await fetchAddressActive_Service();
        if (response && response.data && response.data.address) {
          setAddress(response.data.address);
        }
      } catch (err) {
        console.error("Error fetching address:", err);
        toast.error("Failed to fetch address.");
      }
    };
    fetchActiveAddress();
  }, []);

  const handleIncQuantity = useCallback(async (productId) => {
    try {
      const response = await incQuantityCall(productId);
      if (!response) {
        return false;
      }
      await fetchCartItems();
      return true;
    } catch (err) {
      return false;
    }
  }, []);

  const handleDecQuantity = useCallback(async (productId) => {
    try {
      const response = await decQuantityCall(productId);
      if (!response) {
        toast.error("Failed to decrease quantity.");
        return false;
      }
      await fetchCartItems();
      return true;
    } catch (err) {
      console.error("Error decreasing quantity:", err);
      toast.error("Error decreasing quantity.");
      return false;
    }
  }, []);

  const calculateSummary = () => {
    let originalTotal = 0;
    let finalTotal = 0;

    cartItems?.items?.forEach((item) => {
      const quantity = item?.quantity || 1;
      const product = item?.productId;

      const offer = offerOfProducts.find(
        (offer) =>
          offer.applicableTo === product._id ||
          offer.applicableTo === product.category
      );

      const salePrice = product.salePrice;
      let discountedPrice = salePrice;

      if (offer) {
        if (offer.discountType === "Percentage") {
          discountedPrice = salePrice - (salePrice * (offer.discountAmount / 100));
        } else if (offer.discountType === "Flat") {
          discountedPrice = salePrice - offer.discountAmount;
        }
      }

      originalTotal += salePrice * quantity;
      finalTotal += Math.floor(discountedPrice) * quantity;
    });

    return {
      originalTotal,
      finalTotal,
      discount: originalTotal - finalTotal
    };
  };

  const { originalTotal, finalTotal, discount } = calculateSummary();

  // Check if any cart item is out of stock
  const hasOutOfStock = cartItems?.items?.some(item => item.productId.quantity === 0);

  const handleCheckout = async () => {
    const fetchCartDataOnce = await fetchCartItems(false); 

    if (!fetchCartDataOnce) {
      return false;
    }

    if (hasOutOfStock) {
      toast.error("Please remove out-of-stock items before proceeding.");
      return false;
    }

    navigate("/user/checkout");

    return true;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      <HeaderSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8 flex flex-col lg:flex-row gap-6">
        {/* Cart Items Section */}
        <div className="lg:w-2/3">
          {/* Delivery Info */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {address?.name ? `Deliver to: ${address?.name}, ${address?.pincode}` : 'Kindly add an Address'}
                </p>
                <p className="text-sm text-gray-500">
                  {address?.streetAddress?.slice(0, 45) + "..." || "No address Selected"}
                </p>
              </div>
              <Link to="/user/profile/address">
                <button className="text-teal-600 font-semibold text-sm hover:underline">
                  Change
                </button>
              </Link>
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {cartItems?.items?.length === 0 ? (
              <div className="text-center py-10">
                <FaShoppingCart size={40} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-lg font-semibold text-gray-700">Your Cart is Empty</h2>
                <p className="text-gray-500 mt-2">Add items to your cart to proceed.</p>
                <Link
                  to="/user/shop"
                  className="mt-4 inline-block px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems?.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start gap-4 border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    {/* Product Image */}
                    <img
                      src={item?.productId.productImage[0] || "/placeholder.jpg"}
                      alt={item?.productId.productName?.slice(0, 20) + "..."}
                      className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    />
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-800">
                        {item?.productId.productName}
                        {item.productId.quantity === 0 && (
                          <span className="ml-2 text-sm text-red-500 font-semibold">
                            (Out of Stock)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">{item?.productId?.weight} ml</p>

                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                          const rawOffer = offerOfProducts?.find(
                            (ele) =>
                              ele.applicableTo === item.productId._id ||
                              ele.applicableTo === item.productId.category
                          );

                          const isValidOffer =
                            rawOffer &&
                            rawOffer.discountType === "Percentage" &&
                            rawOffer.discountAmount > 0 &&
                            rawOffer.discountAmount <= 25;

                          const offer = isValidOffer ? rawOffer : null;

                          if (offer) {
                            const discountPrice =
                              offer.discountType === "Flat"
                                ? item.productId.salePrice - offer.discountAmount
                                : item.productId.salePrice - (item.productId.salePrice * (offer.discountAmount / 100));

                            return (
                              <>
                                <span className="text-lg font-semibold text-gray-800">
                                  ₹{Math.floor(discountPrice)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.productId.salePrice?.toFixed(2)}
                                </span>
                                <span className="text-sm text-green-500">
                                  {offer.discountType === "Flat"
                                    ? `Save ₹${offer.discountAmount}`
                                    : `${offer.discountAmount}% Off`}
                                </span>
                              </>
                            );
                          } else if (item?.productId.validOffer > 0) {
                            const validDiscount =
                              item.productId.salePrice - (item.productId.salePrice * (item.productId.validOffer / 100));

                            return (
                              <>
                                <span className="text-lg font-semibold text-gray-800">
                                  ₹{Math.floor(validDiscount)}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  ₹{item.productId.salePrice?.toFixed(2)}
                                </span>
                                <span className="text-sm text-green-500">
                                  {item.productId.validOffer}% Off
                                </span>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <span className="text-lg font-semibold text-gray-800">
                                  ₹{item.productId.salePrice?.toFixed(2)}
                                </span>
                              </>
                            );
                          }
                        })()}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            type="button"
                            onClick={() => handleDecQuantity(item?.productId._id)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.productId.quantity === 0 || item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="px-3 py-1 text-gray-800">{item?.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleIncQuantity(item?.productId._id)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            disabled={item.productId.quantity === 0}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(item.productId._id)}
                          className="text-teal-600 text-sm font-semibold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Place Order Button (Mobile) */}
          {cartItems?.items?.length > 0 && (
            <div className="lg:hidden mt-4">
              <button
                type="button"
                onClick={handleCheckout}
                className={`w-full py-3 font-semibold rounded-md transition-colors ${
                  hasOutOfStock
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
                disabled={hasOutOfStock}
              >
                Place Order
              </button>
            </div>
          )}
        </div>

        {/* Price Summary Section */}
        {cartItems?.items?.length > 0 && (
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Price Details</h2>

              <div className="flex justify-between">
                <span>Price ({cartItems?.items?.length} item{cartItems?.items?.length > 1 ? "s" : ""})</span>
                <span>₹{originalTotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between">
                  <span>Total Discount</span>
                  <span className="text-green-500">-₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹3</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className={finalTotal >= 500 ? "text-gray-700" : "text-green-500"}>
                  {finalTotal >= 500 ? "Free" : "₹40"}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-800">
                <span>Total Amount</span>
                <span>
                  ₹{(finalTotal + 3 + (finalTotal >= 500 ? 0 : 40)).toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className={`mt-6 w-full py-3 font-semibold rounded-md transition-colors hidden lg:block ${
                  hasOutOfStock
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
                disabled={hasOutOfStock}
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
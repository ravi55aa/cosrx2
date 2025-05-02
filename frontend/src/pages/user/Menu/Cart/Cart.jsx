import React, { useCallback, useEffect, useState } from "react";
import { Link,useParams } from "react-router-dom";
import { FaTrash, FaHeart, FaShoppingCart, FaChevronDown, FaMapMarkerAlt } from "react-icons/fa";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import Swal from 'sweetalert2'
import { 
  getCartItems,
  incQuantityCall,
  decQuantityCall,
  removeProduct_Service,
  fetchAddressActive_Service
} from "@/Services/User/Cart/Cart.jsx"

const CartPage = () => {
  // Mock cart data
  const {userId} = useParams();
  const [address,setAddress] = useState({});
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Reginald Men Sunscreen - SPF 50 PA+++ Bright...",
      seller: "ReginaldMen",
      price: 850,
      discountedPrice: 810,
      discount: "4% Off",
      quantity: 1,
      image: "",
      delivery: "Delivery by Tue Apr 29",
      deliveryCharge: 40,
    },
  ]);
  const [totalPrice,setTotalPrice] = useState(0);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);  

  const fetchCartItems = async()=> {
    const response = await getCartItems();
    console.log(response);
    
    if(!response){
      return false;
    }

    let priceDetails = {};

      setCartItems(response?.data?.cartData);

      return true;
  }

  useEffect(()=>{
    fetchCartItems();
  },[]);


  //fetches the address
  //-------------------
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

  const handleRemoveProduct = useCallback(async(id) => {

    const sureToDel = await Swal.fire({
      title: "Sure to Delete",
      icon: "question",
      iconHtml: "؟",
      confirmButtonText: "Remove",
      cancelButtonText: "Not",
      showCancelButton: true,
      showCloseButton: true
    });

    if(!sureToDel.isConfirmed) {
      return;
    }

    const response = await removeProduct_Service(id);
    if(!response){
      return false;
    }
    
    fetchCartItems();
    return true;
  },[]);

  const handleIncQuantity=useCallback(async(productId)=>{
    const response = await incQuantityCall(productId);

    if(!response){
      return false;
    }
    
    fetchCartItems();
    return true;
  },[]);

  const handleDecQuantity=useCallback(async(productId)=>{
    const response = await decQuantityCall(productId);

    if(!response){
      return false;
    }
    
    fetchCartItems();
    return true;
  },[]);

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
                {address?.name ? `Deliver to: ${address?.name}, ${address?.pincode}` : 'Ravi, 673936' }
                </p>
                <p className="text-sm text-gray-500">
                  {address?.streetAddress?.slice(0,45)+"..." ||  "Unity residency, near Abbs mini mart, Kakkanchery ABBA..."}
                </p>
              </div>
              <Link  to="/user/profile/address">
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
                      src={item?.productId.productImage[0]}
                      alt={item?.productId.productName.slice(0,20)+"..."}
                      className="w-20 h-20 object-cover rounded-md border border-gray-200"
                    />
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-800">{item?.productId.productName}</h3>
                      <p className="text-sm text-gray-500">{item?.productId?.weight} ml</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-semibold text-gray-800">
                          ₹{item?.productId.salePrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item?.productId?.regularPrice}
                        </span>
                        <span className="text-sm text-green-500">{item?.productId.validOffer}%Off</span>
                        {/* <span className="text-sm text-green-500">1 coupon applied</span> */}
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-md">

                          <button type="button" onClick={()=>handleDecQuantity(item?.productId._id)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">
                            -
                          </button>
                          
                          <span className="px-3 py-1 text-gray-800">{item?.quantity}</span>
                          
                          <button type="button" onClick={()=>handleIncQuantity(item?.productId._id)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">
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
              <button className="w-full py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors">
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
              <div className="space-y-3 text-gray-700 text-sm">
                <div className="flex justify-between">
                  <span>Price ({cartItems?.items.length} item)</span>
                  <span>
                    ₹ {cartItems?.cartTotal}
                    </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Discount</span>
                  <span className="text-green-500">
                    -₹{cartItems?.discount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span>₹3</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className={cartItems?.cartTotal >= 500 ? "text-green-500" : "text-gray-700"}>
                    {cartItems?.cartTotal >= 500 ?  `₹40` : "Free"} 
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-gray-800">
                  <span>Total Amount</span>
                  <span>
                    ₹ { cartItems?.cartTotal + ( cartItems?.cartTotal >= 500 ? 43 : 3) }  
                  </span>
                </div>
              </div>
              <Link to="/user/checkout">
              <button className="mt-6 w-full py-3 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors hidden lg:block">
                Place Order
              </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CartPage;

  


import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axiosBaseUrl from "$/axios"; 
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import Swal from "sweetalert2";
import {
    fetchWishlist_Service,
    removeProduct_wishlist_Service
} from "@/Services/User/wishlist/Wishlist";
import {addToCart_Service} from "@/Services/User/Cart/Cart.jsx";

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const fetchWishlistData=async()=>{
        const response = await fetchWishlist_Service();

        if(!response){
            return false;
        } 
    
        setWishlistItems(response?.data?.wishlist);
        return true;
    }

    useEffect(()=>{
        fetchWishlistData();
    },[]);


    const handleRemoveFromWishlist = async (productId) => {

        const sureToDel = await Swal.fire({
                title: "Sure to Remove",
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

        const response = await removeProduct_wishlist_Service(productId);
        if (!response) {
            return false;
        }

        setWishlistItems(wishlistItems.filter((item) => item._id !== productId));
        return true;
    };
    
    
    const handleAddToCart = async (productId) => {

        const sureToDel = await Swal.fire({
            title: "Sure to AddToCart",
            icon: "question",
            iconHtml: "؟",
            confirmButtonText: "Add To Cart",
            cancelButtonText: "Not",
            showCancelButton: true,
            showCloseButton: true
        });
    
        if(!sureToDel.isConfirmed) {
            return;
        }
        
        const response = await addToCart_Service(productId);
        
        if (!response) {
            return false;
        }
        
        setWishlistItems(wishlistItems.filter((item) => item._id !== productId));
        return true;
    };


    return (
        <div className="bg-gray-50">
        <HeaderSection />

        
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4">
            <h2
                className="text-3xl font-bold text-textLight text-center"
                data-aos="fade-up"
            >
                Your Wishlist. <sup className="text-green-500">({wishlistItems?.length})</sup>
            </h2>
            <p
                className="mt-2 text-textLight text-center max-w-md mx-auto"
                data-aos="fade-up"
                data-aos-delay="100"
            >
                View and manage your saved products.
            </p>

            {wishlistItems.length === 0 ? (
                <div
                className="text-center text-textLight mt-8"
                data-aos="fade-up"
                data-aos-delay="200"
                >
                <p>
                    Your wishlist is empty
                    <Link to="/user/shop" className="text-teal-600 hover:underline">
                    Explore products
                    </Link>{" "}
                    to add some!
                </p>
                </div>
            ) : (
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlistItems.map((product, index) => (
                    <motion.div
                    key={product._id}
                    className="bg-white rounded-lg shadow-md p-4 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    >
                    <Link to={`/user/productDetails/${product?._id}`}>
                        <img
                        src={product?.image || "https://via.placeholder.com/200x300?text=Product+Image"}
                        alt={product?.productName}
                        className="w-full h-48 object-contain mx-auto transition-transform duration-300 transform hover:scale-105"
                        />
                    </Link>
                    <h3 className="mt-4 text-lg font-semibold text-textLight">
                        {product?.productName?.length > 35
                        ? `${product?.productName.slice(0, 35)}...`
                        : product?.productName}
                    </h3>
                    <p className="mt-2 text-teal-600 font-bold">₹{product.price}/-</p>
                    <div className="mt-4 flex justify-center gap-2">
                        <motion.button
                        className="py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddToCart(product._id)}
                        >
                        Add to Cart
                        </motion.button>
                        <motion.button
                        className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveFromWishlist(product?._id)}
                        >
                        Remove
                        </motion.button>
                    </div>
                    </motion.div>
                ))}
                </div>
            )}
            </div>
        </section>

        <Footer />
        </div>
    );
    };

    export default Wishlist;

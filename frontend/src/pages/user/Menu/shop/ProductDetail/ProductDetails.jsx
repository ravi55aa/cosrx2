import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaStar, FaRegStar, FaChevronRight, FaShoppingCart, FaHeart } from "react-icons/fa";

import { useParams,Link } from "react-router-dom";
import grid10 from "@/assets/HomePage/grid10.png";
import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";
import {addToCart_Service} from "@/Services/User/Cart/Cart.jsx";
import {addToWishlist_Service} from "@/Services/User/wishlist/Wishlist.jsx";

import import_Component from "@/importStateMents/import_Component";


const relatedProducts = [
  { id: 1, name: "Hydrating Cleanser", price: "₹450.00", image: "https://via.placeholder.com/200x200?text=Related+Product+1" },
  { id: 2, name: "Moisturizing Cream", price: "₹650.00", image: "https://via.placeholder.com/200x200?text=Related+Product+2" },
  { id: 3, name: "Serum", price: "₹850.00", image: "https://via.placeholder.com/200x200?text=Related+Product+3" },
  { id: 4, name: "Toner", price: "₹350.00", image: "https://via.placeholder.com/200x200?text=Related+Product+4" },
];

const tempProduct = {
  name: "Hydrating Cleanser",
  price: "₹450.00",
  originalPrice: "₹500.00",
  discount: "10% off",
  rating: 4.5,
  reviews: [
    { id: 1, user: "John Doe", rating: 5, comment: "Amazing product! My skin feels so hydrated." },
    { id: 2, user: "Jane Smith", rating: 4, comment: "Really good, but a bit pricey." },
  ],
  highlights: [
    "Deeply hydrates the skin",
    "Suitable for all skin types",
    "Non-greasy formula",
    "Dermatologist tested",
  ],
  fullDescription: "This Hydrating Cleanser is designed to gently cleanse your skin while providing deep hydration. Infused with natural ingredients like aloe vera and chamomile, it soothes the skin and removes impurities without stripping away essential moisture. Perfect for daily use, this cleanser leaves your skin feeling soft, smooth, and refreshed. Suitable for all skin types, including sensitive skin.",
  images: [
    grid10,
    "https://via.placeholder.com/500x500?text=Image+2",
    "https://via.placeholder.com/500x500?text=Image+3",
    "https://via.placeholder.com/500x500?text=Image+4",
  ],
};

const ProductDetails = () => {

  const params = useParams();
  
  const [product,setProductFromBackend] = useState({});
  const [related_Products,setRelatedProducts] = useState([]);
  const [stockStatus, setStockStatus] = useState("In Stock");
  const [isProductBlocked, setIsProductBlocked] = useState(false);

  const [mainImage, setMainImage] = useState(
    product?.productImage ?? "d"
  );

 
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".product-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  useEffect(()=>{

    axiosBaseUrl.get(`/productDetails/product/${params.productId}`)
    .then((res)=>{                           
      
      if(res.status !== 200){
        console.log(res.error || "somethieng went wrong" )
        return; 
      }
  
      const result = res.data;
    
      setProductFromBackend(result.product);
      setMainImage(result?.product?.productImage[0]);
      setRelatedProducts(result.relatedProducts)

      return;
    
    }).catch((err)=>{
      console.log(err.message);
      return;
    });
  },[]);

  const handleAddToCart = async(productId) => {
    if (stockStatus === "Unavailable" || stockStatus === "Sold Out" || isProductBlocked) {
      toast.info("Product is unavailable or blocked. Redirecting to product listing page...");
    } else if (stockStatus === "Out of Stock") {
      toast.info("Product is out of stock. Please check back later.");
    } else {
      
      const addedToCart = await addToCart_Service(productId);
      
      if(!addedToCart){
        return false;
      }

      toast.success("Product added to cart!");
      return true;
    }
  };

    const handleAddToWishlist = async(productId) => {
      const addedToWishlist = await addToWishlist_Service(productId);
      
      if(!addedToWishlist){
        return false;
      }
  
      toast.success("Added To the Wishlist")
      return true;
    };

  // Handle image thumbnail click
  const handleThumbnailClick = useCallback((image) => {
    setMainImage(image);
  },[mainImage]);

  // Handle zoom functionality
  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

    // Calculate the position of the zoomed image
    const zoomX = (x / width) * 100;
    const zoomY = (y / height) * 100;

    setZoomPosition({ x: zoomX, y: zoomY });
    setZoomVisible(true);
  };

  const handleMouseLeave = () => {
    setZoomVisible(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <import_Component.HeaderSection/>
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center text-sm text-textLight" data-aos="fade-down">
          <a href="/user/homepage" className="hover:underline">Home</a>
          <FaChevronRight className="mx-2" />
          <a href="/user/shop" className="hover:underline">shop</a>
          <FaChevronRight className="mx-2" />
          <span>{product?.productName?.slice(0,15)+"..."}</span>
        </nav>
      </div>
      

      <section className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Product Images Section */}
        <div className="lg:w-1/2 flex gap-4">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2">
            {product?.productImage?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-20 h-20 object-contain rounded-lg cursor-pointer border-2 ${
                  mainImage === image ? "border-teal-600" : "border-transparent"
                }`}
                onClick={() => handleThumbnailClick(image)}
              />
          ))}
          </div>

          {/* Main Image with Zoom */}
          <div className="relative flex-1">
            <div
              ref={imageRef}
              className="relative flex justify-center w-full h-[500px] overflow-hidden rounded-lg shadow-md"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {
                ([ "deconstruct", "Oshea", "BELLAVITA"].some(keyword =>{
                  if(product?.productName?.includes(keyword) &&
                  mainImage == product?.productImage[0]){
                    return true;
                  }

                  return false;
                } ))
                ? (
                    <img
                    src={mainImage}
                    alt={product.productName}
                    width="40%"
                    className=" object-center !h-[100%] justify-center transition-transform duration-300"
                  />
                ) :(
                  <img
                    src={mainImage}
                    alt={product.productName}
                    className="w-full h-full object-fill"
                  />
                )
              }
              {zoomVisible && (
                <div
                  className="absolute w-32 h-32 bg-gray-200 opacity-30 rounded-full pointer-events-none"
                  style={{
                    left: `${zoomPosition.x}%`,
                    top: `${zoomPosition.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>
            {/* Zoomed Image */}
            {zoomVisible && (
              <div className="absolute bg-white top-0 left-[100%] w-[700px] h-[500px] rounded-lg shadow-md overflow-hidden z-10">
                <img
                  src={mainImage}
                  alt="Zoomed"
                  
                  className="w-auto flex justify-self-center h-auto object-center"
                  style={{
                    transform: `scale(2)`,
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/2 space-y-6" data-aos="fade-left">
          <h1 className="product-heading text-3xl font-bold text-textLight">
            {product.productName}
          </h1>

          {/* Ratings */}
          <div className="flex items-center space-x-2">
            <div className="flex">
              {[...Array(5)].map((_, index) => (
                <span key={index}>
                  {index + 1 <= Math.floor(tempProduct.rating) ? (
                    <FaStar className="text-yellow-400" />
                  ) : (
                    <FaRegStar className="text-yellow-400" />
                  )}
                </span>
              ))}
            </div>
            <span className="text-textLight">({tempProduct.rating} / 5)</span>
            <span className="text-textLight">({tempProduct.reviews.length} reviews)</span>
          </div>

          {/* Price and Discount */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-2xl font-bold text-teal-600">₹{product.salePrice}.00</span>
              <span className="text-lg text-gray-500 line-through">₹{product.regularPrice}.00</span>
            </div>
            <p className="text-sm text-green-600">{product.validOffer}% off</p>
          </div>

          {/* Stock Status */}
          <div>
            <p
              className={`text-sm font-semibold ${
                product.status == "available"
                  ? "text-green-600"
                  : product.status === "out of stock"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {product?.status && product?.quantity > 0 == "available" ?"In Stock" : product?.status}
            </p>
            {product?.quantity <=0 || product?.status === "Out of Stock" && (
              <p className="text-sm text-red-600 mt-1">Please check back later.</p>
            )}
            {product?.status === "Discontinued" && (
              <p className="text-sm text-red-600 mt-1">This product is currently unavailable.</p>
            )}
            {
              product?.quantity>0 &&
              <p className="text-sm text-gray-800 mt-1">Quantity: {product?.quantity}</p>
            }
          </div>

          {/* Add to Cart and Wishlist Buttons */}
          <div className="flex space-x-4">
            <div className="flex gap-2 space-x-2 w-[70%]">
            <motion.button
              onClick={()=>handleAddToCart(product._id)}
              className={`flex-1 py-3 flex items-center justify-center w-1/2 rounded-md transition-colors ${
                product?.status === "available" && !product?.isBlocked && product?.quantity>0
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              whileHover={{ scale: product?.status == "available" && !product?.isBlocked ? 1.05 : 1 }}
              whileTap={{ scale: product?.status == "available" && !product?.isBlocked  ? 0.95 : 1 }}
              disabled={product?.status !== "available" || product?.isBlocked}
            >
              <FaShoppingCart />
              <span>Add to Cart</span>
            </motion.button>

            {/* <motion.button
              onClick={()=>handleAddToCart(product._id)}
              className={`flex-1 py-3 flex items-center justify-center  rounded-md transition-colors ${
                product?.status === "available" && !product.isBlocked
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              whileHover={{ scale: product?.status == "available" && !product?.isBlocked ? 1.05 : 1 }}
              whileTap={{ scale: product?.status == "available" && !product?.isBlocked  ? 0.95 : 1 }}
              disabled={product?.status !== "available" || product?.isBlocked}
            >

              <span>Buy Now</span>
            </motion.button> */}
            </div>

            <motion.button
              type="button"
              onClick={()=>handleAddToWishlist(product._id)}
              className="py-3 px-6 border border-gray-300 text-textLight rounded-md hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHeart />
            </motion.button>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-textLight">Highlights</h3>
            <ul className="list-disc list-inside text-textLight">
              {product.description?.split(";")?.map((highlight, index) => (
                highlight.trim() && 
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      
    {/* Full Description */}
    <div className="w-[82%] mx-auto space-y-2">
      <h3 className="text-2xl font-bold text-textLight">Product Description</h3>
      <p className="text-textLight">{product.fullDescription}</p>
    </div>

    <br />

    <hr className="!w-[82%] opacity-30 mx-auto " />

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-textLight" data-aos="fade-up">
            Customer Reviews
          </h2> 
          <span className="!text-md text-[#00786F] cursor-pointer underline underline-offset-2">ADD YOU'RE REVIEW</span>
        </div>
        
        <div className="mt-4 space-y-4">
          {tempProduct.reviews.length > 0 ? (
            tempProduct.reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-white rounded-lg shadow-md"
                data-aos="fade-up"
                data-aos-delay={Number(review.id) * 100}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-textLight">{review.user}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <span key={index}>
                        {index + 1 <= review.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-yellow-400" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-textLight">{review.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-textLight">No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </section>

      {/* Related Products Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-textLight" data-aos="fade-up">
          Related Products
        </h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 ">
          {related_Products?.length == 0 &&
          <p className="text-start opacity-75">---No related products---</p>
          }
          {related_Products?.map((relatedProduct,index) => (
            <motion.div
              key={relatedProduct?._id}
              className="bg-white rounded-lg shadow-md p-4 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: relatedProduct?._id * 0.1 }}
              data-aos="fade-up"
              data-aos-delay={relatedProduct?._id * 100}
            >
              <img
                src={relatedProduct?.productImage[0] || ""}
                alt={relatedProduct?.productName}
                className="w-full h-48 object-contain mx-auto"
                style={{
                  transform:"scale(1.2)"
                }}
              />
              <button type="button" onClick={() => handleAddToWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                    <FaHeart className="text-gray-500 hover:text-red-500" />
                  </button>
                  {/* Add to Cart Icon (Visible on Hover) */}
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="absolute top-1/3 left-1/2 transform w-full flex justify-center -translate-x-1/2 -translate-y-1/2 p-3 bg-teal-600 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                    >
                    <FaShoppingCart />
                  </button>

              {index == 2 &&
              <span className="px-1 absolute left-0 shadow-2xl top-[10px] bg-black text-[#fffff5]">BestSeller</span>
              }

              {index == 0 &&
              <span className="px-1 absolute left-0 shadow-2xl top-[10px] bg-teal-600 text-[#fffff5]">COSRXchoice</span>
              }

              <h3 className="mt-4 text-lg font-semibold text-textLight">
                {relatedProduct?.productName}
              </h3>

              
              <div className="space-y-2">
                <div className="flex justify-center items-center space-x-4">
                  <span className="text-xl font-bold text-teal-600">₹{relatedProduct?.salePrice}.00</span>
                  <span className="text-md text-gray-500 line-through">₹{relatedProduct?.regularPrice}.00</span>
                </div>
                
                <p className="text-sm text-green-600">{relatedProduct?.validOffer}% off</p>
              </div>
              
              <Link to={`/user/productDetails/${relatedProduct._id}`} target="_blank" >
              <motion.button
                className="mt-4 py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Product
              </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <import_Component.Footer/>
    </div>
  );
};

export default ProductDetails;
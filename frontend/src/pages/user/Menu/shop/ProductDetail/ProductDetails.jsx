import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaStar, FaRegStar, FaChevronRight, FaShoppingCart, FaHeart } from "react-icons/fa";
import { useParams, Link } from "react-router-dom";
import grid10 from "@/assets/HomePage/grid10.png";
import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";
import { addToCart_Service } from "@/Services/User/Cart/Cart.jsx";
import { addToWishlist_Service } from "@/Services/User/wishlist/Wishlist.jsx";
import import_Component from "@/importStateMents/import_Component";

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
};

const ProductDetails = () => {
  const params = useParams();
  const [product, setProductFromBackend] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [stockStatus, setStockStatus] = useState({ text: "Loading...", color: "text-gray-600" });
  const [offer, setOffer] = useState({});
  const [selectedNull, setSelectedNull] = useState(10);
  const [mainImage, setMainImage] = useState("");
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

  // Fetch product details and set stock status
  useEffect(() => {
    axiosBaseUrl.get(`/productDetails/product/${params.productId}`)
      .then((res) => {
        if (res.status !== 200) {
          console.error("Error fetching product:", res.error || "Something went wrong");
          toast.error("Failed to load product details.");
          return;
        }

        const result = res.data;
        const fetchedProduct = result.product || {};

        // Validate product data
        if (!fetchedProduct._id) {
          console.error("Invalid product data:", fetchedProduct);
          toast.error("Product not found.");
          return;
        }

        setProductFromBackend(fetchedProduct);
        setMainImage(fetchedProduct.productImage?.[0] || grid10);
        setRelatedProducts(result.relatedProducts || []);
        setOffer(result.finalOffer || {});

        // Set stock status based on quantity, status, and isBlocked
        if (fetchedProduct.isBlocked) {
          setStockStatus({ text: "Temporarily Unavailable", color: "text-gray-600" });
        } else if (fetchedProduct.status === "Discontinued") {
          setStockStatus({ text: "Discontinued", color: "text-red-600" });
        } else if (fetchedProduct.quantity <= 0) {
          setStockStatus({ text: "Out of Stock", color: "text-red-600" });
        } else if (fetchedProduct.quantity <= 5) {
          setStockStatus({ text: `Low Stock (${fetchedProduct.quantity} left)`, color: "text-yellow-600" });
        } else {
          setStockStatus({ text: "In Stock", color: "text-green-600" });
        }

        // Warn if status and quantity are inconsistent
        if (fetchedProduct.status === "available" && fetchedProduct.quantity <= 0) {
          console.warn(`Product ${fetchedProduct.productName} has status "available" but quantity is ${fetchedProduct.quantity}`);
        }
      })
      .catch((err) => {
        console.error("Error fetching product:", err.message);
        toast.error("Error loading product details.");
        setStockStatus({ text: "Error Loading Status", color: "text-red-600" });
      });
  }, [params.productId]);

  const handleAddToCart = async (productId) => {
    if (stockStatus.text !== "In Stock" && !stockStatus.text.startsWith("Low Stock")) {
      toast.info(`${stockStatus.text}. Please check back later or view similar products.`);
      return false;
    }

    try {
      const addedToCart = await addToCart_Service(productId);
      if (!addedToCart) {
        // toast.error("Failed to add product to cart.");
        return false;
      }
      toast.success("Product added to cart!");
      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Error adding product to cart.");
      return false;
    }
  };

  const handleAddToWishlist = async (productId) => {
    try {
      const addedToWishlist = await addToWishlist_Service(productId);
      if (!addedToWishlist) {
        toast.error("Failed to add to wishlist.");
        return false;
      }
      toast.success("Added to Wishlist");
      return true;
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      toast.error("Error adding to wishlist.");
      return false;
    }
  };

  // Handle image thumbnail click
  const handleThumbnailClick = useCallback((image) => {
    setMainImage(image);
  }, []);

  // Handle zoom functionality
  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;

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
      <import_Component.HeaderSection />
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center text-sm text-textLight" data-aos="fade-down">
          <Link to="/user/homepage" className="hover:underline">Home</Link>
          <FaChevronRight className="mx-2" />
          <Link to="/user/shop" className="hover:underline">Shop</Link>
          <FaChevronRight className="mx-2" />
          <span>{product?.productName?.slice(0, 15) + "..."}</span>
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
              {["deconstruct", "Oshea", "BELLAVITA"].some(keyword =>
                product?.productName?.includes(keyword) && mainImage === product?.productImage?.[0]
              ) ? (
                <img
                  src={mainImage}
                  alt={product.productName}
                  width="40%"
                  className="object-center !h-[100%] justify-center transition-transform duration-300"
                />
              ) : (
                <img
                  src={mainImage}
                  alt={product.productName}
                  className="w-full h-full object-fill"
                />
              )}
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
            {product.productName || "Loading..."}
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
              <span className="text-2xl font-bold text-teal-600">
                {offer && offer.discountAmount > 0
                  ? offer.discountType === "Flat"
                    ? `₹${(product.salePrice - offer.discountAmount).toFixed(2)}`
                    : `₹${(product.salePrice - (product.salePrice * (offer.discountAmount / 100))).toFixed(2)}`
                  : `₹${product.salePrice?.toFixed(2) || "0.00"}`}
              </span>
              {offer && offer.discountAmount > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.salePrice?.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-sm text-green-600">
              {offer && offer.discountAmount > 0
                ? `${offer.discountAmount}% off`
                : product?.validOffer > 0
                ? `${product.validOffer}% off`
                : "No offer available"}
            </p>
          </div>

          {/* Stock Status */}
          <div>
            <p className={`text-sm font-semibold ${stockStatus.color}`}>
              {stockStatus.text}
            </p>
            {stockStatus.text === "Out of Stock" && (
              <p className="text-sm text-red-600 mt-1">Please check back later for restock.</p>
            )}
            {stockStatus.text === "Discontinued" && (
              <p className="text-sm text-red-600 mt-1">This product is no longer available.</p>
            )}
            {stockStatus.text === "Temporarily Unavailable" && (
              <p className="text-sm text-gray-600 mt-1">This product is currently unavailable.</p>
            )}
            {product?.quantity > 0 && (
              <p className="text-sm text-gray-800 mt-1">Available Quantity: {product.quantity}</p>
            )}
          </div>

          {/* Add to Cart and Wishlist Buttons */}
          <div className="flex space-x-4">
            <div className="flex gap-2 space-x-2 w-[70%]">
              <motion.button
                onClick={() => handleAddToCart(product._id)}
                className={`flex-1 py-3 flex items-center justify-center w-1/2 rounded-md transition-colors ${
                  stockStatus.text === "In Stock" || stockStatus.text.startsWith("Low Stock")
                    ? "bg-teal-600 text-white hover:bg-teal-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                whileHover={{ scale: (stockStatus.text === "In Stock" || stockStatus.text.startsWith("Low Stock")) ? 1.05 : 1 }}
                whileTap={{ scale: (stockStatus.text === "In Stock" || stockStatus.text.startsWith("Low Stock")) ? 0.95 : 1 }}
                disabled={stockStatus.text !== "In Stock" && !stockStatus.text.startsWith("Low Stock")}
              >
                <FaShoppingCart className="mr-2" />
                <span>Add to Cart</span>
              </motion.button>
            </div>
            <motion.button
              type="button"
              onClick={() => handleAddToWishlist(product._id)}
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
                highlight.trim() && <li key={index}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Full Description */}
      <div className="w-[82%] mx-auto space-y-2">
        <h3 className="text-2xl font-bold text-textLight">Product Description</h3>
        <p className="text-textLight">{product.fullDescription || "No description available."}</p>
      </div>

      <br />

      <hr className="!w-[82%] opacity-30 mx-auto " />

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-textLight" data-aos="fade-up">
            Customer Reviews
          </h2>
          <span className="!text-md text-[#00786F] cursor-pointer underline underline-offset-2">ADD YOUR REVIEW</span>
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
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts?.length === 0 && (
            <p className="text-start opacity-75">---No related products---</p>
          )}
          {relatedProducts?.map((relatedProduct, index) => (
            <motion.div
              key={relatedProduct?._id}
              className="bg-white rounded-lg shadow-md p-4 text-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <img
                src={relatedProduct?.productImage?.[0] || grid10}
                alt={relatedProduct?.productName}
                className="w-full h-48 object-contain mx-auto"
                style={{ transform: "scale(1.2)" }}
              />
              <button
                type="button"
                onClick={() => handleAddToWishlist(relatedProduct._id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <FaHeart className="text-gray-500 hover:text-red-500" />
              </button>
              <button
                onClick={() => handleAddToCart(relatedProduct._id)}
                className="absolute top-1/3 left-1/2 transform w-full flex justify-center -translate-x-1/2 -translate-y-1/2 p-3 bg-teal-600 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
              >
                <FaShoppingCart />
              </button>

              {index === 2 && (
                <span className="px-1 absolute left-0 shadow-2xl top-[10px] bg-black text-[#fffff5]">BestSeller</span>
              )}
              {index === 0 && (
                <span className="px-1 absolute left-0 shadow-2xl top-[10px] bg-teal-600 text-[#fffff5]">COSRXchoice</span>
              )}

              <h3 className="mt-4 text-lg font-semibold text-textLight">
                {relatedProduct?.productName}
              </h3>

              <div className="space-y-2">
                <div className="flex justify-center items-center space-x-4">
                  <span className="text-xl font-bold text-teal-600">₹{relatedProduct?.salePrice?.toFixed(2)}</span>
                  <span className="text-md text-gray-500 line-through">₹{relatedProduct?.regularPrice?.toFixed(2)}</span>
                </div>
                <p className="text-sm text-green-600">{relatedProduct?.validOffer}% off</p>
              </div>

              <Link to={`/user/productDetails/${relatedProduct._id}`} target="_blank">
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
      <import_Component.Footer />
    </div>
  );
};

export default ProductDetails;






















/*In feature alter the schema into this ;
{
  _id: ObjectId(1984g3453t4t66gaf33t3),
  name: "BlueWella",
  category: "Serum",
  description: "Good product with the highly intensive products",
  variants: [
    {
      variantId: "v1",
      weight: "250g",
      price: 150,
      stock: 100
    },
    {
      variantId: "v2",
      weight: "500g",
      price: 280,
      stock: 80
    },
    {
      variantId: "v3",
      weight: "1kg",
      price: 520,
      stock: 50
    }
  ],
  image: "...",
  createdAt: "...",
  updatedAt: "..."
}
*/
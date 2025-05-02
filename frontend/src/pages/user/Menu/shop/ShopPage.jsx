import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {toast} from "react-toastify";
import axiosBaseUrl from "$/axios";
import { loadProducts } from "#/shop/shop";
import HeaderSection from "@/components/HeaderSection";
import tempBanner from "@/assets/Product/Tooner/banner.webp";
import {addToCart_Service} from "@/Services/User/Cart/Cart.jsx";
import { addToWishlist_Service} from "@/Services/User/wishlist/Wishlist";

import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  FaTimes, 
  FaHeart, 
  FaSearch, 
  FaChevronLeft, 
  FaChevronDown, 
  FaShoppingCart ,
  FaChevronRight
} from "react-icons/fa";


const headerBackgroundImage = tempBanner;

const ShopPage = () => {
  const [categories, setCategories] = useState([]);
  const dispatch = useDispatch();
  // const shopStore = useSelector((state) => state.shop);
  //------------------------------------------------------

  const [shopStore,setShopStore] = useState([]);
  // State for search, sort, filtyer, and pagination If poosgible change it to the latetr onwartd
  //--------------------------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [filterProductType, setFilterProductType] = useState("");
  const [filterSkinType, setFilterSkinType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // here iam settinghg the nopof products per page

  // Initialize AOS and GSAP animations
  //---------------------------------------------
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    gsap.fromTo(
      ".page-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Fetch categories
  //-----------------------
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axiosBaseUrl.get("/productDetails/manageCategory");
        if (response.data?.error) {
          console.error("API Error:", response.data.error);
          return;
        }
        console.log(response.data?.category);
        const categoryss = response.data?.category;
        setCategories((categoryss || []));
      } catch (err) {
        console.log(err.message);
        return;
      }
    };
    fetchCategory();
  }, []);

  // Fetch all products
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosBaseUrl.get("/productDetails/products");
        const result = await response.data;

        if(!result?.products){
          console.log("products not found");
          return;
        }

        //USING STATE OVER STORE   
        //-------------------------------------
        // setTimeout(()=>{
        //   dispatch(loadProducts(result?.products));
        // },1000);

        setShopStore(result?.products);
        console.log("shopStore",shopStore)

      } catch (err) {
        console.log(err.message);
        return;
      }
    };

    fetch();
  }, []);

  // Fetch products Based on filter and sorting
  //-------------------------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosBaseUrl.get("/productDetails/filterProducts", {
          params: {
            search: searchQuery,
            productType: filterProductType, 
            skinType: filterSkinType,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            sort: sortOption,
            limit: 6,
          },
        });

        const result = response.data;

        // dispatch( loadProducts(result.filteredProducts));
        setShopStore(result?.filteredProducts);
        // setProducts(response.data.products);
        // setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error.message);
        return;
      }
    };

    fetchProducts();
  }, [searchQuery, filterProductType, filterSkinType, priceRange, sortOption, currentPage]);

  
  const handleAddToCart = async (productId) => {
    const addedToCart = await addToCart_Service(productId);
    
    if(!addedToCart){
      return false;
    }

    toast.success("Added To the Cart")
    return true;
  };
  
  
  const handleAddToWishlist = async(productId) => {
    const addedToWishlist = await addToWishlist_Service(productId);
    
    if(!addedToWishlist){
      return false;
    }

    toast.success("Added To the Wishlist")
    return true;
  };

  // Calculate pagination
  const totalItems = shopStore?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = shopStore?.slice(startIndex, endIndex) || [];

 
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    console.log("searchQuery",searchQuery);
    setCurrentPage(1); // Reset to first page on search
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleSort = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };


  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <HeaderSection/>
      <section
        className="relative bg-teal-100 py-16 bg-cover bg-center"
        style={{ backgroundImage: `url(${headerBackgroundImage})` }}
      >
        <div className="max-w-7xl relative mx-auto px-4">
        
          <h2
            className="page-heading text-5xl w-fit mx-auto text-[#075795] !opacity-95 bg-[#C3DAF4] font-bold text-textLight text-center"
            data-aos="fade-up"
          >
            SHOP ALL PRODUCTS
          </h2>
        
        </div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar (Filters and Categories) */}
        <aside className="lg:w-1/4 space-y-6" data-aos="fade-right">
          {/* Product Categories */}
          <div>
            <h3 className="text-lg font-semibold text-textLight mb-4 uppercase tracking-wide">
              Categories
            </h3>
            <ul className="space-y-3">
              {categories?.map((category) => (
                <li key={category.name}>
                  <Link

                  to={
                    ["sunScreen", "Serum", "Tooner"].includes(category.name)
                      ? `/user/product/${category.name.toLowerCase()}`
                      : `/user/special/${category.name.toLowerCase()}`
                    }

                    state={{"categoryId":category?._id}}
                    className="block text-textLight hover:text-teal-600 transition-colors"
                  >
                    {category.name.toUpperCase()}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center border rounded-md p-3 bg-white shadow-sm">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search products..."
                className="w-full outline-none text-textLight text-sm"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="ml-2 text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Product Type Filter (All ProductTypes) */}
          <div>
            <h3 className="text-lg font-semibold text-textLight mb-4 uppercase tracking-wide">
              Product Types
            </h3>
            <select
              value={filterProductType}
              onChange={(e) => setFilterProductType(e.target.value)}
              className="w-full border rounded-md p-3 bg-white text-textLight text-sm shadow-sm"
            >
              <option value="">All Products</option>
              <option value="Anti-aging">Anti-aging</option>
              <option value="Hydrating">Hydrating</option>
              <option value="Brightening">Brightening</option>
            </select>
          </div>

          {/* Skin Types Filter */}
          <div>
            <h3 className="text-lg font-semibold text-textLight mb-4 uppercase tracking-wide">
              Skin Types
            </h3>
            <select
              value={filterSkinType}
              onChange={(e) => setFilterSkinType(e.target.value)}
              className="w-full border rounded-md p-3 bg-white text-textLight text-sm shadow-sm"
            >
              <option value="">All Skin Types</option>
              <option value="Dry">Dry</option>
              <option value="Oily">Oily</option>
              <option value="Normal">Normal</option>
              <option value="Combination">Combination</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-lg font-semibold text-textLight mb-4 uppercase tracking-wide">
              Price Range
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                placeholder="Min"
                className="border rounded-md p-3 w-1/2 text-textLight text-sm shadow-sm"
              />
              <span className="text-textLight">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                placeholder="Max"
                className="border rounded-md p-3 w-1/2 text-textLight text-sm shadow-sm"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid and Sorting */}
        <div className="lg:w-3/4">
          {/* Sort Dropdown */}
          <div className="flex justify-end mb-6" data-aos="fade-left">
            <div className="relative">
              <select
                value={sortOption}
                onChange={handleSort}
                className="appearance-none border rounded-md p-3 bg-white text-textLight text-sm pr-8 shadow-sm"
              >
                <option value="default">Sort By</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
                <option value="ratings">Average Ratings</option>
              </select>
              <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.length > 0 ? (
              currentProducts.map((product,i) => (
                <motion.div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md p-6 text-center transition-transform transform hover:scale-105 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  data-aos="fade-up"
                  data-aos-delay={i * 100}
                >
                  <Link to={`/user/productDetails/${product._id}`} state={"_self"}>
                  <img
                    src={product.productImage[0]}
                    alt={product.productName}
                    className="w-full h-48 object-contain mx-auto mb-4"
                  />
                  </Link>
                  <button onClick={() => handleAddToWishlist(product._id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                    <FaHeart className="text-gray-500 hover:text-red-500" />
                  </button>
                  {/* Add to Cart Icon (Visible on Hover) */}
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-teal-600 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                    >
                    <FaShoppingCart />
                  </button>

                  <h3 className="text-lg font-semibold text-textLight mb-2">{product.productName}</h3>
                  <p className="text-sm text-gray-500 mb-2 text-underline font-semibold">{product.category?.name}</p>
                  <p className="text-teal-600 font-bold text-lg">₹{product.salePrice}/-</p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-textLight col-span-full">No products found.</p>
            )}
          </div>

          {/* Simplified Pagination */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 bg-teal-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
            >
              <FaChevronLeft />
            </button>
            <span className="text-textLight">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 bg-teal-600 text-white rounded-full disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
          <div>
            <h3 className="text-lg font-semibold">COSRX</h3>
            <p className="mt-2 text-gray-400">
              Your beauty, our passion. Discover the best in skincare.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.56c-.89.39-1.84.65-2.84.77a4.92 4.92 0 002.16-2.72c-.95.56-2 .97-3.12 1.19a4.9 4.9 0 00-8.35 4.47A13.92 13.92 0 011.67 3.15a4.9 4.9 0 001.52 6.54c-.79-.02-1.54-.24-2.19-.61v.06a4.9 4.9 0 003.94 4.8c-.41.11-.84.17-1.28.17-.31 0-.61-.03-.91-.09a4.9 4.9 0 004.58 3.4A9.85 9.85 0 010 19.54a13.9 13.9 0 007.55 2.21c9.06 0 14.01-7.51 14.01-14.01 0-.21 0-.42-.02-.63A10 10 0 0024 4.56z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm-5.5 15.5v-5.5h-2v-2h2v-2c0-2.21 1.79-4 4-4h2v2h-2c-1.1 0-2 .9-2 2v2h2l-1 2h-1v5.5h-2z" />
                </svg>
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Menu</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Help</h3>
            <ul className="mt-2 space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <ul className="mt-2 space-y-2">
              <li className="text-gray-400">123 Beauty Lane, Skincare City</li>
              <li className="text-gray-400">support@cosrx.com</li>
              <li className="text-gray-400">+1 (123) 456-7890</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400">
          <p>© 2025 COSRX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ShopPage;
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  FaSearch, 
  FaTimes, 
  FaChevronDown, 
  FaChevronLeft, 
  FaChevronRight, 
  FaHeart, 
  FaShoppingCart, 
  FaChevronRight as FaChevronRightIcon 
} from "react-icons/fa";

import {addToCart_Service} from "@/Services/User/Cart/Cart.jsx";
import {addToWishlist_Service} from "@/Services/User/wishlist/Wishlist";

import {toast} from "react-toastify";
import { Link, useLocation } from "react-router-dom"; 
import Footer from "@/components/Footer";
import HeaderSection from "@/components/HeaderSection";
import axiosBaseUrl from "$/axios";

// Dummy background image for the header cheange intto the latest ele lazst
//when done withe theoss
import headerBackgroundImage from "@/assets/Product/Serum/banner2.jpg"

const ProductListing = () => {
  const [sunscreenProducts, setSunScreenProducts] = useState([]);
  const [filsunscreenProducts, setSunfilScreenProducts] = useState([]);
  const [category, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSkinType, setFilterSkinType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3; // Number of products per page

  const location = useLocation();

  // Fetch categories
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axiosBaseUrl.get("/productDetails/manageCategory");
        if (response.data?.error) {
          console.error("API Error:", response.data.error);
          return;
        }
        const categoryss = response.data?.category;
        setCategories(categoryss);
      } catch (err) {
        console.log(err.message);
        return;
      }
    };
    fetchCategory();
  }, []);

  useEffect(() => {
      if (sunscreenProducts?.length > 0) {
        setSunfilScreenProducts([...sunscreenProducts]);
      }
    }, [sunscreenProducts]);

  // Fetch products based on categoryId
  useEffect(() => {
    const { categoryId } = location.state || {};

    const fetch = async () => {
      try {
        const response = await axiosBaseUrl.get(`/productDetails/products/${categoryId}`);
        const result = await response.data;
        setSunScreenProducts(result.products);
        setSunfilScreenProducts(result.products);
        console.log(result.products);
      } catch (err) {
        console.log(err.message);
      }
    };

    if (categoryId) {
      fetch();
    }
  }, [location]);

  // Handle search
  useEffect(() => {
    const fetchSearchedData = async () => {
      try {
        const response = await axiosBaseUrl.get("/productDetails/searchProducts", {
          params: {
            categoryId: location?.state?.categoryId,
            searchQuery: searchQuery,
            skinType:filterSkinType,
            productType : filterCategory,
            minPrice : priceRange[0],
            maxPrice : priceRange[1],
            sort:sortOption,
          },
        });

        if (response.data?.error) {
          console.log("Something went wrong");
          return;
        }

        const result = response.data;
        setSunfilScreenProducts(result.products);
      } catch (err) {
        console.log("Error", err.message);
      }
    };

    if (location?.state?.categoryId) {
      setTimeout(()=>{
        fetchSearchedData();
      },1000);
    }
  }, [searchQuery, location,filterSkinType,filterCategory,priceRange,sortOption]);

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".page-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Handle Search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Clear Search
  const clearSearch = () => {
    setSearchQuery("");
    setSunfilScreenProducts(sunscreenProducts); // Reset to original products
  };

  // Handle Sort
  const handleSort = (e) => {
    const option = e.target.value;
    setSortOption(option);
    let sortedProducts = [...filsunscreenProducts];
    if (option === "price-low-high") {
      sortedProducts.sort((a, b) => a.salePrice - b.salePrice);
    } else if (option === "price-high-low") {
      sortedProducts.sort((a, b) => b.salePrice - a.salePrice);
    } else if (option === "a-z") {
      sortedProducts.sort((a, b) => a.productName.localeCompare(b.productName));
    } else if (option === "z-a") {
      sortedProducts.sort((a, b) => b.productName.localeCompare(a.productName));
    } else if (option === "ratings") {
      sortedProducts.sort((a, b) => b.validOffer - a.validOffer);
    }
    setSunfilScreenProducts(sortedProducts);
  };

  // Handle Filter
  const handleFilter = () => {
    let filteredProducts = sunscreenProducts?.filter((product) => {
      const matchesCategory = filterCategory ? product?.productType === filterCategory : true;
      const matchesSkinType = filterSkinType ? product?.skinType === filterSkinType : true;
      const matchesBrand = filterBrand ? product.category?.name === filterBrand : true;
      const matchesPrice = product.salePrice >= priceRange[0] && product.salePrice <= priceRange[1];
      return matchesCategory && matchesSkinType && matchesBrand && matchesPrice && !product.isBlocked;
    });

    setSunfilScreenProducts(filteredProducts);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    handleFilter();
  }, [filterCategory, filterSkinType, filterBrand, priceRange, sunscreenProducts]);

  // Pagination Logic
  const totalProducts = filsunscreenProducts?.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filsunscreenProducts?.slice(startIndex, startIndex + productsPerPage);

  // Handle Page Change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };


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


  const currentCategory = category.find(cat => cat._id === location?.state?.categoryId)?.name || "Category";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <HeaderSection />

      <section
        className="relative bg-teal-100 py-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${headerBackgroundImage})` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h1
            className="page-heading absolute top-[46.5%] !-rotate-[40deg] bg-[#0090DA] text-[#89D6F1] shadow-teal-400 translate-x-4 !opacity-75 left-[16%] px-1 py-2 rounded-2xl text-4xl font-bold text-textLight text-center"
            data-aos="fade-up"
          >
          </h1>
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
              {category?.map((category) => (
                <li key={category.name}>
                  <Link
                    to={
                      ["sunScreen", "Serum", "Tooner"].includes(category.name)
                        ? `/user/product/${category.name.toLowerCase()}`
                        : `/user/special/${category.name.toLowerCase()}`
                      }
                    state={{ categoryId: category._id }}
                    target="_self"
                    className={`block text-textLight hover:text-teal-600 transition-colors ${
                      category._id === location?.state?.categoryId ? "font-bold text-teal-600" : ""
                    }`}
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
                placeholder={`Search ${currentCategory.toLowerCase()}...`}
                className="w-full outline-none text-textLight text-sm"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="ml-2 text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Categories Filter (Subcategories for Serums) */}
          <div>
            <h3 className="text-lg font-semibold text-textLight mb-4 uppercase tracking-wide">
              Serum Types
            </h3>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border rounded-md p-3 bg-white text-textLight text-sm shadow-sm"
            >
              <option value="">All Serum Types</option>
              <option value="Brightening">Brightening</option>
              <option value="Hydrating">Hydrating</option>
              <option value="Anti-aging">Anti-Aging</option>
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
            {/* Breadcrumbs */}
          <div className="max-w-7xl h-fit mx-auto px-4 py-4">
            <nav className="flex items-center text-sm text-textLight" data-aos="fade-down">
              <Link to="/user/homepage" className="hover:underline">Home</Link>
              <FaChevronRightIcon className="mx-2" />
              <Link to="/user/shop" className="hover:underline">Shop</Link>
              <FaChevronRightIcon className="mx-2" />
              <span>{currentCategory.toUpperCase()}</span>
            </nav>
          </div>

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
            {currentProducts?.length > 0 ? (
              currentProducts?.map((product) => (
                <motion.div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md p-6 text-center transition-transform transform hover:scale-105 hover:shadow-lg relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  data-aos="fade-up"
                  data-aos-delay={Number(product._id) * 100}
                >
                  {/* Product Image with Wishlist and Add to Cart Icons */}
                  <div className="relative group">
                  <Link to={`/user/productDetails/${product._id}`} state={"_self"}>
                    <img
                      src={product?.productImage[0]}
                      alt={product.productName}
                      className="w-full h-48 object-contain mx-auto mb-4"
                    />
                    </Link>
                    {/* Wishlist Icon (Always Visible) */}
                    <button
                      onClick={() => handleAddToWishlist(product._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <FaHeart className="text-gray-500 hover:text-red-500" />
                    </button>
                    {/* Add to Cart Icon (Visible on Hover) */}
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-teal-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaShoppingCart />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-textLight mb-2">{product.productName.slice(0,50) +
                    "..."}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.category?.name}</p>
                  
                  <p className="text-teal-600 font-bold text-lg">₹{product?.salePrice}</p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-textLight col-span-full">No products found.</p>
            )}
          </div>

          {/* Simplified Pagination */}
          {sunscreenProducts?.length > 0 &&
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
          }
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductListing;
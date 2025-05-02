import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaSearch, FaTimes, FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom"; // For navigation between product pages

import Footer from "@/components/Footer";
import HeaderSection from "@/components/HeaderSection";

// Dummy image for products
const dummyProductImage = "https://via.placeholder.com/200x300?text=Serum+Image";

// Dummy background image for the header (replace with your actual image)
import headerBackgroundImage from "@/assets/Product/moisturuizer/banner.webp"

// Dummy product data for the "Serum" category (replace with backend data)
const initialProducts = [
  { id: 1, name: "Vitamin C Serum", brand: "Brand A", category: "Brightening", skinType: "Dry", price: 850, rating: 4.5, isBlocked: false },
  { id: 2, name: "Hyaluronic Acid Serum", brand: "Brand B", category: "Hydrating", skinType: "Oily", price: 650, rating: 4.0, isBlocked: false },
  { id: 3, name: "Retinol Serum", brand: "Brand A", category: "Anti-Aging", skinType: "Normal", price: 950, rating: 4.8, isBlocked: false },
  { id: 4, name: "Niacinamide Serum", brand: "Brand C", category: "Brightening", skinType: "Combination", price: 550, rating: 4.2, isBlocked: true }, // Blocked product
  { id: 5, name: "Peptide Serum", brand: "Brand B", category: "Anti-Aging", skinType: "Dry", price: 750, rating: 4.3, isBlocked: false },
  { id: 6, name: "Hydrating Serum", brand: "Brand D", category: "Hydrating", skinType: "Oily", price: 450, rating: 4.1, isBlocked: false },
  { id: 7, name: "Brightening Serum", brand: "Brand A", category: "Brightening", skinType: "Normal", price: 700, rating: 4.6, isBlocked: false },
  { id: 8, name: "Anti-Aging Serum", brand: "Brand C", category: "Anti-Aging", skinType: "Combination", price: 800, rating: 4.4, isBlocked: false },
];

// List of product categories for the sidebar
const productCategories = [
  { name: "Cleansers", path: "/cleansers" },
  { name: "Moisturizers", path: "/moisturizers" },
  { name: "Toners", path: "/toners" },
  { name: "Serums", path: "/serums" },
  { name: "Sunscreen", path: "/sunscreen" },
];

const ProductListing = () => {
  // State for search, sort, filter, and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterSkinType, setFilterSkinType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6; // Number of products per page

  // State for filtered and sorted products
  const [products, setProducts] = useState(initialProducts);

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".page-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  // Handle Search (to be implemented with backend)
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    // Implement backend search logic here
    // Example: Fetch products from backend with search query
    // setProducts(fetchedProducts.filter(product => !product.isBlocked));
  };

  // Clear Search
  const clearSearch = () => {
    setSearchQuery("");
    // Reset products to initial state (fetch from backend)
    setProducts(initialProducts);
  };

  // Handle Sort (to be implemented with backend)
  const handleSort = (e) => {
    const option = e.target.value;
    setSortOption(option);
    // Implement backend sort logic here
    let sortedProducts = [...products];
    if (option === "price-low-high") {
      sortedProducts.sort((a, b) => a.price - b.price);
    } else if (option === "price-high-low") {
      sortedProducts.sort((a, b) => b.price - a.price);
    } else if (option === "a-z") {
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === "z-a") {
      sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === "ratings") {
      sortedProducts.sort((a, b) => b.rating - a.rating);
    }
    setProducts(sortedProducts);
  };

  // Handle Filter (to be implemented with backend)
  const handleFilter = () => {
    // Implement backend filter logic here
    let filteredProducts = initialProducts.filter((product) => {
      const matchesCategory = filterCategory ? product.category === filterCategory : true;
      const matchesSkinType = filterSkinType ? product.skinType === filterSkinType : true;
      const matchesBrand = filterBrand ? product.brand === filterBrand : true;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesCategory && matchesSkinType && matchesBrand && matchesPrice && !product.isBlocked;
    });
    setProducts(filteredProducts);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Apply filters whenever filter state changes
  useEffect(() => {
    handleFilter();
  }, [filterCategory, filterSkinType, filterBrand, priceRange]);

  // Pagination Logic
  const totalProducts = products.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage);

  // Handle Page Change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section (Banner to be added by you) */}
      <HeaderSection/>
      <section
        className="relative bg-teal-100 py-80 bg-cover bg-center"
        style={{ backgroundImage: `url(${headerBackgroundImage})` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h1
            className="page-heading absolute top-[46.5%] !-rotate-[40deg] bg-[#0090DA] text-[#89D6F1] shadow-teal-400 translate-x-4  !opacity-75 left-[16%] px-1 py-2 rounded-2xl text-4xl font-bold text-textLight text-center"
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
              {productCategories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className={`block text-textLight hover:text-teal-600 transition-colors ${
                      category.name === "Serums" ? "font-bold text-teal-600" : ""
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
                placeholder="Search serums..."
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
              <option value="Anti-Aging">Anti-Aging</option>
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
              currentProducts.map((product) => (
                <motion.div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md p-6 text-center transition-transform transform hover:scale-105 hover:shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  data-aos="fade-up"
                  data-aos-delay={product.id * 100}
                >
                  <img
                    src={dummyProductImage}
                    alt={product.name}
                    className="w-full h-48 object-contain mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-textLight mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                  <p className="text-teal-600 font-bold text-lg">₹{product.price}</p>
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
      <Footer/>
    </div>
  );
};

export default ProductListing;
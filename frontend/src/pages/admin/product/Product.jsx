import React, { useState, useCallback, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2"
import ReactPaginate from "react-paginate";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import axiosBaseUrl from "$/axios";
import Sidebar from "@/components/Admin.sidebar";
import { updateProducts } from "#/admin/users/Product";

const ProductPage = () => {
  const productStore = useSelector((state) => state.products) || [];
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const [isDeleted, setIsDeleted] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          page: currentPage + 1,
          limit: itemsPerPage,
        };
        const endpoint = searchText ? "/adminPro/products/search" : "/adminPro/products";
        if (searchText) params.searchText = searchText;

        const response = await axiosBaseUrl.get(endpoint, { params });
        const result = await response.data;

        if (result.error) {
          console.error("API Error:", result.error);
          toast.error("Failed to fetch products.");
          return;
        }

        // Update Redux store with paginated results
        //-----------------------------------------
        dispatch(updateProducts(result.products));

        // Set total pages based on backend's total count
        //------------------------------------------------
        setTotalPages(Math.ceil(result.total / itemsPerPage));
      } catch (err) {
        console.log(err.message);
        toast.error("Something went wrong.");
      }
    };

    fetchData();
  }, [dispatch, currentPage, isDeleted, searchText]);

  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected);
  }, []);

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const sidebarVariants = {
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: {
      x: "-100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const handleAddProduct = () => {
    navigate("/admin/products/add");
  };

  const handleEditProduct = (product) => {
    navigate(`/admin/products/edit/${product._id}`, { state: { product } });
  };

  const handleSoftDelete = useCallback(async(id) => {
    if (!id) {
      toast.info("ID is null");
      return;
    }

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

    axiosBaseUrl
      .patch(`/adminPro/products/delete/${id}`)
      .then((res) => {
        if (res.data.error) {
          toast.error(res.data.error);
          return;
        }

        setIsDeleted((prevState) => !prevState);
        toast.success("Item deleted successfully...");
      })
      .catch((err) => {
        console.error(err.message);
        toast.error("Something went wrong.");
      });
  }, []);

  const handleListing = useCallback(async (id, listing) => {
    try {

      const swalll = await Swal.fire({
            title: 'Are you sure to Toggle listing',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',   
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, do it!',
            cancelButtonText: 'Cancel'
          })

      if (listing === "available" && !swalll.isConfirmed) {
        return;
      }

      const response = await axiosBaseUrl.patch(`/adminPro/products/listing/${id}`, { listing });
      const result = response.data;

      if (result.hasOwnProperty("error")) {
        toast(result?.error);
        console.log("error in the handleListing");
        return;
      }

      setIsDeleted((prevState) => !prevState);
    } catch (err) {
      console.log(err.message);
    }
  }, []);

  const handleSearchInput = (event) => {
    setSearchText(event.target.value);
  };

  const handleEnterInput = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleEnterInput);

    return () => {
      window.removeEventListener("keydown", handleEnterInput);
    };
  }, [searchText]);

  const handleSearchSubmit = useCallback(() => {
    setCurrentPage(0); 
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText("");
    setCurrentPage(0); 
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-semibold">Products</h1>
              <Bars3Icon
                className="h-8 w-8 text-white cursor-pointer md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              />
            </div>
            <div className="flex gap-4">
              <input
                type="search"
                value={searchText}
                onChange={handleSearchInput}
                placeholder="Search for Products"
                className="w-full mt-2 p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              
              {searchText && (
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                  onClick={handleClearSearch}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-500 text-white px-4 !py-0 rounded hover:bg-red-600 transition-colors whitespace-nowrap"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#26a69a" }}
              whileTap={{ scale: 0.95 }}
              className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors whitespace-nowrap"
              onClick={handleAddProduct}
            >
              ADD PRODUCT +
            </motion.button>
            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
          </div>
        </div>

        <div className="hidden md:block bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">PRODUCT IMAGE</th>
                <th className="py-3 px-4">PRODUCT NAME</th>
                <th className="py-3 px-4">PRODUCT CATEGORY</th>
                <th className="py-3 px-4">PIECES</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">LAST UPDATED</th>
                <th className="py-3 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {productStore.map((product) => (
                  <motion.tr
                    key={product._id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">PRO-{product._id?.slice(0, 5) + ".."}</td>
                    <td className="py-3 px-4">
                      <img
                        src={product.productImage?.[0] || "https://placehold.co/40x40"}
                        alt="Product"
                        className="w-10 h-10 rounded"
                      />
                    </td>
                    <td className="py-3 px-4">{product.productName}</td>
                    <td className="py-3 px-4">{product.category?.name}</td>
                    <td
                      className={`py-3 px-4 ${product.quantity < 5 ? "text-red-500" : "text-green-500"}`}
                    >
                      {product.quantity}
                    </td>
                    <td className="py-3 px-4">{"₹" + product.salePrice + ".00"}</td>
                    <td className="py-3 px-4">
                      <span
                        onClick={() => handleListing(product._id, product.status)}
                        className={`px-2 py-1 whitespace-nowrap rounded ${
                          product.status === "Discontinued" ? "bg-red-500" : "bg-green-500"
                        } text-white cursor-pointer`}
                      >
                        {product.status === "Discontinued" ? "Unlisted" : "Listed"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {product.updatedAt?.slice(0, 10) || "23/3/2025"}
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <motion.div
                        whileHover={{ scale: 1.1, color: "#26a69a" }}
                        onClick={() => handleEditProduct(product)}
                      >
                        <PencilIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        onClick={() => handleSoftDelete(product._id)}
                      >
                        <TrashIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div className="block md:hidden space-y-4">
          <AnimatePresence>
            {productStore.map((product) => (
              <motion.div
                key={product._id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={product.productImage?.[0] || "https://placehold.co/40x40"}
                    alt="Product"
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {product.productName}
                    </h3>
                    <p className="text-gray-400">
                      {product.category?.name} | {product.brand}
                    </p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span> CAT-{product._id?.slice(0, 8) + "..."}
                  </div>
                  <div>
                    <span className="text-gray-400">Piece:</span> {product.quantity}
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span> {"₹" + product.salePrice + ".00"}
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={`px-2 py-1 rounded ${
                        product.status === "Discontinued" ? "bg-red-500" : "bg-green-500"
                      } text-white`}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Last Updated:</span>{" "}
                    {product.updatedAt?.slice(0, 10) || "23/3/2025"}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.1, color: "#26a69a" }}
                    onClick={() => handleEditProduct(product)}
                  >
                    <PencilIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1, color: "#ef4444" }}
                    onClick={() => handleSoftDelete(product._id)}
                  >
                    <TrashIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageClick}
            containerClassName={"flex space-x-2 items-center"}
            pageClassName={
              "px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all duration-200"
            }
            activeClassName={"bg-teal-500 text-white"}
            previousClassName={
              "px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all duration-200"
            }
            nextClassName={
              "px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600 transition-all duration-200"
            }
            breakClassName={"px-3 py-1 text-white"}
            renderOnZeroPageCount={null}
          />
          {/* <span className="text-gray-400">
            SHOWING {currentPage * itemsPerPage + 1} TO{" "}
            {currentPage * itemsPerPage + productStore.length} OF{" "}
            {totalPages * itemsPerPage}
          </span> */}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
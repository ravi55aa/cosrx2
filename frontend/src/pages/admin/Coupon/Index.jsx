import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactPaginate from "react-paginate";
import Sidebar from "@/components/Admin.sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosBaseUrl from "$/axios";
import {
  admin_coupon_getAll_success,
  admin_removeCoupon_success,
  admin_coupon_toggleListing_success,
  admin_coupon_search_success
} from "@/Services/Admin/Coupon/Coupon.jsx";

const CouponManagementPage = () => {
  const navigate = useNavigate();
  const [listing, setListing] = useState(false);
  const [couponDataObj, setCouponDataObj] = useState({ coupons: [] });
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCoupons = async () => {
      const response = await admin_coupon_getAll_success();
      
      if (!response) {
          return;
      }

      const coupons = response.data.coupons || [];
      setCouponDataObj({ coupons });
      setFilteredCoupons(coupons);
  };

  useEffect(() => {
    fetchCoupons();
  }, [listing]);

  const itemsPerPage = 4;
  const pageCount = Math.ceil(filteredCoupons.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = filteredCoupons.slice(offset, offset + itemsPerPage);

  const sidebarVariants = useMemo(
    () => ({
      open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
      closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    }),
    []
  );

  const rowVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    }),
    []
  );

  const toastVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: -50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
    }),
    []
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected);
  }, []);

  const handleSearchSubmit = useCallback(
    async (term) => {
      
      if (!term?.trim()) {
        fetchCoupons();
        return;
      }

        const response = await admin_coupon_search_success(term);
        
        if (!response ) {
          return false;
        }

        const coupons = response.data.coupons || [];
        setCouponDataObj({ coupons });
        setFilteredCoupons(coupons)

        // if (filterStatus === "All") {
        //   setFilteredCoupons(coupons);
        // } else {
        //   setFilteredCoupons(coupons.filter((coupon) => coupon.status === filterStatus));
        // }

        return true;
    },
    [filterStatus]
  );

  const handleSearchChange = useCallback(
    (e) => {
      const term = e.target.value;
      setSearchTerm(term);
      (async () => {
        await handleSearchSubmit(term);
      })();
      setCurrentPage(0);
    },
    [handleSearchSubmit]
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setFilterStatus("All");
    fetchCoupons();
    setCurrentPage(0);
  }, []);


   const handleFilterChange = useCallback(
      (e) => {
        const status = e.target.value;
        setFilterStatus(status);
        setCurrentPage(0);
    
        const now = new Date();
        const coupons = couponDataObj.coupons || [];
    
        if (status === "Expired") {
          setFilteredCoupons(coupons.filter((offer) => new Date(offer.expireOn) < now));
        } else if (status === "Active") {
          setFilteredCoupons(coupons.filter((offer) => offer.isActive === true));
        } else if (status === "Inactive") {
          setFilteredCoupons(coupons.filter((offer) => offer.isActive === false));
        } else {
          setFilteredCoupons(coupons);
        }
      },
      [couponDataObj.coupons]
    );


  const handleAddCoupon = useCallback(() => {
    navigate("/admin/coupon/add");
  }, [navigate]);

  const handleViewCouponDetails = useCallback(
    (couponId) => {
      navigate(`/admin/coupon/edit/${couponId}`);
    },
    [navigate]
  );

  const handleDeleteCoupon = useCallback(
    async (couponId) => {
        const response = await admin_removeCoupon_success(couponId);
        
        if (!response) {
          return false;
        }

        toast.success("Coupon deleted successfully");
        setListing((prev) => !prev);
    },
    []
  );

  const handleToggleListing = useCallback(
    async (couponId, currentStatus) => {
        const newStatus = !currentStatus
        
        const response = await admin_coupon_toggleListing_success(couponId,newStatus)

        if (!response){
          return false;
        }
        
        toast.success(`Coupon ${newStatus ? "listed" : "unlisted"} successfully`);
        setListing((prev) => !prev);
      
    },[]
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-semibold">Coupons</h1>
              <Bars3Icon
                className="h-8 w-8 text-white cursor-pointer md:hidden"
                onClick={toggleSidebar}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search for Coupons (Coupon Code)"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="me-3 w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                {searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-5 bg-red-600 text-white rounded-2xl"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddCoupon}
                  className="flex items-center px-5 bg-teal-600 text-white rounded-2xl"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Coupon
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {successMessage && (
          <motion.div
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-4 p-4 bg-green-500/20 text-green-400 rounded-lg"
          >
            {successMessage}
          </motion.div>
        )}

        {/* Desktop Table View */}
        <div className="hidden md:block bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-left text-gray-400 min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Amount</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Usage Limit</th>
                <th className="py-3 px-4">Used Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length > 0 ? (
                <AnimatePresence>
                  {currentItems.map((coupon) => (
                    <motion.tr
                      key={coupon._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <td className="py-3 px-4">{coupon.code?.toUpperCase() || "N/A"}</td>
                      <td className="py-3 px-4">₹{coupon?.offerPrice || 0}</td>
                      <td className="py-3 px-4">
                        {coupon.expireOn
                          ? new Date(coupon.expireOn).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">{coupon.usageLimit || 0}</td>
                      <td className="py-3 px-4">{coupon.usageLimit || 0}</td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleListing(coupon._id, coupon?.isActive)}
                          className={`px-2 py-1 rounded text-xs ${
                            coupon.isActive === true
                              ? "bg-green-500/20 text-green-400 hover:scale-110"
                              : "bg-red-500/20 text-red-400 hover:scale-110"
                          }`}
                        >
                          {coupon.isActive ?"Active" : "Inactive" || "N/A"}
                        </button>
                      </td>
                      <td className="py-3 px-4 flex space-x-2">
                        <motion.div whileHover={{ scale: 1.1, color: "#26a69a" }}>
                          <PencilIcon
                            className="h-5 w-5 text-gray-400 cursor-pointer"
                            onClick={() => handleViewCouponDetails(coupon._id)}
                            title="Edit"
                          />
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1, color: "#ef4444" }}>
                          <TrashIcon
                            className="h-5 w-5 text-gray-400 cursor-pointer"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                            title="Delete"
                          />
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <AnimatePresence>
                  <motion.tr
                    key={1}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <td colSpan="7" className="text-center py-20">
                      <span className="underline">No coupons in the DATABASE</span>
                    </td>
                  </motion.tr>
                </AnimatePresence>
              )}
            </tbody>
          </table>

          <div className="mt-4">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              containerClassName={"flex justify-center space-x-2 mt-4"}
              pageClassName={"px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"}
              activeClassName={"bg-teal-500"}
              previousClassName={"px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"}
              nextClassName={"px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"}
              disabledClassName={"opacity-50 cursor-not-allowed"}
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {filteredCoupons.length > 0 ? (
            <AnimatePresence>
              {currentItems.map((coupon) => (
                <motion.div
                  key={coupon._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      Coupon #{coupon.couponCode}
                    </h3>
                    <p className="text-gray-400">Discount: ₹{coupon.discountAmount || 0}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Expiry Date:</span>{" "}
                      {coupon.expiryDate
                        ? new Date(coupon.expiryDate).toLocaleDateString()
                        : "N/A"}
                    </div>
                    <div>
                      <span className="text-gray-400">Usage Limit:</span>{" "}
                      {coupon.usageLimit || 0}
                    </div>
                    <div>
                      <span className="text-gray-400">Used Count:</span>{" "}
                      {coupon.usedCount || 0}
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          coupon.status === "Active"
                            ? "bg-green-500/20 text-green-400"
                            : coupon.status === "Inactive"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {coupon.status || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <motion.div whileHover={{ scale: 1.1, color: "#26a69a" }}>
                      <PencilIcon
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={() => handleViewCouponDetails(coupon._id)}
                        title="Edit"
                      />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1, color: "#ef4444" }}>
                      <TrashIcon
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        title="Delete"
                      />
                    </motion.div>
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        color: coupon.status === "Active" ? "#ef4444" : "#22c55e",
                      }}
                    >
                      {coupon.status === "Active" ? (
                        <XCircleIcon
                          className="h-5 w-5 text-gray-400 cursor-pointer"
                          onClick={() => handleToggleListing(coupon._id, coupon.isActive)}
                          title="Unlist"
                        />
                      ) : (
                        <CheckCircleIcon
                          className="h-5 w-5 text-gray-400 cursor-pointer"
                          onClick={() => handleToggleListing(coupon._id, coupon.isActive)}
                          title="List"
                        />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <AnimatePresence>
              <motion.div
                key={1}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex justify-center underline px-2 py-20">
                  No coupons in the DATABASE
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <div className="mt-4">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              containerClassName={"flex justify-center space-x-2 mt-4"}
              pageClassName={"px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"}
              activeClassName={"bg-teal-500"}
              previousClassName={"px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"}
              nextClassName={"px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"}
              disabledClassName={"opacity-50 cursor-not-allowed"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponManagementPage;
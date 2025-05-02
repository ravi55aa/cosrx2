import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPaginate from "react-paginate";
import { ClipLoader } from "react-spinners";
import {
  Bars3Icon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import axiosBaseUrl from "$/axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loadCategory,
  addCategory,
  updateSearchedCategory,
  updateListing,
  updateSoftDelete,
} from "#/admin/users/Category";
import Sidebar from "@/components/Admin.sidebar";
import swal from "sweetalert2";

const CategoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const categoryStore = useSelector((state) => state.category) || [];
  const [isDeleted, setIsDeleted] = useState(0);
  const [listing, setListing] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    offer: "",
    status: true,
    banner: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = {
          page: currentPage + 1,
          limit: itemsPerPage,
        };
        const endpoint = searchTerm
          ? "/adminCat/handleSearchInputForCategory"
          : "/adminCat/manageCategory";
        if (searchTerm) params.searchTerm = searchTerm;

        const response = await axiosBaseUrl.get(endpoint, { params });
        const result = response.data;

        if (result.error || result.errors) {
          console.error("API Error:", result.error || result.errors);
          toast.error("Failed to fetch categories.");
          return;
        }

        dispatch(loadCategory(result.categories));
        setTotalPages(Math.ceil(result.total / itemsPerPage));
      } catch (err) {
        console.log(err.message);
        toast.error("Something went wrong.");
      }
    };

    fetchCategories();
  }, [dispatch, currentPage, isDeleted, listing, searchTerm]);

  const [totalPages, setTotalPages] = useState(1);

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

  const modalVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
      exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
    }),
    []
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setNewCategory({ name: "", description: "", offer: "", status: true, banner: null });
  }, []);

  const openEditModal = useCallback((category) => {
    setCurrentCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description,
      offer: category.categoryOffer || "",
      status: category.isListed,
      banner: null,
    });
    setIsEditModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setCurrentCategory(null);
    setNewCategory({ name: "", description: "", offer: "", status: true, banner: null });
  }, []);

  const handleAddChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === "banner") {
      setNewCategory((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setNewCategory((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleFields = useCallback(() => {
    const { name, description, offer } = newCategory;
    let errors = {};

    if (!name.trim()) {
      errors.name = "Category name is required";
    } else if (name.length < 3 || name.length > 50) {
      errors.name = "Category name must be 3-50 characters.";
    } else if (!/[a-zA-Z]/.test(name)) {
      errors.name = "Category name must contain at least one letter.";
    }

    if (!description.trim()) {
      errors.description = "Description is required";
    } else if (description.length < 10 || description.length > 10000) {
      errors.description = "Description must be 10-10000 characters.";
    } else if (!/[a-zA-Z0-9]/.test(description)) {
      errors.description = "Description must contain actual text content";
    } else if (/(.)\1{10,}/.test(description)) {
      errors.description = "Description contains excessive repetitive characters";
    }

    if (offer < 0) {
      errors.offer = "Offer cannot be a negative number";
    } else if (isNaN(offer)) {
      errors.offer = "Please enter a valid offer";
    } else if (offer > 100) {
      errors.offer = "Offer cannot exceed 100%";
    }

    return errors;
  }, [newCategory]);

  const handleReAddCategory = useCallback(
    async (name) => {
      if (!name) {
        console.log("category-name to re-add is undefined");
        return false;
      }

      try {
        const response = await axiosBaseUrl.get("/adminCat/reAddCategory", {
          params: { categoryName: name },
        });
        const result = response.data;

        if (result.error) {
          toast.info("Failed to re-add the category");
          return false;
        }

        toast.success("Category re-added successfully");
        setIsDeleted((prev) => prev + 1); // Trigger re-fetch
        return true;
      } catch (err) {
        console.log(err.message);
        return false;
      }
    },
    []
  );

  const handleAddSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSpinner(true);

      const errors = handleFields();
      if (Object.keys(errors).length > 0) {
        toast.info(Object.entries(errors)[0][1]);
        setSpinner(false);
        return false;
      }

      const formData = new FormData();
      for (let key in newCategory) {
        if (key === "banner" && newCategory[key]) {
          formData.append("image", newCategory[key]);
        } else {
          formData.append(key, newCategory[key]);
        }
      }

      try {
        const response = await axiosBaseUrl.post("/adminCat/addCategory", formData);
        const result = response.data;

        if (result.error) {
          setSpinner(false);
          toast.error("Something went wrong");
          return;
        }

        if (result.alreadyExist) {
          setSpinner(false);
          toast.info("Category already exists in the table and is active");
          closeAddModal();
          return;
        }

        if (result.exist) {
          setSpinner(false);
          if (window.confirm("Category exists. Would you like to re-add it?")) {
            await handleReAddCategory(newCategory.name);
          }
          closeAddModal();
          return;
        }

        dispatch(addCategory(result.newCategory));
        setIsDeleted((prev) => prev + 1);
        setSpinner(false);
        closeAddModal();
        toast.success("New category added");
      } catch (err) {
        setSpinner(false);
        console.log("Error", err.message);
        closeAddModal();
      }
    },
    [newCategory, closeAddModal, handleReAddCategory]
  );

  const handleEditSubmit = useCallback( async (e) => {

      e.preventDefault();
      setSpinner(true);

      const errors = handleFields();
      if (Object.keys(errors).length > 0) {
        setSpinner(false);
        toast.info(Object.entries(errors)[0][1]);
        return false;
      }

      if (!currentCategory?._id) {
        setSpinner(false);
        toast.info("ID not found");
        return;
      }

      const formData = new FormData();
      for (let key in newCategory) {
        if (key === "banner" && newCategory[key]) {
          formData.append("image", newCategory[key]);
        } else {
          formData.append(key, newCategory[key]);
        }
      }

      try {
        const response = await axiosBaseUrl.patch(`/adminCat/handleEdit/${currentCategory._id}`, formData);
        const result = response.data;

        if (result.error) {
          setSpinner(false);
          toast.error(result.message || "Failed to update category");
          return;
        }

        if (result.alreadyExist) {
          setSpinner(false);
          toast.info("Category already exists in the table");
          closeEditModal();
          return;
        }

        if (result.exist) {
          setSpinner(false);

          const sweetAlertConfirmation = await new swal({
            title: "Category already exist?",
            text: "Press ok to re-add it!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#00BBA7',
            confirmButtonText: 'Yes, Add it!',
            closeOnConfirm: false,
          },
          function(){
            swal("Deleted!", "Your imaginary file has been deleted!", "success");
          });
    
          if(sweetAlertConfirmation.isConfirmed){
            await handleReAddCategory(newCategory.name);
          } 

          closeEditModal();
          return;
        }

        setIsDeleted((prev) => prev + 1); // Trigger re-fetch
        setSpinner(false);
        closeEditModal();
        toast.success("Category updated successfully");
      } catch (err) {
        setSpinner(false);
        console.log(err.message);
      }
    },
    [currentCategory, newCategory, closeEditModal, handleReAddCategory]
  );

  const handleSoftDelete = useCallback(
    async (id) => {

      if (!id) {
        toast.info("ID is null");
        return false;
      }

      const sweetAlertConfirmation = await new swal({
            title: "Delete the category",
            text: "Press ok to Delete-it!",
            type: "success",
            showCancelButton: true,
            confirmButtonColor: '#00BBA7',
            confirmButtonText: 'Yes, Delete it!',
            closeOnConfirm: false,
          },
          function(){
            swal("Deleted!", "Your imaginary file has been deleted!", "success");
          });
    
          if(!sweetAlertConfirmation.isConfirmed){
            return false;
          } 

      axiosBaseUrl
        .patch(`/adminCat/handleSoftDelete/${id}`)
        .then((res) => {
          const result = res.data;

          if (result.error) {
            toast.info(result.message);
            return;
          }

          setIsDeleted((prev) => prev + 1);
          setTimeout(() => toast.success("Item deleted successfully..."), 200);
        })
        .catch((err) => {
          console.log(err.message);
        });
    },
    []
  );

  const handleListing = useCallback(
    async (id, isListed) => {
      try {
        
        if(isListed==true ){
            const sweetAlert = await new swal({
              title: "Unlist The Category",
              text: "Press ok to unlist-it!",
              type: "info",
              showCancelButton: true,
              confirmButtonColor: '#00BBA7',
              confirmButtonText: 'Yes, Unlist-it!',
              closeOnConfirm: false,
            },
            function(){
              swal("Deleted!", "Your imaginary file has been deleted!", "success");
            });
            
            if(!sweetAlert.isConfirmed){
              return false;
            }
          } 

        setSpinner(true);
        const response = await axiosBaseUrl.post(`/adminCat/handleListed/${id}`, {
          listing: isListed,
        });
        const result = response.data;

        if (result.error) {
          toast.error(result.error);
          console.log("error in the handleListing");
          setSpinner(false);
          return;
        }

        dispatch(updateListing(id, !isListed));
        setListing((prev) => !prev);
        setSpinner(false);
        toast.success("Listing status updated");
      } catch (err) {
        console.log(err.message);
        setSpinner(false);
      }
    },
    []
  );

  const handlePageClick = useCallback(({ selected }) => {
    setCurrentPage(selected);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
    setCurrentPage(0);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-semibold">Categories</h1>
              <Bars3Icon
                className="h-8 w-8 text-white cursor-pointer md:hidden"
                onClick={toggleSidebar}
              />
            </div>
            <div className="flex mt-2 gap-4">
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search for Categories"
                className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClearSearch}
                  className="bg-red-500 text-white px-4 !py-0 rounded hover:bg-red-600 transition-colors whitespace-nowrap"
                >
                  Clear
                </motion.button>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#26a69a" }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddModal}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors whitespace-nowrap"
          >
            ADD CATEGORY +
          </motion.button>
        </div>

        <div className="hidden md:block bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-left text-gray-400 min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">CATEGORY NAME</th>
                <th className="py-3 px-4">DESCRIPTION</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {categoryStore.map((category) => (
                  <motion.tr
                    key={category._id}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <td className="py-3 px-4">CAT-{category._id.slice(0, 7) + "..."}</td>
                    <td className="py-3 px-4">{category.name}</td>
                    <td className="py-3 px-4">{category.description}</td>
                    <td
                      className="py-3 px-4"
                      onClick={() => handleListing(category._id, category.isListed)}
                    >
                      <span
                        className={`px-2 py-1 cursor-pointer rounded text-xs ${
                          category.isListed
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {category.isListed ? "Active" : "Unlisted"}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <motion.div
                        whileHover={{ scale: 1.1, color: "#26a69a" }}
                        onClick={() => openEditModal(category)}
                      >
                        <PencilIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        onClick={() => handleSoftDelete(category._id)}
                      >
                        <TrashIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
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
              {currentPage * itemsPerPage + categoryStore.length} OF{" "}
              {totalPages * itemsPerPage}
            </span> */}
          </div>
        </div>

        <div className="block md:hidden space-y-4">
          <AnimatePresence>
            {categoryStore.map((category) => (
              <motion.div
                key={category._id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={category.banner || "https://placehold.co/40x40"}
                    alt={category.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                    <p className="text-gray-400">{category.description}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>{" "}
                    {category._id.slice(0, 7) + "..."}
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>{" "}
                    <span
                      className={`px-2 py-1 cursor-pointer rounded text-xs ${
                        category.isListed
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                      onClick={() => handleListing(category._id, category.isListed)}
                    >
                      {category.isListed ? "Active" : "Unlisted"}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.1, color: "#26a69a" }}
                    onClick={() => openEditModal(category)}
                  >
                    <PencilIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.1, color: "#ef4444" }}
                    onClick={() => handleSoftDelete(category._id)}
                  >
                    <TrashIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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
              {currentPage * itemsPerPage + categoryStore.length} OF{" "}
              {totalPages * itemsPerPage}
            </span> */}
          </div>
        </div>

        {/* Add Category Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold text-white mb-4">Add Category</h2>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Category Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={newCategory.name}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Description:</label>
                    <textarea
                      name="description"
                      value={newCategory.description}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      rows="3"
                      placeholder="Enter category description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Category Offer:</label>
                    <input
                      type="number"
                      name="offer"
                      value={newCategory.offer}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter category offer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Status:</label>
                    <select
                      name="status"
                      value={newCategory.status}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Banner:</label>
                    <input
                      type="file"
                      name="banner"
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      type="button"
                      onClick={closeAddModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05, backgroundColor: "#26a69a" }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
                    >
                      {spinner ? <ClipLoader loading /> : "Add Category"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Category Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
            >
              <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold text-white mb-4">Edit Category</h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Category Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={newCategory.name}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Description:</label>
                    <textarea
                      name="description"
                      value={newCategory.description}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      rows="3"
                      placeholder="Enter category description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Category Offer:</label>
                    <input
                      type="number"
                      name="offer"
                      value={newCategory.offer}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                      placeholder="Enter category offer"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Status:</label>
                    <select
                      name="status"
                      value={newCategory.status}
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Current Banner:</label>
                    <img
                      src={currentCategory?.banner || "https://placehold.co/40x40"}
                      alt="Current Banner"
                      className="w-20 h-20 mb-2 rounded"
                    />
                    <input
                      type="file"
                      name="banner"
                      onChange={handleAddChange}
                      className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <motion.button
                      type="button"
                      onClick={closeEditModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05, backgroundColor: "#26a69a" }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
                    >
                      {spinner ? <ClipLoader loading /> : "Submit Changes"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryPage;
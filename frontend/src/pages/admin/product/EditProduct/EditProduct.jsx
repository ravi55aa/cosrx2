import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import axiosBaseUrl from "$/axios";
import { ClipLoader } from "react-spinners";
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const sidebarVariants = {
  open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const EditProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [categoryStore, setCategoryStore] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const product = location.state?.product || {};

  const [formData, setFormData] = useState({
    productName: product?.productName || "",
    productDescription: product?.description || "",
    productFullDescription: product?.fullDescription || "",
    productCategory: product?.category._id || "",
    skinType: product?.skinType || "",
    productType: product?.productType || "",
    weight: product?.weight || "",
    salePrice: product?.salePrice || "",
    quantity: product?.quantity || "",
    isBlocked: product?.isBlocked || false,
    status: product?.status || "available",
    images: product?.productImage || [],
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosBaseUrl.get("/adminCat/manageCategory");
        const result = await response.data;

        if (result.hasOwnProperty("error")) {
          console.error("API Error:", result.error);
          return;
        }
        setCategoryStore(result.categories);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length < 3) {
      toast.info("Please upload at least 3 images.");
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]); // Add new files to existing
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleCancelImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setFormData((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleFields = () => {
    for (let key in formData) {
      if (key === "isBlocked"  ||  key === "validOffer") {
        continue;
      }

      if(key == "productOffer"){
        continue;
      }

      if (key === "images" && formData[key].length < 3) {
        toast.info("Images are insufficient (min-3)");
        return false;
      }


      if (!formData[key] || (typeof formData[key] === "string" && !formData[key].trim())) {
        console.log("this is working fine now")
        toast.info(`${key} is null`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setSpinner(true);

      const allFieldsAreOkay = handleFields();
      if (!allFieldsAreOkay) {
        setSpinner(false);
        return false;
      }

      const newFormData = new FormData();
      let error = {};

      for (const key in formData) {
        if (key === "images" && Array.isArray(formData[key])) {
          formData[key].forEach((image, index) => {
            if (typeof image === "string") return; // Skip existing URLs
            if (!["image/png", "image/jpg", "image/jpeg", "image/webp", "image/avif"].includes(image.type)) {
              error.mimetypeError = "Images are not valid";
              setSpinner(false);
            }
            newFormData.append("images", image);
          });
        } else {
          newFormData.append(key, formData[key]);
        }
      }

      if (Object.keys(error).length > 0) {
        toast.error(Object.entries(error)[0][1]);
        return false;
      }

      axiosBaseUrl
        .put(`/adminPro/products/edit/${id}`, newFormData)
        .then((res) => {
          const result = res.data;

          if(result?.hasOwnProperty("validtionError")){
            toast.warn(Object.entries(result?.validtionError)[0][1]);
            setSpinner(false);
            return;
          }

          setSpinner(false);
          toast.success("Product Edited.");
          navigate("/admin/products", { state: "new product edited" });
        })
        .catch((err) => {
          setSpinner(false);
          console.log("Error", err.message);
        });
    },
    [formData, id]
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <motion.div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-6 z-20 md:static md:w-64 md:block ${
          isSidebarOpen ? "block" : "hidden md:block"
        }`}
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-bold text-teal-400">COSRX</div>
          <XMarkIcon
            className="h-6 w-6 text-white cursor-pointer md:hidden"
            onClick={toggleSidebar}
          />
        </div>
        <ul className="space-y-6">
          <li className="flex items-center space-x-3 text-teal-400">
            <HomeIcon className="h-6 w-6" />
            <span>Dashboard</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <ShoppingBagIcon className="h-6 w-6" />
            <span>Product</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <ShoppingBagIcon className="h-6 w-6" />
            <span>Orders</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <UserIcon className="h-6 w-6" />
            <span>Users</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TagIcon className="h-6 w-6" />
            <span>Categories</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TicketIcon className="h-6 w-6" />
            <span>Offers</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TicketIcon className="h-6 w-6" />
            <span>Banner</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TicketIcon className="h-6 w-6" />
            <span>Coupons</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <CogIcon className="h-6 w-6" />
            <span>Settings</span>
          </li>
          <li className="flex items-center space-x-3 text-red-400">
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </li>
        </ul>
      </motion.div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">Edit Products</h1>
          <Bars3Icon
            className="h-8 w-8 text-white cursor-pointer md:hidden"
            onClick={toggleSidebar}
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 mb-1">Product Name:</label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Product Description:</label>
                <textarea
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  rows="3"
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Full Description:</label>
                <textarea
                  name="productFullDescription"
                  value={formData.productFullDescription}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  rows="3"
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Category:</label>
                <select
                  name="productCategory"
                  value={formData.productCategory}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value={formData.productCategory?._id || ""}>
                    {formData.productCategory?.name || "Choose Category"}
                  </option>
                  {categoryStore?.length > 0
                    ? categoryStore.map((category) =>
                        category._id !== formData.productCategory?._id && (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        )
                      )
                    : <option value="">No category available</option>}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Skin Type:</label>
                <select
                  name="skinType"
                  value={formData.skinType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Choose the Type</option>
                  <option value="Oily">Oily</option>
                  <option value="Dry">Dry</option>
                  <option value="Normal">Normal</option>
                  <option value="Combination">Combination</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Product Type:</label>
                <select
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="">Choose the Type</option>
                  <option value="Brightening">Brightening</option>
                  <option value="Hydrating">Hydrating</option>
                  <option value="Anti-aging">Anti-aging</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Product Weight:</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter product weight"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-gray-400 mb-1">Regular Price:</label>
                <input
                  type="text"
                  name="regularPrice"
                  value={formData.regularPrice}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter regular price"
                  required
                />
              </div> */}
              <div>
                <label className="block text-gray-400 mb-1">Sale Price:</label>
                <input
                  type="text"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter sale price"
                  required
                />
              </div>
              <div className="gap-3 flex">
                <motion.button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  whileHover={{ scale: 1.05, backgroundColor: "#00a61a" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full lg:w-auto mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05, backgroundColor: "#26a69a" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full lg:w-auto mt-4 bg-teal-500 text-white px-6 py-2 rounded hover:bg-teal-600 transition-colors"
                >
                  {spinner ? <ClipLoader loading /> : "SUBMIT CHANGES"}
                </motion.button>
              </div>
            </div>

            <div className="flex gap-y-6 flex-col">
              <div>
                <h2 className="text-lg font-medium text-gray-400 mb-4">Add/Edit Image:</h2>
                <motion.button
                  type="button"
                  onClick={() => {
                    setSelectedImages([]);
                    setFormData((prev) => ({ ...prev, images: product?.productImage || [] }));
                  }}
                  whileHover={{ scale: 1.05, backgroundColor: "#ef4444" }}
                  whileTap={{ scale: 0.95 }}
                  className="mb-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  RemoveAll
                </motion.button>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-all duration-200"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      multiple
                    />
                    <span className="text-gray-400">Add Image</span>
                  </label>
                </div>
                {(selectedImages.length > 0 || formData.images.length > 0) && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {(selectedImages.length > 0 ? selectedImages : formData.images).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={
                            typeof image === "string"
                              ? image
                              : URL.createObjectURL(image)
                          }
                          alt={`Preview ${index}`}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => handleCancelImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Temporary not available the offers */}
              {/* 
              <div>
                <label className="block text-gray-400 mb-1">Product Offer:</label>
                <input
                  type="number"
                  name="productOffer"
                  value={formData.productOffer}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter product offer"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Valid Offer:</label>
                <input
                  type="number"
                  name="validOffer"
                  value={formData.validOffer}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter valid offer"
                  required
                />
              </div>
              */}

              <div>
                <label className="block text-gray-400 mb-1">Stock Count:</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                  placeholder="Enter stock count"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Block Product:</label>
                <select
                  name="isBlocked"
                  value={formData.isBlocked}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  <option value="available">Available</option>
                  <option value="out of stock">Out of Stock</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProduct;
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactPaginate from "react-paginate";
import Sidebar from "@/components/Admin.sidebar";
import {
  Bars3Icon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import AddUser from "./AddUser/AddUser";
import EditUser from "./EditUser/EditUser";

import tempDP from "@/assets/HomePage/grid9.jpeg";

import { useSelector, useDispatch } from "react-redux";
import { loadUsers,updateSearchedUsers,updateUserStatus } from "#/admin/users/Reducer";
import {toast} from "react-toastify";  
import axiosBaseUrl from "$/axios";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {

  const navigate =  useNavigate();
  const dispatch = useDispatch();
  let [listing,setListing] = useState(false);

  const manageUsers = useSelector((state) => state.users);

  useEffect(() => {
    const fetchUsers = async (dispatch) => {
      try {
        const response = await axiosBaseUrl.get("/admin/manageUsers");

        if (response.data?.error) {
          console.error("API Error:", response.data.error);
          return;
        }

        const users = response.data?.users || [];

        dispatch(loadUsers(users));

      } catch (err) {
        console.error("Error fetching users:", err.message);
      }
    };

    fetchUsers(dispatch);
  }, [listing,dispatch]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [view, setView] = useState("list");
  const [selectedUser, setSelectedUser] = useState(null);

  const itemsPerPage = 4;

  const pageCount = Math.ceil(manageUsers.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = manageUsers.slice(offset, offset + itemsPerPage);

  const sidebarVariants = useMemo(
    () => ({
      open: {
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      },
      closed: {
        x: "-100%",
        transition: { type: "spring", stiffness: 300, damping: 30 },
      },
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


  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); 
  }, []);


  const handleSearchSubmit = useCallback(() => {

    axiosBaseUrl.post("/admin/searchUsers",{searchTerm})
    .then((res)=>{
      
      const result =  res.data;
      
      if(result?.error){
        console.log(error);
        return;
      }

      dispatch(updateSearchedUsers(result.users));
    })
    .catch((err)=>{
      toast.error("something went wrong");
      console.log(err.message);
      return;
    })
  });


  const goToEditUser = useCallback((user) => {
    setSelectedUser(user);
    setView("edit");
  }, []);

  const goBack = useCallback(() => {
    setView("list");
    setSelectedUser(null);
  }, []);

  const handleUserBlock =  async (id, blockingValue,gleId) => {
      if(blockingValue === false && !window.confirm("Sure to Delete")){
        return false;
      }

      const currentUser = JSON.parse(localStorage.getItem("user"));
      const isUser = currentUser?._id ?? currentUser?.id;
      const forceBlockUser=()=>{
        let keysToDelete = [];
            
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
          
            if (key === "adminData") {
              continue;
            }
          
            keysToDelete.push(key);
          }
        keysToDelete.forEach(key => localStorage.removeItem(key));
      }

      if(isUser){
          if( id == isUser || gleId == isUser){
            forceBlockUser();
      }}

      try {
        const res = await axiosBaseUrl.post("/admin/handleBlocking", {
          id,
          blockingValue,
        });
        const data = await res.data;

        const status = data.user?.isBlocked;

        dispatch(updateUserStatus(id, status));

        setListing( (prev)=> !prev);

        setSuccessMessage("User status updated successfully!");
        
        setTimeout(() => setSuccessMessage(""), 3000);
        
        return;

      } catch (err) {
        const errorIs = {
          mission: "failed",
          message: "Server Error",
          Error: err.message,
        };
        return;
      }
    };

  //remove----
  // Render the appropriate component based on the view state
  // Moved this logic AFTER all hooks are called
  if (view === "add") {
    return <AddUser onAddUser={handleAddUser} onBack={goBack} />;
  }

  if (view === "edit" && selectedUser) {
    return (
      <EditUser
        user={selectedUser}
        onEditUser={handleEditUser}
        onBack={goBack}
      />
    );
  }
//------


  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-semibold">Users</h1>
              <Bars3Icon
                className="h-8 w-8 text-white cursor-pointer md:hidden"
                onClick={toggleSidebar}
              />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search for Users"
                value={searchTerm}
                onChange={handleSearchChange}
                className="me-3 w-full mt-2 p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={handleSearchSubmit}
                className="px-5 bg-teal-600 text-white rounded-2xl "
              >
                Search
              </button>
            </div>
          </div>
        </div>


        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block bg-gray-800 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-left text-gray-400 min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">ProfilePic</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4">EMAIL</th>
                <th className="py-3 px-4">PHONE NUMBER</th>
                <th className="py-3 px-4">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {manageUsers.length > 0 ? (
                <AnimatePresence>
                  {currentItems.map((user) => (
                    <motion.tr
                      key={user._id}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <td className="py-3 px-4">
                        {user._id.slice(0, 6) + "..."}
                      </td>
                      <td className="py-3 px-4 overflow-hidden">
                        <img
                          src={user?.profilePicture || tempDP}
                          alt="profile-picture"
                          className="rounded-full"
                          style={{ width: "15%" }}
                        />
                      </td>
                      <td className="py-3 px-4">{user?.firstName || user?.name }</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        {user.phone || "-not-added-"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          onClick={() => {
                            handleUserBlock(user._id, user.isBlocked,user?.googleId);
                          }}
                          className={`px-2 py-1 hover:cursor-pointer rounded text-xs ${
                            user.isBlocked === false
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {user.isBlocked == false ? "Block" : "Unblock"}
                        </span>
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
                    <template className="flex justify-center underline px-2 py-20">
                      No users...In the DATABASE
                    </template>
                  </motion.tr>
                </AnimatePresence>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="mt-4">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              containerClassName={"flex justify-center space-x-2 mt-4"}
              pageClassName={
                "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
              }
              activeClassName={"bg-teal-500"}
              previousClassName={
                "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
              }
              nextClassName={
                "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
              }
              disabledClassName={"opacity-50 cursor-not-allowed"}
            />
          </div>
        </div>

        {/* Mobile Card View (Visible on Mobile) */}
        <div className="block md:hidden space-y-4">
          {manageUsers.length > 0 ? (
            <AnimatePresence>
              {currentItems.map((user) => (
                <motion.div
                  key={user._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {user.name}
                    </h3>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">ID:</span> {user.id}
                    </div>
                    <div>
                      <span className="text-gray-400">Phone:</span> {user.phone}
                    </div>
                    <div>
                      <span className="text-gray-400">Role:</span> {user.role}
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>{" "}
                      <button
                        onClick={() => handleUserBlock(user.id)}
                        className={`px-2 hover:cursor-pointer py-1 rounded text-xs ${
                          user.status === "Unblock"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {user.status}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <motion.div whileHover={{ scale: 1.1, color: "#26a69a" }}>
                      <PencilIcon
                        className="h-5 w-5 text-gray-400 cursor-pointer"
                        onClick={() => goToEditUser(user)}
                      />
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
                  No users...In the DATABASE
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          <div className="mt-4">
            <ReactPaginate
              previousLabel={"← Previous"}
              nextLabel={"Next →"}
              pageCount={pageCount}
              onPageChange={handlePageClick}
              containerClassName={"flex justify-center space-x-2 mt-4"}
              pageClassName={
                "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
              }
              activeClassName={"bg-teal-500"}
              previousClassName={
                "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
              }
              nextClassName={
                "px-3 py-1 rounded bg-gray-700 text-white hover:bg-teal-500"
              }
              disabledClassName={"opacity-50 cursor-not-allowed"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

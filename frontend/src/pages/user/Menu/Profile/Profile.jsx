import React,{useState,useEffect,useCallback} from "react";
import { Link } from "react-router-dom";
import {toast} from "react-toastify";
import { useNavigate } from "react-router-dom";

import { FaChevronRight, FaEdit, FaSignOutAlt } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

import Swal from "sweetalert2";
import axiosBaseUrl from "$/axios";
import tempDP from "@/assets/HomePage/grid9.jpeg";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import Sidebar from "@/components/user/Profile/Sidebar.jsx"


const UserProfile = () => {
  // Initialize AOS animations
  React.useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const navigate = useNavigate();
  const [user,setUser] = useState({});

useEffect(()=>{
    let userId = JSON.parse(localStorage.getItem("user"))?._id ;
    
    if(!userId){//finding googleID->not found userId 
        userId = JSON.parse(localStorage.getItem("googleId"));  
      }

    if(!userId){
      console.error("user id not found");
      return;
    }

    axiosBaseUrl.get("/profile/fetchUserProfile",{
        params:{id:userId}
    }).then((res)=>{
        const result =  res.data; 
        setUser(result.user || {});
        
        return

    }).catch((err)=>{
        console.error(err.message);
        return;
    })

},[])

const handleLogout=useCallback(async()=>{
  
    const sureToDel = await Swal.fire({
        title: "Sure to Logout",
        icon: "question",
        iconHtml: "؟",
        confirmButtonText: "Logout",
        cancelButtonText: "Not",
        showCancelButton: true,
        showCloseButton: true
      });
  
    if(!sureToDel.isConfirmed) {
      return;
    }

    let keysToDelete = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
    
      if (key === "adminData") {
        continue;
      }
    
      keysToDelete.push(key);
    }
    
    // Remove after iteration to avoid skipping
    keysToDelete.forEach(key => localStorage.removeItem(key));

    navigate("/user/login");

    setTimeout(()=>{
        toast.success("User logout success");
    },300);
    return; 
});


  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
    <HeaderSection />
    {/* Breadcrumbs */}
    <nav className="max-w-7xl mx-auto px-4 py-4" data-aos="fade-down">
      <div className="flex items-center text-sm text-gray-600">
        <Link to="/user/homepage" className="hover:text-teal-600 transition-colors">
          Home
        </Link>
        <FaChevronRight className="mx-2 text-gray-400" />
        <span className="font-medium">Profile</span>
      </div>
    </nav>

    {/* Main Profile Section */}
    <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Sidebar className="lg:col-span-1" />
        <section className="lg:col-span-3">
          <div
            className="bg-white rounded-lg shadow-lg p-6 lg:p-8"
            data-aos="fade-up"
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
              User Profile
            </h1>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Picture and Actions */}
              <div className="flex flex-col items-center lg:w-1/3">
                <img
                  src={
                    user?.profilePicture ||
                    tempDP
                  }
                  alt="Profile"
                  className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-teal-600 shadow-md mb-4"
                />
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                  <Link
                    to="/user/profile/edit"
                    className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors w-full sm:w-auto"
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors w-full sm:w-auto mt-2 sm:mt-0"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:w-2/3 space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                    Personal Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {user?.firstName || user?.name || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {user?.email || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {user?.phone || "+9867345350"}
                  </p>
                  { user?.referralCode &&
                  <p>
                    <span className="font-medium">ReferralCode:</span>{" "}
                    {user?.referralCode || "+9867345350"}
                  </p>
                  }
                  <p>
                    <span className="font-medium">Address:</span>{" "}
                    {user?.streetAddress || "Home kerala 671322 ,"}
                    <br />
                    <span>BhagavathiDwara uppala</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <Footer />
  </div>

  );
};

export default UserProfile;


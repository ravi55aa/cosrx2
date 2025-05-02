import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FaBars,
  FaTimes,
  FaUser,
  FaPhone,
  FaLock,
  FaEnvelope,
  FaSignOutAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { validate_Profile_edit_data_forEmail, validate_passwords ,validate_Profile_edit_data } from "U/utils";
import { getProfileDetails, fetchOTP, isEmailExist,editPassword } from "@/Services/User/EditProfile.jsx";
import axiosBaseUrl from "$/axios";
import Footer from "@/components/Footer";
import HeaderSection from "@/components/HeaderSection";
import defaultProfilePic from "@/assets/user_profile/skeloton_profile_picture.png";

const EditProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    userName: "",
    profilePicture: "",
    _id: "",
  });
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setIsChangeEmailModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: "",
    newPassword: "",
    reenterNewPassword: "",
  });

  const [otp, setOTP] = useState({ otpis: "", expiryTime: "", userEnteredOtp: "", isOtpVerified: false });
  const intervalRef = useRef(null);
  const [countdown, setCountdown] = useState(2 * 60);

  const navigate = useNavigate();

  // Animation
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Fetch user profile info
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const user = await getProfileDetails();
        const updatedProfile = {};
        for (let [key, value] of Object.entries(user)) {
          if (profile.hasOwnProperty(key)) {
            updatedProfile[key] = value;
          }
        }
        setUserProfile((prev) => ({ ...prev, ...updatedProfile }));
      } catch (err) {
        console.error("Error fetching profile details:", err.message);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChanges = useCallback((e) => {
    const { name, value } = e.target;

    if (name === "profilePicture") {
      setUserProfile((prevData) => ({ ...prevData, [name]: e.target.files[0] }));
    } else {
      setUserProfile((prevData) => ({ ...prevData, [name]: value }));
    }
  }, []);

  const handlePasswordChanges = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({ ...prevData, [name]: value }));
  }, []);


  // Fetch OTP from the backend
  useEffect(() => {
    if (!isChangeEmailModalOpen) return;

    const fetchingOtp = async () => {
      try {
        const response = await fetchOTP(setOTP, intervalRef);
        const { otp, expiryTime } = response;
        setOTP((prev) => ({ ...prev, otpis: otp, expiryTime: expiryTime }));
        toast.success("OTP sent successfully");

        // Start countdown
        setCountdown(1 * 60);
        intervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        toast.error("Failed to send OTP. Please try again.");
      }
    };

    fetchingOtp();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isChangeEmailModalOpen]);


  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOTP((prev) => ({ ...prev, userEnteredOtp: value }));
  }, []);


  const newFormData = async () => {
    const formData = new FormData();
    let user = {};

    try {
      user = await getProfileDetails();
    } catch (err) {
      throw new Error(err.message);
    }

    for (let key of Object.keys(profile)) {
      if (key === "profilePicture" && profile[key] instanceof File) {
        formData.append("image", profile[key]);
      } else if (key !== "_id" && profile[key] !== user[key]) {
        formData.append(key, profile[key]);
      }
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    return formData;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validate_Profile_edit_data(profile);

    if(Object?.keys(validation)?.length > 0 ){
      toast.error(Object?.entries(validation)[0][1]);
      return;
    }

    try {
      const formData = await newFormData();
      const response = await axiosBaseUrl.post(`/profile/edit/${profile._id}`, formData);
      toast.success("Profile updated successfully!");

      navigate("/user/profile");

    } catch (err) {
      console.log(err.message);
      toast.error("Failed to update profile.");
    }
  };


  const handlePasswordSubmit = useCallback(async() => {

    const isValid = validate_passwords(Object.entries(passwordData));

    if (Object.keys(isValid).length > 0) {
      toast.error(Object.entries(isValid)[0][1]);
      return;
    }

    let response = await editPassword(profile._id,passwordData);
      
      if(!response){
        return false;
      }

    toast.success("Password Updated successfully");

    setIsChangePasswordModalOpen(false);
    setPasswordData({ password: "", newPassword: "", reenterNewPassword: "" });
  }, [passwordData, navigate, profile._id]);


  const handleEmailOtpSubmit = () => {
    const { otpis, userEnteredOtp } = otp;

    if (userEnteredOtp?.length < 6 || isNaN(userEnteredOtp)) {
      toast.warn("Please enter a valid 6-digit OTP");
      return false;
    }

    if (otpis !== userEnteredOtp) {
      setOTP((prev) => ({ ...prev, userEnteredOtp: "" }));
      toast.error("OTP does not match");
      return false;
    }

    toast.success("Email verification successful!");
    setOTP({ otpis: "", expiryTime: "", userEnteredOtp: "", isOtpVerified: true });
    setIsChangeEmailModalOpen(false);
    return true;
  };

  const handleEmailChangeVerifySubmit = async (e) => {
    e.preventDefault();

    if (!validate_Profile_edit_data_forEmail(profile?.email)) {
      toast.warn("Kindly enter a valid email");
      return;
    }

    const data = await isEmailExist(profile?.email, profile._id);
    if (data?.user && Object.keys(data?.user).length > 0) {
      toast.warn("Email already exists");
      return;
    }

    toast.success("Email verification successful");
    document.getElementById("emailVerifier").innerHTML = "Verified ✅";
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 min-h-screen text-gray-800 `}>

      <HeaderSection />

      {/* Main Content */}
      <div className={`max-w-4xl !mx-auto px-4 py-6 lg:py-8 `}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Form */}
          <div className="lg:col-span-3">
            <div className="bg-white mx-auto w-[100%] rounded-lg shadow-lg p-6 lg:p-8" data-aos="fade-up">
              {/* Mobile Menu Button */}
              <div className="lg:hidden p-4 !mx-auto bg-teal-600 text-white flex jus justify-center rounded-md mb-6">
                <h2 className="text-xl !text-center font-bold">Edit Profile</h2>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 text-center hidden lg:block lg:text-left">
                Edit Profile
              </h1>

              <form onSubmit={handleSubmit} name="form" autoComplete="off" className="space-y-8">
                {/* Basic Info */}
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                    Basic Information
                  </h2>
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="mb-4 lg:mb-0">
                      <img
                        src={
                          typeof profile?.profilePicture === "string"
                            ? profile?.profilePicture
                            : profile?.profilePicture
                            ? URL.createObjectURL(profile?.profilePicture)
                            : defaultProfilePic
                        }
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-teal-600 shadow-md"
                      />
                      <input
                        type="file"
                        name="profilePicture"
                        onChange={handleChanges}
                        className="mt-2 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                        accept="image/*"
                      />
                    </div>
                    <div className="w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            onChange={handleChanges}
                            value={profile?.firstName || ""}
                            className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            onChange={handleChanges}
                            value={profile?.lastName || ""}
                            className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          onChange={handleChanges}
                          value={profile?.phone || ""}
                          className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Login Details */}
                <div>
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                    Login Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <input
                        type="text"
                        name="userName"
                        onChange={handleChanges}
                        value={profile?.userName || ""}
                        className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        className="mt-1 p-2 w-full bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change Email */}
                {otp.isOtpVerified ? (
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                      Change Email
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          New Email <sup className="text-green-500">(*OTP verified)</sup>
                        </label>
                        <input
                          type="email"
                          name="email"
                          onChange={handleChanges}
                          value={profile?.email || ""}
                          className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div id="emailVerifier" className="flex items-end">
                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={handleEmailChangeVerifySubmit}
                            className="mt-1 p-2 w-full bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          >
                            Check Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setOTP((prev) => ({ ...prev, isOtpVerified: false }))}
                            className="mt-1 p-2 w-full bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">
                      Change Email
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email <sup className="text-red-500">(*Verify via OTP to edit)</sup>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profile?.email || ""}
                          onChange={handleChanges}
                          className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setIsChangeEmailModalOpen(true)}
                          className="mt-1 p-2 w-full bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                        >
                          Verify with OTP
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex mt-6 gap-5 justify-center">
                  <button type="button" className=" px-6 py-3 bg-teal-900 text-white rounded-md hover:bg-teal-700 transition-colors">
                    <Link to="/user/profile">
                    Go back
                    </Link>
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Submit All Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Change Password Modal */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" data-aos="fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="text"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChanges}
                  className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="text"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChanges}
                  className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Re-enter New Password
                </label>
                <input
                  type="text"
                  name="reenterNewPassword"
                  value={passwordData.reenterNewPassword}
                  onChange={handlePasswordChanges}
                  className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <Link
                to="/user/profile/edit/forgotPassword_emailVerify"
                className="px-4 py-2 text-teal-600 hover:underline"
              >
                Forgot Password?
              </Link>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Email OTP Modal */}
      {isChangeEmailModalOpen && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" data-aos="fade-in">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Enter OTP</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">6-Digit OTP</label>
                <input
                  type="text"
                  value={otp.userEnteredOtp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter 6-digit OTP"
                />
                {countdown > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Time remaining: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsChangeEmailModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailOtpSubmit}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

import { useLocation,useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosBaseUrl from "$/axios";

const UploadProfilePicture = () => {
  
  const [profileImage, setProfileImage] = useState(null);
  
  const location = useLocation();

  const navigate = useNavigate();
  
  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    setProfileImage(file);
    
  };

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".form-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      ".left-section",
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const handleSubmit=()=>{
    if(!profileImage){
      toast.error("Insert the image first");
      return;
    }
    
    //TODO pass the userID 
    if(!location.state){
      // navigate("/user/homepage");
      toast("image id not found");
      console.log("profile image not found");
      return;
    }

    const userId = JSON.parse(window.localStorage.getItem("userId"));
    console.log(profileImage);

    const formData = new FormData();
    
    formData.append("image",profileImage);
    
    formData.append("userId",userId);
    

    axiosBaseUrl.patch("/user/register/uploadImage",formData, { headers: 
      {"Content-type":"multipart/form-data"}
    })
    .then((res)=>{
      toast.success(res.data.message);
      navigate("/user/homepage");
      return;
    })
    .catch((err)=>{
      console.log(err.message);
      toast("Something went wrong...");
      return;
    })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left Section: Branding */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto bg-teal-100 flex items-center justify-center left-section">
        <div className="text-center">
          {/* COSRX Logo SVG */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto mb-4"
            data-aos="zoom-in"
          >
            <path
              d="M40 10C40 10 20 30 20 40C20 50 40 70 40 70C40 70 60 50 60 40C60 30 40 10 40 10Z"
              stroke="#4B5EAA"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="40" cy="40" r="2" fill="#4B5EAA" />
            <circle cx="30" cy="30" r="2" fill="#4B5EAA" />
            <circle cx="50" cy="30" r="2" fill="#4B5EAA" />
            <circle cx="25" cy="45" r="2" fill="#4B5EAA" />
            <circle cx="55" cy="45" r="2" fill="#4B5EAA" />
            <circle cx="40" cy="60" r="2" fill="#4B5EAA" />
            <path
              d="M30 30L40 40L50 30"
              stroke="#4B5EAA"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M25 45L40 40L55 45"
              stroke="#4B5EAA"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M40 40L40 60"
              stroke="#4B5EAA"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>

          <h2
            className="text-5xl font-bold text-textLight"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            COSRX
          </h2>
          <p
            className="mt-2 text-sm text-textLight max-w-xs mx-auto"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Personalize your profile to make your shopping experience even better!
          </p>
        </div>
      </div>

      {/* Right Section: Upload Form */}
      <motion.div
        className="lg:w-1/2 w-full flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-md w-full space-y-6">
          <h1
            className="form-heading text-3xl font-bold text-textLight"
            data-aos="fade-up"
          >
            Upload Your Profile Picture
          </h1>
          <p
            className="text-sm text-textLight"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Add a profile picture to personalize your account. You can skip this step and do it later if you’d like.
          </p>

          {/* Image Upload Section */}
          <div className="flex flex-col items-center space-y-4" data-aos="fade-up" data-aos-delay="200">
            {/* Preview Image */}
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>

            {/* Upload Button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <motion.span
                className="inline-block py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Upload Image
              </motion.span>
            </label>
          </div>

          {/* Submit and Skip Buttons */}
          <div className="flex space-x-4" data-aos="fade-up" data-aos-delay="300">
            <motion.button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit
            </motion.button>
            <motion.button
            onClick={()=>navigate("/user/homepage")}
              className="flex-1 py-3 border border-gray-300 text-textLight rounded-md hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Skip
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadProfilePicture;
import { useState,useEffect, useCallback, useMemo } from 
"react";
import {useNavigate} from "react-router-dom"

import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { motion } from "framer-motion";

import {toast} from "react-toastify";
import {LuEye, LuEyeClosed} from "react-icons/lu"


import logo from "@/assets/logo.png"
import axiosBaseUrl from "$/axios";


const Login = () => {
  let [formData,setFormData] = useState({
    email:"",password:""});
  let [changePassword,setChangePassword] = useState(false);
  let [seePassword,setSeePassword] = useState(false);

  const navigate = useNavigate();

  // Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".form-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      ".right-section",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const handleChanges=(e)=>{
    const {value,name} = e.target;
    setFormData((prevState)=>({...prevState,[name]:value}));
    return;
  };

 
  const handleEachFileds=useCallback(()=>{      
  const {email,password} = formData; 
  
  let errors = {};
        if (!email.trim()) {
          errors.email = 'Email is required';
      } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
          errors.email = 'Invalid Gmail address. Must end with @gmail.com';
      } else if (email.length < 6 || email.length > 50) {
          errors.email = 'Email must be between 6 and 50 characters.';
      } else if (!/^[a-zA-Z0-9]/.test(email)) {
          errors.email = 'Email must start with a letter or number.';
      } else if (/\s/.test(email)) {
          errors.email = 'Email cannot contain spaces.';
      }
    
      if (!password.trim()) {
        errors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 20) {
        errors.password = 'Password must be 8-20 characters long.';
    } else if (!/[A-Z]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(password)) {
        errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(password)) {
        errors.password = 'Password must contain at least one number.';
    } else if (!/[@$!%*?&]/.test(password)) {
        errors.password = 'Password must contain at least one special character (@$!%*?&)';
    } else if (/\s/.test(password)) {
        errors.password = 'Password cannot contain spaces.';
    }
    
    console.log(password,email);
    return errors;
  },[formData]);


  const handleSubmit=useCallback(()=>{
    event.preventDefault();

    const errors = handleEachFileds();

    if(Object.keys(errors).length > 0){
      toast(Object.entries(errors)[0][1]);
      return;
    }

    axiosBaseUrl.post("/user/login",formData)
    .then((res)=>{
      
      const result = res.data;
      
      if(res?.hasOwnProperty("error")){
        toast(result?.message);
        return;
      }

      if(result?.isBlocked){
        toast.warn(result.message);
        return;
      }

      //token,user:
      window.localStorage.setItem("token",JSON.stringify(result?.token));
      window.localStorage.setItem("user",JSON.stringify(result?.user));
      
      
      navigate("/user/homepage",{state:{"user":result.email}});
      return;

    }).catch((err)=>{
      console.log(err.message);
      toast.warn("User not found");
      return;
    })
    
    return;
  },[formData]);

  const handleForgoPassword=useCallback(()=>{
    navigate("/user/verifyEmail",{state:{'isLogin':true}});
  },[]);


  const handleGoogleLogin = () => {
    window.location.href = "https://cosrx.ddns.net/auth/google"; 
  }

  const handlePasswordWatch=()=>{
    if(!formData.password?.trim()){
      toast.info("Field is null");
      return;
    }
  
    setSeePassword((prevState)=>!prevState);
  };


  return (
    <div className="min-h-screen overflow-hidden flex flex-col lg:flex-row bg-gray-50">
      {/* Left Section: Form */}
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
            Welcome back!
          </h1>
          <p
            className="text-sm text-textLight"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Enter your Credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-aos="fade-up" data-aos-delay="200">
              <label className="block text-sm font-medium text-textLight">
                Email address
              </label>
              <input
                type="email"
                name="email" 
                value={formData.email}
                onChange={handleChanges}
                placeholder="Enter your email"
                className="w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white border-gray-300"
              />
            </div>

            <div data-aos="fade-up" data-aos-delay="300">
              <label className="block text-sm font-medium text-textLight">
                Password
              </label>
              <div className="relative">
                <input
                  type={`${seePassword ? 
                    "text":
                    "password"}`
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChanges}
                  placeholder="Enter your password"
                  className="w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white border-gray-300"
                />

                { seePassword ?
                  (<LuEye onClick={handlePasswordWatch} className="absolute !opacity-60 top-[55%] right-2" />)

                  :(<LuEyeClosed onClick={handlePasswordWatch} className="absolute !opacity-60 top-[55%] right-2" />)
                  }
                
              </div>
            </div>

            <div className="text-center flex items-center justify-end !h-[40px] mx-auto ">
              
            <button
                  type="button"
                  onClick={()=>{
                    handleForgoPassword();
                    setChangePassword(true)
                  }}
                  className=" !h-[100%] text-center right-3 top-1/2 -translate-y-1/2 text-sm text-teal-500 hover:underline"
                >
                  Forgot password?
            </button>
            </div>

            <motion.button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-aos="fade-up"
              data-aos-delay="400"
            >
              Login
            </motion.button>
          </form>

          <div
            className="flex items-center justify-center space-x-2"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <motion.button
              className="w-full py-3 border rounded-md flex items-center justify-center space-x-2 text-textLight hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleLogin}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />  
              <span>Sign in with Google</span>
            </motion.button>
          </div>

          <p
            className="text-center text-sm text-textLight"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            Don’t have an account?{" "}
            <a href="https://thecosrx.shop/user/register" className="text-teal-500 hover:underline">
              Sign Up
            </a>
          </p>
          <p
            className="text-center text-sm text-textLight"
            data-aos="fade-up"
            data-aos-delay="600"
          >
            Don’t have an account?{" "}
            <a href="https://thecosrx.shop/user/register" className="text-teal-500 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </motion.div>

      {/* Right Section: Logo and Background */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto bg-teal-100 flex items-center justify-center right-section">
        <div className="text-center">
          {/* Logo SVG */}
          <div className="h-50 flex justify-center overflow-hidden">
            <img src={logo} width="100%" className="object-contain" alt="the logo" />
          </div>

          <h2
            className="text-5xl font-bold text-textLight"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            COSRX
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Login;


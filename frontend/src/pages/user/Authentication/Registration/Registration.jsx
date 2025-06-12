import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import registraion from "@/assets/cosrx.png";
import axiosBaseUrl from "$/axios";

const Register = () => {
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
      ".right-image",
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 1.2, ease: "power3.out", delay: 0.3 }
    );
  }, []);

  const [formData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    referralCode: "" 
  });

  const [seePassword, setSeePassword] = useState(false);
  const [errors, setErrors] = useState({}); 

  const handleChange = (e) => {
    if (!e.target.name) {
      console.log("No name present");
      return;
    }

    setUserData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [e.target.name]: ""
    }));
  };

  const handleEachFileds = () => {
    const { email, firstName, password, lastName, referralCode } = formData;
    let errors = {};

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.length < 3 || firstName.length > 50) {
      errors.firstName = "First name must be 3-50 characters";
    } else if (!/[a-zA-Z]/.test(firstName)) {
      errors.firstName = "First name must contain at least one letter";
    }

    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (lastName.length < 3 || lastName.length > 50) {
      errors.lastName = "Last name must be 3-50 characters";
    } else if (!/[a-zA-Z]/.test(lastName)) {
      errors.lastName = "Last name must contain at least one letter";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
      errors.email = "Invalid Gmail address. Must end with @gmail.com";
    } else if (email.length < 6 || email.length > 50) {
      errors.email = "Email must be between 6 and 50 characters";
    } else if (!/^[a-zA-Z0-9]/.test(email)) {
      errors.email = "Email must start with a letter or number";
    } else if (/\s/.test(email)) {
      errors.email = "Email cannot contain spaces";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 8 || password.length > 20) {
      errors.password = "Password must be 8-20 characters long";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least one number";
    } else if (!/[@$!%*?&]/.test(password)) {
      errors.password = "Password must contain at least one special character (@$!%*?&)";
    } else if (/\s/.test(password)) {
      errors.password = "Password cannot contain spaces";
    }

    if (referralCode.trim()) {
      if (referralCode.length < 6 || referralCode.length > 20) {
        errors.referralCode = "Referral code must be 6-20 characters";
      } else if (!/^[a-zA-Z0-9]+$/.test(referralCode)) {
        errors.referralCode = "Referral code must be alphanumeric (letters and numbers only)";
      } else if (/\s/.test(referralCode)) {
        errors.referralCode = "Referral code cannot contain spaces";
      }
    }

    return errors;
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const formValidation = handleEachFileds();

      if (Object.keys(formValidation).length > 0) {
        setErrors(formValidation);
        toast.error(Object.entries(formValidation)[0][1]);
        return;
      }

      axiosBaseUrl
        .post("/user/register", formData)
        .then((res) => {
          const result = res.data;
          navigate("/user/otp", { state: { token: result.token, userId: result.userId } });
          toast.success("Registration successful! Verify your OTP.");
        })
        .catch((err) => {
          toast.error(err.response?.data?.message || "Registration failed.");
        });
    },
    [formData]
  );

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  const handlePasswordWatch = () => {
    if (!formData.password?.trim()) {
      toast.info("Password field is empty");
      return;
    }
    setSeePassword((prevState) => !prevState);
  };

  return (
    <div className="h-[100vh] overflow-y-scroll overflow-x-hidden flex flex-col lg:flex-row bg-gray-50">
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
            Get Started Now
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-aos="fade-up" data-aos-delay="100">
              <label className="block text-sm font-medium text-textLight">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div data-aos="fade-up" data-aos-delay="150">
              <label className="block text-sm font-medium text-textLight">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>
            <div data-aos="fade-up" data-aos-delay="200">
              <label className="block text-sm font-medium text-textLight">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
            <div data-aos="fade-up" data-aos-delay="250">
              <label className="block text-sm font-medium text-textLight">
                Password
              </label>
              <div className="relative">
                <input
                  type={seePassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formData.password && (
                  seePassword ? (
                    <LuEye
                      onClick={handlePasswordWatch}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer opacity-60"
                    />
                  ) : (
                    <LuEyeClosed
                      onClick={handlePasswordWatch}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer opacity-60"
                    />
                  )
                )}
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>
            <div data-aos="fade-up" data-aos-delay="300">
              <label className="block text-sm font-medium text-textLight">
                Referral Code (Optional)
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Enter referral code (optional)"
                className={`w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white ${errors.referralCode ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.referralCode && (
                <p className="text-sm text-red-600 mt-1">{errors.referralCode}</p>
              )}
            </div>

            <motion.button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-aos="fade-up"
              data-aos-delay="350"
            >
              Sign Up
            </motion.button>
          </form>

          <div
            className="flex items-center justify-center space-x-"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <motion.button
              className="w-full py-3 border rounded-md flex items-center justify-center space-x-2 text-textLight hover:bg-gray-100 transition-colors"
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Sign up with Google</span>
            </motion.button>
          </div>

          <p
            className="w-[50%] mx-auto text-center underline cursor-pointer text-green-800 hover:text-green-500"
            onClick={() => navigate("/user/login")}
          >
            Already Have an Account
          </p>
        </div>
      </motion.div>

      {/* Right Section: Image */}
      <div className="lg:w-1/2 lg:block hidden lg:h-auto">
        <img
          src={registraion}
          alt="Placeholder"
          className="right-image w-full h-full object-contain"
        />
      </div>
    </div>
  );
};

export default Register;
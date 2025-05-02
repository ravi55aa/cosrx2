import { useEffect,useRef,useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { motion } from "framer-motion"

import { toast } from "react-toastify";
import { useNavigate,useLocation } from "react-router-dom";
import axiosBaseUrl from "$/axios";
import { getUserId } from "../../../../../../Services/Reusable"; 

const EmailVerify = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const [loading,setLoading] = useState(false);

  let emailCheck = useRef("");

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

  const handleInputField=()=>{
      emailCheck.current=event.target.value;
      return;
  }

  const handleValidation = ()=>{
    let errors = {};
  
      if (!emailCheck.current.trim()) {
        errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(emailCheck.current)) {
        errors.email = 'Invalid Gmail address. Must end with @gmail.com';
    } else if (emailCheck.current.length < 6 || emailCheck.current.length > 50) {
        errors.email = 'Email must be between 6 and 50 characters.';
    } else if (!/^[a-zA-Z0-9]/.test(emailCheck.current)) {
        errors.email = 'Email must start with a letter or number.';
    } else if (/\s/.test(emailCheck.current)) {
        errors.email = 'Email cannot contain spaces.';
    }
    return errors;
  }

  const handleSubmit=()=>{
    event.preventDefault();

    const validation = handleValidation();

    if(Object.keys(validation).length > 0 ){
      
      toast.warn(Object.entries(validation)[0][1]);

      return false;
    }
    
    setLoading(true);

    axiosBaseUrl.post("/user/checkEMailForPasswordChange",  {"email":emailCheck.current})
    .then((res)=>{
      
      if(res.data.mission == "success"){
        navigate("/user/profile/edit/forgotPassword_ChangePassword",{state:getUserId()});

        setLoading(false);
        toast.success("Email verified successful..");
        return;
      }
      
      setLoading(false);
      toast.error("something went wrong");
      return;
    })
    .catch((err)=>{
      setLoading(false);
      toast.error("User not found");
      console.log(err.message);
      return;
    })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">

      {/* Left Section: Logo and Background */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto bg-teal-100 flex items-center justify-center left-section">
        <div className="text-center">
          {/* Logo SVG */}
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
        </div>
      </div>

      {/* Right Section: Form */}
      <motion.div
        className="lg:w-1/2 w-full flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-md w-full space-y-6">

          {
            location.state?.isLogin ?
            (<h1
              className="form-heading text-3xl font-bold text-textLight"
              data-aos="fade-up"
            >
              Forgot Password?
            </h1>
            ): (
              <h1
              className="form-heading text-3xl font-bold text-textLight"
              data-aos="fade-up"
            >
              Welcome😃.. Kindly Verify;
            </h1>
            )
          }
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-aos="fade-up" data-aos-delay="100">
              <input
                type="email"
                onChange={handleInputField}
                placeholder="Enter your registered email"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white border-gray-300"
              />
            </div>

            <motion.button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Verify Email
            </motion.button>
          </form>

          {
          loading && 
          <p> Verifying email... </p>
          }
          
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerify;
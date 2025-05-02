import { useEffect,useState } from "react";

import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { motion } from "framer-motion";

import {toast} from "react-toastify";
import { ClipLoader } from "react-spinners";
import axiosBaseUrl from "$/axios";
import { useLocation, useNavigate } from "react-router-dom";

const dummyImage = "https://via.placeholder.com/600x800?text=Replace+Me";

const EnterNewPassword = () => {

  const location = useLocation(); //Eg : {id:2as3213123213, field:_id or googleId}

  const navigate = useNavigate();

  let [passwords,setPassword] = useState({password1:"",password2:"",email:location.state});
  const [loading,setLoading] = useState(false);

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

  const handlePasswordChange=()=>{
    setPassword((prevState)=>({...prevState,[event.target.name]:event.target.value})); 
    return;
  }

  const handleFields=()=>{
    let errors = {}

    if(!location.state){
      toast.error("no Credentials found");
      navigate("/user/profile");
      return false;
    }

    const {password1,password2} = passwords;


    [password1,password2].forEach((password)=>{
      if (!password.trim()) {
        return errors.password = 'Password is required';
    } else if (password.length < 8 || password.length > 20) {
        return errors.password = 'Password must be 8-20 characters long.';
    } else if (!/[A-Z]/.test(password)) {
        return errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(password)) {
        return errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(password)) {
      return errors.password = 'Password must contain at least one number.';
    } else if (!/[@$!%*?&]/.test(password)) {
        return errors.password = 'Password must contain at least one special character (@$!%*?&)';
    } else if (/\s/.test(password)) {
        return errors.password = 'Password cannot contain spaces.';
    }
  })
    
    if(password1 !==  password2){
      errors.password = "Password should Match";
    }

    return errors;
  }

  const handleSubmit=()=>{
    event.preventDefault();
    
    setLoading(true);
    const validation =  handleFields();
    
    if(Object.keys(validation).length > 0){
      setLoading(false);

      toast.info(Object.entries(validation)[0][1]);

      return false;
    }

    axiosBaseUrl.patch("/profile/edit/PasswordChange",passwords,{
      params:{query : location.state}
    })
    .then((res)=>{
      if(res?.data?.mission == "failed"){
        toast("Opps something wrong try again..");
        setLoading(false);
        return;
      }

      navigate('/user/profile/edit');
      toast.success("Password changed successfully..");
      setLoading(false);
      return;
    })
    .catch((err)=>{
      console.json(err);
      toast.success(err?.response?.data?.message);
      setLoading(false);
      return false;
    });
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left Section: Image and Text */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto flex items-center justify-center left-section">
        <div className="relative w-full h-full">
          <img
            src={dummyImage}
            alt="Placeholder"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <h2
              className="text-3xl font-bold text-textLight"
              data-aos="fade-up"
            >
              Create Your NEW Password
            </h2>
            <p
              className="mt-2 text-sm text-textLight max-w-xs"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Set a strong password to secure access. Once done, you’ll be ready to continue shopping with ease!
            </p>
          </div>
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
          {/* Logo */}
          <div className="flex items-center justify-center" data-aos="zoom-in">
            <svg
              width="40"
              height="40"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
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
            <h2 className="text-2xl font-bold text-textLight">COSRX</h2>
          </div>

          <h1
            className="form-heading text-3xl font-bold text-textLight"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Enter Your New Password
          </h1>
          <p
            className="text-sm text-textLight"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Set a strong password to keep your account secure. Once done, you’ll be ready to continue shopping with ease!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-aos="fade-up" data-aos-delay="300">
              <label className="block text-sm font-medium text-textLight">
                New Password
              </label>
              <input
                type="text"
                name="password1"
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                className="w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white border-gray-300"
              />
            </div>

            <div data-aos="fade-up" data-aos-delay="400">
              <label className="block text-sm font-medium text-textLight">
                Confirmation
              </label>
              <input
                type="text"
                name="password2"
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
                className="w-full mt-1 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-textLight bg-white border-gray-300"
              />
            </div>

            { loading &&  
            <p className="w-full flex justify-center">
              <ClipLoader color="#36d7b7" size={20} />
            </p>  
            }

            <motion.button
              type="submit"
              className="w-full py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-aos="fade-up"
              data-aos-delay="500"
            >
              Submit
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EnterNewPassword;
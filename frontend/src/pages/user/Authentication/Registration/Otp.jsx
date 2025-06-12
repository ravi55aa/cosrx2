import { useEffect,useRef,useState,useCallback } from "react";
import { motion } from "framer-motion";
import {toast} from "react-toastify";
import { gsap } from "gsap";
import "aos/dist/aos.css";
import AOS from "aos";

import axiosBaseUrl from "$/axios";
import { useLocation,useNavigate } from "react-router-dom";


const EnterOTP = () => {


  const location = useLocation();

  let [otp,setOTP] = useState({otpis:"",expiryTime:""});
    
  const intervalRef = useRef(null); 
    
  const [countdown, setCountdown] = useState(2 * 60);

  const navigate = useNavigate();

// Initialize AOS and GSAP animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });

    gsap.fromTo(
      ".form-heading",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    const fetchOTP = async () => {
      try {

        const token = location?.state?.token;

        const res = await axiosBaseUrl.get("/user/verifyOTP",{
          params: { token }
        });

        const { otp, expiryTime } = await res.data;

        console.log("OTP generated is:", otp);
        setOTP({ otpis: otp, expiryTime:expiryTime });

        toast.success("OTP generated successfully");

        // Start countdown
        setCountdown(3 * 60);

        intervalRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              console.log("Timer stopped");
              return 0;
            }
            
            return prev - 1;
          });
        }, 1000);

      } catch (error) {
        toast.error("Failed to generate OTP: " + error.message);
        console.error(error);
      }
    };

    fetchOTP();

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

    let otpCarrier = useRef("");
    
    const handleInputField=()=>{
        otpCarrier.current=event.target.value;
        return;
    }

    const handleSubmit=()=>{
        event.preventDefault();

        if(countdown <= 0){
          toast.info("OTP is not valid");          
          return;
        }
        
        if(!otp.otpis){
            toast("otp not stored at frontend");
            return;
        }

        if(!otpCarrier.current){
            toast.error("field cannot be null");
            return;
        }
        
        if(otp.otpis != otpCarrier.current){
            console.log(otp == otpCarrier.current);
            toast.error("OTP doesn't match");
            return;
        }

        //This is where i want to show the otp expiry time
        
        toast.success("OTP verification successful");

        window.localStorage.setItem("userId",JSON.stringify(location.state?.userId));

        navigate("/user/login");
        
        return;
    }

    const resendOTP = async () => {
        try {
          // Clear existing countdown before resending
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          // const token = JSON.parse(window.localStorage.getItem("token"));

          console.log("the location si",location);
          const token = location?.state?.token;

          if(!token) {
            toast.info("Technical issue,kindly Register once-again")
          }
      
          const res = await axiosBaseUrl.get("/user/verifyOTP",{
            params:{
              "token":token
            }
          });
          const { otp, expiryTime } = res.data;
      
          console.log("New OTP generated:", otp);
          setOTP({ otpis: otp, expiryTime });
      
          toast.success("OTP resent successfully");
      
          // Reset countdown to 3 minutes (180 seconds)
          setCountdown(2 * 60);
      
          intervalRef.current = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(intervalRef.current);
                console.log("Timer stopped");
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } catch (error) {
          toast.error("Failed to resend OTP: " + error.message);
          console.error(error);
        }
    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        className="max-w-md w-full space-y-6 p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1
          className="form-heading text-2xl font-bold text-textLight text-center"
          data-aos="fade-up"
        >
          Please enter the OTP in the mail:
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div data-aos="fade-up" data-aos-delay="100">
            <input
              type="text"
              onChange={handleInputField}
              placeholder="Enter OTP"
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
            Submit
          </motion.button>
        </form>

        <p className={`underline text-center underline-offset-2 
          ${countdown==0 ? "text-red-600" : "text-black" } `}>
          
        {countdown == 0 ? "--OTP Expired--" : `Expires in ${countdown}sec` }
        </p>

        <p
          className="text-center mb-3 text-sm text-textLight"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Wrong Email?{" "}
          <a onClick={()=>navigate("/login")} className="text-teal-500 hover:cursor-pointer hover:underline">
            Renter
          </a>
        </p>
        <p className="inline-block w-full text-center">or</p>
        <p
          className="text-center text-sm text-textLight"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <a onClick={resendOTP} className="text-teal-500 hover:underline hover:cursor-pointer">
          Resent OTP 
          </a>
        </p>

      </motion.div>
    </div>
  );
};

export default EnterOTP;
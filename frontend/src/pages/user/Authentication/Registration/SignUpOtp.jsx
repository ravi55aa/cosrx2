import { useEffect } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import AOS from "aos";
import "aos/dist/aos.css";

// Dummy image placeholder (same as registration page)
const dummyImage = "https://via.placeholder.com/600x800?text=Replace+Me";

const SignupOTP = () => {
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
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
            Signup
          </h1>

          <form className="space-y-4">
            <div data-aos="fade-up" data-aos-delay="100">
              <input
                type="email"
                placeholder="Enter email"
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
              Send OTP
            </motion.button>
          </form>

          <p
            className="text-center text-sm text-textLight"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Already a user?{" "}
            <a href="#" className="text-teal-500 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </motion.div>

      {/* Right Section: Image */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto">
        <img
          src={dummyImage}
          alt="Placeholder"
          className="right-image w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default SignupOTP;
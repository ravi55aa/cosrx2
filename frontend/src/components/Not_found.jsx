import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import notFound from "../assets/logo.png";

const NotFound = () => {
  // Initialize AOS animations
  React.useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center" data-aos="fade-up">
        <h1 className="text-6xl font-bold text-teal-600 mb-4">404</h1>
        <img src={notFound} alt="404" className="w-64 mx-auto mb-6" />
        <p className="text-2xl text-textLight mb-6">Oops! Page Not Found</p>
        <p className="text-textLight mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/user/homepage"
          className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
        >
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
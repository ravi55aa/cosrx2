import React from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaShoppingBag, FaHeadset, FaLock, FaQuoteLeft, } from "react-icons/fa";

import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import headerBackground from "@/assets/aboutUs/banner4.avif"; 
import cosrxLogo from "@/assets/logo.png"; 
import testimonialImage from "@/assets/aboutUs/profile.jpeg"; 

const AboutUs = () => {
  
  React.useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <div className="bg-gray-50 text-textLight min-h-screen">
        <HeaderSection/>

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center py-32"
        style={{ backgroundImage: `url(${headerBackground})` }} 
      >
        <div className="absolute  opacity-80"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h3 className=" text-6xl font-bold text-start ms-20 ">About Us</h3>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-aos="fade-up">
          <div className="text-center">
            <FaShoppingBag className="text-teal-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Free Shipping</h3>
            <p className="text-gray-600">Shipping is free to your doorstep on all orders.</p>
          </div>
          <div className="text-center">
            <FaHeadset className="text-teal-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Customer Support</h3>
            <p className="text-gray-600">Help is here 24/7, every day - we are happy to assist you.</p>
          </div>
          <div className="text-center">
            <FaLock className="text-teal-600 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Secure Payments</h3>
            <p className="text-gray-600">Shop with confidence - your safety is our priority.</p>
          </div>
        </div>
      </section>

      {/* Established Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 bg-white">
        <div className="text-center" data-aos="fade-up">
          <img
            src={cosrxLogo} // Replace with your logo or a network graphic
            alt="COSRX Network"
            className="w-32 h-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-textLight mb-4">Established Since 2024</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We started the beginning of 2024 with our attention transformed into reality. Vision, mission, and experience matter - we thrive on shaping that path to growing value, and enhancing customer satisfaction.
          </p>
          <a href="https://en.wikipedia.org/wiki/Amorepacific_Corporation" target="_blank" className="my-6 inline-block px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            Learn More
          </a>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8" data-aos="fade-up">
          <div className="md:w-1/2">
            <div className="bg-teal-100 p-6 rounded-lg">
              <FaQuoteLeft className="text-teal-600 text-2xl mb-4" />
              <p className="text-gray-600 italic">
                "Far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts."
              </p>
              <p className="mt-4 font-semibold text-textLight">- Jenny Clark</p>
              <div className="flex mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src={testimonialImage} // Replace with your testimonial image
              alt="Testimonial"
              className="w-1/2 h-64 object-fill rounded-lg"
            />
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default AboutUs;
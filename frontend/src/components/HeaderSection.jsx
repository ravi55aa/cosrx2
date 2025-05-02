import React,{useState} from 'react';
import { FaHome, FaShoppingCart, FaHeart, FaBox, FaUser, FaBars, FaTimes } from "react-icons/fa"; 
import { IoIosAppstore } from "react-icons/io";
import { MdLocalLibrary } from "react-icons/md";
import { LuSwatchBook } from "react-icons/lu";

import {Link} from "react-router-dom";

const HeaderSection = () => {

     // State for hamburger menu
      const [isMenuOpen, setIsMenuOpen] = useState(false);
    
      // Toggle hamburger menu
      const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
      };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center">
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
            <h1 className="text-2xl font-bold text-textLight">COSRX</h1>
          </div>

          {/* Hamburger Menu Button (Visible on Mobile) */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-textLight">
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Navigation */}
          <nav
            className={`${
              isMenuOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0 transition-all duration-300`}
          >
            <Link to="/user/homepage" target='_self'>
                <button
                  
                  className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
                >
                  <FaHome className="mr-1" /> Home
                </button>
            </Link>

            <Link target="_self" to="/user/shop">
                <button
                  className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
                >
                  <FaBox className="mr-1" /> Shop
                </button>
            </Link>
            
            <Link target="_self" to="/user/aboutUs">
                <button
                  className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
                >
                  <IoIosAppstore  className="mr-1" /> AboutUs
                </button>
            </Link>
            
            <a
              href="#"
              className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
            >
              <LuSwatchBook className="mr-1 " /> Contact
            </a>
            <Link
              to="/user/wishlist"
              className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
            >
              <FaHeart className="mr-1" />
            </Link>
            <Link
              to="/user/cart"
              className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
            >
              <FaShoppingCart className="mr-1" /> 
            </Link>
            <Link to="/user/profile" target="_self">
              <button
                className="flex items-center text-textLight hover:text-teal-500 transition-colors py-2 md:py-0"
              >
                <FaUser className="mr-1" /> 
              </button>
            </Link>
          </nav>
        </div>
      </header>
  )
}

export default HeaderSection
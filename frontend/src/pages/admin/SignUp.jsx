import React,{useState,useEffect} from 'react';
import "./signup.css"
import cosrx_logo_text from '@/assets/cosrx-logo-text.webp';


const Login = () => {

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      {/* Left Section with Logo */}
      <div className="w-1/2 h-screen bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <img src={cosrx_logo_text} alt="Droplet Icon" className=" mx-auto w-[100%] h-[100%]" />
        </div>
      </div>

      {/* Right Section with Login Form */}
      <div className="w-1/2 h-full bg-gray-900 flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Login</h2>
          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700"
            >
              Login In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
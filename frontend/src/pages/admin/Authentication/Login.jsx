import React, { useState } from "react";

import {toast} from "react-toastify" 
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import axiosBaseUrl from "$/axios";

const AdminPage = () => {
  let [formData, setFormData] = useState({ email: "", password: ""});
  const [spinner,setSpinner] = useState(false); 

  const navigate = useNavigate();

    const adminLogin ={
      email:"ravi@gmail.com",
      password:"20180565940aA@"
    }

  const handleChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
    return;
  };


    const handleFrontEndValidation = () => {    
      const {email,password,} = formData; 

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

      if(email !== adminLogin.email){
          errors.email = "Email doesn't match "
      }

      if(password !== adminLogin.password){
          errors.password = "Password doesn't match"
      }
      
      return errors;
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSpinner(true);
    const errors = handleFrontEndValidation();
    
    if(Object.keys(errors).length > 0){
      setSpinner(false);
      toast.info(Object.entries(errors)[0][1]);
      return;
    }
      
    setSpinner(false);
    window.localStorage.setItem("adminData",JSON.stringify(formData.email));
    toast.success("Admin Login successful");

    navigate("/admin/usersManage");
    
    return;
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-2xl font-bold text-gray-800 text-center">Admin Login</h2>
        <form onSubmit={(e)=>handleSubmit(e)} className="mt-6">
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            {spinner &&
              <ClipLoader loading />
            }
            <input
              name="email"
              type="email"
              className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              onChange={(e) => handleChange(e)}
              required
              defaultValue="eg: admin@gmail"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              className="w-full p-2 border rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
              onChange={(e) => handleChange(e)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full mb-4 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;

import React, { useState, useCallback, useEffect } from "react";
import OtpModal from "./User.address.otp.model";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaBars } from "react-icons/fa";
import axios from "axios";

import AOS from "aos";
import "aos/dist/aos.css";

import axiosBaseUrl from "$/axios";
import { validate_address } from "U/utils";
import Footer from "@/components/Footer";
import {getUserId} from "@/Services/Reusable";
import HeaderSection from "@/components/HeaderSection";


const AddAddress = () => {

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [OTPModal,setOTPModal]=useState({
        open:false,
        data:[],
    });


    const [addressData, setAddressData] = useState({
        name: "",
        state: "",
        streetAddress: "",
        townCity: "",
        postcodeZip: "",
        phone: "",
        alternativePhone: "",
        isPrimary:false
    });

    const handleChanges = useCallback((e) => {
        const { name, value } = e.target;
        setAddressData((prevData) => ({ ...prevData, [name]: value }));
    }, []);


    const handleSubmit = useCallback((e)=>{
        e.preventDefault();
        
        const isValidated = validate_address(addressData);

        if(Object.keys(isValidated).length > 0){
            toast.warn(Object.entries(isValidated)[0][1]);
            return;
        }
        
        const user = JSON.parse(localStorage.getItem("user"));

        axiosBaseUrl.post(`/profile/addAddress`, addressData,{params : getUserId() })
        .then((res) => {
            toast.success("Address added successfully!");
            window.history.back();
        })
        .catch((err) => {
            console.log(err.message);
            toast(err.message);
            return;
        });

      // Reset 
        // setAddressData({
        //     name: "",phone: "",
        //     state: "",townCity: "",
        //     postcodeZip: "",
        //     streetAddress: "",
        //     alternativePhone: "",
        //     isPrimary:false
        // });
        
        return;
    }, [addressData]);

    const handleCancel=useCallback(()=>{
        setOTPModal((prevData)=>({...prevData,open:false}));
        window.history.back()
    },[OTPModal.open])

    const handleSelect = useCallback((place) => {
      const { Name, State } = place;
      setAddressData((prevData) => ({
          ...prevData,
          townCity: Name,
          state: State
      }));
      closeModalOnly(); 
  }, []);

  const closeModalOnly = () => {
    setOTPModal((prevData) => ({ ...prevData, open: false }));
  };
  
  


    const handleZipcode=useCallback(()=>{
        if(!addressData.postcodeZip.trim()){
            toast.warn("Zip-code is null");
            return;
        }

    if(isNaN(addressData.postcodeZip)){
        toast.warn("Enter a valid Zip-code");
        return;
    }
    
    if(addressData.postcodeZip.length < 6){
        toast.warn("Enter isn't valid");
        return;
    }

    setOTPModal((prevData)=>({...prevData,open:true}));

    axios.get(`https://api.postalpincode.in/pincode/${addressData.postcodeZip}`)
        .then((res)=>{
            if(res?.data[0]?.Status == 'Success'){
                const postOffice = res?.data[0].PostOffice;
                setOTPModal((prevData)=>({...prevData,data:[...postOffice]}));
                return true;
            }

            console.log(res);
            toast.info("Address not found");
        })
        .catch((err)=>{
            console.log(err.message);
        })

        return;
  },[addressData.postcodeZip]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col md:flex-col">
      <HeaderSection />

      {/* Main Content */}
      <div className="flex md:flex-col !w-[90%]">
        {/* Mobile Menu Button */}
        <div className="md:hidden p-4 bg-teal-600 text-white flex !md:flex-col justify-between items-center">
          <h2 className="text-xl font-bold">Add Address</h2>
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="text-white">
            <FaBars size={24} />
          </button>
        </div>

        {/* Address Form */}
        <div className="w-[60%] mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6" data-aos="fade-up">
            <h1 className="text-3xl font-bold text-textLight mb-6">Add Address</h1>

            <div className="grid grid-cols-1 gap-8">
              {/* Sidebar Placeholder on Desktop */}

              {/* Form Section */}
              <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Label</label>
                  <input
                    type="text"
                    name="name"
                    value={addressData.name}
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    type="text"
                    readOnly
                    value="india"
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postcode / ZIP *</label>
                  <input
                    type="text"
                    name="postcodeZip"
                    value={addressData.postcodeZip}
                    onChange={handleChanges}
                    className="mt-1 me-2 p-2 w-2/3 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your postcode or ZIP"
                    maxLength={6}
                    
                  />

                    <button onClick={handleZipcode} type="button" className="px-2 py-1 rounded-xl text-center bg-[#124] text-white">
                        Click me
                    </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    name="streetAddress"
                    value={addressData.streetAddress}
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Town / City</label>
                  <input
                    type="text"
                    name="townCity"
                    value={addressData.townCity}
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your town or city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={addressData.phone}
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter your phone number"
                    
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Alternative Phone</label>
                  <input
                    type="tel"
                    name="alternativePhone"
                    value={addressData.alternativePhone}
                    onChange={handleChanges}
                    className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter an alternative phone number"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">Primary account</label>
                  <select value={addressData.isPrimary} name="isPrimary" className="mt-1 p-2 w-full border rounded-md focus:ring-teal-500 focus:border-teal-500" onChange={handleChanges} id="isPrimary">
                    <option value={false}>Not-primary</option>
                    <option value={true}>Yes its-Primary</option>
                  </select>
                  </div> */}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() =>{
                      setAddressData({
                      name: "",
                      state: "",
                      streetAddress: "",
                      townCity: "",
                      postcodeZip: "",
                      phone: "",
                      alternativePhone: "",
                      isPrimary:false
                    });
                    
                    window.history.back()
                  }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                      Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

        {OTPModal.open && <OtpModal  addresses={OTPModal.data}  onSelect={handleSelect} onCancel={handleCancel}  />}

      <Footer />
    </div>
  );
};

export default AddAddress;



{/* Sidebar */}
      {/* <div
        className={`fixed md:static inset-0 bg-gray-800 text-white w-64 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 z-50`}
      >
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-white">
            <FaTimes size={24} />
          </button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-4 p-4">
            <li>
              <Link
                to="/orders"
                className="flex items-center text-gray-300 hover:text-teal-400"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/personal-info"
                className="flex items-center text-gray-300 hover:text-teal-400"
              >
                Personal Info
              </Link>
            </li>
            <li>
              <Link
                to="/addresses"
                className="flex items-center text-gray-300 hover:text-teal-400"
              >
                Addresses
              </Link>
            </li>
            <li>
              <Link
                to="/wallet"
                className="flex items-center text-gray-300 hover:text-teal-400"
              >
                Wallet
              </Link>
            </li>
            <li>
              <Link
                to="/coupons"
                className="flex items-center text-gray-300 hover:text-teal-400"
              >
                Coupons
              </Link>
            </li>
            <li>
              <Link
                to="/logout"
                className="flex items-center text-gray-300 hover:text-teal-400"
              >
                <FaSignOutAlt className="mr-2" /> Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div> */}
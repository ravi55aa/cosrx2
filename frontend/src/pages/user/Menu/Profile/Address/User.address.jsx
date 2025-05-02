import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2'

import AOS from "aos";
import "aos/dist/aos.css";
import { toast } from "react-toastify";
import Footer from "@/components/Footer";
import Sidebar from "@/components/user/Profile/Sidebar.jsx";

import axiosBaseUrl from "$/axios";
import HeaderSection from "@/components/HeaderSection";
import {getUserId} from "@/Services/Reusable";
import {deleteAddress,address_primaryAddress_Service} from "@/Services/User/Profile/Address.jsx";
import { FaBars, FaTimes, FaEdit, FaTrash, FaPlus, } from "react-icons/fa";
import { HiMiniEye } from "react-icons/hi2";

const Addresses = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  //mobile view menu
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fetchAddresses , setAddress] = useState([]);
  const [isDeleted,setDeleted] = useState(1);

  //tempData
    const addresses = [
        {
            id: 1,
            name: "Suppi Primary",
            address: "Kinfra Tech Park, Kakkanad, Kochi, Kerala, 546734",
            isPrimary: true,
        },
        {
            id: 2,
            name: "Home Address",
            address: "123 Main St, City, State, 12345",
            isPrimary: false,
        },
    ];

    useEffect(()=>{
        const user =  JSON.parse(localStorage.getItem("user")) ;
        
        if(!user){
            toast('No user found');
            return;
        }

        axiosBaseUrl.get(`/profile/getAddress`,{params : getUserId() }) //params : {key,value}
            .then((res)=>{
                if(res.hasOwnProperty("error")){
                    console.log("response is not okay");
                    return;
                }

                setAddress(res.data?.address);
                console.log(res.data?.address);
                return;

            }).catch((err)=>{
                console.log("error",err.message);
                return;
            })
    },[isDeleted]);

    const handleAddressView=(address)=>{
      Swal.fire({
        title: "Address View",
        html: `
            <table style="width:100%; padding:2px; border: 1px solid #ccc; text-align:left; border-collapse:collapse;">
            ${Object?.entries(address).map((ele,i)=>{
              return(
                `<tr>
                <td style="padding: 8px; white-space: nowrap;"><strong>${ele[0]?.toUpperCase()}:</strong></td>
                <td>${ele[1]}</td>
                </tr> `)
            })}
            </table>`,
        confirmButtonText: 'Close',
      })
    }

    const handleDelete=async(addressId)=>{
      const res = await deleteAddress(addressId);
      if(!res){
        toast.error("Something went wrong");
        return;
      }

      toast.success("Deleted Successfully");
      setDeleted((prev)=>prev+1);
      return;
    }

    const handlePrimaryCheckBox=async(e,addrId)=>{
      if(!e.target.checked) return;

      const defaultAddressChange = await address_primaryAddress_Service(addrId);
      if(!defaultAddressChange){
        return false;
      }

      setDeleted((prev)=>prev+1);
      return true;
    }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
        <HeaderSection/>
      {/* Sidebar */}

      {/* Main Content */}
    <div className="flex-1">
    {/* Mobile Menu Button */}
    <div className="md:hidden p-4 bg-teal-600 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold">My Addresses</h2>
        <button onClick={() => setIsSidebarOpen(true)} className="text-white">
        <FaBars size={24} />
        </button>
    </div>

        {/* Addresses Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="rounded-lg p-6" data-aos="fade-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Placeholder on Desktop */}
                <Sidebar/>

              {/* Addresses List */}
            <div className=" bg-white shadow-md md:col-span-2">
              <div className="flex justify-around py-2">
                <h1 className="text-3xl font-bold text-textLight mb-6">My Addresses</h1>
                <Link
                    to="/user/profile/address/add"
                    className="mt-6 inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                    <FaPlus className="mr-2" /> Add Address
                </Link>
              </div>
                {addresses?.length === 0 ? (
                    <p className="text-gray-600">No addresses added yet.</p>
                ) : (
                <div className="space-y-4 mx-5 py-2 overflow-y-auto">
                    {fetchAddresses?.address?.map((address) => (
                        <div
                        key={address._id}
                        className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >

                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-textLight">
                                        {address?.name}
                                        {address?.isPrimary && (
                                        <span className="ml-2 text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                                            Primary
                                        </span>
                                        )}
                                    </h3>
                                    <p className="text-gray-600">{address?.streetAddress}</p>
                                </div>

                                <div className="flex space-x-2">
                                  {!address.isPrimary &&
                                    <input type="checkbox" onChange={(e)=>handlePrimaryCheckBox(e,address._id)} className="text-blue-600 hover:text-blue-800"/>
                                  }
                                    <button onClick={()=>handleAddressView(address)} type="button" className="text-blue-600 hover:text-blue-800">
                                        <HiMiniEye />
                                    </button>
                                    <Link to={`/user/profile/address/edit/${address._id}`}>
                                      <button type="button" className="text-teal-600 hover:text-teal-800">
                                          <FaEdit />
                                      </button>
                                    </Link>
                                    <button onClick={()=>handleDelete(address._id)} type="button" className="text-red-600 hover:text-red-800">
                                        <FaTrash />
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>
        </div>
        </div>
    </div>
    </div>
    <Footer/>
    </div>
  );
};

export default Addresses;














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
              <Link to="/orders" className="flex items-center text-gray-300 hover:text-teal-400">
                Orders
              </Link>
            </li>
            <li>
              <Link to="/personal-info" className="flex items-center text-gray-300 hover:text-teal-400">
                Personal Info
              </Link>
            </li>
            <li>
              <Link to="/addresses" className="flex items-center text-gray-300 hover:text-teal-400">
                Addresses
              </Link>
            </li>
            <li>
              <Link to="/wallet" className="flex items-center text-gray-300 hover:text-teal-400">
                Wallet
              </Link>
            </li>
            <li>
              <Link to="/coupons" className="flex items-center text-gray-300 hover:text-teal-400">
                Coupons
              </Link>
            </li>
            <li>
              <Link to="/logout" className="flex items-center text-gray-300 hover:text-teal-400">
                <FaSignOutAlt className="mr-2" /> Logout
              </Link>
            </li>
          </ul>
        </nav>
      </div> */}
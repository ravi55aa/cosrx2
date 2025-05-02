import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const liClassed = "px-4 py-2 hover:bg-[#BDC1C7] max-w-fit hover:cursor-pointer"

  return (
    <div className="hidden md:block bg-white rounded-lg shadow-lg p-6 lg:p-8 ">
                <h2 className="text-xl font-semibold mb-4">Settings</h2>
                <ul className="space-y-4 text-gray-600 ">
                    <li className={liClassed} >
                      <Link to="/user/profile">
                        Personal Info
                      </Link>
                      </li>
                    
                    <li className={liClassed} >
                      <Link to="/user/profile/address">
                        Addresses
                      </Link>
                      </li>
                    
                    <li className={liClassed} >
                    <Link to="/user/list-of-order">
                    Orders
                    </Link>
                    </li>
                    <li className={liClassed} >Wallet</li>
                    <li className={liClassed} >Coupons</li>
                </ul>
    </div>
    )
}

export default Sidebar
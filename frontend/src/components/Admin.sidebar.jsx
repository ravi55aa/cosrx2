import React, { useState,useCallback,useMemo } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { motion } from 'framer-motion';
import { toast } from "react-toastify";

import {
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  CubeIcon
} from "@heroicons/react/24/outline";



const Sidebar = () => {
    
    const navigate =useNavigate();
    const currentRoute = useLocation().pathname;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const sidebarVariants = useMemo(
        () => ({
        open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
        }),
        []
    );

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen((prev) => !prev);
    }, []);

    const handleLogout=useCallback(()=>{
        localStorage.removeItem("adminData");
        navigate("/admin/login");
        toast.success("Admin logout");
        return;
    },[]);


    const sideBars = [
        {icon:HomeIcon,title:"Dashboard",path:"/admin/dashboard"},
        {icon:ShoppingBagIcon,title:"Product",path:"/admin/products"},
        {icon:UserIcon,title:"Users",path:"/admin/usersManage"},
        {icon:TagIcon,title:"Categories",path:"/admin/category"},
        {icon:CubeIcon,title:"Orders",path:"/admin/orders"},
        {icon:TicketIcon,title:"Offers",path:""},
        {icon:TicketIcon,title:"Banner",path:""},
        {icon:TicketIcon,title:"coupons",path:""},
        {icon:CogIcon,title:"Settings",path:""},
    ];

    return (
        <div>
        <motion.div
            className={`fixed h-screen inset-y-0 left-0 w-64 bg-gray-800 p-6 z-20 md:static md:w-64 ${
            isSidebarOpen ? "block" : " md:block"
        }`}
        variants={sidebarVariants}
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        >
            <div className="flex justify-between items-center mb-10">
            <div className="text-2xl font-bold text-teal-400">COSRX</div>
            <XMarkIcon
                className="h-6 w-6 text-white cursor-pointer md:hidden"
                onClick={() => setIsSidebarOpen(false)}
            />
            </div>
            <ul className="space-y-6">
                {sideBars.map((sidebar,i)=>{
                    return(<li key={i}
                                onClick={() => navigate(sidebar.path)}
                                className={`flex items-center cursor-pointer space-x-3 
                                ${currentRoute==sidebar.path 
                                ? "text-sky-500" 
                                : "text-white"} 
                                `}>
                                <sidebar.icon className="h-6 w-6" />
                                <span>{sidebar?.title}</span>
                        </li>)
                })}
                <li 
                    onClick={handleLogout}
                    className="flex items-center cursor-pointer space-x-3 text-red-600  ">
                        <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                        <span>Logout</span>
                </li>
            </ul>
        </motion.div>
        {isSidebarOpen && (
            <div
            className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
            onClick={toggleSidebar}
            ></div>
        )}
    </div>
  );
};

export default Sidebar;

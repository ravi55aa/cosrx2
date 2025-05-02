import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const EditUser = ({ user, onEditUser, onBack }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  });

  // Memoize animation variants
  const sidebarVariants = useMemo(
    () => ({
      open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
      closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    }),
    []
  );

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }),
    []
  );

  // Event handlers with useCallback
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onEditUser(formData);
    },
    [formData, onEditUser]
  );

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 p-6 z-20 md:static md:w-64 md:block ${
          isSidebarOpen ? 'block' : 'hidden md:block'
        }`}
        initial="closed"
        animate={isSidebarOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
      >
        <div className="flex justify-between items-center mb-10">
          <div className="text-2xl font-bold text-teal-400">COSRX</div>
          <XMarkIcon
            className="h-6 w-6 text-white cursor-pointer md:hidden"
            onClick={toggleSidebar}
          />
        </div>
        <ul className="space-y-6">
          <li className="flex items-center space-x-3 text-teal-400">
            <HomeIcon className="h-6 w-6" />
            <span>Dashboard</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <ShoppingBagIcon className="h-6 w-6" />
            <span>Product</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <ShoppingBagIcon className="h-6 w-6" />
            <span>Orders</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <UserIcon className="h-6 w-6" />
            <span>Users</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TagIcon className="h-6 w-6" />
            <span>Categories</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TicketIcon className="h-6 w-6" />
            <span>Offers</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TicketIcon className="h-6 w-6" />
            <span>Banner</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <TicketIcon className="h-6 w-6" />
            <span>Coupons</span>
          </li>
          <li className="flex items-center space-x-3 text-teal-400">
            <CogIcon className="h-6 w-6" />
            <span>Settings</span>
          </li>
          <li className="flex items-center space-x-3 text-red-400">
            <ArrowLeftOnRectangleIcon className="h-6 w-6" />
            <span>Logout</span>
          </li>
        </ul>
      </motion.div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="text-gray-400 hover:text-teal-400"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </motion.button>
            <h1 className="text-2xl sm:text-3xl font-semibold">Edit User</h1>
          </div>
          <Bars3Icon
            className="h-8 w-8 text-white cursor-pointer md:hidden"
            onClick={toggleSidebar}
          />
        </div>

        {/* Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-800 rounded-lg p-6 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-1">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter user name"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter user email"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Phone Number:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Role:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="Unblock">Unblock</option>
                <option value="Block">Block</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <motion.button
                type="button"
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, backgroundColor: '#26a69a' }}
                whileTap={{ scale: 0.95 }}
                className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors"
              >
                Submit Changes
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditUser;
import React, { useState } from 'react';
import Sidebar from '../../../components/Admin.sidebar';
import ReactPaginate from 'react-paginate';
import "./dashboard.css"

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {

  const products = [
    { id: '#1125', name: 'Episoft lotion', category: 'cleanser', amount: '$120', revenue: '$1276.45', qtySold: 5 },
    { id: '#1126', name: 'inisfree', category: 'cleanser', amount: '$65.25', revenue: '$369.95', qtySold: 5 },
    { id: '#1127', name: 'dot n key', category: 'moisturizer', amount: '$25.25', revenue: '$863.45', qtySold: 4 },
    { id: '#1128', name: 'inisfree', category: 'cleanser', amount: '$180', revenue: '$127.45', qtySold: 2 },
    { id: '#1129', name: 'inisfree', category: 'cleanser', amount: '$80', revenue: '$86.00', qtySold: 2 },
    { id: '#1125', name: 'Episoft lotion', category: 'cleanser', amount: '$120', revenue: '$1276.45', qtySold: 5 },
    { id: '#1126', name: 'inisfree', category: 'cleanser', amount: '$65.25', revenue: '$369.95', qtySold: 5 },
    { id: '#1127', name: 'dot n key', category: 'moisturizer', amount: '$25.25', revenue: '$863.45', qtySold: 4 },
    { id: '#1128', name: 'inisfree', category: 'cleanser', amount: '$180', revenue: '$127.45', qtySold: 2 },
    { id: '#1129', name: 'inisfree', category: 'cleanser', amount: '$80', revenue: '$86.00', qtySold: 2 },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const pageCount = Math.ceil(products.length / itemsPerPage);

  const navigate = useNavigate();

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentItems = products.slice(offset, offset + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-900">
      
      <Sidebar/>

      
      <div className="flex-1 p-8">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Total Users</h2>
            <p className="text-3xl font-bold text-white mt-2">29</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Items Sold</h2>
            <p className="text-3xl font-bold text-white mt-2">34</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Total Sales</h2>
            <p className="text-3xl font-bold text-white mt-2">₹15889</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Pending Orders</h2>
            <p className="text-3xl font-bold text-white mt-2">12</p>
          </div>
        </div>

        
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Top Sold Products</h2>
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">PRODUCT IMAGE</th>
                <th className="py-3 px-4">PRODUCT NAME</th>
                <th className="py-3 px-4">CATEGORY</th>
                <th className="py-3 px-4">AMOUNT</th>
                <th className="py-3 px-4">REVENUE</th>
                <th className="py-3 px-4">QTY SOLD</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((product) => (
                <tr key={product.id} className="border-b border-gray-700">
                  <td className="py-3 px-4">{product.id}</td>
                  <td className="py-3 px-4">
                    <img
                      src="https://placehold.co/40x40"
                      alt="Product"
                      className="w-10 h-10 rounded"
                    />
                  </td>
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.category}</td>
                  <td className="py-3 px-4">{product.amount}</td>
                  <td className="py-3 px-4">{product.revenue}</td>
                  <td className="py-3 px-4">{product.qtySold}</td>
                </tr>
              ))}
            </tbody>
          </table>

          
          <div className="mt-6 flex justify-center">
            <ReactPaginate
              previousLabel={'<'}
              nextLabel={'>'}
              breakLabel={'...'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName={'flex space-x-2'}
              pageClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
              activeClassName={'bg-purple-600'}
              previousClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
              nextClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
              breakClassName={'px-3 py-1 text-white'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
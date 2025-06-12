import React, { useState, useEffect } from 'react';
import "./dashboard.css";

import ReactPaginate from 'react-paginate';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

import { 
  Chart as ChartJS, 
  Title, 
  PointElement,
  LineElement, 
  ArcElement, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

import Sidebar from "@/components/Admin.sidebar";
import {
  fetch_user_orderedProducts_service
} from "@/Services/Admin/DashBoard/DashBoard.jsx"

const Dashboard = () => {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('All Time');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filteredOrderedItems, setFilteredOrderedItems] = useState([]);
  const [currentProductPage, setCurrentProductPage] = useState(0);
  const [timePeriod, setTimePeriod] = useState('Monthly');
  const [categoryObj, setCategoryObj] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Infer categories from categoryObj
  let categories = ['All', ...Object.keys(categoryObj)];

  const itemsPerPage = 5;
  const productPageCount = Math.ceil(filteredOrderedItems.length / itemsPerPage);

  const fetchProducts = async (filters = {}) => {
    try {
      const response = await fetch_user_orderedProducts_service(filters);
      
      console.log("Backend response:", response);
      if (!response || !response.data || response.data.mission !== 'success') {
        throw new Error(response?.data?.message || 'Failed to fetch data');
      }
      
      setFilteredOrders(response?.data?.allOrders || []);
      setFilteredOrderedItems(response?.data?.allOrderedItems || []);
      setCategoryObj(response?.data?.topCategories || {});
      console.log("Updated filteredOrders:", response?.data?.allOrders || []);
      console.log("Updated filteredOrderedItems:", response?.data?.allOrderedItems || []);
      return true;
    } catch (error) {
      console.error("Error fetching products:", error.message);
      alert("Failed to fetch data: " + error.message);
      return false;
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchProducts();
    };
    fetchInitialData();
  }, []);

  const handleProductPageClick = ({ selected }) => {
    setCurrentProductPage(selected);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
    if (e.target.value !== 'Custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const handleFilter = async () => {
    if (dateRange === 'Custom' && (!startDate || !endDate)) {
      alert('Please select both start and end dates for custom range.');
      return;
    }

    const filters = {
      dateRange,
      startDate: dateRange === 'Custom' ? startDate : undefined,
      endDate: dateRange === 'Custom' ? endDate : undefined,
      category: selectedCategory,
    };

    console.log("Applying filters:", filters);
    await fetchProducts(filters);
  };

  const handleClear = async () => {
    setDateRange('All Time');
    setStartDate('');
    setEndDate('');
    setSelectedCategory('All');
    setTimePeriod('Monthly');
    setCurrentProductPage(0);
    await fetchProducts();
  };

  const handleDownload = (format) => {
    alert(`Downloading as ${format}... (Functionality to be implemented)`);
  };

  // Modal Handlers
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Stats Calculations
  const totalUsers = [...new Set(filteredOrders.map(order => order.userId))].length;
  const itemsSold = filteredOrderedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSales = filteredOrders.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
  const pendingOrders = filteredOrders.filter(order => order.status === 'Pending').length;

  // Line Chart: Revenue Over Time
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const revenueOverTime = filteredOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt);
    let key;

    if (timePeriod === 'Yearly') {
      key = date.getFullYear().toString();
    } else if (timePeriod === 'Monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (timePeriod === 'Weekly') {
      const week = getWeekNumber(date);
      key = `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
    } else if (timePeriod === 'Daily') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    acc[key] = (acc[key] || 0) + (order.finalAmount || 0);
    return acc;
  }, {});

  const lineLabels = Object.keys(revenueOverTime).sort();
  const lineData = lineLabels.map(key => revenueOverTime[key]);
  const maxRevenue = Math.max(...lineData, 0);
  const suggestedMax = timePeriod === 'Daily' 
    ? Math.ceil(maxRevenue / 100) * 100 + 100
    : Math.ceil(maxRevenue / 1000) * 1000 + 1000;

  const lineChartData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: lineData,
        backgroundColor: '#A5B4FC',
        borderColor: '#818CF8',
        borderWidth: 2,
        fill: false,
        pointRadius: timePeriod === 'Daily' ? 4 : 3,
      },
    ],
  };

  // Pie Chart: Ordered Items Status Distribution
  const itemStatusData = filteredOrderedItems.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(itemStatusData),
    datasets: [
      {
        label: 'Item Status',
        data: Object.values(itemStatusData),
        backgroundColor: [
          '#FF6F61', 
          '#10B981', 
          '#F59E0B', 
          '#2ECC71', 
          '#EF4444', 
          '#F97316', 
          '#DC2626', 
          '#B91C1C', 
          '#FB923C', 
          '#FBBF24', 
          '#EF4444', 
          '#7F1D1D', 
        ],
        borderColor: [
          '#E15548', 
          '#065F46', 
          '#B45309', 
          '#27AE60', 
          '#991B1B', 
          '#C2410C', 
          '#991B1B', 
          '#7F1D1D', 
          '#C2410C', 
          '#B45309', 
          '#991B1B', 
          '#7F1D1D', 
        ],
        borderWidth: 1,
      },
    ],
  };

  // Donut Chart: Order Payment Type Distribution
  const paymentTypeData = filteredOrders.reduce((acc, order) => {
    const type = order.paymentMethod || 'Unknown'; 
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const donutChartData = {
    labels: Object.keys(paymentTypeData),
    datasets: [
      {
        label: 'Payment Type',
        data: Object.values(paymentTypeData),
        backgroundColor: [
          '#FF7C7C', 
          '#5EEAD4', 
          '#76C7F2', 
          '#D1D5DB', 
        ],
        borderColor: [
          '#DC2626', 
          '#0F766E', 
          '#2563EB', 
          '#6B7280', 
        ],
        borderWidth: 1,
        cutout: '60%', 
      },
    ],
  };

  // Bar Chart: Revenue by Month and Category
  const monthlyRevenueData = filteredOrderedItems.reduce((acc, item) => {
    const date = new Date(item.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const revenue = (item.price || 0) * (item.quantity || 0);

    let category = 'Other';
    if (item.name.toLowerCase().includes('sunscreen')) category = 'sunScreen';
    else if (item.name.toLowerCase().includes('toner')) category = 'Tooner';
    else if (item.name.toLowerCase().includes('serum')) category = 'Serum';

    if (!acc[monthKey]) {
      acc[monthKey] = { sunScreen: 0, Tooner: 0, Serum: 0, Other: 0 };
    }
    acc[monthKey][category] += revenue;
    return acc;
  }, {});

  const months = Object.keys(monthlyRevenueData).sort();
  const barChartData = {
    labels: months,
    datasets: [
      {
        label: 'SunScreen',
        data: months.map(month => monthlyRevenueData[month].sunScreen),
        backgroundColor: '#4F46E5',
        borderColor: '#312E81',
        borderWidth: 1,
      },
      {
        label: 'Tooner',
        data: months.map(month => monthlyRevenueData[month].Tooner),
        backgroundColor: '#10B981',
        borderColor: '#065F46',
        borderWidth: 1,
      },
      {
        label: 'Serum',
        data: months.map(month => monthlyRevenueData[month].Serum),
        backgroundColor: '#F59E0B',
        borderColor: '#B45309',
        borderWidth: 1,
      },
      {
        label: 'Other',
        data: months.map(month => monthlyRevenueData[month].Other),
        backgroundColor: '#EF4444',
        borderColor: '#991B1B',
        borderWidth: 1,
      },
    ],
  };

  // Recent Orders (Top 5 by Date)
  const recentOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Top Products by Total Amount Generated
  const topProducts = Object.values(
    filteredOrderedItems.reduce((acc, item) => {
      const productName = item.name;
      if (!acc[productName]) {
        acc[productName] = {
          productName,
          totalQuantitySold: 0,
          totalAmountGenerated: 0,
        };
      }
      acc[productName].totalQuantitySold += item.quantity || 0;
      acc[productName].totalAmountGenerated += (item.price || 0) * (item.quantity || 0);
      return acc;
    }, {})
  )
    .sort((a, b) => b.totalAmountGenerated - a.totalAmountGenerated)
    .slice(0, 5);

  // Ordered Items for the Selected Order (for Modal)
  const getOrderedItemsForOrder = (orderId) => {
    return filteredOrderedItems.filter(item => item.orderId.toString() === orderId.toString());
  };

  const pieChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
      },
    },
    maintainAspectRatio: false,
  };

  const donutChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
      },
    },
    maintainAspectRatio: false,
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#FFFFFF',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
      },
    },
    scales: {
      x: {
        ticks: { color: '#D1D5DB' },
        grid: { display: false },
      },
      y: {
        ticks: { 
          color: '#D1D5DB',
          stepSize: timePeriod === 'Daily' ? 100 : 1000,
        },
        grid: { color: '#374151' },
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: '#D1D5DB',
        },
        suggestedMax: suggestedMax,
      },
    },
  };

  const barChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#D1D5DB',
          font: { size: 14 },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#FFFFFF',
        bodyColor: '#D1D5DB',
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: '#D1D5DB' },
        grid: { display: false },
      },
      y: {
        stacked: true,
        ticks: { color: '#D1D5DB' },
        grid: { color: '#374151' },
        title: {
          display: true,
          text: 'Revenue (₹)',
          color: '#D1D5DB',
        },
      },
    },
    maintainAspectRatio: false,
  };

  const productOffset = currentProductPage * itemsPerPage;
  const currentProducts = filteredOrderedItems.slice(productOffset, productOffset + itemsPerPage);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className='flex-1 p-4 sm:p-6 md:p-8'>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
        </div>

        {/* Filtering Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Filter Data</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <label className="text-gray-400 mr-2">Select Range:</label>
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="All Time">All Time</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-gray-400 mr-2">Time Period:</label>
              <select
                value={timePeriod}
                onChange={handleTimePeriodChange}
                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Yearly">Yearly</option>
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-gray-400 mr-2">Category:</label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {dateRange === 'Custom' && (
              <div className="flex gap-4">
                <div>
                  <label className="text-gray-400 mr-2">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="text-gray-400 mr-2">End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleFilter}
                className="px-4 py-2 text-white rounded hover:bg-[#aaDeB0] transition-colors"
                style={{ backgroundColor: '#00D5BE' }}
              >
                Search
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 text-white rounded hover:bg-[#aaDeB0] transition-colors"
                style={{ backgroundColor: '#00D5BE' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Total Users</h2>
            <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Items Sold</h2>
            <p className="text-3xl font-bold text-white mt-2">{itemsSold}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Total Sales</h2>
            <p className="text-3xl font-bold text-white mt-2">₹{totalSales}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center">
            <h2 className="text-lg font-medium text-gray-400">Pending Orders</h2>
            <p className="text-3xl font-bold text-white mt-2">{pendingOrders}</p>
          </div>
        </div>

        {/* First Row: Line Chart and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Line Chart: Revenue Over Time */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-white mb-4">Revenue Over Time</h2>
            <div style={{ height: '300px' }}>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Pie Chart: Ordered Items Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-white mb-4">Ordered Items Status Distribution</h2>
            <div style={{ height: '300px' }}>
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* Second Row: Donut Chart and Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Donut Chart: Order Payment Type Distribution */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-white mb-4">Order Payment Type Distribution</h2>
            <div style={{ height: '300px' }}>
              <Doughnut data={donutChartData} options={donutChartOptions} />
            </div>
          </div>

          {/* Bar Chart: Revenue by Month and Category */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-lg font-medium text-white mb-4">Revenue by Month and Category</h2>
            <div style={{ height: '300px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Recent Orders */}
          <div className="bg-gray-800 p-6 col-span-3 rounded-lg">
            <h2 className="text-lg font-medium text-white mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-2 px-4 text-gray-400">Order ID</th>
                    <th className="py-2 px-4 text-gray-400">User Name</th>
                    <th className="py-2 px-4 text-gray-400">Date</th>
                    <th className="py-2 px-4 text-gray-400">Amount</th>
                    <th className="py-2 px-4 text-gray-400">Status</th>
                    <th className="py-2 px-4 text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="py-2 px-4 text-white">{order.orderId.slice(0,13)}</td>
                      <td className="py-2 px-4 text-white">{order?.userId?.userName || order.userId || 'Unknown'}</td>
                      <td className="py-2 px-4 text-white">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-4 text-white">₹{order.finalAmount || 0}</td>
                      <td className="py-2 px-4 text-white">{order.status}</td>
                      <td className="py-2 px-4 text-white">
                        <button
                          onClick={() => openModal(order)}
                          className="px-3 py-1 text-white rounded hover:bg-[#aaDeB0] transition-colors"
                          style={{ backgroundColor: '#00D5BE' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gray-800 !h-auto p-6 col-span-2 rounded-lg">
            <h2 className="text-lg font-medium text-white mb-4">Top Products</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="py-2 px-4 text-gray-400">Product</th>
                    <th className="py-2 px-4 text-gray-400">Quantity</th>
                    <th className="py-2 px-4 text-gray-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-t border-gray-700">
                      <td className="py-2 px-4 text-white">{product.productName.slice(0,20)}..</td>
                      <td className="py-2 px-4 text-white">{product.totalQuantitySold}</td>
                      <td className="py-2 px-4 text-white">₹{product.totalAmountGenerated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal for Order Details */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Order Details</h2>
              <div className="text-white mb-4">
                <p><strong>Order ID:</strong> {selectedOrder._id}</p>
                <p><strong>User Name:</strong> {selectedOrder.userId.userName || selectedOrder.userId || 'Unknown'}</p>
                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p><strong>Amount:</strong> ₹{selectedOrder.finalAmount || 0}</p>
                <p><strong>Status:</strong> {selectedOrder.status}</p>
                <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Unknown'}</p>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Ordered Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="py-2 px-4 text-gray-400">Product Name</th>
                      <th className="py-2 px-4 text-gray-400">Quantity</th>
                      <th className="py-2 px-4 text-gray-400">Price</th>
                      <th className="py-2 px-4 text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getOrderedItemsForOrder(selectedOrder._id).map((item, index) => (
                      <tr key={index} className="border-t border-gray-700">
                        <td className="py-2 px-4 text-white">{item.name}</td>
                        <td className="py-2 px-4 text-white">{item.quantity}</td>
                        <td className="py-2 px-4 text-white">₹{item.price || 0}</td>
                        <td className="py-2 px-4 text-white">₹{(item.price || 0) * (item.quantity || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-white rounded hover:bg-gray-600 transition-colors"
                  style={{ backgroundColor: '#4B5563' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
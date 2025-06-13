import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Admin.sidebar';
import ReactPaginate from 'react-paginate';
import { useNavigate } from 'react-router-dom';
import { 
    fetchOrders, 
    downloadSalesReport,
    downloadTestPdf,
} from "@/Services/Admin/Sales/Sales.jsx";
import { toast } from "react-toastify";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SalesReport = () => {
    const [currentPage, setCurrentPage] = useState(0);
    const [statusCurrentPage, setStatusCurrentPage] = useState(0);
    const [dateRange, setDateRange] = useState('Daily');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [summary, setSummary] = useState({
        overallSalesCount: 0,
        overallOrderAmount: 0,
        overallDiscount: 0
    });
    const [statusFilter, setStatusFilter] = useState('Completed');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const itemsPerPage = 5;

    // Filter orders by status category
    const getFilteredOrdersByStatus = () => {
        const statusMap = {
            Active: ['Pending', 'Shipped'],
            Completed: ['Delivered'],
            'Cancelled/Returned': ['Cancelled', 'Returned', 'Return Requested',"Order Returned"]
        };

        return filteredOrders.filter(order => 
            statusMap[statusFilter].includes(order.status)
        );
    };

    const pageCount = filteredOrders.length ? Math.ceil(filteredOrders.length / itemsPerPage) : 0;
    const statusPageCount = filteredOrders.length ? Math.ceil(getFilteredOrdersByStatus().length / itemsPerPage) : 0;

    const fetchSalesReport = async () => {
        setLoading(true);
        setError(null);
        const params = { range: dateRange };
        if (dateRange === 'Custom') {
            params.startDate = startDate;
            params.endDate = endDate;
        }

        try {
            const response = await fetchOrders(params);
            if (!response || !response.data) {
                throw new Error('Failed to fetch sales report');
            }

            setFilteredOrders(response.data.orders || []);
            setSummary(response.data.summary || {
                overallSalesCount: 0,
                overallOrderAmount: 0,
                overallDiscount: 0
            });
            setCurrentPage(0);
            setStatusCurrentPage(0);
        } catch (error) {
            console.error('Error fetching sales report:', error);
            setError('Failed to fetch sales report');
            setFilteredOrders([]);
            setSummary({
                overallSalesCount: 0,
                overallOrderAmount: 0,
                overallDiscount: 0
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (format) => {
        const params = { range: dateRange };
        if (dateRange === 'Custom') {
            if (!startDate || !endDate) {
                toast.error('Please select both start and end dates for custom range.');
                return;
            }
            params.startDate = startDate;
            params.endDate = endDate;
        }

        try {
            const response = await downloadSalesReport(format, params);
            if (!response || !response.data) {
                throw new Error(`Failed to download ${format.toUpperCase()} report`);
            }

            // Create a blob from the response data
            const blob = new Blob([response.data], {
                type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sales-report.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`${format.toUpperCase()} report downloaded successfully`);
        } catch (error) {
            console.error(`Error downloading ${format} report:`, error);
            toast.error(`Failed to download ${format.toUpperCase()} report`);
        }
    };

    useEffect(() => {
        fetchSalesReport();
    }, [dateRange, startDate, endDate]);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleStatusPageClick = ({ selected }) => {
        setStatusCurrentPage(selected);
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
        if (e.target.value !== 'Custom') {
            setStartDate('');
            setEndDate('');
        }
    };

    const handleSearch = () => {
        if (dateRange === 'Custom' && (!startDate || !endDate)) {
            toast.error('Please select both start and end dates for custom range.');
            return;
        }
        fetchSalesReport();
    };

    const handleClear = () => {
        setDateRange('Daily');
        setStartDate('');
        setEndDate('');
        setStatusFilter('Completed');
        setStatusCurrentPage(0);
    };

    const statusFilteredOrders = getFilteredOrdersByStatus();
    const statusOffset = statusCurrentPage * itemsPerPage;
    const statusCurrentItems = statusFilteredOrders.slice(statusOffset, statusOffset + itemsPerPage);

    // Prepare pie chart data
    const paymentMethodCounts = statusFilteredOrders.reduce((acc, order) => {
        const method = order.paymentMethod?.toLowerCase();
        if (['wallet', 'cod', 'razorpay'].includes(method)) {
            acc[method] = (acc[method] || 0) + 1;
        }
        return acc;
    }, { wallet: 0, cod: 0, razorpay: 0 });

    const pieChartData = {
        labels: ['Wallet', 'COD', 'Razorpay'],
        datasets: [
            {
                data: [
                    paymentMethodCounts.wallet,
                    paymentMethodCounts.cod,
                    paymentMethodCounts.razorpay
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }
        ]
    };

    const offset = currentPage * itemsPerPage;
    const currentItems = filteredOrders.slice(offset, offset + itemsPerPage);

    return (
        <div className="flex min-h-screen bg-gray-900">
            <Sidebar />

            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-semibold text-white">Sales Report</h1>
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                </div>

                {/* Filtering Section */}
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Filter Sales</h2>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <label className="text-gray-400 mr-2">Select Range:</label>
                            <select
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-teal-600"
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Yearly">Yearly</option>
                                <option value="Custom">Custom</option>
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
                                        className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-teal-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 mr-2">End Date:</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-teal-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleSearch}
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

                {/* Sales Summary */}
                {loading ? (
                    <div className="text-center text-white">Loading...</div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h2 className="text-lg font-medium text-gray-400">Overall Sales Count</h2>
                                <p className="text-3xl font-bold text-white mt-2">{summary.overallSalesCount}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h2 className="text-lg font-medium text-gray-400">Overall Order Amount</h2>
                                <p className="text-3xl font-bold text-white mt-2">₹{summary.overallOrderAmount.toFixed(2)}</p>
                            </div>
                            <div className="bg-gray-800 p-6 rounded-lg text-center">
                                <h2 className="text-lg font-medium text-gray-400">Overall Discount</h2>
                                <p className="text-3xl font-bold text-white mt-2">₹{summary.overallDiscount.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Orders Table */}
                        <div className="bg-gray-800 rounded-lg p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-white">All Orders</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownload('pdf')}
                                        className="px-4 py-2 text-white rounded hover:bg-[#aaDeB0] transition-colors"
                                        style={{ backgroundColor: '#00D5BE' }}
                                    >
                                        Download as PDF
                                    </button>
                                    <button
                                        onClick={() => handleDownload('xlsx')}
                                        className="px-4 py-2 text-white rounded hover:bg-[#aaDeB0] transition-colors"
                                        style={{ backgroundColor: '#00D5BE' }}
                                    >
                                        Download as Excel
                                    </button>
                                </div>
                            </div>
                            {filteredOrders.length === 0 ? (
                                <div className="text-center text-gray-400">No orders found.</div>
                            ) : (
                                <>
                                    <table className="w-full text-left text-gray-400">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="py-3 px-4">ORDER ID</th>
                                                <th className="py-3 px-4">CUSTOMER NAME</th>
                                                <th className="py-3 px-4">DATE</th>
                                                <th className="py-3 px-4">AMOUNT</th>
                                                <th className="py-3 px-4">DISCOUNT</th>
                                                <th className="py-3 px-4">COUPON DEDUCTION</th>
                                                <th className="py-3 px-4">PAYMENT METHOD</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-center">
                                            {currentItems.map((order) => (
                                                <tr key={order.id} className="border-b border-gray-700">
                                                    <td className="py-3 px-4">{order.orderId}</td>
                                                    <td className="py-3 px-4">{order.userId?.userName || 'N/A'}</td>
                                                    <td className="py-3 whitespace-nowrap px-4">{order.createdAt.split('T')[0]}</td>
                                                    <td className="py-3 px-4">₹{order.paymentAmount?.toFixed(2)}</td>
                                                    <td className="py-3 px-4">₹{order.offerDiscount?.toFixed(2)}</td>
                                                    <td className="py-3 px-4">₹{order.couponDiscount?.toFixed(2)}</td>
                                                    <td className="py-3 px-4">{order.paymentMethod?.toLowerCase() || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Pagination */}
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
                                            activeClassName={'bg-teal-600'}
                                            previousClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
                                            nextClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
                                            breakClassName={'px-3 py-1 text-white'}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Status-Filtered Table and Pie Chart */}
                        <div className="grid grid-cols-3 lg:grid-cols-[2fr,3fr] gap-6">
                            {/* Status-Filtered Table */}
                            <div className="bg-gray-800 col-span-2 rounded-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-white">Orders by Status</h2>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => {
                                            setStatusFilter(e.target.value);
                                            setStatusCurrentPage(0);
                                        }}
                                        className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-teal-600"
                                    >
                                        <option value="Active">Active (Pending, Shipped)</option>
                                        <option value="Completed">Completed (Delivered)</option>
                                        <option value="Cancelled/Returned">Cancelled/Returned</option>
                                    </select>
                                </div>
                                {statusFilteredOrders.length === 0 ? (
                                    <div className="text-center text-gray-400">No orders found for this status.</div>
                                ) : (
                                    <>
                                        <table className="w-full text-left text-gray-400">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="py-3 px-4">ORDER ID</th>
                                                    <th className="py-3 px-4">CUSTOMER NAME</th>
                                                    <th className="py-3 px-4">DATE</th>
                                                    <th className="py-3 px-4">AMOUNT</th>
                                                    <th className="py-3 px-4">STATUS</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-center">
                                                {statusCurrentItems.map((order) => (
                                                    <tr key={order.id} className="border-b border-gray-700">
                                                        <td className="py-3 px-4">{order.orderId}</td>
                                                        <td className="py-3 px-4">{order.userId?.userName || 'N/A'}</td>
                                                        <td className="py-3 whitespace-nowrap px-4">{order.createdAt.split('T')[0]}</td>
                                                        <td className="py-3 px-4">₹{order.paymentAmount?.toFixed(2)}</td>
                                                        <td className="py-3 px-4">{order.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Status Table Pagination */}
                                        <div className="mt-6 flex justify-center">
                                            <ReactPaginate
                                                previousLabel={'<'}
                                                nextLabel={'>'}
                                                breakLabel={'...'}
                                                pageCount={statusPageCount}
                                                marginPagesDisplayed={2}
                                                pageRangeDisplayed={3}
                                                onPageChange={handleStatusPageClick}
                                                containerClassName={'flex space-x-2'}
                                                pageClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
                                                activeClassName={'bg-teal-600'}
                                                previousClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
                                                nextClassName={'px-3 py-1 rounded bg-gray-700 text-white'}
                                                breakClassName={'px-3 py-1 text-white'}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Pie Chart */}
                            <div className="bg-gray-800 max-h-fit rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Payment Method Distribution</h2>
                                {statusFilteredOrders.length === 0 ? (
                                    <div className="text-center text-gray-400">No data available for chart.</div>
                                ) : (
                                    <div className="flex justify-center">
                                        <div style={{ maxWidth: '400px' }}>
                                            <Pie
                                                data={pieChartData}
                                                options={{
                                                    responsive: true,
                                                    plugins: {
                                                        legend: {
                                                            position: 'bottom',
                                                            labels: { color: 'white' }
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: (context) => `${context.label}: ${context.raw} orders`
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SalesReport;
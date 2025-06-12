const orderModel = require('../../../Model/order'); 
const httpStatus = require('../../../Config/HTTPstatusCodes');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const fs = require('fs');

const validateInput = (range, startDate, endDate, res) => {
    const validRanges = ['Daily', 'Weekly', 'Yearly', 'Custom'];

    if (!range || !validRanges.includes(range)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            mission: "failed",
            message: "Invalid range parameter"
        });
    }

    if (range === 'Custom') {
        if (!startDate || !endDate) {
            return res.status(httpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Start date and end date are required for custom range"
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(httpStatus.BAD_REQUEST).json({
                mission: "failed",
                message: "Invalid date format"
            });
        }
    }

    return null;
};


const buildDateFilter = (range, startDate, endDate) => {
    let dateFilter = {};

    const now = new Date().toISOString().slice(0,19); 
    const today = new Date(now);

    if (range === 'Daily') {
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        dateFilter = {
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        };
    } else if (range === 'Weekly') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        dateFilter = {
            createdAt: { $gte: startOfWeek, $lte: endOfWeek }
        };
    } else if (range === 'Yearly') {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        dateFilter = {
            createdAt: { $gte: startOfYear, $lte: endOfYear }
        };
    } else if (range === 'Custom') {
        dateFilter = {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        };
    }

    return dateFilter;
};


const fetchOrders = async (dateFilter) => {
    return await orderModel.find(dateFilter)
        .populate("userId", "userName")
        .lean();
};


const calculateSummaryMetrics = (orders) => {
    const overallSales = orders.length;
    const overallAmount = orders.reduce((acc, val) => acc + (val.paymentAmount || 0), 0);
    const overallDiscount = orders.reduce(
        (acc, val) => acc + (val.offerDiscount || 0) + (val.couponDiscount || 0),
        0
    );

    return {
        overallSalesCount: overallSales,
        overallOrderAmount: overallAmount,
        overallDiscount: overallDiscount
    };
};


const formatOrders = (orders) => {
    return orders.reverse().map(order => ({
        id: order._id,
        orderId: order.orderId,
        userId: {
            userName: order.userId?.userName || 'Unknown'
        },
        createdAt: order.createdAt.toISOString(),
        paymentAmount: order.paymentAmount || 0,
        offerDiscount: order.offerDiscount || 0,
        couponDiscount: order.couponDiscount || 0,
        status: order.status,
        paymentMethod: order.paymentMethod
    }));
};


const sendSuccessResponse = (res, orders, summary) => {
    return res.status(httpStatus.OK).json({
        mission: "success",
        message: "Orders fetched successfully",
        orders,
        summary
    });
};


const sendErrorResponse = (res, error) => {
    console.log(error.message);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        mission: "failed",
        message: "Server Error",
        Error: error.message
    });
};


const downloadSalesReportPDF = async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;

        const validationError = validateInput(range, startDate, endDate, res);
        if (validationError) return validationError;

        const dateFilter = buildDateFilter(range, startDate, endDate);
        const rawOrders = await fetchOrders(dateFilter);
        const orders = formatOrders(rawOrders);

        const summary = calculateSummaryMetrics(orders);

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=sales-report-${range}-${new Date().toISOString().split('T')[0]}.pdf`);
            res.setHeader('Content-Length', pdfData.length);
            res.end(pdfData);
        });

        // Title
        doc.fontSize(20).font('Helvetica-Bold').text('Sales Report', { align: 'center' });
        doc.moveDown(1);

        // Summary
        doc.fontSize(14).font('Helvetica-Bold').text('Summary', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica')
            .text(`Overall Sales Count: ${summary.overallSalesCount}`)
            .moveDown(0.5)
            .text(`Overall Order Amount: ₹${summary.overallOrderAmount.toFixed(2)}`)
            .moveDown(0.5)
            .text(`Overall Discount: ₹${summary.overallDiscount.toFixed(2)}`);
        doc.moveDown(1);

        // Define table headers and widths
        const headers = [
            'Order ID', 'Customer', 'Date',
            'Amount', 'Discount', 'Coupon',
            'Status', 'Payment'
        ];

        const columnWidths = [70, 70, 60, 60, 60, 60, 55, 60];
        const startX = 50;
        let y = doc.y;

        const drawHeaders = () => {
            let x = startX;
            doc.fontSize(10).font('Helvetica-Bold');
            headers.forEach((header, i) => {
                doc.text(header, x, y, {
                    width: columnWidths[i],
                    align: 'center',
                    continued: false
                });
                x += columnWidths[i];
            });
            y += 25;
            doc.font('Helvetica');
        };

        drawHeaders();

        if (orders.length === 0) {
            doc.text('No orders found for the selected range.', startX, y + 10);
        } else {
            for (const order of orders) {
                // Add new page if content exceeds height
                if (y > 750) {
                    doc.addPage();
                    y = 100;
                    drawHeaders();
                }

                let x = startX;
                const row = [
                    order.orderId?.slice(0, 16) || '-',
                    order.userId?.userName || 'Unknown',
                    new Date(order.createdAt).toISOString().split('T')[0],
                    `₹${(order.paymentAmount || 0).toFixed(2)}`,
                    `₹${(order.offerDiscount || 0).toFixed(2)}`,
                    `₹${(order.couponDiscount || 0).toFixed(2)}`,
                    order.status || '-',
                    order.paymentMethod || '-'
                ];

                row.forEach((cell, i) => {
                    doc.text(cell, x, y, {
                        width: columnWidths[i],
                        align: 'center',
                        continued: false
                    });
                    x += columnWidths[i];
                });

                y += 25;
            }
        }

        doc.end();
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};


const downloadSalesReportExcel = async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        
        const validationError = validateInput(range, startDate, endDate, res);
        if (validationError) return validationError;
        
        const dateFilter = buildDateFilter(range, startDate, endDate);
        const orders = await fetchOrders(dateFilter);
        console.log('Fetched orders for Excel:', orders);
        
        const summary = calculateSummaryMetrics(orders);
        console.log('Summary for Excel:', summary);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add summary
        worksheet.addRow(['Sales Report']).font = { bold: true, size: 16 };
        worksheet.addRow([]);
        worksheet.addRow(['Summary']).font = { bold: true };
        worksheet.addRow(['Overall Sales Count', summary.overallSalesCount]);
        worksheet.addRow(['Overall Order Amount', `₹${summary.overallOrderAmount.toFixed(2)}`]);
        worksheet.addRow(['Overall Discount', `₹${summary.overallDiscount.toFixed(2)}`]);
        worksheet.addRow([]);

        // Define columns
        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 20 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'Date', key: 'date', width: 15 },
            { header: 'Amount', key: 'amount', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Coupon Deduction', key: 'couponDeduction', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 }
        ];

        // Add rows
        if (orders.length === 0) {
            worksheet.addRow(['No orders found for the selected range.']);
        } else {
            orders.forEach(order => {
                worksheet.addRow({
                    orderId: order.orderId.slice(0, 17),
                    customerName: order.userId?.userName || 'Unknown',
                    date: order.createdAt.toISOString().split('T')[0],
                    amount: `₹${(order.paymentAmount || 0).toFixed(2)}`,
                    discount: `₹${(order.offerDiscount || 0).toFixed(2)}`,
                    couponDeduction: `₹${(order.couponDiscount || 0).toFixed(2)}`,
                    status: order.status,
                    paymentMethod: order.paymentMethod
                });
            });
        }

        // Style the header row (row 8 due to summary rows above)
        const headerRow = worksheet.getRow(8);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Style the data rows
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 8) { 
                row.eachCell((cell) => {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            }
        });

        const buffer = await workbook.xlsx.writeBuffer();
        fs.writeFileSync('test.xlsx', buffer);
        console.log('Excel buffer length:', buffer.length);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=sales-report-${range}-${new Date().toISOString().split('T')[0]}.xlsx`);
        res.setHeader('Content-Length', buffer.length);

        res.end(buffer, 'binary');
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

const getSalesReport = async (req, res) => {
    try {
        const { range, startDate, endDate } = req.query;
        console.log("The range",range);

        const validationError = validateInput(range, startDate, endDate, res);
        if (validationError) return validationError;

        const dateFilter = buildDateFilter(range, startDate, endDate);

        const orders = await fetchOrders(dateFilter);

        const summary = calculateSummaryMetrics(orders);

        const formattedOrders = formatOrders(orders);

        return sendSuccessResponse(res, formattedOrders, summary);
    } catch (error) {
        return sendErrorResponse(res, error);
    }
};

module.exports = { 
    getSalesReport, 
    downloadSalesReportPDF, 
    downloadSalesReportExcel 
};
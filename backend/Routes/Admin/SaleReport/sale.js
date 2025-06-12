const express = require("express");
const router = express.Router();

const { 
    getSalesReport,
    downloadSalesReportPDF,
    downloadSalesReportExcel,
} = require("../../../Controller/admin/Sales/sale.js");

router.get('/fetch-reports', getSalesReport);

router.get('/sales-report/download/pdf',downloadSalesReportPDF);

router.get('/sales-report/download/xlsx',downloadSalesReportExcel);




module.exports = router;
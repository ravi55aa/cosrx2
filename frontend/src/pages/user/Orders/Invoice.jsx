import { forwardRef, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import "aos/dist/aos.css";
import AOS from "aos";
import HeaderSection from "@/components/HeaderSection";
import Footer from "@/components/Footer";
import { getInvoiceOfOrder } from "@/Services/User/Order/Invoice.jsx";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";

const Invoice = forwardRef((props, ref) => {
    const navigate = useNavigate();
    const { order_Id } = useParams();
    const [invoiceData, setInvoiceData] = useState(null);
    const [offersOfProducts, setOffers] = useState([]);
    const [error, setError] = useState(null);
    const invoiceElement = useRef(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    useEffect(() => {
        const fetchInvoiceData = async () => {
            try {
                const response = await getInvoiceOfOrder(order_Id);
                if (!response || !response.data?.invoice) {
                    setError("Failed to fetch invoice data");
                    return;
                }
                setInvoiceData(response?.data?.invoice);
                setOffers(response?.data?.offersOfProducts || []);
            } catch (err) {
                setError("Error fetching invoice: " + err.message);
            }
        };

        if (order_Id) {
            fetchInvoiceData();
        }
    }, [order_Id]);

    const calculateTaxDetails = (item) => {
        if (item.status !== "Delivered") {
            return { grossAmount: 0, discount: 0, taxableValue: 0, gst: 0, total: 0 };
        }

        const quantity = item?.quantity || 0;
        const product = item?.product;
        const salePrice = Number(product?.salePrice) || 0;
        const itemPrice = Number(item?.price) || salePrice;

        const grossAmount = salePrice * quantity;
        const discount = (salePrice - itemPrice) * quantity;
        const taxableValue = itemPrice * quantity;
        const gst = taxableValue * 0.02; // 2% GST
        const total = taxableValue + gst;

        return { grossAmount, discount, taxableValue, gst, total };
    };

    const calculateSummary = () => {
        let grossTotal = 0;
        let discountTotal = 0;
        let taxableTotal = 0;
        let gstTotal = 0;
        let finalTotal = 0;
        let deliveredItems = 0;
        let allDelivered = true;

        if (!invoiceData?.orderItems?.length) {
            return {
                grossTotal: 0,
                discountTotal: 0,
                taxableTotal: 0,
                gstTotal: 0,
                finalTotal: 0,
                deliveredItems: 0,
                allDelivered: false,
            };
        }

        invoiceData.orderItems.forEach((item) => {
            if (item.status !== "Delivered") {
                allDelivered = false;
                return;
            }
            deliveredItems += 1;
            const { grossAmount, discount, taxableValue, gst, total } = calculateTaxDetails(item);
            grossTotal += grossAmount;
            discountTotal += discount;
            taxableTotal += taxableValue;
            gstTotal += gst;
            finalTotal += total;
        });

        if (deliveredItems < 1 && ["Pending", "Shipped"].includes(invoiceData?.order?.status)) {
            grossTotal = 0;
            discountTotal = 0;
            taxableTotal = 0;
            gstTotal = 0;
            finalTotal = 0;
            allDelivered = false;
        }

        return {
            grossTotal,
            discountTotal,
            taxableTotal,
            gstTotal,
            finalTotal,
            deliveredItems,
            allDelivered,
        };
    };

    const {
        grossTotal,
        discountTotal,
        taxableTotal,
        gstTotal,
        finalTotal,
        deliveredItems,
        allDelivered,
    } = invoiceData
        ? calculateSummary()
        : {
              grossTotal: 0,
              discountTotal: 0,
              taxableTotal: 0,
              gstTotal: 0,
              finalTotal: 0,
              deliveredItems: 0,
              allDelivered: false,
          };

    const platformFee = Number(invoiceData?.order?.platformFee) || 0;
    const shippingFee = Number(invoiceData?.order?.shippingFee) || 0;
    const couponDiscount = Number(invoiceData?.order?.couponDiscount) || 0;
    const grandTotal = finalTotal > 0
        ? (finalTotal + shippingFee + platformFee - couponDiscount).toFixed(2)
        : "0.00";

    const handleDownloadInvoice = async () => {
        if (!order_Id) {
            toast.info("No invoice data available to download");
            return;
        }

        try {
            const element = invoiceElement.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight * ratio);
            pdf.save(`invoice-${order_Id}.pdf`);

            const swalSuccess = await Swal.fire({
                title: order_Id,
                text: `Download invoice ${order_Id}`,
                icon: "success",
                showCloseButton: true,
            });

            if (swalSuccess.isConfirmed) {
                window.history.back();
            }

            return true;
        } catch (err) {
            console.error("Error generating PDF:", err.message);
            toast.error("Failed to download invoice");
            return false;
        }
    };

    if (error) {
        return (
            <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
                <HeaderSection />
                <section className="py-16" style={{ backgroundColor: "#ffffff" }}>
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <p style={{ color: "#ff2a05" }}>{error}</p>
                        <button
                            className="mt-4 py-2 px-4 rounded-md text-white transition-colors"
                            style={{
                                backgroundColor: "#016086",
                                ":hover": { backgroundColor: "rgba(1, 96, 134, 0.8)" },
                            }}
                            onClick={() => navigate("/user/orders")}
                        >
                            Back to Orders
                        </button>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    if (!invoiceData) {
        return (
            <div className="min-h-screen hidden" style={{ backgroundColor: "#a1aaaa" }}>
                <HeaderSection />
                <section className="py-16" style={{ backgroundColor: "#a1aaaa" }}>
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <p style={{ color: "#111111" }}>Loading invoice...</p>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    return (
        <div className="h-fit" style={{ backgroundColor: "#f9fafb" }}>
            <motion.button
                className="py-2 px-4 my-5 flex bg-teal-600 justify-self-center text-white rounded-md hover:bg-teal-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadInvoice}
            >
                Download Invoice
            </motion.button>
            <section
                ref={invoiceElement}
                className="py-16"
                style={{
                    width: "794px",
                    minHeight: "1123px",
                    margin: "0 auto",
                    backgroundColor: "#ffffff",
                }}
            >
                <div className="max-w-4xl mx-auto px-4">
                    <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: "#ffffff" }}>
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold" data-aos="fade-up">
                                INVOICE
                            </h2>
                        </div>

                        {/* Order Details */}
                        <div
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                            data-aos="fade-up"
                            data-aos-delay="200"
                        >
                            <div>
                                <p style={{ color: "#1f2937" }}>
                                    <span className="font-semibold">Order ID:</span>{" "}
                                    {invoiceData?.order?.orderId || "N/A"}
                                </p>
                                <p style={{ color: "#1f2937" }}>
                                    <span className="font-semibold">Order Date:</span>{" "}
                                    {invoiceData.order?.createdAt
                                        ? new Date(invoiceData.order.createdAt).toLocaleDateString()
                                        : "N/A"}
                                </p>
                                <p style={{ color: "#1f2937" }}>
                                    <span className="font-semibold">Invoice Date:</span>{" "}
                                    {invoiceData.order?.createdAt
                                        ? new Date(invoiceData.order.createdAt).toLocaleDateString()
                                        : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p style={{ color: "#1f2937" }}>
                                    <span className="font-semibold">PAN:</span>{" "}
                                    {invoiceData.order?.orderId?.split("-")[1] || "N/A"}
                                </p>
                                <p style={{ color: "#1f2937" }}>
                                    <span className="font-semibold">GSTIN:</span> 27AAGFT9023N2ZM
                                </p>
                            </div>
                            <div>
                                <p style={{ color: "#1f2937" }}>
                                    <span className="font-semibold">Total Items:</span>{" "}
                                    {deliveredItems}
                                </p>
                            </div>
                        </div>

                        {/* Bill To and Ship To */}
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                            data-aos="fade-up"
                            data-aos-delay="300"
                        >
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "#1f2937" }}>
                                    Bill To
                                </h3>
                                <p style={{ color: "#1f2937" }}>
                                    {invoiceData.order?.userId?.firstName || "N/A"}
                                </p>
                                <p className="text-sm" style={{ color: "#6b7280" }}>
                                    {invoiceData.orderAddress?.addressType || "N/A"}
                                </p>
                                <p className="text-sm" style={{ color: "#6b7280" }}>
                                    Phone: {invoiceData.orderAddress?.phone || "N/A"}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "#1f2937" }}>
                                    Ship To
                                </h3>
                                <p style={{ color: "#1f2937" }}>
                                    {invoiceData.order?.userId?.firstName || "N/A"}
                                </p>
                                <p className="text-sm" style={{ color: "#6b7280" }}>
                                    {invoiceData.orderAddress?.city || invoiceData.orderAddress?.addressType || "N/A"}
                                </p>
                                <p className="text-sm" style={{ color: "#6b7280" }}>
                                    Phone: {invoiceData.orderAddress?.phone || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="mb-6" data-aos="fade-up" data-aos-delay="400">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr style={{ backgroundColor: "#dbdbdb" }}>
                                        <th className="border p-2 text-left" style={{ color: "#242424" }}>
                                            Title
                                        </th>
                                        <th className="border p-2" style={{ color: "#242424" }}>
                                            Qty
                                        </th>
                                        <th className="border p-2" style={{ color: "#242424" }}>
                                            Gross Amount ₹
                                        </th>
                                        <th className="border p-2" style={{ color: "#242424" }}>
                                            Discount ₹
                                        </th>
                                        <th className="border p-2" style={{ color: "#242424" }}>
                                            Taxable Value ₹
                                        </th>
                                        <th className="border p-2" style={{ color: "#242424" }}>
                                            GST ₹
                                        </th>
                                        <th className="border p-2" style={{ color: "#242424" }}>
                                            Total ₹
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {deliveredItems > 0 ? (
                                        invoiceData.orderItems
                                            .filter((item) => item.status === "Delivered")
                                            .map((item, index) => {
                                                const { grossAmount, discount, taxableValue, gst, total } =
                                                    calculateTaxDetails(item);
                                                return (
                                                    <motion.tr
                                                        key={index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    >
                                                        <td className="border p-2" style={{ color: "#1f2937" }}>
                                                            {item?.product?.productName?.slice(0, 15) +
                                                                (item?.product?.productName?.length > 15 ? ".." : "")}
                                                        </td>
                                                        <td
                                                            className="border p-2 text-center"
                                                            style={{ color: "#1f2937" }}
                                                        >
                                                            {item?.quantity || 0}
                                                        </td>
                                                        <td
                                                            className="border p-2 text-center"
                                                            style={{ color: "#1f2937" }}
                                                        >
                                                            {grossAmount.toFixed(2)}
                                                        </td>
                                                        <td
                                                            className="border p-2 text-center"
                                                            style={{ color: "#1f2937" }}
                                                        >
                                                            {discount.toFixed(2)}
                                                        </td>
                                                        <td
                                                            className="border p-2 text-center"
                                                            style={{ color: "#1f2937" }}
                                                        >
                                                            {taxableValue.toFixed(2)}
                                                        </td>
                                                        <td
                                                            className="border p-2 text-center"
                                                            style={{ color: "#1f2937" }}
                                                        >
                                                            {gst.toFixed(2)}
                                                        </td>
                                                        <td
                                                            className="border p-2 text-center"
                                                            style={{ color: "#1f2937" }}
                                                        >
                                                            {total.toFixed(2)}
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="border p-2 text-center"
                                                style={{ color: "#1f2937" }}
                                            >
                                                No items found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Grand Total */}
                        <div className="flex justify-end mb-6" data-aos="fade-up" data-aos-delay="500">
                            <p className="font-semibold text-lg" style={{ color: "#1f2937" }}>
                                Grand Total: {allDelivered ? (
                                    <>
                                        <s>₹{grandTotal}</s>
                                        <span className="ml-2">₹{invoiceData.order.finalAmount.toFixed(2)}</span>
                                    </>
                                ) : (
                                    `₹${grandTotal}`
                                )}
                            </p>
                        </div>

                        {/* Authorized Signatory */}
                        <div className="flex justify-end" data-aos="fade-up" data-aos-delay="600">
                            <div className="text-right">
                                <p className="mb-4 italic" style={{ color: "#1f2937" }}>
                                    ravisha A
                                </p>
                                <p className="font-semibold" style={{ color: "#1f2937" }}>
                                    Authorized Signatory
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
});

export default Invoice;
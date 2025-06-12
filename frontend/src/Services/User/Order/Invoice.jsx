import axiosBaseUrl from "$/axios";
import {toast} from "react-toastify";
import {getUserId} from "../../Reusable";

export const getInvoiceOfOrder=async(order_Id)=>{
    try{
        const response = await axiosBaseUrl.get(`/order/invoice/${order_Id}`,{params:getUserId()});

        return response;
        
    } catch(err){
        toast(err?.response?.data.message);
        return false;
    }
}


//     "invoice": [
//         {
//             "order": {
//                 "_id": "680f3270ee6cb4a8d443ba20",
//                 "orderId": "ORD-1745826416897-045",
//                 "userId": "680b31d93915cfae1bd55a0c",
//                 "totalPrice": 5564,
//                 "orderType": "cod",
//                 "couponDiscount": 0,
//                 "offerDiscount": 0,
//                 "finalAmount": 4675,
//                 "paymentAmount": 4675,
//                 "status": "Pending",
//                 "couponApplied": false,
//                 "createdAt": "2025-04-28T07:46:56.897Z",
//                 "updatedAt": "2025-04-28T07:46:56.897Z",
//                 "__v": 0
//             }
//         },
//         {
//             "orderItems": [
//                 {
//                     "_id": "680f3270ee6cb4a8d443ba22",
//                     "orderId": "680f3270ee6cb4a8d443ba20",
//                     "product": "67ea4cc78cf89c6949de41f0",
//                     "quantity": 10,
//                     "price": 4490,
//                     "name": "Chemist at Play Gentle Exfoliating Face Toner - Glycolic & Mandelic Acid, Niacinamide & Kombucha Men & Women  (150 ml)",
//                     "status": "Pending",
//                     "createdAt": "2025-04-28T07:46:56.899Z",
//                     "updatedAt": "2025-04-28T07:46:56.899Z",
//                     "__v": 0
//                 },
//                 {
//                     "_id": "680f3270ee6cb4a8d443ba24",
//                     "orderId": "680f3270ee6cb4a8d443ba20",
//                     "product": "67ea53ce8cf89c6949de421e",
//                     "quantity": 3,
//                     "price": 675,
//                     "name": "Mamaearth Vitamin C Daily Glow Face Serum & Turmeric for Radiant Skin  (10 ml)",
//                     "status": "Pending",
//                     "createdAt": "2025-04-28T07:46:56.901Z",
//                     "updatedAt": "2025-04-28T07:46:56.901Z",
//                     "__v": 0
//                 }
//             ]
//         },
//         {
//             "orderAddress": {
//                 "_id": "680f3270ee6cb4a8d443ba26",
//                 "orderId": "680f3270ee6cb4a8d443ba20",
//                 "addressType": "Home",
//                 "name": "Home",
//                 "city": "Bekur",
//                 "state": "Kerala",
//                 "pincode": 671322,
//                 "phone": "8998786789",
//                 "altPhone": "8998786789",
//                 "createdAt": "2025-04-28T07:46:56.903Z",
//                 "updatedAt": "2025-04-28T07:46:56.903Z",
//                 "__v": 0
//             }
//         }
//     ]
// }
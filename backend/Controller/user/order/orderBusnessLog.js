const generateOrderId=(nthOrder)=>{
    const orderStamp = "ORD"
    const date =  Date.now();
    return orderStamp+"-"+date+"-"+(String(nthOrder+1).padStart(3,0))
}

let helper = {
    generateOrderId,
}

module.exports =  helper;


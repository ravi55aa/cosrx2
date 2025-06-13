const bcrypt = require("bcrypt"); 
const mongoose =  require("mongoose");
const cloudinary = require("../Config/cloudinary");

//uploading images:
const uploadTheProductImages = async (images) => {
    try {
        const secure_urls = await Promise.all(
            images.map(async (ele, index) => {
                const timestamp = Date.now();
                const uploaded_image = await cloudinary.uploader.upload(ele.path, {
                folder: "ecommerce/products",
                context : {product_id: ele+index},
                public_id: `product_${timestamp}_${index}`, 
                use_filename: true, 
                unique_filename: true,
                overwrite: false,
            });
            if (!uploaded_image || !uploaded_image.secure_url) {
                return "Error";
            }
            return uploaded_image.secure_url;
            })
        );

        console.log("secure_urls", secure_urls);

        return secure_urls;
    } catch (err) {
        return { error: err.message };
    }
};


//product validation
function validateProduct(product) {
    const {
        productName,
        productDescription,
        productFullDescription,
        productCategory ,
        salePrice,
        quantity, 
        weight,
    } = product;

    let errors = {};

    // Validate productName
    if (!productName.trim()) {
        errors.productName = 'Product name is required';
    } else if (productName.length < 3 || productName.length > 500) {
        errors.productName = 'Product name must be 3-50 characters.';
    }else if (!/[a-zA-Z]/.test(productName)){
        errors.productName = 'Product name must contain at least one Upper-letter and One LowerCase-letter';
    }

    // Validate description
    if (!productDescription.trim()) {
        errors.description = 'Description is required';
    } else if (productDescription.length < 10 || productDescription.length > 10000) {
        errors.description = 'Description must be 10-10000 characters.';
    } else if (!/[a-zA-Z0-9]/.test(productDescription)) {
        errors.description = 'Description must contain actual text content';
    } else if (/(.)\1{10,}/.test(productDescription)) {
        errors.description = 'Description contains excessive repetitive characters';
    }

    // Validate Full-description
    if (!productFullDescription.trim()) {
        errors.productFullDescription = 'Description is required';
    } else if (productFullDescription.length < 10 || productFullDescription.length > 10000) {
        errors.productFullDescription = 'Description must be 10-10000 characters.';
    } else if (!/[a-zA-Z0-9]/.test(productFullDescription)) {
        errors.productFullDescription = 'Description must contain actual text content';
    } else if (/(.)\1{10,}/.test(productFullDescription)) {
        errors.productFullDescription = 'Description contains excessive repetitive characters';
    }
   

    // Validate category
    if (!productCategory) {
        errors.category = 'Category is required';
    } else if (!mongoose.Types.ObjectId.isValid(productCategory)) {
        errors.category = 'Please enter a valid category ID.';
    }

    // Validate regularPrice
    // if (!regularPrice) {
    //     errors.regularPrice = 'Regular price is required';
    // } else if (regularPrice < 0) {
    //     errors.regularPrice = 'Regular price must be a positive number.';
    // }else if( isNaN(regularPrice)) {
    //     errors.regularPrice = 'pls enter a valid Regular price.';
    // } else if(regularPrice > 9999){
    //     errors.salePrice = 'Sale price is exceeding the price limit';
    // }

    // Validate salePrice
    if (!salePrice) {
        errors.salePrice = 'Sale price is required';
    } else if ( salePrice < 0) {
        errors.salePrice = 'Sale price must be a positive number.';
    }else if( isNaN(salePrice)) {
        errors.salePrice = 'pls enter a valid Sale Price.';
    } else if(salePrice > 9999){
        errors.salePrice = 'Sale price is exceeding the price limit';
    }

    if (!weight) {
        errors.weight = 'weight is required';
    } else if (weight < 0) {
        errors.weight = 'weight must be a positive number.';
    }else if( isNaN(weight)) {
        errors.weight = 'pls enter a valid weight.';
    } else if(weight > 999){
        errors.weight = 'pls enter a valid amount of  weight.';
    }

    // Validate quantity
    if (!quantity) {
        errors.quantity = 'Quantity is required';
    } else if (quantity < 0) {
        errors.quantity = 'Quantity must be a positive number.';
    } else if ( isNaN(quantity)) {
        errors.quantity = ' pls enter a valid Quantity ';
    } else if(quantity > 100){
        errors.quantity = 'Max reach of the quantity has been reached';
    }

    // if(productOffer < 0){
    //     errors.product = "Offer cannot be a -ve Number";
    // } else if(isNaN(productOffer)) {
    //     errors.productOffer = "pls Enter a valid Product offer"
    // } else if(productOffer > 100){
    //     errors.regularPrice = 'Offer cannot be greater than 100.';
    // } else if(productOffer > validOffer){
    //     errors.regularPrice = 'productOFfer should be less than validOFffer.';
    // }

    // if(validOffer < 0){
    //     errors.product = "Offer cannot be a -ve Number";
    // } else if(isNaN(validOffer)) {
    //     errors.productOffer = "pls Enter a valid Product offer"
    // } else if(validOffer > 100){
    //     errors.regularPrice = 'Offer cannot be greater than 100.';
    // } else if(validOffer < productOffer){
    //     errors.regularPrice = 'validOffer should be less than validOFffe';
    // }

    return errors;
}

// address validation 
// function validateAddress(address) {
//     let errors = {};

//     // Validate addressType
//     if (!address.addressType) {
//         errors.addressType = 'Address type is required';
//     } else if (!['Home', 'Work', 'Other'].includes(address.addressType)) {
//         errors.addressType = 'Invalid address type';
//     }

//     // Validate name
//     if (!address.name) {
//         errors.name = 'Full name is required';
//     } else if (!validator.isLength(address.name, { min: 2, max: 50 })) {
//         errors.name = 'Full name must be 2-50 characters';
//     }else if (!validator.matches(address.name, /^(?!.\s{3,})[a-zA-Z](?:[a-zA-Z\s.][a-zA-Z])?$/)) {
//         errors.name = 'Full name can only contain letters, spaces, and periods, and cannot have excessive spaces';
//     }

//     // Validate addressLine
//     if (!address.addressLine) {
//         errors.addressLine = 'Address line is required';
//     } else if (!validator.isLength(address.addressLine, { min: 5, max: 100 })) {
//         errors.addressLine = 'Address line must be 5-100 characters';
//     } else if (!validator.matches(address.addressLine, /^(?=.[a-zA-Z0-9])(?!.\s{3,})[a-zA-Z0-9][-.,#\/a-zA-Z0-9\s]*[a-zA-Z0-9]$/)) {
//         errors.addressLine = 'Address line must contain letters or numbers without excessive spaces and can only include common symbols (-.,#/)';
//     }

//     // Validate city
//     if (!address.city) {
//         errors.city = 'City is required';
//     } else if (!validator.isLength(address.city, { min: 3, max: 50 })) {
//         errors.city = 'City must be 3-50 characters';
//     }else if (!validator.matches(address.city, /^(?=.[a-zA-Z])(?!.\s{3,})[a-zA-Z][-a-zA-Z\s]*[a-zA-Z]$/)) {
//         errors.city = 'City must contain letters without excessive spaces and can only include spaces and hyphens (e.g., New Delhi)';
//     }

//    // Validate landmark
//     if (!address.landmark) {
//         errors.landmark = 'Landmark is required';
//     } else if (!validator.isLength(address.landmark, { min: 3, max: 50 })) {
//         errors.landmark = 'Landmark must be 3-50 characters';
//     } else if (!validator.matches(address.landmark, /^(?=.[a-zA-Z0-9])(?!.\s{3,})[a-zA-Z0-9][-.,&()a-zA-Z0-9\s]*[a-zA-Z0-9]$/)) {
//         errors.landmark = 'Landmark must contain letters or numbers without excessive spaces and can only include common symbols (-.,&())';
//     }

//     // Validate state
//     if (!address.state) {
//         errors.state = 'State is required';
//     }

//     // Validate pincode
//     if (!address.pincode) {
//         errors.pincode = 'PIN code is required';
//     } else if (!validator.isLength(address.pincode, { min: 6, max: 6 })) {
//         errors.pincode = 'PIN code must be exactly 6 digits';
//     } else if (!validator.isNumeric(address.pincode)) {
//         errors.pincode = 'PIN code must contain only digits';
//     }

//     // Validate phone
//     if (!address.phone) {
//         errors.phone = 'Phone number is required';
//     } else if (!validator.isLength(address.phone, { min: 10, max: 10 })) {
//         errors.phone = 'Phone number must be exactly 10 digits';
//     } else if (!validator.matches(address.phone, /^[6-9][0-9]{9}$/)) {
//         errors.phone = 'Phone number must be a valid mobile number (starting with 6, 7, 8, or 9) ';
//     }

//     // Validate altPhone
//     if (address.altPhone) {
//         if (!validator.isLength(address.altPhone, { min: 10, max: 10 })) {
//             errors.altPhone = 'Alternate phone number must be exactly 10 digits';
//         } else if (!validator.matches(address.altPhone, /^[6-9][0-9]{9}$/)) {
//             errors.altPhone = 'Alternate phone number must be a valid Indian mobile number (starting with 6, 7, 8, or 9)';
//         }
//     }

//     // Validate isDefault
//     if (typeof address.isDefault !== 'boolean') {
//         errors.isDefault = 'isDefault must be a boolean';
//     }

//     return Object.keys(errors).length > 0 ? errors : null;
// }

// // validate password 
// async function validatePassword(user, data, isChangePassword ) {
//     let errors = {};

//     if (isChangePassword && user.password) {
//         if (!data.currentPassword) {
//             errors.currentPassword = 'Current password is required';
//         } else if (!await bcrypt.compare(data.currentPassword, user.password)) {
//             errors.currentPassword = 'Current password is incorrect';
//         }
//     }

//     if (!data.password) {
//         errors.password = 'password is required';
//     } else if (!validator.isLength(data.password, { min: 8 })) {
//         errors.password = 'Password must be at least 8 characters';
//     } else if (!validator.isStrongPassword(data.password)) {
//         errors.password = 'Password must include uppercase, lowercase, and a number';
//     }

//     if (!data.cPassword) {
//         errors.cPassword = 'Please confirm your new password';
//     }else if (data.password !== data.cPassword) {
//         errors.cPassword = 'Passwords do not match';
//     }

//     return Object.keys(errors).length > 0 ? errors : null;
// }


module.exports = {validateProduct,uploadTheProductImages};
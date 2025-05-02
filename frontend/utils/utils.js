import validator from "validator";

export function validateProduct(product) {
    const {
        productName,
        productDescription,
        productFullDescription,
        productCategory ,
        regularPrice,
        salePrice,
        productOffer,
        validOffer,
        quantity, 
        weight,
    } = product;

    let errors = {};

    // Validate productName
    if (!productName.trim()) {
        errors.productName = 'Product name is required';
    } else if (productName.length < 3 || productName.length > 50) {
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
    if (!regularPrice) {
        errors.regularPrice = 'Regular price is required';
    } else if (regularPrice < 0) {
        errors.regularPrice = 'Regular price must be a positive number.';
    }else if( isNaN(regularPrice)) {
        errors.regularPrice = 'pls enter a valid Regular price.';
    }

    // Validate salePrice
    if (!salePrice) {
        errors.salePrice = 'Sale price is required';
    } else if ( salePrice < 0) {
        errors.salePrice = 'Sale price must be a positive number.';
    } else if (salePrice > regularPrice) {
        errors.salePrice = 'Sale price must be less than or equal to regular price.';
    }else if( isNaN(salePrice)) {
        errors.regularPrice = 'pls enter a valid Sale Price.';
    }

    if (!weight) {
        errors.weight = 'weight is required';
    } else if (regularPrice < 0) {
        errors.regularPrice = 'weight must be a positive number.';
    }else if( isNaN(regularPrice)) {
        errors.regularPrice = 'pls enter a valid weight.';
    }

    // Validate quantity
    if (!quantity) {
        errors.quantity = 'Quantity is required';
    } else if (quantity < 0) {
        errors.quantity = 'Quantity must be a positive number.';
    } else if ( isNaN(quantity)) {
        errors.quantity = ' pls enter a valid Quantity ';
    }

    if(productOffer < 0){
        errors.product = "Offer cannot be a -ve Number";
    } else if(isNaN(productOffer)) {
        errors.productOffer = "pls Enter a valid Product offer"
    }

    if(validOffer < 0){
        errors.product = "Offer cannot be a -ve Number";
    } else if(isNaN(validOffer)) {
        errors.productOffer = "pls Enter a valid Product offer"
    }

    return errors;
}

export const validate_Profile_edit_data=(payload)=>{
    
    const {firstName,lastName,phone,userName} = payload;

    let errors = {};

    const fields = {firstName,lastName,userName};

    
    for(let [key,value] of Object.entries(fields)){
        if (!value.trim()) {
            errors[key] = `${key} is required`;
        } else if (value.length < 3 || value.length > 50) {
            errors[key] = `${key} must be 3-50 characters.`;
        }else if (!/[a-zA-Z]/.test(value)){
            errors[key] = `${key} must contain at least one Upper-letter and One LowerCase-letter`;
        }
    };

    if (!phone?.trim()) {
        errors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(phone)) {
        errors.phone = "Phone must be a 10-digit number";
    }

    return errors;
}

export const validate_Profile_edit_data_forEmail=(email)=>{
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.endsWith(".com");
};

export const validate_passwords=(payload)=>{

    let errors = {};

    for(let [key,value] of payload){
        if (!value.trim()) {
            errors[key] = `${key} is required`;
        } else if (key.length < 8 || key.length > 20) {
            errors[key] = `${key} must be 8-20 characters long.`;
        } else if (!/[A-Z]/.test(value)) {
            errors[key] = `${key} must contain at least one uppercase letter.`;
        } else if (!/[a-z]/.test(value)) {
            errors[key] = `${key} must contain at least one lowercase letter.`;
        } else if (!/[0-9]/.test(value)) {
            errors[key] = `${key} must contain at least one number.`;
        } else if (!/[@$!%*?&]/.test(value)) {
            errors[key] = `${key} must contain at least one special character (@$!%*?&)`;
        } else if (/\s/.test(value)) {
            errors[key] = `${key} cannot contain spaces.`;
        }
    }

    return errors;
}

export const validate_address=(address)=>{

    let errors = {};

    if (!address.name.trim()) {
        errors.name = 'Name is required';
    } else if (!validator.isLength(address.name, { min: 2, max: 50 })) {
        errors.name = 'Name must be 2-50 characters';
    }else if (!validator.matches(address.name,  /^[a-zA-Z.]+(?: [a-zA-Z.]+)*$/ )) {
        errors.name = 'Name can only contain letters, spaces, and periods, and cannot have excessive spaces';
    }

    if (!address.townCity) {
        errors.townCity = 'City is required';
    } else if (!validator.isLength(address.townCity, { min: 3, max: 50 })) {
        errors.city = 'City must be 3-50 characters';
    }else if (!validator.matches(address.townCity, /^(?=.[a-zA-Z])(?!.\s{3,})[a-zA-Z][-a-zA-Z\s]*[a-zA-Z]$/)) {
        errors.city = 'City must contain letters without excessive spaces and can only include spaces and hyphens (e.g., New Delhi)';
    }

    if (!address?.streetAddress?.trim()) {
        errors.streetAddress = 'streetAddress is required';
    } else if (address.streetAddress.length < 10 || address.streetAddress.length > 10000) {
        errors.streetAddress = 'streetAddress must be 10-10000 characters.';
    } else if (!/[a-zA-Z0-9]/.test(address?.streetAddress)) {
        errors.streetAddress = 'streetAddress must contain actual text content';
    } else if (/(.)\1{10,}/.test(address.streetAddress)) {
        errors.streetAddress = 'streetAddress contains excessive repetitive characters';
    }

    if (!address.state) {
        errors.state = 'State is required';
    }

    if (!address?.postcodeZip?.trim()) {
        errors.pincode = 'PIN code is required';
    } else if (!validator.isLength(address.postcodeZip, { min: 6, max: 6 })) {
        errors.pincode = 'PIN code must be exactly 6 digits';
    } else if (!validator.isNumeric(address.postcodeZip)) {
        errors.pincode = 'PIN code must contain only digits';
    }

    // Validate phone
    if (!address.phone) {
        errors.phone = 'Phone number is required';
    } else if (!validator.isLength(address.phone, { min: 10, max: 10 })) {
        errors.phone = 'Phone number must be exactly 10 digits';
    } else if (!validator.matches(address.phone, /^[6-9][0-9]{9}$/)) {
        errors.phone = 'Phone number must be a valid mobile number (starting with 6, 7, 8, or 9) ';
    }

    // Validate altPhone
    if (address.alternativePhone) {
        if (!validator.isLength(address.alternativePhone, { min: 10, max: 10 })) {
            errors.altPhone = 'Alternate phone number must be exactly 10 digits';
        } else if (!validator.matches(address.alternativePhone, /^[6-9][0-9]{9}$/)) {
            errors.altPhone = 'Alternate phone number must be a valid Indian mobile number (starting with 6, 7, 8, or 9)';
        }
    }

    return errors;
}
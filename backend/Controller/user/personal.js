const cloudinary = require('../../Config/cloudinary');
const HttpStatus = require('../../Config/HTTPstatusCodes');
const userModel =  require('../../Model/user');
const mongoose =  require("mongoose");
const addressModel = require("../../Model/address");
const bcrypt = require("bcrypt");
const walletModel=require("../../Model/wallet");

const getObjToId=(id)=>{
    return new mongoose.Types.ObjectId(id);
}

const checkWhichId=async(field,id)=>{
    let userId = "";
    
    if(field == "googleId"){
        const user = await userModel.findOne({[field]:id});
        userId = user._id ;
    } else {
        userId = getObjToId(id);
    }

    return userId; 
}  

const fetchProfile = async(req,res)=>{
    try {
        const {id} =  req.query

        if(!id){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"id not found"});
            return;
        }

        let userId = "";
        let user = {};
        

        if(id.length < 24){
            user =  await userModel.findOne( { googleId : id } );
        } else {
            userId = new mongoose.Types.ObjectId(id);
            user = await userModel.findOne({_id:userId});
        }

        if(Object.keys(user) == "null"){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"user not found"});
            return;
        }
        
        if(Object.keys(user).length <= 0 ){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"user not found"});
            return;
        }

        res.status(HttpStatus.OK).json({mission:"success",message:"user data fetch successfully",user:user});
        return;

    } catch(err){
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"server error",Error:err.message});
        return;
    }
};

const profileEdit=async(req,res)=>{
    try {
        const {id} = req.params;
        
        
        if(!id){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Id not found"});
            return;
        }

        let cloudinary_ = "";
        let updateUser ={};

        if( req.file ){
            cloudinary_ = await cloudinary.uploader.upload(req.file.path, {
                folder: "ecommerce/products",
                use_filename: true,
                unique_filename: true,
                overwrite: false,
            }); 
            updateUser={profilePicture:cloudinary_.secure_url}
        }
        
        updateUser = {...updateUser,...req.body,}
        
        const updatedUser = await userModel.findByIdAndUpdate(id,updateUser,{new:true});

        if(Object.keys(updatedUser).length <= 0){
            res.status(HttpStatus.CONFLICT).json({mission:"failed",message:"failed to update the user"});
            return;
        }

        res.status(HttpStatus.OK).json({mission:"success",message:" User updated successfully"});
        return;

    }catch(err){
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"Server Error",error:err.message});
        return;
    }
};

const handleIsEmailExist=async(req,res)=>{
    const {email,id} = req.query;

    if(!email){
        res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:'email not found'});
        return;
    }
    
    const presentUserId = new mongoose.Types.ObjectId(id);

    try{
        const user = await userModel.findOne({_id:{$ne:presentUserId},email:email});
        res.status(HttpStatus.OK).json({mission:'success',message:"User fetch successful",user:user});
        return;

    }catch(err){
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:'failed',message:"Server Error",Error:err.message});
        return;
    }
};

const handlePasswordChange=async(req,res)=>{
    try{
        const {id} = req.params;
    
        if(!id){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:'Id not found'});
            return;
        }
    
        const {password,newPassword,reenterNewPassword} = req.body;
        //add a validation to the passwords;
    
        const user = await userModel.findById(id);
    
        if(Object.keys(user).length <= 0 ){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:'User not found'});
            return;
        }

        const passwordCompare = await bcrypt.compare(password, user.password); //userEnteredPassword ,StoredPassword
        if(!passwordCompare){
            res.status(HttpStatus.UNAUTHORIZED).json({mission:"failed",message:"Old Password is required"});
            return;
        }
    
        if(newPassword !== reenterNewPassword){
            res.status(HttpStatus.CONFLICT).json({mission:"failed",message:"Passwords Doesn't match"});
            return;
        }
        const getHashedPassword = await bcrypt.hash(newPassword,10);

        await userModel.findByIdAndUpdate(id,{password:getHashedPassword},{new:true});
    
        res.status(HttpStatus.OK).json({mission:"success",message:"Passwords updated Successfully"});
        return true;
    }catch(err) {
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"Server Error",Error:err.message});
        return;
    }
};

const handleForgotPasswordOnEdit=async(req,res)=>{
    try{
        const {password1,password2} = req.body;

        
        const {query} = req.query; //key,value;
        let {field,id} = query;

        if(password1 !== password2){
            res.status(HttpStatus.CONFLICT).json({mission:"failed",message:"Passwords are not matching"});
            return;
        }

        const hashedPassword = await bcrypt.hash(password1,10);

        if(field == "_id"){
            id = new mongoose.Types.ObjectId(id);
        }

        const updatedUser = await userModel.findOneAndUpdate({[field]:id},{password:hashedPassword});
        
        if(!updatedUser || Object?.keys(updatedUser).length <= 0){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"User cannot found or not updated"});
            return;
        }
        
        res.status(HttpStatus.OK).json({mission:"success",message:"User updated successfully"});
        return;
    } catch(err) {
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"Server Error",Error:err.message});
        return;
    }
};

const handleNewAddAddress=async(req,res)=>{
    try {
        let {field,id} = req.query;

        if(!id){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"id not found"});
            return;
        }
        
        const userId = await checkWhichId(field,id);

        const {name,state,phone,streetAddress,townCity,postcodeZip,alternativePhone} = req.body;

        //User in  the DB
        const userInDB = await addressModel.findOne({userId:userId});

        let isPrimary = true;
        
        if( userInDB?.address?.length >= 1) {
            isPrimary = false;
        } 

        const address = {
            "name":name,
            "state":state,
            "phone":phone,
            "streetAddress":streetAddress,
            "city":townCity,
            "pincode":postcodeZip,
            "altPhone":alternativePhone,
            "isPrimary" : isPrimary
        }

        

        if(userInDB && Object.keys(userInDB).length > 0){
            await addressModel.updateOne(
                {userId:userId},
                {$push : {address:address}}
            );
            
            res.status(HttpStatus.OK).json({mission:"success",message:"address Added successfully"});
            return;
        }
        
        const newAddress = await new addressModel({
            userId:userId,
            address:[address]
        }).save();

        res.status(HttpStatus.OK).json({mission:"success",message:"address Added successfully"});
        return;

    } catch(err){
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"Server Error",error:err.message});
        return;
    }
};

const handleGetAddress=async(req,res)=>{
    try {
        let {field,id} = req.query;
        
        if(!id){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"id not found"});
            return;
        }
        
        let userId = await checkWhichId(field,id);
    
        let addresses = await addressModel.findOne({userId:userId}).populate("userId");
        
        let walletAmt = await walletModel.findOne(
            {userId:userId}
        );

        if(!walletAmt){
            walletAmt = 'no money';
        }
    
        res.status(HttpStatus.OK)
            .json(
                {
                    mission:"success",
                    message:"AddressFetchSuccessfully", 
                    address :addresses,
                    walletAmt:walletAmt.balance
            });
        return;

    }catch(err){
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"ServerError",Error :err.message});
        return;
    }

};

const handleDeleteAddress=async(req,res)=>{
    try{
        let {addressID} = req.params;
    
        if(!addressID){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"AddressID not found"});
            return;
        }
    
        addressID = new mongoose.Types.ObjectId(addressID);
        const addressToDelete = await addressModel.findOne({"address._id": addressID});
    
        if(!addressToDelete || Object?.keys(addressToDelete)?.length <= 0){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Address not found"});
            return;
        }
        
        addressToDelete.address  = addressToDelete.address.filter((addr => !addr._id.equals(addressID)));

        const findPrimaryAddress = addressToDelete?.address.find((add)=>add.isPrimary)

        if (!findPrimaryAddress && addressToDelete.address && addressToDelete.address[0]) {
                addressToDelete.address[0].isPrimary = true;
        }

        await addressToDelete.save();

        res.status(HttpStatus.OK)
        .json({mission:"success",message:"Address Deleted Successfully",});
        return;
    } catch(err){
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"ServerError",Error :err.message});
        return;
    }
};

const handleEditFetchAddress=async(req,res)=>{
    try{
        let {addressID} = req.params;
    
        if(!addressID){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"AddressID not found"});
            return;
        }
        
        const {id,field} = req.query;
        
        let userId = await checkWhichId(field,id);
    
        addressID = new mongoose.Types.ObjectId(addressID);
        const addressToEdit = await addressModel.findOne(
            {userId: userId ,"address._id": addressID}); 
    
        if(!addressToEdit || Object?.keys(addressToEdit)?.length <= 0){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Address not found"});
            return;
        }

        const address = addressToEdit.address.filter((addr => addr._id.equals(addressID)));
        
        res.status(HttpStatus.OK)
        .json({mission:"success",message:"Address Edited Successfully",address:address});
        return;
    } catch(err){
        
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"ServerError",Error :err.message});
        return;
    }
};

const handleEditAddress=async(req,res)=>{
    try{
        let {addressID} = req.params;
        if(!addressID){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"AddressID not found"});
            return;
        }
        const {isPrimary} = req.body;

        addressID = new mongoose.Types.ObjectId(addressID);
        const addressToEdit = await addressModel.findOne({"address._id": addressID}); 
    
        if(!addressToEdit || Object?.keys(addressToEdit)?.length <= 0){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Address not found"});
            return;
        }        
        addressToEdit.address = addressToEdit.address.map((addr) =>{
                if(addr._id.equals(addressID)) {
                    return {
                        ...addr.toObject(),
                        ...req.body,
                        _id:addr._id
                    }
                } else {
                    return addr;
                }
            });

        await addressToEdit.save();

        res.status(HttpStatus.OK)
        .json({mission:"success",message:"Address Edited Successfully"});
        return;

    } catch(err){
        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"ServerError",Error :err.message});
    }
};

const handleChangingDefaultAddr=async(req,res)=>{
    try{
        let {addressID} = req.params;

        if(!addressID){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"AddressID not found"});
            return;
        }

        addressID = new mongoose.Types.ObjectId(addressID);
        const addressToEdit = await addressModel.findOne({"address._id": addressID}); 
    
        if(!addressToEdit || Object?.keys(addressToEdit)?.length <= 0){
            res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Address not found"});
            return;
        }

        addressToEdit.address = addressToEdit.address.map((addr) =>{
                if(addr._id.equals(addressID)){
                    return {
                        ...addr.toObject(),
                        isPrimary:true,
                        _id:addr._id
                    }
                } else {
                    return {
                        ...addr.toObject(),
                        isPrimary:false,
                        _id:addr._id
                    };
                }
            });

        await addressToEdit.save();

        res.status(HttpStatus.OK)
        .json({mission:"success",message:"Default Address changed Successfully"});
        return;

    } catch(err){
        
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({mission:"failed",message:"ServerError",Error :err.message});
    }
}


module.exports =  { 
    fetchProfile, 
    profileEdit,
    handleIsEmailExist,
    handlePasswordChange, 
    handleForgotPasswordOnEdit,
    handleGetAddress, 
    handleNewAddAddress,
    handleDeleteAddress,
    handleEditFetchAddress,
    handleEditAddress,
    handleChangingDefaultAddr,

    checkWhichId,
};
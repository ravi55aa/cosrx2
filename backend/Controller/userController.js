require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const {generateToken} = require("../Config/jwt")

const otpGenerator = require("otp-generator");
const { validationResult } = require("express-validator");
const walletModel = require("../Model/wallet.js");

const User = require("../Model/user");
const cloudinary = require("../Config/cloudinary");
const HttpStatus = require("../Config/HTTPstatusCodes");
const sendOTP = require("../Config/nodeMailer");
const {referralGenerate} = require("./userContBussines.js");

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, referralCode } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = new User({
      firstName,
      lastName,
      email,
      userName: firstName,
      password: hashedPassword,
      googleId: hashedPassword + 1,
      referralCode: referralGenerate(),
    });

    if (referralCode) {
      let foundUser = await User.findOne({ referralCode: referralCode });

      if (foundUser) {
        
        newUser.referrerCode = referralCode;
        newUser.redeemed = true;
        await newUser.save();

        foundUser.redeemedUsers.push(newUser._id);
        await foundUser.save();

        const newUserTransaction = {
          type: "credit",
          amount: 50,
          description: "Successfully credited the referral amount",
          transactId: "Tran-" + Math.floor(Math.random() * 1000000) + "-Admin"
        };

        await new walletModel({
          userId: newUser._id,
          balance: 50,
          transactions: [newUserTransaction],
        }).save();

        
        const referrerWallet = await walletModel.findOne({ userId: foundUser._id });

        const referrerTransaction = {
          type: "credit",
          amount: 50,
          description: `Reward for referring ${newUser.email}`,
          transactId: "Tran-" + Math.floor(Math.random() * 1000000) + "-Ref"
        };

        if (!referrerWallet) {
          
          await new walletModel({
            userId: foundUser._id,
            balance: 50,
            transactions: [referrerTransaction],
          }).save();
        } else {
          
          await walletModel.updateOne(
            { userId: foundUser._id },
            {
              $inc: { balance: 50 },
              $push: { transactions: referrerTransaction }
            }
          );
        }
      }
    }

    const payload = {
      email: newUser.email,
      id: newUser._id,
    };

    const token = generateToken(payload);
    await newUser.save();

    res.status(201).json({
      mission: "success",
      message: "User registered successfully",
      userId: newUser._id,
      token: token
    });

  } catch (error) {
    
    res.status(500).json({ message: "Server error", Error: error.message });
  }
};

const registerUserWithGoogle = async (payload) => {
  try {
    
    if (Object.keys(payload).length <= 0) {
      
      return false;
    }

    const { name, email, id,photo } = payload;
    
    const userExist = await User.find({ email: email });

    if (userExist.length > 0 ) {
      return true;
    }
    
    const newUser = await new User({
      email: email,
      firstName:name,
      googleId:id,
      userName:name,
      profilePicture:photo,
      referralCode:referralGenerate()
    }).save(); 


    if(!newUser){
      return false;
    }

    return true;

  } catch (error) {
    

    return false;
  }
};

const uploadUserImage = async (req, res) => {
  try {
    if (!req.file || !req.file.filename) {
      res
        .status(HttpStatus.NO_CONTENT)
        .json({ mission: "failed", message: "image is null" });
      return;
    }

    const { userId } = req.body;

    if (!userId) {
      res
        .status(HttpStatus.NO_CONTENT)
        .json({ mission: "failed", message: "id is null" });
      return;
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "ecommerce/products",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    if (!result || !result.secure_url) {
      res
        .status(HttpStatus.CONFLICT)
        .json({ mission: "failed", message: "image cloudinary not uploaded" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    

    const updateImage = await User.findByIdAndUpdate(
      userObjectId,
      { profilePicture: result.secure_url }
    );

    if (!updateImage) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(HttpStatus.CREATED)
      .json({ mission: "success", message: "image uploaded successfully" });
    return;
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server-error", error: err.message });
    return;
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ mission: "failed", message: "email or pass is null" });
    }

    const user = await User.findOne({ email:email });

    const comparePassword = await bcrypt.compare(password,user?.password);

    if ( Object.keys(user).length <= 0 || !comparePassword) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "user not found" });
      return;
    }

    if(user.isBlocked) {
      res
        .status(HttpStatus.OK)
        .json(
          { 
            mission: "success", 
            isBlocked : "blocked", 
            message: "You're Blocked By The Admin" 
          }
        );

      return;
    }

    //generate the token with 
    //email and password:
    const payload = {
      email:user?.email || "",
      id:user?._id || '',
    }

    const token = generateToken(payload);


    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "user login successfull",
      user: user,
      token:token
    });

    return;

  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
};

const generateOtp = (req, res) => {
  try {
    const {token} = req.query;
  
    const decode = jwt.verify(token,process.env.JWT_SECRET);
  
    const generateOTP = () => {
      return otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
    };
  
    let generateOTPis = generateOTP();
    const expireTime = Date.now() + 10 * 1000;
  
    if (generateOTPis.length > 6) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ mission: "failed", message: "otp not generated" });
      return;
    }
 
    
    
    //NODE MAIL:
    sendOTP(decode.email,generateOTPis);
  
  
    res.status(HttpStatus.OK).json({
      mission: "success",
      message: "otp generated",
      otp: generateOTPis,
      expiryTime: expireTime,
    });
    return;

  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
};

const checkEMailForPasswordChange = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res
        .status(HttpStatus.NO_CONTENT)
        .json({ mission: "failed", message: "email is undefined" });
      return;
    }

    const isUser = await User.findOne({ email });

    if (!isUser) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "user not found" });
      return;
    }

    res
      .status(HttpStatus.OK)
      .json({ mission: "success", message: "Change the password" });
    return;
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
};

const changePassword = async (req, res) => {
  try {
    const { password1, password2, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ mission: "failed", message: "user not found" });
      return;
    }

    const hashPassword = await bcrypt.hash(password1, 10);

    await User.findOneAndUpdate({ email: email }, { password: hashPassword });

    res
      .status(HttpStatus.OK)
      .json({ mission: "success", message: "Change the password" });
    return;
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
};

//This one is for the fetch the 
//user data into the homepage 
//------------------------------
const homePageFetchData = async (req,res)=>{
  try {

    const {id} = req.params;

    
    
    if(!id) {
      res
      .status(HttpStatus.NOT_FOUND)
      .json({ mission: "failed", message: "id not found" });
      return  false;
    }
    
    const userId = new mongoose.Types.ObjectId(id);
  
    const user = await User.findOne({_id:userId});
    
  
    if(Object.keys(user).length  <= 0){
      res
      .status(HttpStatus.NOT_FOUND)
      .json({ mission: "failed", message: "User not found"});
      return false
    }
  
      const token = generateToken(user);

      res
      .status(201)
      .json({
        mission: "success",
        message: "User registered successfully",
        userId: user._id,
        token:token
      });
      
      return true;

  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ mission: "failed", message: "server error", Error: err.message });
    return;
  }
}

module.exports = {
  registerUser,
  registerUserWithGoogle,
  uploadUserImage,
  login,
  generateOtp,
  checkEMailForPasswordChange,
  changePassword,
  homePageFetchData, //FetchUSERiNFOINTOTHE hOMEPAGE
};

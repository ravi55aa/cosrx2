const express = require("express");
const passport = require("passport");
const HttpStatus = require("../Config/HTTPstatusCodes");
const jwt = require("jsonwebtoken");
const { registerUserWithGoogle } = require("../Controller/userController");

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", passport.authenticate("google", { session: false }),(req, res) => {

    if (!req.user.token) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const { name, email, photo, token,googleId } = req.user;
        
    res.redirect(
      `http://localhost:5173/user/google-auth?token=${token}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&photo=${encodeURIComponent(photo)}&id=${encodeURIComponent(googleId)}`
    );    
    
  });

  //to het hte profile info of the 
  //google authenticated user in the frontend
router.post("/profile",(req,res)=>{
  const token = req.headers.authorization?.split(" ")[1];


  if(!token){
    res.status(HttpStatus.NOT_FOUND).json({mission:"failed",message:"Token is null"});
    return;
  }

  try {

    const verify=jwt.verify(token , process.env.JWT_SECRET);

    if(!verify){

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"something went wrong"});

      return; 
    }

    //save user in DB:
    if(!registerUserWithGoogle(req.body)){
      console.log("something went wrong",req.user);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({mission:"failed",message:"something went wrong"});

      return;
    }


    res.status(HttpStatus.OK).json({mission:"success",message:"Everything is Done",userAddress:req.body,});
    return;

  } catch (error) {
      res.status(403).json({ message: "Invalid token" });
      return;
  }


})

module.exports = router;

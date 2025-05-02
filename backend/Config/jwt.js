const jwt =  require("jsonwebtoken");
const HttpStatus = require("./HTTPstatusCodes");
require("dotenv").config();

const generateToken = (user)=>{
    return jwt.sign({_id:user._id, email:user.email},
        process.env.JWT_SECRET,
        { expiresIn : process.env.JWT_EXPIRES_IN }
    );
} 

const authMiddleware =(req,res,next)=>{
    const autorization = req.headers.authorization;
    const token = autorization.split(" ")[1];

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
    if (err.name === "TokenExpiredError") {
        return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ mission: "failed", message: "Token has brrnexpired" });
    }

    return res
            .status(HttpStatus.UNAUTHORIZED)
            .json({ mission: "failed", message: "Unauthorized error" });
    }
} 

//this one will take for the errors
//which comes from the direct frontend
//and sends the response before 
// reaching ot the controller 
const errorHandlingMiddleware=(req,res,next)=>{
    
    if(req.hasError(err)){
        res.status(HttpStatus.NOT_FOUND).json({mession:"failed",message:"Error handled by the middleware"})
    }

    next();
}

//later fill with the error handle
//login into this 
//important one
const adminHandler = (req,res,next)=>{
    next();
};

module.exports = {generateToken,authMiddleware,errorHandlingMiddleware,adminHandler};   
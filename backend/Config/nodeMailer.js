var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rachouhan58@gmail.com',
    pass: 'uvezwboikvaubkia'
  }
});

var mailOptions = (to,otp)=> {
    return {
        from: 'rachouhan58@gmail.com',
        to: `${to}`,
        subject: "You're OTP",
        html: `Hello Sir/Madam you're OTP is ${otp}`
    } 
};

const sendOTP=(to,otp)=>{
    transporter.sendMail(mailOptions(to,otp), function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});
} 

module.exports = sendOTP;
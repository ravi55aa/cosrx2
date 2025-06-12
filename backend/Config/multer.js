const multer = require("multer");
const path = require("path");

let Storage = multer.diskStorage({
  
  destination: "uploads",

  filename: (req, file, cb) => {  
    const timestamp = Date.now(); 
    const randomNum = Math.floor(Math.random() * 10000);
    const ext = path.extname(file.originalname);

    const generatedFilename = `${timestamp}-${randomNum}${ext}`;

    cb(null, generatedFilename);
  },

});

const upload = multer({ 
  storage: Storage, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" 
      || file.mimetype == "image/jpeg"|| file.mimetype == "image/webp" 
      || file.mimetype == "image/avif" ) {
        cb(null, true);
    } else {
        cb(null, false);
        const err = new Error('Only .png, .jpg and .jpeg format allowed!')
        err.name = 'ExtensionError'
        return cb(err);
    }
},
});

module.exports = upload;
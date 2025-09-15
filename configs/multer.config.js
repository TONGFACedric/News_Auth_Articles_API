// configs/multer.config.js
//This configuration sets up Multer to store uploaded files in an uploads directory, 
// and generates a unique filename for each file using the current timestamp and the original filename.
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({

// Destination to store files
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  //
  filename: (req, file, cb) => {
    console.log(file);
    //add random string + file originalname to extension eg .png (mime type)
    //cb(null, `${Date.now()}-${file.originalname}`);
    const extension = path.extname(file.originalname);
    cb(null, `${Date.now()}${extension}`);
  },
});

// Upload parameter middleware
const upload = multer({ storage: storage, 
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

module.exports = upload;
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);

cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', 
  { folder: 'autoparse_test' },
  function(error, result) {
    if (error) {
      console.error('❌ Upload Failed:', error);
    } else {
      console.log('✅ Upload Success:', result.secure_url);
    }
  });

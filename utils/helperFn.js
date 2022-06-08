const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const AppError = require('./errorHandle/appError');
require('dotenv').config();

exports.generateToken = (key,time) => {
    return jwt.sign(key, process.env.JWT_SECRET, {
        expiresIn: time, 
    });
};

exports.returnSuccess = (req,res,data = "success") => {
  res.status(200).json({
    status: 'success',
    data:data,
  });
}

exports.returnFail = (req,res,err) => {
  res.status(404).json({
    status: 'fail',
    err:err,
  });
};

exports.sendEmail = async (
    clientEmail,
    subject,
    text,
    endpoint = '/',
    token = ''
) => {
    // const domain = `http:127.0.0.1:5000`;
    const domain = `http://localhost:8080`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user : process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOption = {
      from: process.env.EMAIL,
      to: clientEmail,
      subject: subject,
      html: `<a href=${domain + endpoint + token} target="_blank">${text}</a>`,
    };
    await transporter.sendMail(mailOption);
};

exports.comparePassword = async (inputPassword, userPassword) => {
    return await bcrypt.compare(inputPassword, userPassword);
};


// setting for image upload
const fileStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    // cb(null, 'public/image/client');
    // if(req.params.user_id) 
    cb(null, 'public/image/user');
  },
  
  filename:(req,file,cb) => {
    if(req.params.client_id){
      cb(null, `client-${req.params.client_id}-avatar.jpeg`); //edit filename
    }
    if(req.params.user_id){
      cb(null, `user-${req.params.user_id}-avatar.jpeg`); //edit filename
    }
  }
});


const fileFilter = (req,file,cb) => {
  if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"){
    cb(null,true);
  } else {
    cb(new AppError('Unsupported file format',400),false);
  }
};

exports.upload = multer({
  storage: fileStorage,
  fileFilter:fileFilter
})

exports.isUserLogin = (req, res,next) => { 
  if(req.isAuthenticated()) {
    return next();
  }
  res.status(401).json('error')
}
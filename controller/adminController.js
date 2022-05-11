const User = require('../models').User;
const helperFn = require('../utils/helperFn');
const catchAsync = require('../utils/errorHandle/catchAsync');
const AppError = require('../utils/errorHandle/appError');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary');
require('dotenv').config()
const login = async (req, res) => {
    const {user_email:inputEmail, password:inputPassword} = req.body
    // check exist email
    if(!inputEmail || !inputPassword) {
        return next(new AppError(`Please provide email and password!`,400))
    }
    // get exist email
    const user = await User.findOne( {where: {user_email:inputEmail}})
    if(!user) {
        return next(new AppError(`your email is not correct`,400));
    }
    
    // get all params client
    const {
        user_email,
        password,
        firstName,
        lastName,
        phonenumber,
        age,
    } = user;
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        return next(new AppError('your password not correct', 400));
    }
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         user: {
    //             user: user_email,
    //             firstName: firstName,
    //             lastName: lastName,
    //             phonenumber: phonenumber,
    //             age: age
    //         },
    //     }
    // });
    res.redirect('/api/admin/allClass')
}
const loginAdminView = (req, res) => {
    return res.render('admin/login.ejs')
}
const updateUserPassword = catchAsync(async (req, res,next) => {
    const { oldPass, newPass, user_email } = req.body;
    const user = await User.findOne({
        where: {user_email: user_email}
    })
    console.log('req.user',req.user)
    const checkPass = await helperFn.comparePassword(oldPass,user.password)
    console.log(user.password)
    if(!checkPass) {
        return next(new AppError('please provide a password',400));
    }
    const hashPass = await bcrypt.hash(newPass,8);
    user.password = hashPass;
    user.save()
    res.status(200).json({
        status: 'success',
    });
});
const updateUserPasswordView = (req, res) => {
    return res.render('admin/updateUserPasswordView.ejs')
}
// uploadAvatar
const uploadAvatar = helperFn.upload.single('image')
// set up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
})
console.log(uploadAvatar)
const updateUser = catchAsync(async (req, res,next) => {
    console.log('check req.file exist',req.file);

    const {phonenumber, age,user_id,user_email} = req.body;
    const user = await User.findOne({
        // where: {user_id: user_id},
        where: {user_email: user_email},
        attributes: {exclude: ['password','countLogin','isActive']},
    });
    console.log(req.body);
    if(req.file) {
        const img = await cloudinary.uploader.upload(req.file.path, {
            public_id: req.file.filename
        });
        user.avatar = await img.url;
    }
    if(phonenumber) user.phonenumber = phonenumber;
    if(age) user.age = age;
    res.status(200).json({
        status: 'success',
        data: user,
      });
      user.save();
})
const updateProfileView = (req, res) => {
    return res.render('admin/updateProfileView.ejs')
}
module.exports = {
    login: login,
    updateUserPassword:updateUserPassword,
    uploadAvatar:uploadAvatar,
    updateUser:updateUser,
    loginAdminView:loginAdminView,
    updateUserPasswordView:updateUserPasswordView,
    updateProfileView:updateProfileView
}
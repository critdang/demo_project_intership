const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/errorHandle/catchAsync');
const rateLimit = require('express-rate-limit');
const AppError = require('../utils/errorHandle/appError');

const {Client} = require('../models');
exports.protectingRoutes = catchAsync(async (req, res,next) => {    
    const bearerHeader = req.headers['authorization'];//raw header
    if(typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' '); //tách header
        const bearerToken = bearer[1];//lấy dãy string sau
        req.token = bearerToken; //chèn thêm token lưu lại để check
    }else{
        return next(new AppError('Please pass token to header',401));
    }
    if(!req.token || req.token === "null") {
        return next(new AppError("You have  not log in yet",401));
    }
    const decode = await jwt.verify(req.token, process.env.JWT_SECRET);
    const client = await Client.findOne({
        attributes: {exclude: ['password','countLogin']},
        where: {
            client_id: decode.client_id
        }, 
        //tại sao phải decode id
    });
    if(!client) {
        return next(new AppError('this client does not exist',401));
    }
    req.client = client; //tại sao cần cái này
    next();

})

exports.loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: process.env.NODE_ENV === 'test' ? 100 : 5,
    message: 'Something went wrong , try again after 3 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


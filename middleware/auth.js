const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/errorHandle/catchAsync');
const rateLimit = require('express-rate-limit');
const AppError = require('../utils/errorHandle/appError');
const {Client} = require('../models');
const bcrypt = require('bcryptjs');
var localStrategy = require('passport-local').Strategy;
const User = require('../models').User;

exports.authUser = catchAsync(async passport => {
    passport.serializeUser((user, done) => {
        done(null, user);
    
    })
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use('user-local',new localStrategy({usernameField:'user_email'},
         function(username,password, done) {
            User.findOne({
                where:{user_email: username},
            })
            .then(async(user) => {
                if(!user) return done(null, false, { message: 'Incorrect email.' });
                
                let passport = await bcrypt.compare(password,user.password);
    
                if(!passport) return done(null, false, {message: 'Incorrect password.'});
                return  done(null,user)
             
            })
        }
    ))
})

exports.authClient = catchAsync(async passport => {
    passport.serializeUser((user, done) => {
        done(null, user);
    })
    
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use('client-local',new localStrategy({usernameField:'client_email'},
         function(username,password, done) {
            Client.findOne({
                where:{client_email: username},
            })
            .then(async(client) => {
                if(!client) return done(null, false, { message: 'Incorrect email.' });
                
                let passport = await bcrypt.compare(password,client.password);
    
                if(!passport) return done(null, false, {message: 'Incorrect password.'});
                return done(null,client)
            })
        }
    ))
})

exports.protectingRoutes = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/login_view');
    next();
})

// exports.protectingRoutes = catchAsync(async (req, res,next) => {    
    
//     const bearerHeader = req.headers['authorization'] || req.cookie.jwt;//raw header

//     if(typeof bearerHeader !== 'undefined') {
//         const bearer = bearerHeader.split(' '); //tách header
//         const bearerToken = bearer[1];//lấy dãy string sau
//         req.token = bearerToken; //chèn thêm token lưu lại để check
//     }else{
//         return next(new AppError('Please pass token to header',401));
//     }
//     if(!req.token || req.token === "null") {
//         return next(new AppError("You have  not log in yet",401));
//     }

//     const decode =  jwt.verify(req.token, process.env.JWT_SECRET,(err,decode) => {
//         if(err.name === "JsonWebTokenError") {
//             return next(new AppError('Invalid token',401));
//         }
//     });
//     if(!decode) return next(new AppError('Invalid token',401));
//     const client = await Client.findOne({
//         attributes: {exclude: ['password','countLogin']},
//         where: {
//             client_id: decode.client_id,
//         }, 
//     });
//     if(!client) {
//         return next(new AppError('this client does not exist',401));
//     }
//     req.client = client; 
//     next();
    
// })

exports.accessToken = catchAsync(async (req, res) => {
    const accessToken = req.cookie.jwt
    console.log(req.cookie)
    if(!accessToken || accessToken === "null") {
        return next(new AppError("You have  not log in yet",401));
    }
    try{
        const decoded = jwt.verify(accessToken,process.env.JWT_SECRET,(err, decode) => {
            if(err.name === "JsonWebTokenError") {
                return next(new AppError('Invalid token',401));
            }
        req.user = decoded;
        next();
        })
    }catch(err){
        console.log(err);
        res.status(500).json('Internal Server Error')
    }
})

exports.loginLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: process.env.NODE_ENV === 'test' ? 100 : 5,
    message: 'Something went wrong , try again after 3 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


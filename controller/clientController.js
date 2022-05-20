
const Client = require('../models').Client;
const Regis = require('../models').Regis;
const Class = require('../models').Class;
// const model = require('../models/index')
const helperFn = require('../utils/helperFn');
const catchAsync = require('../utils/errorHandle/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/errorHandle/appError');
const bcrypt = require('bcryptjs/dist/bcrypt');
const cli = require('nodemon/lib/cli');
const cloudinary = require('cloudinary')
require('dotenv').config();

const getClient = async(req, res) => {
    const client = await Client.findAll({
        attributes: { exclude: ['password', 'countLogin', 'isActive'] },
    })

    helperFn.returnSuccess(req, res, client);

    res.render('admin/viewClients',{data: client});
}
const idClient = async(req, res) => {
    const client = await Client.findOne({
        where: { client_id: req.params.id },
        attributes: { exclude: ['password', 'countLogin', 'isActive'] },
    });

    helperFn.returnSuccess(req, res, client);

    res.render("website/websiteView",{ data: client});
}

const createClient = catchAsync(async (req, res,next) => {
    const {firstName,client_email,password} = req.body;
    const emailExists = await Client.findOne({where: {client_email: client_email}});

    if(emailExists) {res.json("Email already existed ")};
    await Client.create({
        firstName,
        client_email,
        password,
    });
    
    const token = helperFn.generateToken({client_email}, '3m');

    helperFn.sendEmail(
        client_email,
        process.env.SUCCESS_EMAIL,
        process.env.SUCCESS_EMAIL_DES,
        process.env.SUCCESS_EMAIL_ENDPOINT,
        token,
    );

    helperFn.returnSuccess(req, res, token);
});

const signupView = async (req, res) => {
    return res.render('website/signup.ejs');
}

const login = catchAsync(async (req, res,next) => {
    const {client_email:inputEmail, password:inputPassword} = req.body;
    // check exist email
    if(!inputEmail || !inputPassword) {
        return next(new AppError(`Please provide email and password!`,400))
    }
    // get exist email
    const client = await Client.findOne( {where: {client_email:inputEmail}});

    if(!client) {
        return next(new AppError(`your email is not correct`,400));
    };
    // get all params client
    const {
        password,
        countLogin,
        isActive,
    } = client;
    // check countLogin and isActive
    if(countLogin >=3 || !isActive) {
        return next(
            new AppError(
                'your account has been disabled or not active yet , please contact admin',
                400
        ))
    };
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        await client.increment('countLogin');
        await client.save();
        return next(new AppError('your password not correct', 400));
    };
    const token = helperFn.generateToken({ client_id:client.client_id},'1d');
    client.countLogin = 0;

    await client.save(); //save database by sequelize
    // helperFn.returnSuccess(req,res,client);
    
    res.render("website/websiteView",{ data: [client],token:token});
});
const loginView = async(req, res) => {
    return res.render('website/login.ejs');
}
const verifyClientEmail = catchAsync(async(req, res,next) => {
    const token = req.params.token;
     // verify makes sure that the token hasn't expired and has been issued by us
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const client = await Client.findOne({
        attribute: ['client_id','isActive'],
        where: {
            client_email : decodedToken.client_email 
        }
    });
    if(!client) {
        return next(new AppError('this email not available',401));
    }
    client.isActive = true;
    await client.save();

    helperFn.returnSuccess(req, res, 'success. Your email has been actived');
})

const updateClientPassword = catchAsync(async (req, res,next) => {
    const {client_id} = req.params;
    const { oldPass, newPass } = req.body;
    const client = await Client.findOne({
        where: {client_id: client_id}
        // where: {client_email: client_email}
    })
    const checkPass = await helperFn.comparePassword(oldPass,client.password);
    // console.log('check pass',checkPass)
    // console.log('client password',client.password)
    // console.log('old password',oldPass)
    if(!checkPass) {
        return next(new AppError('please try the right password',400));
    }
    const hashPass = await bcrypt.hash(newPass,8);

    client.password = hashPass;
    await client.save();

    helperFn.returnSuccess(req, res)
});
const updateClientPasswordView = (req, res) => {
    res.render('website/updateClientPasswordView.ejs',{data : req.params});
}

// uploadAvatar
const uploadAvatar = helperFn.upload.single('image');
// set up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
})
// updateMe

const updateMe = catchAsync(async (req, res,next) => {
    // console.log('check req.file exist',req.file); check file
    const client_id = req.params.client_id;
    const {phonenumber, age,} = req.body;
    const client = await Client.findOne({
        where: {client_id: client_id},
        attributes: {exclude: ['password','countLogin','isActive']},
    });

    if(req.file) {
        const img = await cloudinary.uploader.upload(req.file.path, {
            public_id: req.file.filename
        });
        client.avatar = await img.url;
    }
    if(phonenumber) client.phonenumber = phonenumber;
    if(age) client.age = age;

    await client.save();

    // helperFn.returnSuccess(req, res,client);

    res.redirect("/admin/getClient");
})
const deleteClient = catchAsync(async (req, res) => {
    client_id = req.params.client_id;
    const client = await Client.findOne({
        where: {client_id:client_id}
    })
    await client.destroy();

    // helperFn.returnSuccess(req, res,'Client deleted successfully')

    res.redirect('/admin/getClient');
})
// update Me view
const updateMeView = (req, res) => {
    res.render('website/updateMeView.ejs',
    {data : req.params}
    )
};
const websiteView = async(req, res) => {
    res.render('website/websiteView.ejs');
};
const regis = async (req, res) => {
    client_id = req.params.client_id;
    class_id = req.params.class_id;
    const regisExists = await Regis.findOne({
        where: {
            client_id: client_id,
            class_id: class_id
        }
    });

    if(regisExists) {
        res.json("Your registration has been already existed ")
        regisExists.destroy();
    }
    
    const data = await Regis.create({
        client_id,
        class_id,
    });

    helperFn.returnSuccess(req, res, data);
}
const registration = catchAsync(async(req, res) => {
    // class_id = req.params.class_id
    client_id = req.params.client_id;
    
    const regis = await Regis.findOne({
        where: {client_id: client_id},
        include: {
            model: Class,
            attributes: ['class_id','subject','from','to']
        }
    });

    if(!regis) {
        res.send('does not have registration');
    }

    // helperFn.returnSuccess(req, res)

    res.render("website/cancelRegistrationView",{ data: [regis]});
})
const cancelRegistration = catchAsync(async (req, res) => {
    reg_id = req.params.reg_id;
    
    const data = await Regis.findOne({
        where: {reg_id: reg_id}
    })
    await data.destroy();
    await data.save();

    // helperFn.returnSuccess(req, res,data);

    res.redirect('api/calender');
})

const getOpenClass = catchAsync(async (req, res) => {
    client_id = req.params.client_id;
    const data = await Class.findOne({
        where: {status: 'open'},
    })

    // helperFn.returnSuccess(req,res,client_id);

    res.render('website/registView',{data:[data],client_id:client_id});
})

const registedClass = catchAsync(async (req, res) => {
    client_id = req.params.client_id;

    const data = await Regis.findOne({
        where: {client_id: client_id, status: 'pending'},
        include: [
            {
                model: Class,
                attributes: ['subject','from','to'],
            }   
        ]
    })
    
    helperFn.returnSuccess(req, res, data);
    if(!data) res.render('website/registedClass',{data:[data]});
})
module.exports = {
    getClient: getClient,
    idClient: idClient,
    createClient: createClient,
    signupView:signupView,
    login:login,
    loginView:loginView,
    verifyClientEmail:verifyClientEmail,
    updateClientPassword:updateClientPassword,
    updateClientPasswordView:updateClientPasswordView,
    updateMe:updateMe,
    updateMeView:updateMeView,
    uploadAvatar:uploadAvatar,
    websiteView:websiteView,
    deleteClient:deleteClient,
    cancelRegistration:cancelRegistration,
    registration:registration,
    getOpenClass:getOpenClass,
    registedClass:registedClass,
    regis:regis
}
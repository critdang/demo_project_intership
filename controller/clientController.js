
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
const getClient = async(req, res) => {
    const client = await Client.findAll({
        attributes: { exclude: ['password', 'countLogin', 'isActive'] },
    })
    // res.status(200).json({
    //     status: 'success',
    //     data: client
    // })
    res.render('admin/viewClients',{data: client})
}
const idClient = async(req, res) => {
    const client = await Client.findOne({
        where: { client_id: req.params.id },
        attributes: { exclude: ['password', 'countLogin', 'isActive'] },
    });
    // res.status(200).json({
    //     status: 'Success.Welcome to Profile',
    //     data: client
    // })
    res.render("website/websiteView",{ data: client})

}

const postCRUD = catchAsync(async (req, res,next) => {
    const {firstName,client_email,password} = req.body
    const emailExists = await Client.findOne({where: {client_email: client_email}});

    console.log(emailExists)
    if(emailExists) {res.json("Email already existed ")}
    await Client.create({
        firstName,
        client_email,
        password
    })
    
    const token = helperFn.generateToken({client_email}, '3m');
    helperFn.sendEmail(
        client_email,
        'Verify your email',
        'please click the link below to verify your email',
        '/api/verify/',
        token
    );
    res.status(200).json({
        status: 'success',
        message: 'please check your email to confirm within 3 minutes ',
        token: token
    });
});

const signup = async (req, res) => {
    return res.render('crud.ejs');
}

const login = catchAsync(async (req, res,next) => {
    const {client_email:inputEmail, password:inputPassword} = req.body
    // check exist email
    if(!inputEmail || !inputPassword) {
        return next(new AppError(`Please provide email and password!`,400))
    }
    // get exist email
    const client = await Client.findOne( {where: {client_email:inputEmail}})
    if(!client) {
        return next(new AppError(`your email is not correct`,400));
    }
    // get all params client
    const {
        client_id,
        client_email,
        password,
        firstName,
        lastName,
        countLogin,
        isActive,
        phonenumber,
        age,
        avatar
    } = client;
    // check countLogin and isActive
    if(countLogin >=3 || !isActive) {
        return next(
            new AppError(
                'your account has been disabled or not active yet , please contact admin',
                400
        ))
    }
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        await client.increment('countLogin');
        client.save();
        return next(new AppError('your password not correct', 400));
    }

    const token = helperFn.generateToken({ client_id:client.client_id},'1d');
    client.countLogin = 0;
    client.save(); //save database by sequelize
    // res.status(200).json({
    //     status: 'success',
    //     token: token,
    //     data: [
    //         client
    //     ]
    // });
    
    res.render("website/websiteView",{ data: [client],token:token})

});
const loginView = async(req, res) => {
    return res.render('login.ejs')
}
const verifyClientEmail = catchAsync(async(req, res,next) => {
    const token = req.params.token;
     // verify makes sure that the token hasn't expired and has been issued by us
    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
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
    client.save()
    res.status(200).json({
        status: 'success. Your email has been actived',
    })
})

const updateClientPassword = catchAsync(async (req, res,next) => {
    const {client_id} = req.params
    console.log('update client', client_id)
    const { oldPass, newPass } = req.body;
    const client = await Client.findOne({
        where: {client_id: client_id}
        // where: {client_email: client_email}

    })
    console.log('req client',req.client)
    const checkPass = await helperFn.comparePassword(oldPass,client.password)
    // console.log('check pass',checkPass)
    // console.log('client password',client.password)
    // console.log('old password',oldPass)
    if(!checkPass) {
        return next(new AppError('please try the right password',400));
    }
    const hashPass = await bcrypt.hash(newPass,8);
    client.password = hashPass;
    client.save()
    res.status(200).json({
        status: 'success',
    });
});
const updateClientPasswordView = (req, res) => {
    res.render('website/updateClientPasswordView.ejs',{data : req.params})
    //check biến
    // res.status(200).json({
    //     data : req.params
    // })
}
// uploadAvatar
const uploadAvatar = helperFn.upload.single('image')
// set up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
})
// updateMe

const updateMe = catchAsync(async (req, res,next) => {
    console.log('check req.file exist',req.file);
    const client_id = req.params.client_id
    const {phonenumber, age,} = req.body;
    const client = await Client.findOne({
        where: {client_id: client_id},
        attributes: {exclude: ['password','countLogin','isActive']},
    });
    console.log(req.body);
    if(req.file) {
        const img = await cloudinary.uploader.upload(req.file.path, {
            public_id: req.file.filename
        });
        client.avatar = await img.url;
    }
    if(phonenumber) client.phonenumber = phonenumber;
    if(age) client.age = age;
    res.status(200).json({
        status: 'success',
        data: client,
      });
      client.save();
})
const deleteClient = catchAsync(async (req, res) => {
    client_id = req.params.client_id;
    const client = await Client.findOne({
        where: {client_id:client_id}
    })
    client.destroy();
    client.save();
    // res.status(200).json({
    //     message:'Client deleted successfully'
    // })
    res.redirect('/api/admin/viewClients')
})
// update Me view
const updateMeView = (req, res) => {
    res.render('website/updateMeView.ejs',
    {data : req.params}
    )
}
const websiteView = async(req, res) => {
    res.render('website/websiteView.ejs')
}

const calender = catchAsync(async(req, res) => {
    // class_id = req.params.class_id
    client_id = req.params.client_id
    
    const regis = await Regis.findOne({
        where: {client_id: client_id},
        include: {
            model: Class,
            attributes: ['class_id','subject','from','to']
        }
    })

    if(!regis) {
        res.send('does not have registration')
    }
    // res.status(200).json({
    //     status: 'success',
    //     data:[regis],
    //     test:regis.Class.subject
    // })
    res.render("website/registrationView",{ data: [regis]})
})

const cancelRegistration = catchAsync(async (req, res) => {
    reg_id = req.params.reg_id;
    
    const data = await Regis.findOne({
        where: {reg_id: reg_id}
    })
    data.destroy()
    data.save()
    // res.status(200).json({
    //     status: 'success',
    // })
    res.redirect('api/calender')
})
module.exports = {
    getClient: getClient,
    idClient: idClient,
    postCRUD: postCRUD,
    signup:signup,
    login:login,
    verifyClientEmail:verifyClientEmail,
    loginView:loginView,
    updateClientPassword:updateClientPassword,
    updateClientPasswordView:updateClientPasswordView,
    updateMe:updateMe,
    updateMeView:updateMeView,
    uploadAvatar:uploadAvatar,
    websiteView:websiteView,
    deleteClient:deleteClient,
    calender:calender,
    cancelRegistration:cancelRegistration
}
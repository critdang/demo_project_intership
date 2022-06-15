
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
const cloudinary = require('cloudinary');
const fs = require('fs');
const {promisify} = require('util');
const removeFile = promisify(fs.unlink);
const {Op} = require('sequelize');
const { sequelize } = require('../models');

require('dotenv').config();

const getClient = async(req, res) => {
    
    const data = await Client.findAll({
        attributes: { exclude: ['password', 'countLogin', 'isActive'] },
    })

    // helperFn.returnSuccess(req, res, data);
    res.render('admin/viewClients',{data});
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
    const {firstName,client_email,password,lastName} = req.body;
    if(!firstName || !client_email || !password) {
        return res.status(400).json(process.env.FILL_OUT);
    }
    const emailExists = await Client.findOne({where: {client_email: client_email}});
    if(emailExists) {return res.status(400).json(process.env.EXIST_ACCOUNT)};
    
    if(!client_email) return next(new AppError(process.env.PROVIDE_EMAIL,400))
    await Client.create({
        firstName,
        client_email,
        password,
        lastName
    });
    
    const token = helperFn.generateToken({client_email}, '3m');

    helperFn.sendEmail(
        client_email,
        process.env.SUCCESS_EMAIL,
        process.env.SUCCESS_EMAIL_DES,
        process.env.SUCCESS_EMAIL_ENDPOINT,
        token,
    );
    res.redirect('/client/loginView')
    // helperFn.returnSuccess(req, res);
});

const signupView = async (req, res) => {
    return res.render('website/signup.ejs');
}

const login = catchAsync(async (req, res,next) => {
    const {client_email:inputEmail, password:inputPassword} = req.body;
    // check exist email
    if(!inputEmail || !inputPassword) {
        return next(new AppError(process.env.PROVIDE,400))
    }
    // get exist email
    const client = await Client.findOne( {where: {client_email:inputEmail}});

    if(!client) {
        return next(new AppError(process.env.EMAIL_NOT_CORRECT,400));
    };
    // get all params client
    const {
        password,
        countLogin,
        isActive,
    } = client;
    // check countLogin and isActive
    // if(countLogin >=3 || !isActive) {
    //     return next(
    //         new AppError( process.env.DISABLED,400))
    // };
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        await client.increment('countLogin');
        await client.save();
        return next(new AppError(process.env.PASS_NOT_CORRECT, 400));
    };
    const token = helperFn.generateToken({ client_id:client.client_id},'1d');
    client.countLogin = 0;
    await client.save(); //save database by sequelize
    res.cookie('jwt',token, { httpOnly: true, secure: true, maxAge: 3600000 });
    const linkImage = client.avatar
    const myImage = cloudinary.image(linkImage, {type: "fetch"},{width: 100, height: 150, crop: "fill"});
    // helperFn.returnSuccess(req,res,myImage);
    res.render("website/websiteView",{ data: [client],token:token,Image: myImage});
});
const loginView = async(req, res) => {
    return res.render('website/login.ejs');
}

const logout = (req, res) => {
    req.logout();
    res.redirect('/client/loginView');
}

const verifyClientEmail = catchAsync(async(req, res,next) => {
    const token = req.params.token;
     // verify makes sure that the token hasn't expired and has been issued by us
    try{
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const client = await Client.findOne({
        attribute: ['client_id','isActive'],
        where: {
            client_email : decodedToken.client_email 
        }
    });
    if(!client) {
        return next(new AppError(process.env.EMAIL_NOT_AVA,401));
    }
    client.isActive = true;
    await client.save();
}catch (err) {
    if(err.name ==='TokenExpiredError')
    return next(new AppError(process.env.TOKEN_EXPIRED,401));
}
    helperFn.returnSuccess(req, res, process.env.SUCCESS_VERIFY);
})

const updateClientPassword = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/client/loginView');
    const {client_id} = req.params;
    const { oldPass, newPass } = req.body;
    const client = await Client.findOne({
        where: {client_id: client_id}
    })
    const checkPass = await helperFn.comparePassword(oldPass,client.password);
    if(!checkPass) {
        return next(new AppError(process.env.CHECK_PASS,400));
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
    const {phonenumber, age} = req.body;
    const client = await Client.findOne({
        where: {client_id: client_id},
        attributes: {exclude: ['password','countLogin','isActive']},
    });

    if(req.file) {
        const img = await cloudinary.uploader.upload(req.file.path, {
            public_id: req.file.filename
        });
        client.avatar = img.url;
        await removeFile(req.file.path);
    }
    if(phonenumber) client.phonenumber = phonenumber;
    if(age) client.age = age;

    await client.save();

    helperFn.returnSuccess(req, res,client);

    // res.redirect("/admin/getClient");
})
const deleteClient = catchAsync(async (req, res) => {
    const t = await sequelize.transaction();
    try{
        client_id = req.params.client_id;
        await Client.destroy({where: {client_id:client_id}},{transaction:t});
        await Regis.destroy({where: {client_id:client_id}},{transaction:t});
        await t.commit();
        helperFn.returnSuccess(req, res );
        // helperFn.returnSuccess(req, res,'Client deleted successfully')
        
        // res.redirect('/admin/getClient');
    }catch(err) {
        t.rollback();
        console.log(err);
    }
})
const getProfile = async(req, res) => {
    // client_id = req.params.client_id; cùng địa chỉ
    const data = {...req.user};
    res.render('website/updateMeView.ejs',
    {data})
}
// update Me view
const updateMeView = (req, res) => {
    res.render('website/updateMeView.ejs',
    {data : req.params})
};
const websiteView = async(req, res) => {
    res.render('website/websiteView.ejs');
};
const regis = async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/client/loginView');
    try{
    client_id = req.params.client_id;
    class_id = req.params.class_id;
    const regisExists = await Regis.findOne({
        where: {
            client_id: client_id,
            class_id: class_id,
            status: ['pending','active']
        }
    });
    if(regisExists) {
        await regisExists.destroy();
        return res.json(process.env.REGIS_EXISTS)
    }
    
    const classStatus = await Class.findOne({
        where: {
            class_id,
        }
    })
    if(classStatus.max_students == classStatus.current_student) {
        return next(new AppError(process.env.CLASS_FULL,400));
    }
    const data = await Regis.create({
        client_id,
        class_id,
        regisDate: Date.now()
    });
    if(!data) return helperFn.returnFail(req, res);

    helperFn.returnSuccess(req, res, data);
    }catch(err) {
        console.log(err);
    }
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
        res.send(process.env.NO_REGIS);
    }

    // helperFn.returnSuccess(req, res)

    res.render("website/cancelRegistrationView",{ data: [regis]});
})

const getPendingClass = catchAsync(async (req, res) => {
    client_id = req.params.client_id;
    const data = await Regis.findAll({
        where: {client_id,status:'pending'},
        include: {
            model: Class,
            attributes: ['class_id','subject','from','to']
        }
    })
    // helperFn.returnSuccess(req,res,data);
    res.render('website/cancelRegisView',{data,client_id});
})

const cancelRegistration = catchAsync(async (req, res) => {
    class_id = req.params.class_id;
    client_id = req.params.client_id;
    const cancelRegis = await Regis.findOne({
        where: {
            class_id, 
            client_id,
            status:'pending'}
    })
    // if (!cancelRegis) {
    //     return next(new AppError(`Not pending , can not cancel`, 400));
    //   }
    cancelRegis.status = 'cancel';
    await cancelRegis.save();
    helperFn.returnSuccess(req, res,cancelRegis);

    // res.redirect("website/cancelRegisView",{cancelRegis:cancelRegis});

})

const getOpenClass = catchAsync(async (req, res) => {
    client_id = req.params.client_id;
    try{
        const data = await Class.findAll({
            status:'open',
            limit: 5
        });

        // helperFn.returnSuccess(req,res,regisExists);
        res.render('website/registView',{data,client_id});
    }catch(err){
        console.log(err);
    }
})

const registedClass = catchAsync(async (req, res) => {
    try{
    client_id = req.params.client_id;

    const data = await Regis.findAll({
        where: {
            client_id,
        },
        include: [
            {
                model: Class,
                attributes: ['subject','from','to'],
            }   
        ]
    })
    // helperFn.returnSuccess(req, res, data);
    if(data) res.render('website/registedClass',{data});
    }catch(err) {
        console.log(err)
    }

})
const getCalenderClass = catchAsync(async (req, res) => {
    const client_id = req.params.client_id;
    const data = await Regis.findAll({
      where: { client_id, status: 'active'},
      include: {
          model: Class,
          attributes: ['subject', 'from', 'to','week_day','class_description'],
      }
    });
    if (!data) {
      return next(new AppError(process.env.NO_CLASS, 404));
    }

    // helperFn.returnSuccess(req, res,data)
    res.render('website/calenderView',{data});

})
module.exports = {
    getClient: getClient,
    idClient: idClient,
    createClient: createClient,
    signupView:signupView,
    login:login,
    loginView:loginView,
    logout:logout,
    verifyClientEmail:verifyClientEmail,
    updateClientPassword:updateClientPassword,
    updateClientPasswordView:updateClientPasswordView,
    getProfile:getProfile,
    updateMe:updateMe,
    updateMeView:updateMeView,
    uploadAvatar:uploadAvatar,
    websiteView:websiteView,
    deleteClient:deleteClient,
    cancelRegistration:cancelRegistration,
    registration:registration,
    getPendingClass:getPendingClass,
    getOpenClass:getOpenClass,
    registedClass:registedClass,
    getCalenderClass: getCalenderClass,
    regis:regis
}
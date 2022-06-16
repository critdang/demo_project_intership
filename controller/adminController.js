
const Sequelize = require('sequelize');
const User = require('../models').User;
const helperFn = require('../utils/helperFn');
const catchAsync = require('../utils/errorHandle/catchAsync');
const AppError = require('../utils/errorHandle/appError');
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary');
const Op = Sequelize.Op;
const Class = require('../models').Class;
const Regis = require('../models').Regis;
const Client = require('../models').Client;
const {sequelize} = require('../models');
const fs = require('fs');
const {promisify} = require('util');
const removeFile = promisify(fs.unlink);
const constants = require('constants');
require('dotenv').config()

const login = async (req, res,next) => {
    const {user_email:inputEmail, password:inputPassword} = req.body;

    if(!inputEmail || !inputPassword) {
        return next(new AppError(constants.PROVIDE,400));
    }

    const user = await User.findOne( {where: {user_email:inputEmail}});
    if(!user) {
        return next(new AppError(constants.EMAIL_NOT_CORRECT,400));
    }

    const {password} = user;
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        return next(new AppError(constants.PASS_NOT_CORRECT, 400));
    }
    // helperFn.returnSuccess(req, res);
    res.redirect('/classes');
}

const loginAdminView = (req, res) => {
    return res.render('admin/login.ejs');
}

const logout = (req, res) => {
    req.logout();
    res.redirect('/admin/login_view');
}

const updateUserPassword = catchAsync(async (req, res,next) => {
    const { oldPass, newPass } = req.body;
    const id = req.user.user_id;
    const user = await User.findOne({
        where: {user_id:id }
    })

    const checkPass = await helperFn.comparePassword(oldPass,user.password);
    if(!checkPass) {
        return next(new AppError(constants.CHECK_PASS,400));
    }

    const hashPass = await bcrypt.hash(newPass,8);
    user.password = hashPass;
    await user.save();

    helperFn.returnSuccess(req, res);
});

const updateUserPasswordView = (req, res) => {
    return res.render('admin/updateUserPasswordView.ejs');
}
// uploadAvatar
const uploadAvatar = helperFn.upload.single('image');
// set up cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET, 
})

const updateUser = catchAsync(async (req, res,next) => {
    const {phonenumber, age} = req.body;
    const user_id = req.params.user_id;

    const user = await User.findOne({
        where: {user_id},
        attributes: {exclude: ['password','countLogin','isActive']},
    });

    if(req.file) {
        const img = await cloudinary.uploader.upload(req.file.path, {
            public_id: req.file.filename
        });
        user.avatar = img.url;
        // await removeFile(req.file.path);
    }

    if(phonenumber) user.phonenumber = phonenumber;
    if(age) user.age = age;

    await user.save();
    // helperFn.returnSuccess(req,res,user);
    res.redirect('/admin/update_profile_view');
})

const updateProfileView = catchAsync(async(req, res) => {
    const user_id ={...req.user.user_id};
    const data = await User.findOne({where: user_id});
    // helperFn.returnSuccess(req, res, data);
    return res.render('admin/updateProfileView.ejs',{data});
});

const findClass = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/login_view');

    const id = req.params.id;
    const currentClass = await Class.findOne({ where: {class_id:id}});
    if (!currentClass) {
        return next(new AppError(constants.NO_CLASS_FOUND), 404);
    }

    helperFn.returnSuccess(req, res,currentClass)
})

const viewClientsInClass = catchAsync(async (req, res, next) => {
    try{
    const class_id = req.params.class_id;
    const data = await Regis.findAll({
        where: { class_id, status: 'active' },
        through: [],
        include:{
            model: Client,
            attributes: {
                exclude: ['password','isActive', 'avatar','createdAt','updatedAt']
            }
        }
    })
    // helperFn.returnSuccess(req,res,data);

    res.render('class/viewClientsInClass.ejs',{data,class_id});
    }catch(err){
        console.log(err);
    }
})     
const deleteClientInClass = catchAsync(async (req, res, next) => {
    const client_id = req.params.client_id;
    const class_id = req.params.class_id;
    const t = await sequelize.transaction(async (t) => {
        try{
            const currentRegis = await Regis.findOne({
                where: {client_id, status: 'active'}
            });
            await currentRegis.destroy(),{transaction: t};

            const editClass = await Class.findOne({
                where: {class_id,status:'open'}
            })

            if(editClass) {
                await editClass.decrement('current_student',{transaction: t});
            }
            helperFn.returnSuccess(req, res)
        }catch (err) {
            console.log(err);
        }
    })

})     
const viewClientsInClassView = async (req, res, next) => {
    res.render ('class/viewClientsInClass.ejs');
}
const getListRegisterClass = catchAsync(async (req, res, next)=>{
    // pass to param: /api/classes/listRegistered?status=pending,active,cancel
    let listRegis;

    if(req.query.action) {
        const defaultFilter = ['accept', 'reject'];
        let clientFiler = req.query.action?.split(',');
        if(!clientFiler) {
            clientFiler = defaultFilter;
        }
        listRegis = await Regis.findAll({
            where: {
                admAction: {
                    [Op.in] : clientFiler
                },
            },
            order: [['status','DESC']]
        });
        console.log(listRegis)    
    }else {
        listRegis = await Regis.findAll({
            order: [['status','DESC']]
        });
    }
    
    // helperFn.returnSuccess(req, res,listRegis);

    res.render('admin/getListRegisterView.ejs',{data:listRegis});
})
const submitClassRegistration = catchAsync(async (req, res, next)=>{
    if (!req.isAuthenticated()) return res.redirect('/admin/login_view');

    const accept = 'accept';
    const reject = 'reject';
    const action = req.body.action;
    const class_id = req.body.class_id;
    const client_id = req.body.client_id;
    await sequelize.transaction(async(t) => {
        const currentRegis = await Regis.findOne({
            where : {class_id, client_id, status: 'pending'},
            include : {
                model: Client,
                attributes : ['client_email'],
            },
        });
        if(!currentRegis) {
            return next(new AppError(constants.NO_CLASS_FOUND, 404))
        }
        const currentClass = await Class.findOne({
            where: { class_id : class_id},
        });
        const clientEmail = currentRegis.Client.client_email;
        const max_students = currentClass.max_students;
        const currentStudent = currentClass.current_student;

        if(action === accept) {
            if(currentClass.status === 'close') {
                return next(new AppError(constants.CLASS_CLOSE, 404))
            };
            await currentRegis.update(
                {
                    admAction: action,
                    status: 'active',
                },
                { transaction: t}
            );
 
            await currentClass.increment('current_student', {transaction: t});
            if(max_students - currentStudent === 1) {
                await currentClass.update(
                    {
                        status: 'close',
                    },
                    {transaction: t}
                );
            }
            helperFn.sendEmail(
                clientEmail,
                constants.CONGRA,
                constants.CONGRA_MSG
            )
        }
        if(action === reject) {
            await currentRegis.update(
                {
                    admAction: action,
                    status: 'cancel',
                },
                {transaction: t}
            );
            helperFn.sendEmail(
                clientEmail,
                constants.CANCEL,
                constants.CANCEL_MSG
            )
        }
        helperFn.returnSuccess(req, res);
    })
    // res.redirect('/api/classes/listRegistered');
})

module.exports = {
    login: login,
    logout:logout,
    updateUserPassword:updateUserPassword,
    updateUserPasswordView:updateUserPasswordView,
    uploadAvatar:uploadAvatar,
    updateUser:updateUser,
    loginAdminView:loginAdminView,
    updateProfileView:updateProfileView,
    findClass:findClass,
    viewClientsInClass:viewClientsInClass,
    viewClientsInClassView:viewClientsInClassView,
    deleteClientInClass:deleteClientInClass,
    getListRegisterClass:getListRegisterClass,
    submitClassRegistration: submitClassRegistration,
}
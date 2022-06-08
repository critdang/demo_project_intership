
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
require('dotenv').config()

const login = async (req, res,next) => {
    const {user_email:inputEmail, password:inputPassword} = req.body;
    // check exist email
    if(!inputEmail || !inputPassword) {
        return next(new AppError(process.env.PROVIDE,400));
    }
    // get exist email
    const user = await User.findOne( {where: {user_email:inputEmail}});
    if(!user) {
        return next(new AppError(process.env.EMAIL_NOT_CORRECT,400));
    }
    
    // get all params client
    const {password} = user;
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        return next(new AppError(process.env.PASS_NOT_CORRECT, 400));
    }
    // helperFn.returnSuccess(req, res);
    res.redirect('/admin/allClass');
}

const loginAdminView = (req, res) => {
    return res.render('admin/login.ejs');
}

const logout = (req, res) => {
    req.logout();
    res.redirect('/admin/loginView');
}

const updateUserPassword = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');
    const { oldPass, newPass, user_email } = req.body;
    const user = await User.findOne({
        where: {user_email: user_email}
    })
    const checkPass = await helperFn.comparePassword(oldPass,user.password);

    if(!checkPass) {
        return next(new AppError(process.env.CHECK_PASS,400));
    }

    const hashPass = await bcrypt.hash(newPass,8);
    user.password = hashPass;
    await user.save();

    helperFn.returnSuccess(req, res);
});

const updateUserPasswordView = (req, res) => {
    // if(!req.isAuthenticated()) {return res.redirect('/admin/loginView')};
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
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');
    const {phonenumber, age,user_email} = req.body;
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
    if(user_email) user.user_email = user_email;

    await user.save();
    helperFn.returnSuccess(req,res,user);
})

const updateProfileView = (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');
    const data = req.user.user_id;
    return res.render('admin/updateProfileView.ejs',{data});
}

// CRUD class
const getAllClass = catchAsync(async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');
    // localhost:8080/api/classes?status=open
    let checkStatus = ['open','pending']
    // if(req.query.status) {
    //     checkStatus = req.query.status.split(',')
    // }
    const Filter = {
        status: {
            [Op.in]: checkStatus,
        },
    };
    // console.log('with split',req.query.status.split(',')) //put value into a array
    const allClass = await Class.findAll({
        where: Filter
    })
    // helperFn.returnSuccess(req, res,allClass)

    return res.render('admin/getAllClassView.ejs',{data:allClass});
    
});
const getAllClassView = async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');
    return res.render('admin/getAllClassView.ejs');
}

const createClass = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

    const{subject, max_students, from, to } = req.body;
    console.log(subject)
    const existClass = await Class.findOne({
        where: {subject}
    })
    if(existClass) return next(new AppError(process.env.EXIST_CLASS),400);

    const newClass = await Class.create({
        subject,
        max_students, 
        from, 
        to,
        status:'open'
    });

    if(!newClass) helperFn.returnFail(req,res);
    // helperFn.returnSuccess(req, res,newClass);
    res.redirect('/admin/allClass');
}) 
const createClassView = async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

    return res.render('admin/createClassView.ejs');
}
const updateClass = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

    const class_id = req.params.class_id;

    const currentClass = await Class.findOne({ where: {class_id:class_id}})
    if(!currentClass) {
        return next(new AppError(process.env.NO_CLASS_FOUND, 404));
    }
    Object.assign(currentClass, req.body); //gán vào object currentClass
    await currentClass.save(); //Lưu class hiện tại

    helperFn.returnSuccess(req, res,currentClass);
})

const updateClassView = catchAsync(async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

    res.render('admin/updateClassView.ejs',
    {data : req.params})
})

const deleteClass = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

    const class_id = req.params.class_id;
    const currentClass = await Class.findOne({ where: {class_id:class_id} });
    if(!currentClass) {
        return next(new AppError(process.env.NO_CLASS_FOUND, 404));
    }
    if(currentClass.current_student !==0) {
        return next(new AppError(process.env.NO_DELETE, 400));
    }

    await currentClass.destroy();
    // helperFn.returnSuccess(req, res,'Class deleted successfully')

    res.redirect('/admin/allClass');
})
const findClass = catchAsync(async (req, res,next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

    const id = req.params.id;

    const currentClass = await Class.findOne({ where: {class_id:id}});
    if (!currentClass) {
        return next(new AppError(process.env.NO_CLASS_FOUND), 404);
    }

    helperFn.returnSuccess(req, res,currentClass)
})
const viewClientsInClass = catchAsync(async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

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

})     
const deleteClientInClass = catchAsync(async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');
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
    if (!req.isAuthenticated()) return res.redirect('/admin/login');

    res.render ('class/viewClientsInClass.ejs');
}
const getListRegisterClass = catchAsync(async (req, res, next)=>{
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

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
    if (!req.isAuthenticated()) return res.redirect('/admin/loginView');

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
            return next(new AppError(process.env.NO_CLASS_FOUND, 404))
        }
        const currentClass = await Class.findOne({
            where: { class_id : class_id},
        });
        const clientEmail = currentRegis.Client.client_email;
        const max_students = currentClass.max_students;
        const currentStudent = currentClass.current_student;

        if(action === accept) {
            if(currentClass.status === 'close') {
                return next(new AppError(process.env.CLASS_CLOSE, 404))
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
                process.env.CONGRA,
                process.env.CONGRA_MSG
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
                process.env.CANCEL,
                process.env.CANCEL_MSG
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
    getAllClass:getAllClass,
    getAllClassView:getAllClassView,
    createClass:createClass,
    createClassView:createClassView,
    updateClass:updateClass,
    updateClassView:updateClassView,
    deleteClass:deleteClass,
    findClass:findClass,
    viewClientsInClass:viewClientsInClass,
    deleteClientInClass:deleteClientInClass,
    viewClientsInClassView:viewClientsInClassView,
    getListRegisterClass:getListRegisterClass,
    submitClassRegistration: submitClassRegistration,
}
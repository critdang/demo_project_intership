
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
require('dotenv').config()

const login = async (req, res,next) => {
    const {user_email:inputEmail, password:inputPassword} = req.body;
    // check exist email
    if(!inputEmail || !inputPassword) {
        return next(new AppError(`Please provide email and password!`,400));
    }
    // get exist email
    const user = await User.findOne( {where: {user_email:inputEmail}});
    if(!user) {
        return next(new AppError(`your email is not correct`,400));
    }
    
    // get all params client
    const {password} = user;
    const wrongPassword = await helperFn.comparePassword(inputPassword,password);
    if(!wrongPassword) {
        return next(new AppError('your password not correct', 400));
    }

    res.redirect('/admin/allClass');
}
const loginAdminView = (req, res) => {
    return res.render('admin/login.ejs');
}
const updateUserPassword = catchAsync(async (req, res,next) => {
    const { oldPass, newPass, user_email } = req.body;
    const user = await User.findOne({
        where: {user_email: user_email}
    })
    const checkPass = await helperFn.comparePassword(oldPass,user.password);

    if(!checkPass) {
        return next(new AppError('please provide a password',400));
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
    const {phonenumber, age,user_id,user_email} = req.body;
    const user = await User.findOne({
        // where: {user_id: user_id},
        where: {user_email: user_email},
        attributes: {exclude: ['password','countLogin','isActive']},
    });
    if(req.file) {
        const img = await cloudinary.uploader.upload(req.file.path, {
            public_id: req.file.filename
        });
        user.avatar = await img.url;
    }
    if(phonenumber) user.phonenumber = phonenumber;
    if(age) user.age = age;

    await user.save();
    helperFn.returnSuccess(req,res,user);
})

const updateProfileView = (req, res) => {
    return res.render('admin/updateProfileView.ejs');
}

// CRUD class
const getAllClass = catchAsync(async (req, res) => {
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
    return res.render('admin/getAllClassView.ejs');
}

const createClass = catchAsync(async (req, res,next) => {
    const{subject, max_students, from, to } = req.body;

    const newClass = await Class.create({
        subject,
        max_students, 
        from, 
        to,
    });

    helperFn.returnSuccess(req, res,newClass)
}) 
const createClassView = async (req, res) => {
    return res.render('admin/createClassView.ejs');
}
const updateClass = catchAsync(async (req, res,next) => {
    const classId = req.params.id;

    const currentClass = await Class.findOne({ where: { class_id: classId}})
    if(!currentClass) {
        return next(new AppError('No class found with this id', 404));
    }
    Object.assign(currentClass, req.body); //gán vào object currentClas
    await currentClass.save(); //Lưu class hiện tại

    helperFn.returnSuccess(req, res,currentClass)
})

const deleteClass = catchAsync(async (req, res,next) => {
    const classId = req.params.id;
    const currentClass = await Class.findOne({ where: {class_id: classId} });

    if(!currentClass) {
        return next(new AppError('No class found with this id', 404));
    }
    if(currentClass.current_student !==0) {
        return next(new AppError('Class have student , can not delete', 400));
    }

    await currentClass.destroy();

    helperFn.returnSuccess(req, res,'Class deleted successfully')

    res.redirect('/admin/allClass');
})
const findClass = catchAsync(async (req, res,next) => {
    const id = req.params.id;

    const currentClass = await Class.findOne({ where: {class_id:id}});
    if (!currentClass) {
        return next(new AppError('No class founded '), 404);
    }

    helperFn.returnSuccess(req, res,currentClass)
})
const viewClientsInClass = catchAsync(async (req, res, next) => {
    const id = req.params.class_id;
    const data = await Class.findOne({
        where: { class_id: id },
        attributes: [],
        include: [
            {
                model: Regis,
                through: {
                    attributes: ['status']
                }
            }
        ]
    })

    if (!data) {
        // helperFn.returnFail(req,res,'No client was found')
    }
    res.json({data:data})
    // helperFn.returnSuccess(req,res,data)
    // res.render('class/viewClientsInClass.ejs',{data:[data]})

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
        });
    }else {
        listRegis = await Regis.findAll();
    }
    
    helperFn.returnSuccess(req, res,listRegis);

    res.render('admin/getListRegisterView.ejs',{data:listRegis});
})
const submitClassRegistration = catchAsync(async (req, res, next)=>{
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
            return next(new AppError('No register class founded', 404))
        }
        const currentClass = await Class.findOne({
            where: { class_id : class_id},
        });
        const clientEmail = currentRegis.Client.client_email;
        const max_students = currentClass.max_students;
        const currentStudent = currentClass.current_student;

        if(action === accept) {
            if(currentClass.status === 'close') {
                return next(new AppError('the class is close, can not accept at this time', 404))
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
                'Congratulation',
                'Congratulation , your registered class has been accepted'
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
                'Cancel Class',
                'Your registered class has been cancel'
            )
        }
        helperFn.returnSuccess(req, res)
    })
    // res.redirect('/api/classes/listRegistered')
})
module.exports = {
    login: login,
    updateUserPassword:updateUserPassword,
    uploadAvatar:uploadAvatar,
    updateUser:updateUser,
    loginAdminView:loginAdminView,
    updateUserPasswordView:updateUserPasswordView,
    updateProfileView:updateProfileView,
    getAllClass:getAllClass,
    getAllClassView:getAllClassView,
    createClass:createClass,
    createClassView:createClassView,
    updateClass:updateClass,
    deleteClass:deleteClass,
    findClass:findClass,
    viewClientsInClass:viewClientsInClass,
    viewClientsInClassView:viewClientsInClassView,
    getListRegisterClass:getListRegisterClass,
    submitClassRegistration: submitClassRegistration,
}
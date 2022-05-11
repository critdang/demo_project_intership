const Class = require('../models').Class;
const User = require('../models').User;
const Regis = require('../models').Regis;
const Client = require('../models').Client;

// const model = require('../models/index')
const Sequelize = require('sequelize');
const {sequelize} = require('../models')
const AppError = require('../utils/errorHandle/appError');
const catchAsync = require('../utils/errorHandle/catchAsync');
const helperFn = require('../utils/helperFn')
const Op = Sequelize.Op;
// const model = require('../models/index')

const getUser = async(req, res) => {
    const user = await User.findAll({
    })
    res.status(200).json({
        status: 'success',
        data: user
    })
}
const idUser = async(req, res) => {
    const user = await User.findAll({
        where: { user_id: req.params.id },
    })
    res.status(200).json({
        status: 'success',
        data: user
    })
}

const postCRUD = async (req, res) => {
    await User.create({
        firstName: req.body.firstName,
        user_email: req.body.user_email,
        password: req.body.password
    })
    res.status(200).json({
        status: 'success',
        message: 'please check your email to confirm within 3 minutes ',
        data: req.body
    })
}
const getCRUD = async (req, res) => {
    return res.render('crud.ejs');
}
const getAllClassOpen = catchAsync(async (req, res) => {
    // localhost:8080/api/classes?status=open
    let checkStatus = ['open']
    if(req.query.status) {
        checkStatus = req.query.status.split(',')
    }
    const Filter = {
        status: {
            [Op.in]: checkStatus,
        },
    };
    console.log('with split',req.query.status.split(',')) //put value into a array
    console.log('without split',req.query.status)
    const allClass = await Class.findAll({
        where: Filter
    })
    // res.status(200).json({
    //     status: 'success',
    //     data: allClass,
    // });
    return res.render('admin/getAllClassView.ejs',{data:allClass});
    
});
const getAllClass = catchAsync(async (req, res) => {
    const allClass = await Class.findAll({
    })
    // res.status(200).json({
    //     status: 'success',
    //     data: allClass,
    // });
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
        to
    });
    res.status(200).json({
        status:'success',
        data: newClass,
    })
}) 
const createClassView = async (req, res) => {
    return res.render('admin/createClassView.ejs')

}
const updateClass = catchAsync(async (req, res,next) => {
    const classId = req.params.id;
    const currentClass = await Class.findOne({ where: { class_id: classId}})
    if(!currentClass) {
        return next(new AppError('No class found with this id', 404));
    }
    Object.assign(currentClass, req.body); //gán vào object currentClass
    console.log('curret class' + currentClass)
    console.log('current class + req.body',Object.assign(currentClass, req.body))
    console.log('req.body',req.body)
    currentClass.save(); //Lưu class hiện tại
    res.status(200).json({
        status: 'success',
        data: currentClass
    })
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
    // res.status(200).json({
    //     status: 'success',
    //     message: 'Class deleted successfully'
    // })
    res.redirect('/api/admin/allClass');
})

const findClass = catchAsync(async (req, res,next) => {
    const id = req.params.id;
    const currentClass = await Class.findOne({ where: {class_id:id}});
    if (!currentClass) {
        return next(new AppError('No class founded '), 404);
    }
    res.status(200).json({
        status: 'success',
        data: currentClass
    })
})

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
        listRegis = await Regis.findAll()
    }
    // res.status(200).json({
    //     status: 'success',
    //     data: listRegis,
    // });
    res.render('admin/getListRegisterView.ejs',{data:listRegis});
})
const submitClassRegistration = catchAsync(async (req, res, next)=>{
    const accept = 'accept';
    const reject = 'reject';
    const action = req.params.action
    const client_id = req.params.client_id
    console.log(req.params)
    const  class_id = req.params.class_id
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
        console.log('currentClass',currentClass)
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
        // res.status(200).json({
        //     status: 'success',
        // })
    })
    res.redirect('/api/classes/listRegistered')
})
const viewClientsInClass = catchAsync(async (req, res, next) => {
    const id = req.params.id
    const data = await Class.findOne({
        where: { class_id: id },
        attributes: [],
        include: [
            {
                model: Client,
                attributes: ['client_email','age','phonenumber'],
                through: {
                    attributes: ['status']
                }
            }
        ]
    })
    if (!data) {
        return next(new AppError('classId not correct', 404));
    }
      res.status(200).json({
        status: 'success',
        data: data,
    });
})
const viewClientsInClassView = async (req, res, next) => {
    res.render ('class/viewClientsInClass.ejs');
}
// create calender
module.exports = {
    getUser: getUser,
    idUser: idUser,
    postCRUD: postCRUD,
    getCRUD:getCRUD,
    getAllClass:getAllClass,
    getAllClassView:getAllClassView,
    createClass:createClass,
    createClassView:createClassView,
    updateClass:updateClass,
    deleteClass:deleteClass,
    findClass:findClass,
    submitClassRegistration: submitClassRegistration,
    getListRegisterClass:getListRegisterClass,
    viewClientsInClass:viewClientsInClass,
    viewClientsInClassView:viewClientsInClassView
}
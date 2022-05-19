
const Class = require('../models').Class;
const sequelize = require('../models').sequelize;
const { max } = require('moment');
const Sequelize = require('sequelize');
const AppError = require('../utils/errorHandle/appError');
const catchAsync = require('../utils/errorHandle/catchAsync');
require('dotenv').config();

const Op = Sequelize.Op;
// const model = require('../models/index')
const getAllClass = catchAsync(async (req, res) => {
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

    helperFn.returnSuccess(req, res, allClass);
});

const createClass = catchAsync(async (req, res,next) => {
    const{subject, max_students, from, to } = req.body;
    const newClass = await Class.create({
        subject,
        max_students, 
        from, 
        to
    });
    
    helperFn.returnSuccess(req, res, newClass)

}) 

const updateClass = catchAsync(async (req, res,next) => {
    const classId = req.params.id;
    console.log(req.params);
    const currentClass = await Class.findOne({ where: { class_id: classId}})
    if(!currentClass) {
        return next(new AppError('No class found with this id', 404));
    }
    Object.assign(currentClass, req.body); //gán vào object currentClass
    console.log('curret class' + currentClass)
    console.log('current class + req.body',Object.assign(currentClass, req.body))
    console.log('req.body',req.body)
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
})

const findClass = catchAsync(async (req, res,next) => {
    const id = req.params.id;
    const currentClass = await Class.findOne({ where: {class_id:id}});
    if (!currentClass) {
        return next(new AppError('No class founded '), 404);
    }

    helperFn.returnSuccess(req, res,currentClass)
})

const getMyRegisClass = catchAsync(async (req, res, next)=>{
    // pass to param: /api/classes/myClass?status=pending,active,cancel
})
const submitClassRegistration = catchAsync(async (req, res, next)=>{
    const accept = 'accept';
    const reject = 'reject';
    const {action, class_id, client_id} = req.body

    await sequelize.transaction(async(t) => {
        const currentRegis = await Regis.findOne({
            where : {class_id, client_id, status: 'pending'},
            include : {
                model: Client,
                attributes : ['email'],
            },
        });
        if(!currentRegis) {
            return next(new AppError('No register class founded', 404))
        }
        const currentClass = await Class.findOne({
            where: { class_id : class_id},
        });

        const clientEmail = currentRegis.User.email;
        const max_students = currentClass.maxStudent;
        const currentStudent = currentClass.currentStudent;

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
            await Class.create({ class_id, client_id}, transaction(t));
            helperFn.sendEmail(
                clientEmail,
                process.env.SUCCESS_CLASS,
                process.env.SUCCESS_CLASS_DES,
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
                process.env.FAIL_CLASS,
                process.env.FAIL_CLASS_DES,
            )
        }


        helperFn.returnSuccess(req, res)
    })
})
module.exports = {
    getAllClass:getAllClass,
    createClass:createClass,
    updateClass:updateClass,
    deleteClass:deleteClass,
    findClass:findClass,
    submitClassRegistration: submitClassRegistration,
}
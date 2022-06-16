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
    const existClass = await Class.findOne({
        where: {subject}
    })
    if(existClass) return next(new AppError(constants.EXIST_CLASS),400);

    const newClass = await Class.create({
        subject,
        max_students, 
        from, 
        to,
        status:'open'
    });
    if(!newClass) helperFn.returnFail(req,res);

    // helperFn.returnSuccess(req, res,newClass);

    res.redirect('/classes');
}) 
const createClassView = async (req, res) => {
    return res.render('admin/createClassView.ejs');
}

const updateClass = catchAsync(async (req, res,next) => {
    const class_id = req.params.class_id;
    const currentClass = await Class.findOne({ where: {class_id:class_id}})
    if(!currentClass) {
        return next(new AppError(constants.NO_CLASS_FOUND, 404));
    }
    Object.assign(currentClass, req.body); //gán vào object currentClass
    await currentClass.save(); //Lưu class hiện tại

    helperFn.returnSuccess(req, res,currentClass);
})

const updateClassView = catchAsync(async (req, res) => {
    res.render('admin/updateClassView.ejs',{data : req.params})
})

const deleteClass = catchAsync(async (req, res,next) => {
    const class_id = req.params.class_id;
    const currentClass = await Class.findOne({ where: {class_id:class_id} });
    if(!currentClass) {
        return next(new AppError(constants.NO_CLASS_FOUND, 404));
    }
    if(currentClass.current_student !==0) {
        return next(new AppError(constants.NO_DELETE, 400));
    }

    await currentClass.destroy();
    // helperFn.returnSuccess(req, res,'Class deleted successfully')
    console.log(req.session);
    res.redirect('/classes');
})

   
module.exports = {
    getAllClass:getAllClass,
    getAllClassView:getAllClassView,
    createClass:createClass,
    createClassView:createClassView,
    updateClass:updateClass,
    updateClassView:updateClassView,
    deleteClass:deleteClass
}
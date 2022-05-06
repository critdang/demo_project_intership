
const Class = require('../models').Class;
const Sequelize = require('sequelize');
const AppError = require('../utils/errorHandle/appError');
const catchAsync = require('../utils/errorHandle/catchAsync');

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
    res.status(200).json({
        status: 'success',
        data: allClass,
    });
});

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

module.exports = {
    getAllClass:getAllClass,
    createClass:createClass
}
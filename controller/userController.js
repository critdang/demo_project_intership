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
        data: user,
    })
}
const idUser = async(req, res) => {
    const user = await User.findAll({
        where: { user_id: req.params.id },
    })

    res.status(200).json({
        status: 'success',
        data: user,
    })
}
const postCRUD = async (req, res) => {
    await User.create({
        firstName: req.body.firstName,
        user_email: req.body.user_email,
        password: req.body.password,
    })

    res.status(200).json({
        status: 'success',
        message: 'please check your email to confirm within 3 minutes ',
        data: req.body,
    })
}
const getCRUD = async (req, res) => {
    return res.render('crud.ejs');
}
const getAllClassOpen = catchAsync(async (req, res) => {
    // localhost:8080/api/classes?status=open
    let checkStatus = ['open'];

    if(req.query.status) {
        checkStatus = req.query.status.split(',')
    }
    const Filter = {
        status: {
            [Op.in]: checkStatus,
        },
    };
    console.log('with split',req.query.status.split(',')); //put value into a array
    console.log('without split',req.query.status);
    const allClass = await Class.findAll({
        where: Filter
    })
    // res.status(200).json({
    //     status: 'success',
    //     data: allClass,
    // });

    return res.render('admin/getAllClassView.ejs',{data:allClass});
    
});









// create calender
module.exports = {
    getUser: getUser,
    idUser: idUser,
    postCRUD: postCRUD,
    getCRUD:getCRUD,


}

const User = require('../models').User;
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
const createClass = (req, res) => {

}
const getCRUD = async (req, res) => {
    return res.render('crud.ejs');
}

module.exports = {
    getUser: getUser,
    idUser: idUser,
    postCRUD: postCRUD,
    getCRUD:getCRUD,
    createClass:createClass
}
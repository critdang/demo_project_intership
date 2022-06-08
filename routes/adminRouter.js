// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate');
const adminController = require('../controller/adminController');
const clientController = require('../controller/clientController');
const auth = require('../middleware/auth');
const passport = require('passport');
const User = require('../models').User;
var localStrategy = require('passport-local').Strategy;
const {upload,isUserLogin} = require('../utils/helperFn')

require("../middleware/auth").authUser(passport)
let initAdminRouter = (app) => {

    // router.patch('/updateMe',clientController.uploadAvatar,clientController.updateMe)
    // admin
    router.post('/login',passport.authenticate('user-local',{failureRedirect:'/admin/loginView'}) ,adminController.login);
    router.get('/logout',adminController.logout);
    router.post('/updateUserPassword',adminController.updateUserPassword);
    router.post('/updateUser/:user_id',upload.single('image'),adminController.updateUser);
    // CRUD class
    router.post('/createClass',adminController.createClass);
    router.get('/allClass',adminController.getAllClass);
    router.post('/updateClass/:class_id',adminController.updateClass);
    router.get('/delete/:class_id',adminController.deleteClass);

    // view
    router.get('/loginView',adminController.loginAdminView);
    router.get('/updateUserPasswordView',adminController.updateUserPasswordView);
    router.get('/updateProfileView',adminController.updateProfileView);
    router.get('/updateClassView/:class_id',adminController.updateClassView);
    router.get('/createClassView',adminController.createClassView);
    router.get('/getAllClassView',adminController.getAllClassView);
    router.get('/viewClientsInClassView',adminController.viewClientsInClassView);
    // View list register
    router.get('/listRegisterd', adminController.getListRegisterClass);
    router.post('/submitClassRegis',adminController.submitClassRegistration);
    router.get('/:class_id/deleteClientInClass/:client_id',adminController.deleteClientInClass)
    // CRUD clients
    router.get('/viewClients/:class_id', adminController.viewClientsInClass);
    router.get('/deleteClient/:client_id',clientController.deleteClient);


    router.get('/getClient', clientController.getClient);
    return app.use("/admin",router);
}

module.exports = initAdminRouter;

// module.exports = router; nếu không có declar function init
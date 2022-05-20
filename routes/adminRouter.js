// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const clientController = require('../controller/clientController')
const auth = require('../middleware/auth')
const passport = require('passport')
let initAdminRouter = (app) => {

    // router.patch('/updateMe',clientController.uploadAvatar,clientController.updateMe)
    // router.post('/',
    // passport.authenticate('local',{failureRedirect:'/login'}));
    
    router.post('/login',  adminController.login)
    // update password
    router.post('/updateUserPassword',adminController.updateUserPassword);
    // updateUser
    router.patch('/updateUser',adminController.uploadAvatar,adminController.updateUser);
    router.get('/allClass',adminController.getAllClass);
    router.get('/delete/:id',adminController.deleteClass);

    // view
    router.get('/loginView',adminController.loginAdminView);
    router.get('/updateUserPasswordView',adminController.updateUserPasswordView);
    router.get('/updateProfileView',adminController.updateProfileView);
    router.get('/createClassView',adminController.createClassView);
    router.get('/getAllClassView',adminController.getAllClassView);
    router.get('/viewClientsInClassView',adminController.viewClientsInClassView);

    // View list register
    router.get('/listRegisterd', adminController.getListRegisterClass);
    router.post('/submitClassRegis',adminController.submitClassRegistration);
    // crud clients
    router.get('/viewClients/:class_id', adminController.viewClientsInClass);
    router.get('/deleteClient/:client_id',clientController.deleteClient);
    // manage user

    router.get('/getClient', clientController.getClient);
    return app.use("/admin",router);
}

module.exports = initAdminRouter;

// module.exports = router; nếu không có declar function init
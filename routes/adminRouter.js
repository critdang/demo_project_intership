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
    router.post('/login',passport.authenticate('user-local',{failureRedirect:'/admin/login_view'}) ,adminController.login);
    router.get('/logout',adminController.logout);
    router.post('/update_password',auth.protectingRoutes,adminController.updateUserPassword);
    router.post('/update/:user_id',auth.protectingRoutes,upload.single('image'),adminController.updateUser);
    // view
    router.get('/login_view',adminController.loginAdminView);
    router.get('/update_password_view',auth.protectingRoutes,adminController.updateUserPasswordView);
    router.get('/update_profile_view',auth.protectingRoutes,adminController.updateProfileView);
    router.get('/view_clients_in_class',auth.protectingRoutes,adminController.viewClientsInClassView);
    // View list register
    router.get('/list_registerd',auth.protectingRoutes, adminController.getListRegisterClass);
    router.post('/submit_class_regis',auth.protectingRoutes,adminController.submitClassRegistration);
    router.get('/:class_id/delete_client_in_class/:client_id',auth.protectingRoutes,adminController.deleteClientInClass)
    
    // CRUD clients
    router.get('/view_clients/:class_id',auth.protectingRoutes, adminController.viewClientsInClass);
    router.get('/delete_client/:client_id',auth.protectingRoutes,clientController.deleteClient);
    router.get('/get_client', clientController.getClient);
    
    return app.use("/admin",router);
}

module.exports = initAdminRouter;

// module.exports = router; nếu không có declar function init
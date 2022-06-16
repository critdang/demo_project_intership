// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate');
const clientController = require('../controller/clientController');
const auth = require('../middleware/auth');
const passport = require('passport');
const {upload,isUserLogin} = require('../utils/helperFn')

require("../middleware/auth").authClient(passport)

let initClientRoutes = (app) => {
    // get all clients
    router.get("/allclients",passport.authenticate('client-local',{failureRedirect:'/admin/login_view'}) , clientController.getClient);
    // get id clients
    router.get("/api/client/:id",auth.protectingRoutes, clientController.idClient);
    // signup
    router.post("/create",  clientController.createClient);
    // load signup view
    router.get("/signup_view" , clientController.signupView);
    // login
    router.post('/login', passport.authenticate('client-local',{failureRedirect:'/client/login_view'}), clientController.login);
    // , auth.loginLimiter
    router.get('/logout', clientController.logout);
    // load login view
    router.get("/login_view", clientController.loginView);
    // verify email
    router.get('/verify/:token', clientController.verifyClientEmail);
    // update password
    router.post('/update_client_password/:client_id', clientController.updateClientPassword);
    //auth.protectingRoutes,
    // load login view
    router.get("/updateClientPasswordView/:client_id", clientController.updateClientPasswordView);
    // upload image
    router.post('/upload_avatar',clientController.uploadAvatar);
    // get profile
    router.get('/get_profile', clientController.getProfile);
    // updateMe
    router.post('/update_me/:client_id',upload.single('image'),clientController.updateMe);
    // updateMe view
    router.get('/update_view/:client_id',isUserLogin,clientController.updateMeView);
    // websiteView
    router.get('/website_view',clientController.websiteView);
    // create Regis
    router.get('/regis',clientController.regis);
    // calender
    
    router.get('/:client_id/calender',clientController.getCalenderClass);
    // regis Class
    router.get('/regist_class/:client_id/:class_id',clientController.regis);
    // cancelRegis
    router.get('/get_pending_class/:client_id',clientController.getPendingClass);
    router.get('/:client_id/cancel_regis/:class_id',clientController.cancelRegistration);
    router.get('/get_open_class/:client_id',clientController.getOpenClass);
    // show registed class
    router.get('/registed_class/:client_id',clientController.registedClass);

    return app.use("/client",router);
}

module.exports = initClientRoutes;

// module.exports = router; nếu không có declar function init
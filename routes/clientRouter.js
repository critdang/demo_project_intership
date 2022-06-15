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
    router.get("/allclients",passport.authenticate('client-local',{failureRedirect:'/admin/loginView'}) , clientController.getClient);
    // get id clients
    router.get("/api/client/:id",auth.protectingRoutes, clientController.idClient);
    // signup
    router.post("/create",  clientController.createClient);
    // load signup view
    router.get("/signupView" , clientController.signupView);
    // login
    router.post('/login', passport.authenticate('client-local',{failureRedirect:'/client/loginView'}), clientController.login);
    // , auth.loginLimiter
    router.get('/logout', clientController.logout);
    // load login view
    router.get("/loginView", clientController.loginView);
    // verify email
    router.get('/verify/:token', clientController.verifyClientEmail);
    // update password
    router.post('/updateClientPassword/:client_id', clientController.updateClientPassword);
    //auth.protectingRoutes,
    // load login view
    router.get("/updateClientPasswordView/:client_id", clientController.updateClientPasswordView);
    // upload image
    router.post('/uploadAvatar',clientController.uploadAvatar);
    // get profile
    router.get('/getProfile', clientController.getProfile);
    // updateMe
    router.post('/updateMe/:client_id',upload.single('image'),clientController.updateMe);
    // updateMe view
    // router.get('/updateMeView/:client_id',isUserLogin,clientController.updateMeView);
    // websiteView
    router.get('/websiteView',clientController.websiteView);
    // create Regis
    router.get('/regis',clientController.regis);
    // calender
    
    router.get('/:client_id/calender',clientController.getCalenderClass);
    // regis Class
    router.get('/registClass/:client_id/:class_id',clientController.regis);
    // cancelRegis
    router.get('/getPendingClass/:client_id',clientController.getPendingClass);
    router.get('/:client_id/cancelRegis/:class_id',clientController.cancelRegistration);
    router.get('/getOpenClass/:client_id',clientController.getOpenClass);
    // show registed class
    router.get('/registedClass/:client_id',clientController.registedClass);

    return app.use("/client",router);
}

module.exports = initClientRoutes;

// module.exports = router; nếu không có declar function init
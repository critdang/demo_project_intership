// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate')
const clientController = require('../controller/clientController')
const auth = require('../middleware/auth')
let initWebRoutes = (app) => {
    // get all clients
    router.get("/allclients", clientController.getClient);
    // get id clients
    router.get("/api/client/:id",auth.protectingRoutes, clientController.idClient)
    // signup
    router.post("/post-crud", validate.signUpValidate, clientController.postCRUD);
    // load signup view
    router.get("/signup" , clientController.signup)
    // login
    router.post('/login', auth.loginLimiter, clientController.login);
    // load login view
    router.get("/loginview", clientController.loginView)
    // verify email
    router.get('/api/verify/:token', clientController.verifyClientEmail)
    // update password
    router.post('/updateClientPassword/:client_id', clientController.updateClientPassword)
    //auth.protectingRoutes,
    // load login view
    router.get("/updateClientPasswordView/:id", clientController.updateClientPasswordView)
    // upload image
    router.post('/uploadAvatar',clientController.uploadAvatar);
    // updateMe
    router.post('/updateMe/:client_id',clientController.uploadAvatar,clientController.updateMe)
    // updateMe view
    router.get('/updateMeView/:client_id',clientController.updateMeView)
    // websiteView
    router.get('/websiteView',clientController.websiteView)
    // calender
    
    router.get('/api/calender/:client_id',clientController.calender)
    // cancelRegis
    router.get('/api/cancelRegis/:reg_id',clientController.cancelRegistration)
    

    return app.use("/",router);
}

module.exports = initWebRoutes;

// module.exports = router; nếu không có declar function init
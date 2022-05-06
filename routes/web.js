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
    router.patch('/updateClientPassword',auth.protectingRoutes, clientController.updateClientPassword)
    // upload image
    router.post('/uploadAvatar',);
    // updateMe
    router.patch('/updateMe',clientController.uploadAvatar,clientController.updateMe)
    
    
    return app.use("/",router);
}

module.exports = initWebRoutes;

// module.exports = router; nếu không có declar function init
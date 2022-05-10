// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate')
const adminController = require('../controller/adminController')
const auth = require('../middleware/auth')
let initAdminRouter = (app) => {

    // router.patch('/updateMe',clientController.uploadAvatar,clientController.updateMe)
    router.post('/',adminController.login)
    // update password
    router.post('/updateUserPassword',adminController.updateUserPassword)
    // updateUser
    router.patch('/updateUser',adminController.uploadAvatar,adminController.updateUser)


    // view
    router.get('/loginAdminView',adminController.loginAdminView)
    router.get('/updateUserPasswordView',adminController.updateUserPasswordView)
    router.get('/updateProfileView',adminController.updateProfileView)
    return app.use("/api/admin",router);
}

module.exports = initAdminRouter;

// module.exports = router; nếu không có declar function init
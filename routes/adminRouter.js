// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const clientController = require('../controller/clientController')
const auth = require('../middleware/auth')
let initAdminRouter = (app) => {

    // router.patch('/updateMe',clientController.uploadAvatar,clientController.updateMe)
    router.post('/',adminController.login)
    // update password
    router.post('/updateUserPassword',adminController.updateUserPassword)
    // updateUser
    router.patch('/updateUser',adminController.uploadAvatar,adminController.updateUser)
    router.get('/allClass',userController.getAllClass)
    router.get(
        '/delete/:id', 
        userController.deleteClass
    )
    // router.delete(
    //     '/delete/:id', 
    //     userController.deleteClass
    // ) vì HTML chỉ có method get và post
        // auth.protectingRoutes,
    // view
    router.get('/loginAdminView',adminController.loginAdminView)
    router.get('/updateUserPasswordView',adminController.updateUserPasswordView)
    router.get('/updateProfileView',adminController.updateProfileView)
    router.get('/createClassView',userController.createClassView)
    router.get('/getAllClassView',userController.getAllClassView)
    router.get('/viewClientsInClassView',userController.viewClientsInClassView)

    // View list register
    router.get('/listRegisterd', userController.getListRegisterClass)

    // crud clients
    router.get('/viewClients', clientController.getClient)

    router.get('/deleteClient/:client_id',clientController.deleteClient)
    return app.use("/api/admin",router);
}

module.exports = initAdminRouter;

// module.exports = router; nếu không có declar function init
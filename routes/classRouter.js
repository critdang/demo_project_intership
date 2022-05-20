// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate');
const userController = require('../controller/userController');
const adminController = require('../controller/adminController');
const auth = require('../middleware/auth');
let initClassRoutes = (app) => {
    // admin
    router
        .route('/')
        .get(adminController.getAllClass)
        .post(
            validate.classValidate,
            adminController.createClass
          );
        //   auth.protectingRoutes,
    router
        .route('/:id')
        .patch(
            auth.protectingRoutes,
            validate.classValidate,
            adminController.updateClass
        )
        .delete(auth.protectingRoutes, adminController.deleteClass);
    router.get('/findclass/:id',adminController.findClass
    )
    // auth.protectingRoutes,
    router.get('/submitRegistration',adminController.submitClassRegistration);
    // auth.protectingRoutes,
    router.get('/listRegistration',adminController.getListRegisterClass);
    // auth.protectingRoutes
    router.get('/viewClients/:class_id',adminController.viewClientsInClass);
    // auth.protectingRoutes,
    // client - user
    router.delete('/delete/:id',auth.protectingRoutes,adminController.deleteClass)
    return app.use("/api/classes",router);
}

module.exports = initClassRoutes;

// module.exports = router; nếu không có declar function init
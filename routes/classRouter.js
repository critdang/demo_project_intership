// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate')
const classController = require('../controller/classController1')
const userController = require('../controller/userController')
const auth = require('../middleware/auth')
let initClassRoutes = (app) => {
    // admin
    router
        .route('/')
        .get(userController.getAllClass)
        .post(
            
            validate.classValidate,
            userController.createClass
          );
        //   auth.protectingRoutes,
    router
        .route('/:id')
        .patch(
            auth.protectingRoutes,
            validate.classValidate,
            userController.updateClass
        )
        .delete(auth.protectingRoutes, userController.deleteClass);
    router.get(
        '/findclass/:id', 
        auth.protectingRoutes,
        userController.findClass
    )
    router.get(
        '/admin/submit/:action/:client_id/:class_id',
        // auth.protectingRoutes,
        userController.submitClassRegistration
    )
    router.get(
        '/listRegistered',
        // auth.protectingRoutes,
        userController.getListRegisterClass
        );
    router.get(
        '/viewUser/:id',
        userController.viewClientsInClass
        );
        // auth.protectingRoutes,
    // client - user
    router.delete(
        '/delete/:id', 
        auth.protectingRoutes,
        userController.deleteClass
    )
    return app.use("/api/classes",router);
}

module.exports = initClassRoutes;

// module.exports = router; nếu không có declar function init
// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate')
const classController = require('../controller/classController')
const userController = require('../controller/userController')
const auth = require('../middleware/auth')
let initClassRoutes = (app) => {
    // admin
    router
        .route('/')
        .get(classController.getAllClass)
        .post(
            auth.protectingRoutes,
            validate.classValidate,
            classController.createClass
          );

    return app.use("/api/classes",router);
}

module.exports = initClassRoutes;

// module.exports = router; nếu không có declar function init
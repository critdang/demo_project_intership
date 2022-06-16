// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate');
const adminController = require('../controller/adminController');
const auth = require('../middleware/auth');
const classController = require('../controller/classController');
let initClassRoutes = (app) => {
    // admin
    // CRUD class
    router.post('/',auth.protectingRoutes ,classController.createClass); //check route class
    router.get('/createView',auth.protectingRoutes,classController.createClassView);

    router.get('/',auth.protectingRoutes,classController.getAllClass); //check route class
    router.get('/getAllView',auth.protectingRoutes,classController.getAllClassView);

    router.post('/update/:class_id',auth.protectingRoutes,validate.classValidate,classController.updateClass); 
    router.get('/updateView',auth.protectingRoutes,classController.updateClassView);

    router.get('/delete/:class_id',auth.protectingRoutes,classController.deleteClass); //check route class

    router.get('/findclass/:id',adminController.findClass);
    // auth.protectingRoutes,
    router.get('/submitRegistration',adminController.submitClassRegistration);
    // auth.protectingRoutes,
    router.get('/list_registration',adminController.getListRegisterClass);
    // auth.protectingRoutes
    router.get('/viewClients/:class_id',adminController.viewClientsInClass);
    // auth.protectingRoutes,
    // client - user
    router.delete('/delete/:id',auth.protectingRoutes,classController.deleteClass);
    return app.use("/classes",router);
}

module.exports = initClassRoutes;

// module.exports = router; nếu không có declar function init
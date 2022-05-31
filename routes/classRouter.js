// const User = require('../models').User; 
const express = require('express');
const router = express.Router();
const validate = require('../validate/validate');
const adminController = require('../controller/adminController');
const auth = require('../middleware/auth');
let initClassRoutes = (app) => {
    // admin
    router.get('/',auth.protectingRoutes,adminController.getAllClass)
    router.post('/',validate.classValidate,adminController.createClass);
    //   auth.protectingRoutes,
    router.patch('/:id',auth.protectingRoutes,validate.classValidate,adminController.updateClass)
    router.delete('/:id',auth.protectingRoutes, adminController.deleteClass);
    router.get('/findclass/:id',adminController.findClass);
    // auth.protectingRoutes,
    router.get('/submitRegistration',adminController.submitClassRegistration);
    // auth.protectingRoutes,
    router.get('/listRegistration',adminController.getListRegisterClass);
    // auth.protectingRoutes
    router.get('/viewClients/:class_id',adminController.viewClientsInClass);
    // auth.protectingRoutes,
    // client - user
    router.delete('/delete/:id',auth.protectingRoutes,adminController.deleteClass);
    return app.use("/api/classes",router);
}

module.exports = initClassRoutes;

// module.exports = router; nếu không có declar function init
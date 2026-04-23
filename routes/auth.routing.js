//========================================This file will be for routing only=======================================================

const express= require('express');
const router= express.Router();
const {body}= require('express-validator'); // we can use this to validate user inputs easily, not manually

const authController= require('../controllers/auth.controller.js');
const authMiddleware= require('../middleware/auth.middleware.js');

//we will pass the route name, middleware and method name inside controller

//we will use validator in this way to validate the inputs
router.post("/signup", [
    body('name').notEmpty().withMessage('Name is required'),
    body('emailId').isEmail().withMessage('Valid email required'),
    body('password').isLength({min : 6}).withMessage('Password must be 6 characters')
]
 , authController.signup); 

router.post("/login" , authMiddleware.authMiddleWare, authController.login);

router.get("/usersList", authController.usersList); 

router.get("/profile", authMiddleware.tokenMiddleware, authController.profile); 

router.delete("/deleteUser/:id", authMiddleware.tokenMiddleware, authMiddleware.rolesMiddleware("Admin"), authController.deleteUser); 

router.get("/getUsersList", authMiddleware.tokenMiddleware, authController.getUsersList); 

router.put("/updateUsers/:id", authMiddleware.tokenMiddleware, authController.updatedUsers);

router.post("/addNewProduct" , authController.addNewProduct);

router.get("/getAllProducts", authMiddleware.tokenMiddleware, authController.getAllProducts);

router.post("/getTrekDetails" , authMiddleware.tokenMiddleware, authController.getTrekDetails);

router.post("/createItinerary" , authMiddleware.tokenMiddleware, authController.createItinerary);

router.post("/saveItinerary" , authMiddleware.tokenMiddleware, authController.saveItinerary);

router.get("/getTripList", authMiddleware.tokenMiddleware, authController.getTripList);

router.post("/deleteTrip", authMiddleware.tokenMiddleware, authController.deleteTrip);

module.exports= router; //this line is important to use router
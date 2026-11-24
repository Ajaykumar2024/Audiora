const express=require('express')
const authController=require('../controllers/auth.controller') 
const router=express.Router()


//Register a new user
router.post('/register',authController.registerUser)

//login a user
router.post('/login',authController.loginUser)

//logout a user
router.post('/logout',authController.logoutUser)

//Get logged-in user(or artist) detail
router.get("/me",authController.getMe)


module.exports=router
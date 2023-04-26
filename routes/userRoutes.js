const express = require('express');
const { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, updatePassword, getUserDetails, updateProfile } = require('../controller/userController');
const { isAuthenticatedUser } = require('../middleware/auth');
const router = express.Router();

//Register a User
router.route('/register').post(registerUser);

//login user
router.route('/login').post(loginUser);

//logout user
router.route('/logout').get(logoutUser);

// forget password 
router.route('/password/forget').post(forgetPassword);
router.route('/password/reset/:token').put(resetPassword);
//get user detail
router.route('/whoami').get(isAuthenticatedUser, getUserDetails)
//change password
router.route('/password/update').put(isAuthenticatedUser, updatePassword)
//edit user profile
router.route('/editProfile').put(isAuthenticatedUser, updateProfile)







module.exports = router;
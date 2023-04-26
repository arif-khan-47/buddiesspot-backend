const express = require('express');
const { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, updatePassword, getUserDetails, updateProfile, getSingleUser, getAllUser, updateUserProfile, deleteUser } = require('../controller/userController');
const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');
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
//get all user
router.route('/admin/users').get(isAuthenticatedUser, authorizeRole("admin"), getAllUser)
//get user detail-admin
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRole("admin"), getSingleUser).put(isAuthenticatedUser, authorizeRole("admin"), updateUserProfile).delete(isAuthenticatedUser, authorizeRole("admin"), deleteUser)









module.exports = router;
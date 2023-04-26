const User = require('../models/userModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');


//Register User
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    const token = user.getJWTToken();
    sendToken(user, 201, res)
});

//Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter Email and Password", 400))
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invaid email or Password", 401));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invaid email or Password", 401));
    }
    sendToken(user, 200, res)
});

// Logout User 
exports.logoutUser = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out Successfully."
    })
})

//Forget Password 
exports.forgetPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return next(new ErrorHandler("User Not Found.", 404))
    }
    // Get reset Password Token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false })

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/password/reset/${resetToken}`

    const message = `Your Reset Password Link is: \n ${resetPasswordUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: "Buddies Spot Password Recovery",
            message,
        })

        res.status(200).json({
            sucess: true,
            message: `Email send to ${user.email} seccessfully.`
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler(error.message, 500))
    }
})

//reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
    //creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })

    if (!user) {
        return next(new ErrorHandler("Invalid link or may be expired.", 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match.", 400))
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    sendToken(user, 200, res);
})

// get single user
exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.user.id)
    // if (!user) {
    //     return next(new ErrorHandler("User Not Found", 404))
    // }
    res.status(200).json({
        success: true,
        user
    })
}

// update user password
exports.updatePassword = async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Old Password is incorrect.", 400));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match.", 400))
    }

    user.password = req.body.newPassword;

    await user.save();
    sendToken(user, 200, res);
}


// update user profile
exports.updateProfile = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        // avatar:
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, { new: true, runValidators: true, useFindAndModify: false });

    res.status(200).json({
        sucess:true,
        message:'Updated successfully'
    })
}
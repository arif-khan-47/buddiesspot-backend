const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');


//create new order
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const { shippingInfo, orderItems, paymentInfo, itemPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    const order = await Order.create({
        shippingInfo, orderItems, paymentInfo, itemPrice, taxPrice, shippingPrice, totalPrice, paidAt: Date.now(), user: req.user._id,
    });
    res.status(201).json({
        success: true,
        order
    })
})


//get single order

exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user", "name email")
    if (!order) {
        return next(new ErrorHandler("Product not found", 404))
    }
    res.status(200).json({
        success: true,
        order
    })
})


//get logged in user order detail

exports.myOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })

    res.status(200).json({
        success: true,
        orders
    })
})


//get all user order detail--Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()
    let totalAmount = 0;
    orders.forEach(order => totalAmount += order.totalPrice)
    res.status(200).json({
        success: true,
        orders,
        totalAmount
    })
})


//update order status--Admin
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }
    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered", 400))
    }
    order.orderItems.forEach(async (ord) => {
        await updateStock(ord.product, ord.quantity)
    })
    for (let i = 0; i < order.orderItems.length; i++) {
        await updateStock(order.orderItems[i].product, order.orderItems[i].quantity)
    }
    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        order
    })
})

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    if (product.stock != null || undefined) {
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false });
    }
}


//delete order --Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return next(new ErrorHandler("Order not found", 404));
    }
    await Order.deleteOne({ _id: req.params.id })
    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    })
})
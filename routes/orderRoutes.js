const express = require('express')
const router = express.Router();
const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');
const { newOrder, getSingleOrder, myOrders, getAllOrders, updateOrderStatus, deleteOrder } = require('../controller/orderController');



//admin Routes
router.route("/admin/orders").get(isAuthenticatedUser, authorizeRole("admin"), getAllOrders)
router.route("/admin/order/:id").put(isAuthenticatedUser, authorizeRole("admin"), updateOrderStatus).delete(isAuthenticatedUser, authorizeRole("admin"), deleteOrder)





//User routes

router.route("/order/new").post(isAuthenticatedUser, newOrder)
router.route("/order/:id").get(isAuthenticatedUser,  getSingleOrder)

// 
router.route("/myOrder").get(isAuthenticatedUser, myOrders)


module.exports = router;
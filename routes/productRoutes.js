const express = require('express');
const { getAllProducts, createProduct, updateProduct, deleteProduct, getSingleProduct, getAllCategories, updateProductCategory, createProductReview, getProductReview, deleteProductReview } = require('../controller/productController');
const { isAuthenticatedUser, authorizeRole } = require('../middleware/auth');
const router = express.Router();


//Admin Routes

//Create new product
router.route('admin/product/new').post(isAuthenticatedUser, authorizeRole("admin"), createProduct);
// Update existing product & delete by id
// router.route('/product/:id').put(updateProduct).delete(deleteProduct).get(getSingleProduct);

//Update & delete product
router.route('admin/product/:id').put(isAuthenticatedUser, authorizeRole("admin"), updateProduct).delete(isAuthenticatedUser, authorizeRole("admin"), deleteProduct);

//update catagories detail
// router.route('/catagory/:id').put(updateProductCategory);








// UserRoutes
//get all product
router.route('/products').get(getAllProducts);
//get single product
router.route('/product/:slug').get(getSingleProduct);

//add review
router.route('/review').put(isAuthenticatedUser, createProductReview);

//get single product review
router.route('/reviews').get(getProductReview).delete(isAuthenticatedUser, deleteProductReview);



//get all catagories of product
// router.route('/products/catagories').get(getAllCategories);






module.exports = router
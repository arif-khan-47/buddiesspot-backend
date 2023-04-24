const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');


//Admin Routes

//Create Product 
exports.createProduct = catchAsyncError(
    async (req, res, next) => {

        const { slug } = req.body;
        
        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return next(new ErrorHandler(`A product with slug '${slug}' already exists`, 400));
        }
        const slugPattern = /^[a-z0-9-]+$/;
        if (!slugPattern.test(slug)) {
            return next(new ErrorHandler("Slug must not contain any spaces or empty", 400));
        }
        req.body.createdBy = req.user.id;
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        })
    }
);

//Update product by id
exports.updateProduct = catchAsyncError(
    async (req, res, next) => {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler("Product Not Found", 404));
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false });
        res.status(200).json({ success: true, message: "Updated product successfully" });
    });

//delete product
exports.deleteProduct = catchAsyncError(
    async (req, res, next) => {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler("Product Not Found", 404))
        }
        product = await Product.findByIdAndDelete(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Delete product successfully" });
    }
);







//User Route

//get all products
exports.getAllProducts = catchAsyncError(
    async (req, res) => {
        const apiFeature = new ApiFeatures(Product.find(), req.query).search().filter();
        const products = await apiFeature.query;
        res.status(200).json({
            success: true,
            products
        })
    }
);
// get single product
// exports.getSingleProduct = async (req, res, next) => {
//     if (!product) {
//         return next(new ErrorHandler("Product Not Found", 404))
//     }
//     res.status(200).json({
//         success: true,
//         product
//     })
// }
// get single product by slug
exports.getSingleProduct = catchAsyncError(
    async (req, res, next) => {
        try {
            const product = await Product.findOne({ slug: req.params.slug }).exec();

            if (!product) {
                return next(new ErrorHandler("Product Not Found", 404));
            }

            res.status(200).json({
                success: true,
                product,
            });
        } catch (error) {
            next(error);
        }
    }
);

// Fetch all categories

exports.getAllCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category');
        res.status(200).json({
            success: true,
            categories
        });
    } catch (err) {
        next(err);
    }
}

//edit product catagories detail
// exports.updateProductCategory = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const { title, img } = req.body;
//         const product = await Product.findByIdAndUpdate(id, { $set: { category: { title, img } } }, { new: true });
//         if (!product) {
//             return next(new ErrorHandler("Product Not Found", 404));
//         }
//         res.status(200).json({
//             success: true,
//             product
//         });
//     } catch (err) {
//         next(err);
//     }
// }
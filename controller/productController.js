const Product = require('../models/productModel');
const ErrorHandler = require('../utils/errorhandler');
const catchAsyncError = require('../middleware/catchAsyncError');
const ApiFeatures = require('../utils/apiFeatures');
const cloudinary = require('cloudinary')


//Admin Routes

//Create Product 
exports.createProduct = catchAsyncError(
    async (req, res, next) => {
        let images = [];
        if (typeof req.body.images === 'string') {
            images.push(req.body.images);
        } else {
            images = req.body.images
        }

        const imagesLink = [];
        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: 'products',
            });
            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url
            });

        }

        const { slug } = req.body;

        const existingProduct = await Product.findOne({ slug });
        if (existingProduct) {
            return next(new ErrorHandler(`A product with slug '${slug}' already exists`, 400));
        }
        const slugPattern = /^[a-z0-9-]+$/;
        if (!slugPattern.test(slug)) {
            return next(new ErrorHandler("Slug must not contain any spaces or empty", 400));
        }

        req.body.images = imagesLink;
        req.body.createdBy = req.user.id;
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            product
        })
    }
);

// Update Product -- Admin

exports.updateProduct = catchAsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    // Images Start Here
    let images = [];
  
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    if (images !== undefined) {
      // Deleting Images From Cloudinary
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
  
      const imagesLinks = [];
  
      for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
              folder: "products",
            });
            
            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        
        req.body.images = imagesLinks;
    }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    
    res.status(200).json({
        success: true,
      product,
    });
  });

//delete product
exports.deleteProduct = catchAsyncError(
    async (req, res, next) => {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ErrorHandler("Product Not Found", 404))
        }
        //Deleting images form cloudnery
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
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


// get all product with category

exports.getAllProductWithCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category });
        res.status(200).json({
            success: true,
            products
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


//Create review or update review

exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
        productId
    }
    const product = await Product.findById(productId);
    const isReviewed = product.review.find(rev => rev.user.toString() === req.user._id.toString())
    if (isReviewed) {
        product.review.forEach(rev => {
            if (rev.user.toString() === req.user._id.toString())
                rev.rating = rating,
                    rev.comment = comment
        })
    } else {
        product.review.push(review)
        product.numberOfReview = product.review.length
    }
    let avg = 0
    product.review.forEach(rev => {
        avg += review.rating
    })

    product.ratings = avg / product.review.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        message: 'Product review saved successfully'
    })
})

//get single product review
exports.getProductReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        reviews: product.review,
    })
})


//delete product review
exports.deleteProductReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        next(new ErrorHandler("Product not found", 404));
    }
    const review = product.review.filter(rev => rev._id.toString() !== req.query.id.toString())
    let avg = 0
    if (review.length > 0) {
        review.forEach(rev => {
            avg += rev.rating;
        });
        avg = avg / review.length;
    }

    const ratings = avg;

    const numberOfReview = review.length;
    await Product.findByIdAndUpdate(req.query.productId, { review, ratings, numberOfReview }, { new: true, runValidators: true, useFindAndModify: false });
    res.status(200).json({
        success: true,
        message: 'review deleted successfully',
    })
})
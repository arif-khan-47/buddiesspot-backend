const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Insert a Product Name"],
        trim: true
    },
    slug: {
        type: String,
        required: [true, "Please Insert a Slug"],
        unique: true
    },
    description: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: [true, "Please Insert a Product Price"],
        maxLength: [8, "Price cannot exceed 8 characters"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please Enter the product catagory"]
    },
    // category: [{
    //     title: {
    //         type: String,
    //         required: [true, "Please Enter the product catagory"]
    //     },
    //     img: {
    //         type: String,
    //         required: [true, "Please Select the product image"]
    //     }
    // }
    // ],
    stock: {
        type: Number,
    }, 
    numberOfReview:{
        type:Number,
        default: 0,
    },
    review:[
        {
            user:{
                type:mongoose.Schema.ObjectId,
                ref:"User",
                required:true,
            },
            name:{
                type:String,
                required:true,
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ],
    createdBy:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    }
})

module.exports =mongoose.model("Product", productSchema)
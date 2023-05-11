const express = require("express");
const app = express();
const errorHandling = require("./middleware/error");
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload')
var cors = require('cors')


app.use(express.json())
app.use(express.query());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());

const corsOptions ={
    origin:'http://localhost:3000'||'https://buddiesspot.vercel.app/', 
    credentials:true,            
    //access-control-allow-credentials:true,
    optionSuccessStatus:200
}

app.use(cors(corsOptions)) // Use this after the variable declaration
//Import Rourtes
const products = require("./routes/productRoutes");
const user = require("./routes/userRoutes");
const order = require("./routes/orderRoutes");




app.use('/api', products);
app.use('/api', user);
app.use('/api', order);






//MIddleware Error
app.use(errorHandling)


module.exports = app
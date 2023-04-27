const express = require("express");
const app = express();
const errorHandling = require("./middleware/error");
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(express.query());
app.use(cookieParser());



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
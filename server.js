const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const cloudinary = require('cloudinary');

//Handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server due to uncaught exception")
  process.exit(1);
})


//config
require('dotenv').config()
connectDatabase()
// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API,
  api_secret: process.env.CLOUDNARY_SECRET 
});

app.get('/', (req, res) => {
  res.status(200).json({
    sucess: true,
    message: 'Welcome to Buddies Spot'
  })
});


  app.listen(process.env.PORT,()=>{
    console.log(`listening on port http://localhost:${process.env.PORT}`) 
})


//solve unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`)
  console.log('Shuttiong down the server due to unhandled promise rejection')
  server.close(() => {
    process.exit(1);
  })
})
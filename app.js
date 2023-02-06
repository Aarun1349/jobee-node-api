const express = require('express')
const dotenv = require('dotenv')
const app = express();

//Importing all routes
const jobs = require('./routes/jobs')



//setting up config.env valiable
dotenv.config({path:'./config/config.env'})
const port = process.env.PORT || 8000;

//Import Database connection
const connectToDatabase = require('./config/database')
connectToDatabase();


//routes
app.get('/',(req,res)=>{
    res.send(200).json({success:"Success"})
})

app.use('/api/v1',jobs)

app.listen(port,()=>{
    console.log(`App is running on port ${port} in ${process.env.NODE_ENV}`)
})


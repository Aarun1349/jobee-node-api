const express = require('express')
const dotenv = require('dotenv')
const app = express();


//setting up config.env valiable
dotenv.config({path:'./config/config.env'})
const port = process.env.PORT || 8000;


//routes
app.get('/',(req,res)=>{
    res.send(200).json({success:"Success"})
})

app.listen(port,()=>{
    console.log(`App is running on port ${port} in ${process.env.NODE_ENV}`)
})


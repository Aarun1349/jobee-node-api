const express = require("express");
const dotenv = require("dotenv");
const cokkieParser = require("cookie-parser");
const fileUpload = require('express-fileupload')
const rateLimitter = require('express-rate-limit')
const Helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const app = express();

//Importing all routes
const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const user = require("./routes/user");

//setting up config.env valiable
dotenv.config({ path: "./config/config.env" });
const port = process.env.PORT || 8000;

//Import Database connection
const connectToDatabase = require("./config/database");
const errorMiddleware = require("./middleware/errors");
const ErrorHandler = require("./utils/errorHandle");
const cookieParser = require("cookie-parser");
const users = require("./models/users");

//handling uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down due to uncaught exceptions.`);
  process.exit(1);
});
connectToDatabase();

//Securing HTTP Request
app.use(Helmet());


// Setup body parser
app.use(express.json());

//Setup Cookie Parser
app.use(cokkieParser());


//Handle File uploads
app.use(fileUpload());


// Sanitize
app.use(mongoSanitize())

//Prevent XSS script attack
app.use(xssClean());

//prevent parameter pollution
app.use(hpp());

// Apply CORS
app.use(cors());



// Limit API requests
const limitter = rateLimitter({
  windowMs:10*60*1000,
  max:100
})

app.use(limitter);

//routes
app.get("/", (req, res) => {
  res.sendStatus(200).json({ success: true });
});

app.use("/api/v1", jobs);
app.use("/api/v1", auth);
app.use("/api/v1", user);

//Handle Unhandled Routes
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
  res.sendStatus(404).json({ success: true });
});

// Middleware to handle errors
app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(`App is running on port ${port} in ${process.env.NODE_ENV}`);
});

//Handling unhadled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandeld ppromise rejection.`);
  server.close(() => {
    process.exit(1);
  });
});

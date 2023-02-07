const express = require("express");
const router = express.Router();
//Importing Jobs controller methods

const { getJobs, newJob } = require("../controllers/jobsController");

// router.get ('/jobs',(req,res)=>{

// })

// another way to create routes to call controller methods
router.route("/jobs").get(getJobs);

// route to create new job
router.route("/job/new").post(newJob);

module.exports = router;

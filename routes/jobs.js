const express = require("express");
const router = express.Router();
//Importing Jobs controller methods

const { getJobs, newJob , getJobsInRadius, updateJob, deleteJobs, getJobByIDandSlug } = require("../controllers/jobsController");

// router.get ('/jobs',(req,res)=>{

// })

// another way to create routes to call controller methods
router.route("/jobs").get(getJobs);

// route to create new job
router.route("/job/new").post(newJob);

// route to get jobs with the radius
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius);


//route to get single job by id and slug
router.route("/job/:id/:slug").get(getJobByIDandSlug);


//route to update job
router.route("/job/:id").put(updateJob).delete(deleteJobs);

//route to delete job
// router.route("/job/delete/:id").delete(deleteJobs);

module.exports = router;

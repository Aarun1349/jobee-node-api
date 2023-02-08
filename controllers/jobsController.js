const { findById } = require("../models/jobs");
const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");

// Get all jobs => /api/v1/jobs

exports.getJobs = async (req, res, next) => {
  const jobs = await Job.find();
  res.status(200).json({
    success: true,
    reults: jobs.length,
    data: jobs,
  });
};

// Create a new jobs => /api/v1/job/new

exports.newJob = async (req, res, next) => {
  const job = await Job.create(req.body);
  res.status(200).json({
    success: true,
    message: "Job Created.",
    data: job,
  });
};

// update a job => /api/v1/job/:id
exports.updateJob = async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  
  console.log('The JOB', job)  
  console.log('The JOB', req.params.id)  
  if (!job) {
    res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }
  job = await Job.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true
  })
  res.status(200).json({
    success: true,
    message:'Job Updated',
    data: job,
  });

};

// delete job => /api/v1/job/delete/:id
exports.deleteJobs = async (req,res,next)=>{
    const job = await Job.findById(req.params.id);
    console.log('The JOB', job)  
  console.log('The JOB', req.params.id)  
    if(!job){
        res.status(404).json({
            success: false,
            message: "Job not found",
          });
    }
    const deleteJob = await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message:'Job Deleted',
        data: deleteJob,
      });
}

//get jobs by location => api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius = async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // getting longitude and latitude by zipcode
  const loc = await geoCoder.geocode(zipcode);
  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 3963;

  const jobs = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    reults: jobs.length,
    data: jobs,
  });
};

//

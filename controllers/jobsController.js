const { findById } = require("../models/jobs");
const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const ErrorHandler = require("../utils/errorHandle");
const catchAssyncErrors = require("../middleware/catchAsyncErrors");

// Get all jobs => /api/v1/jobs

exports.getJobs = catchAssyncErrors(async (req, res, next) => {
  const jobs = await Job.find();
  res.status(200).json({
    success: true,
    reults: jobs.length,
    data: jobs,
  });
});

// Get a single job by id and slug => /api/v1/job/:id/:slug

exports.getJobByIDandSlug = catchAssyncErrors(async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
  } else {
    res.status(200).json({
      success: true,
      result: job.length,
      data: job,
    });
  }
});

// Create a new jobs => /api/v1/job/new

exports.newJob = catchAssyncErrors(async (req, res, next) => {
  const job = await Job.create(req.body);
  res.status(200).json({
    success: true,
    message: "Job Created.",
    data: job,
  });
});

// update a job => /api/v1/job/:id
exports.updateJob = catchAssyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);
  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
    // res.status(404).json(  {
    //   success: false,
    //   message: "Job not found",
    // });
  }
  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "Job Updated",
    data: job,
  });
});

// delete job => /api/v1/job/:id
exports.deleteJobs = catchAssyncErrors(async (req, res, next) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
  }
  const deleteJob = await Job.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Job Deleted",
    data: deleteJob,
  });
});

//get jobs by location => api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius = catchAssyncErrors(async (req, res, next) => {
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
});

// get Stats about a topic(job) aggregation => /api/v1/stats/:topic

exports.jobStats = catchAssyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      $match: {
        $text: { $search: '"' + req.params.topic + '"' },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$experience" },
        totalJobs: { $sum: 1 },
        avgPositions: { $avg: "$positions" },
        avgSalary: { $avg: "$salary" },
        minSalary: { $min: "$salary" },
        maxSalary: { $max: "$salary" },
      },
    },
  ]);
  if (stats.length === 0) {
    return next(new ErrorHandler(`No Stats were found - ${req.params.topic}`, 200));
    // return res.status(200).json({
    //   success: false,
    //   messaage: `No Stats were found - ${req.params.topic}`,
    // });
  }
  return res.status(200).json({
    success: true,
    data: stats,
  });
});

const { findById } = require("../models/jobs");
const Job = require("../models/jobs");
const geoCoder = require("../utils/geocoder");
const ErrorHandler = require("../utils/errorHandle");
const catchAssyncErrors = require("../middleware/catchAsyncErrors");
const ApiFilters = require("../utils/apiFilters");
const path = require("path");
const fs = require("fs");

// Get all jobs => /api/v1/jobs
exports.getJobs = catchAssyncErrors(async (req, res, next) => {
  const apiFilters = new ApiFilters(Job.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .searchByQuery()
    .pagintion();
  // const jobs = await Job.find();
  const jobs = await apiFilters.query;
  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});

// Get a single job by id and slug => /api/v1/job/:id/:slug

exports.getJobByIDandSlug = catchAssyncErrors(async (req, res, next) => {
  const job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  }).populate({
    path: "user",
    select: "name",
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
  //Adding user to body
  req.body.user = req.user.id;
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

  // Check if user is the owner
  if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorHandler("You are not authorized to update job", 401));
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
  // Check if user is the owner
  if (job.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorHandler("You are not authorized to delete job", 401));
  }

  // Delete files associated with Job
  const delJob = await Job.findById({ _id: req.params.id }).select(
    "+applicantApplied"
  );

  for (let i = 0; i < delJob.applicantsApplied.length; i++) {
    let filePath =
      `${__dirname}/public/uploads/${delJob.applicantsApplied[i].resume}`.replace(
        "\\controllers",
        ""
      );
    fs.unlink(filePath, (err) => {
      if (err) {
        return console.log(err);
      }
    });
  }

  // const deleteJob = await Job.findByIdAndDelete(req.params.id);
  job = await Job.findByIdAndDelete(req.params.id);
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
    return next(
      new ErrorHandler(`No Stats were found - ${req.params.topic}`, 200)
    );
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

// Apply to job using Resume => /api/v1/job/:id/apply
exports.applyJob = catchAssyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id).select("+applicantsApplied");
  if (!job) {
    return next(new ErrorHandler("Job Not Found", 404));
  }
  // Check for last date
  if (job.lastDate < new Date(Date.now())) {
    return next(
      new ErrorHandler(
        "You can not apply for this job. Last date to apply job is over",
        400
      )
    );
  }

  // check if user is already applied for the job
  console.log(job);
  for (let i = 0; i < job.applicantsApplied.length; i++) {
    if ((job.applicantsApplied[i].id = req.user.id)) {
      return next(
        new ErrorHandler("You have already applied for the job", 400)
      );
    }
  }
  // job = await Job.find({ "applicantsApplied.id": req.user.id }).select(
  //   "+applicatsApplied"
  // );
  // if (job) {
  //   return next(new ErrorHandler("You have already applied for the job", 400));
  // }
  // Check the file
  if (!req.files) {
    return next(new ErrorHandler("Please upload your resume", 400));
  }
  const file = req.files.file;
  //check file type
  const supportedFiles = /.doc|.pdf/;
  if (!supportedFiles.test(path.extname(file.name))) {
    return next(new ErrorHandler("File type is not supported", 400));
  }

  // Restrict file size
  if (file.size > process.env.FILE_SIZE) {
    return next(new ErrorHandler("File size exceeds the file size(2MB)", 400));
  }

  // Renaming resume
  file.name = `${req.user.name.replace("", "_")}_${job._id}${
    path.parse(file.name).ext
  }`;

  file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      return next(new ErrorHandler("File upload failed", 500));
    }
  });

  await Job.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        applicantsApplied: { id: req.user.id, resume: file.name },
      },
    },
    { new: true, runValidators: true, useFindAndModify: false }
  );
  return res.status(200).json({
    success: true,
    message: `Applied For ${job.title} successfully`,
    data: file.name,
  });
});

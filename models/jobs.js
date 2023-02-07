const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require('slugify')
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide Job Title"],
    trim: true,
    maxlength: [100, "Job title can not exceed 100 chracters"],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please provide Job description"],
    trim: true,
    maxlength: [1000, "Job description can not exceed 1000 chracters"],
  },
  email: {
    type: String,
    trim: true,
    validate: [validator.isEmail, "Please add a valid email address"],
  },
  address: {
    type: String,
    required: [true, "Please provide an address"],
    trim: true,
  },
  company: {
    type: String,
    required: [true, "Please provide company name"],
    trim: true,
  },
  industry: {
    type: [String],
    required: true,
    enum: {
      values: [
        "Business",
        "Informantion Technology",
        "Banking",
        "Telecommunication",
        "Education/Training",
        "Others",
      ],
      message: "Please select correct option for industry",
    },
  },
  jobType: {
    type: String,
    required: true,
    enum: {
      values: ["Permanent", "Temporary", "Contract", "Internship"],
      message: "Please select correct option for job type",
    },
  },
  minEducation: {
    type: String,
    required: true,
    enum: {
      values: ["Bachelors", "Masters", "Docatrate"],
      message: "Please select correct option for education",
    },
  },
  position: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required: true,
    enum: {
      values: [
        "No Experience",
        "1 Year -2 Years",
        "2 Year -3 Years",
        "3 Year -4 Years",
        "5+ Years",
      ],
      message: "Please select correct option for experience",
    },
  },
  salary: {
    type: String,
    required: [true, "Please provide expected salary for this job"],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 30),
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
});
//creating job slug before saving
jobSchema.pre('save',function(next){
  //creating slug before saving to DB
  this.slug = slugify(this.title,{lower:true})
  next();
})


module.exports = mongoose.model("Jobs", jobSchema);

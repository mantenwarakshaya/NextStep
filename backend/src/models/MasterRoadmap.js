// backend/models/GeneratedRoadmap.js

const mongoose = require("mongoose");

const semesterPlanSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    objective: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    topics: {
      type: [String],
      default: [],
    },

    dsa: {
      type: [String],
      default: [],
    },

    projects: {
      type: [String],
      default: [],
    },

    careerPreparation: {
      type: [String],
      default: [],
    },

    expectedOutcome: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const generatedRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    branch: {
      type: String,
      required: true,
      trim: true,
    },

    careerGoal: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: [String],
      default: [],
    },

    roadmapType: {
      type: String,
      enum: ["master_4_year"],
      default: "master_4_year",
    },

    semesters: {
      type: [semesterPlanSchema],
      required: true,
    },

    generatedBy: {
      type: String,
      default: "gemini-2.5-flash",
    },
  },

  {
    timestamps: true,
    collection: "generated_roadmaps",
  },
);

module.exports = mongoose.model("GeneratedRoadmap", generatedRoadmapSchema);

const User = require("../models/user");
const GeneratedRoadmap = require("../models/MasterRoadmap");

const generateMasterRoadmap = require("../utils/Roadmap/masterRoadmapGenerator");

const generateMaster = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.branch) {
      return res.status(400).json({
        success: false,
        message: "Please select your branch first.",
      });
    }

    if (!user.careerGoal) {
      return res.status(400).json({
        success: false,
        message: "Please select your career goal first.",
      });
    }

    const specialization = Array.isArray(user.specialization)
      ? user.specialization
      : user.specialization
        ? [user.specialization]
        : [];

    // Prevent duplicate master roadmaps
    const existing = await GeneratedRoadmap.findOne({
      userId: user._id,
      roadmapType: "master_4_year",
    }).sort({ createdAt: -1 });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        isCached: true,
      });
    }

    console.log(`🚀 Generating 4-year roadmap for ${user.careerGoal}`);

    const generated = await generateMasterRoadmap(
      user.branch,
      user.careerGoal,
      specialization,
    );

    if (
      !generated?.roadmap ||
      !Array.isArray(generated.roadmap) ||
      generated.roadmap.length !== 8
    ) {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid 4-year roadmap.",
      });
    }

    const roadmap = await GeneratedRoadmap.create({
      userId: user._id,
      branch: user.branch,
      careerGoal: user.careerGoal,
      specialization,

      roadmapType: "master_4_year",

      semesters: generated.roadmap,

      generatedBy: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    return res.status(201).json({
      success: true,
      data: roadmap,
      isCached: false,
    });
  } catch (error) {
    console.error("❌ MASTER ROADMAP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate your 4-year roadmap.",
      error: error.message,
    });
  }
};

const getMasterRoadmap = async (req, res) => {
  try {
    const roadmap = await GeneratedRoadmap.findOne({
      userId: req.user._id,
      roadmapType: "master_4_year",
    }).sort({ createdAt: -1 });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "4-year roadmap has not been generated yet.",
      });
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error("❌ GET MASTER ROADMAP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load roadmap.",
    });
  }
};

module.exports = {
  generateMaster,
  getMasterRoadmap,
};

const User = require("../models/user");
const GeneratedRoadmap = require("../models/MasterRoadmap");
const SemesterRoadmap = require("../models/SemesterRoadmap");

const generateSemesterRoadmap = require("../utils/Roadmap/semesterRoadmapGenerator");

// ======================================================
// GENERATE SEMESTER ROADMAP
// ======================================================

const generateSemester = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const semester = Number(req.params.semester);

    if (semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8.",
      });
    }

    // --------------------------------------------------
    // CHECK MASTER ROADMAP
    // --------------------------------------------------

    const masterRoadmap = await GeneratedRoadmap.findOne({
      userId: user._id,
      roadmapType: "master_4_year",
    }).sort({ createdAt: -1 });

    if (!masterRoadmap) {
      return res.status(400).json({
        success: false,
        message: "Please generate your 4-year roadmap first.",
      });
    }

    // --------------------------------------------------
    // FIND THIS SEMESTER IN MASTER ROADMAP
    // --------------------------------------------------

    const masterSemester = masterRoadmap.semesters.find(
      (item) => item.semester === semester,
    );

    if (!masterSemester) {
      return res.status(404).json({
        success: false,
        message: `Semester ${semester} was not found in your master roadmap.`,
      });
    }

    // --------------------------------------------------
    // CHECK EXISTING SEMESTER ROADMAP
    // --------------------------------------------------

    const existing = await SemesterRoadmap.findOne({
      userId: user._id,
      semester,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: existing,
        isCached: true,
      });
    }

    // --------------------------------------------------
    // COLLEGE CALENDAR FROM REQUEST
    // --------------------------------------------------

    const { semesterStart, semesterEnd, exams = [], holidays = [] } = req.body;

    if (!semesterStart || !semesterEnd) {
      return res.status(400).json({
        success: false,
        message: "Semester start and end dates are required.",
      });
    }

    const collegeCalendar = {
      semesterStart,
      semesterEnd,
      exams,
      holidays,
    };

    // --------------------------------------------------
    // SPECIALIZATION
    // --------------------------------------------------

    const specialization = Array.isArray(user.specialization)
      ? user.specialization
      : user.specialization
        ? [user.specialization]
        : [];

    // --------------------------------------------------
    // AI GENERATION
    // --------------------------------------------------

    console.log(`🚀 Generating Semester ${semester} roadmap`);

    const generated = await generateSemesterRoadmap({
      branch: user.branch,
      careerGoal: user.careerGoal,
      specialization,
      semester,
      masterSemesterPlan: masterSemester,
      collegeCalendar,
    });

    if (!generated) {
      return res.status(502).json({
        success: false,
        message: "AI could not generate the semester roadmap.",
      });
    }

    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    const roadmap = await SemesterRoadmap.create({
      userId: user._id,

      masterRoadmapId: masterRoadmap._id,

      branch: user.branch,

      careerGoal: user.careerGoal,

      specialization,

      semester,

      semesterObjective: generated.semesterObjective || "",

      roadmapSummary: generated.roadmapSummary || "",

      collegeCalendar,

      weeklyPlan: generated.weeklyPlan || [],

      dailyPlan: generated.dailyPlan || [],

      milestones: generated.milestones || [],

      semesterOutcome: generated.semesterOutcome || "",

      generatedBy: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    });

    return res.status(201).json({
      success: true,
      data: roadmap,
      isCached: false,
    });
  } catch (error) {
    console.error("❌ SEMESTER ROADMAP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate semester roadmap.",
      error: error.message,
    });
  }
};

// ======================================================
// GET SEMESTER ROADMAP
// ======================================================

const getSemesterRoadmap = async (req, res) => {
  try {
    const semester = Number(req.params.semester);

    const roadmap = await SemesterRoadmap.findOne({
      userId: req.user._id,
      semester,
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: `Semester ${semester} roadmap not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error("❌ GET SEMESTER ROADMAP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load semester roadmap.",
    });
  }
};

module.exports = {
  generateSemester,
  getSemesterRoadmap,
};

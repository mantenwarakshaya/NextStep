const express = require("express");

const router = express.Router();

const { userAuth } = require("../middleware/auth");

const {
  generateMaster,
  getMasterRoadmap,
} = require("../controllers/roadmapController");

const {
  generateSemester,
  getSemesterRoadmap,
} = require("../controllers/semesterRoadmapController");

// ======================================================
// MASTER 4-YEAR ROADMAP
// ======================================================

// Generate 4-year roadmap
router.post("/generate", userAuth, generateMaster);

// Get 4-year roadmap
router.get("/", userAuth, getMasterRoadmap);

// ======================================================
// SEMESTER ROADMAP
// ======================================================

// Generate semester roadmap
//
// POST
// /api/roadmap/semester/1
// /api/roadmap/semester/2
// ...
// /api/roadmap/semester/8

router.post("/semester/:semester", userAuth, generateSemester);

// Get semester roadmap

router.get("/semester/:semester", userAuth, getSemesterRoadmap);

module.exports = router;

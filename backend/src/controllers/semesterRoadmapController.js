const User = require("../models/user");
const GeneratedRoadmap = require("../models/MasterRoadmap");
const SemesterRoadmap = require("../models/SemesterRoadmap");

const generateSemesterRoadmap = require("../utils/Roadmap/semesterRoadmapGenerator");

// ======================================================
// VALIDATION HELPERS
// ======================================================

const isValidSemester = (semester) =>
  Number.isInteger(semester) && semester >= 1 && semester <= 8;

// Only "complete" if there's at least one item and every item is true.
// (Guards against .every(Boolean) being vacuously true on empty arrays.)
const isFullyComplete = (items) => items.length > 0 && items.every(Boolean);

// ======================================================
// PROGRESS STATE HELPERS
// ======================================================

const buildProgressState = (roadmap = {}) => {
  const weeklyPlan = (roadmap.weeklyPlan || []).map((week) => ({
    week: week.week ?? 0,
    completed: false,
    topics: Array((week.topics || []).length).fill(false),
    dsa: Array((week.dsa || []).length).fill(false),
    projectWork: Array((week.projectWork || []).length).fill(false),
  }));

  const dailyPlan = (roadmap.dailyPlan || []).map((day) => ({
    date: day.date || "",
    completed: false,
    activities: Array((day.activities || []).length).fill(false),
    dsa: Array((day.dsa || []).length).fill(false),
    collegeWork: Array((day.collegeWork || []).length).fill(false),
  }));

  return {
    weeklyPlan,
    dailyPlan,
    milestones: Array((roadmap.milestones || []).length).fill(false),
  };
};

const padBooleanArray = (arr, length) => {
  const base = Array.isArray(arr) ? arr.slice(0, length).map(Boolean) : [];
  while (base.length < length) base.push(false);
  return base;
};

// Rebuilds `progress` to exactly match the shape of the roadmap's actual
// weeklyPlan/dailyPlan/milestones arrays, preserving any existing checked
// state and padding/truncating anything that's mismatched or missing.
// This makes updateSemesterProgress self-healing against stale/legacy
// documents where progress and the plan arrays have drifted out of sync.
const reconcileProgress = (roadmap) => {
  const existing = roadmap.progress?.toObject
    ? roadmap.progress.toObject()
    : roadmap.progress || {};

  const weeklyPlan = (roadmap.weeklyPlan || []).map((week, i) => {
    const existingWeek = existing.weeklyPlan?.[i];
    return {
      week: week.week ?? 0,
      completed: Boolean(existingWeek?.completed),
      topics: padBooleanArray(existingWeek?.topics, (week.topics || []).length),
      dsa: padBooleanArray(existingWeek?.dsa, (week.dsa || []).length),
      projectWork: padBooleanArray(
        existingWeek?.projectWork,
        (week.projectWork || []).length,
      ),
    };
  });

  const dailyPlan = (roadmap.dailyPlan || []).map((day, i) => {
    const existingDay = existing.dailyPlan?.[i];
    return {
      date: day.date || "",
      completed: Boolean(existingDay?.completed),
      activities: padBooleanArray(
        existingDay?.activities,
        (day.activities || []).length,
      ),
      dsa: padBooleanArray(existingDay?.dsa, (day.dsa || []).length),
      collegeWork: padBooleanArray(
        existingDay?.collegeWork,
        (day.collegeWork || []).length,
      ),
    };
  });

  const milestones = padBooleanArray(
    existing.milestones,
    (roadmap.milestones || []).length,
  );

  return { weeklyPlan, dailyPlan, milestones };
};

// Sets a value on a Mongoose DocumentArray/primitive array safely.
// Falls back to plain index assignment if .set isn't available
// (e.g. if the array were ever a plain JS array instead of a
// Mongoose-tracked one).
const setArrayValue = (arr, index, value) => {
  if (arr && typeof arr.set === "function") {
    arr.set(index, value);
  } else {
    arr[index] = value;
  }
};

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

    if (!isValidSemester(semester)) {
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

    let roadmap;

    try {
      roadmap = await SemesterRoadmap.create({
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

        progress: buildProgressState({
          weeklyPlan: generated.weeklyPlan || [],
          dailyPlan: generated.dailyPlan || [],
          milestones: generated.milestones || [],
        }),

        semesterOutcome: generated.semesterOutcome || "",

        generatedBy: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      });
    } catch (saveError) {
      // Handle race condition: two concurrent requests both passed the
      // "existing" check above and both tried to create the same
      // {userId, semester} document. The unique index rejects the loser —
      // treat that as a cache hit instead of a hard failure.
      if (saveError?.code === 11000) {
        const alreadyCreated = await SemesterRoadmap.findOne({
          userId: user._id,
          semester,
        });

        if (alreadyCreated) {
          return res.status(200).json({
            success: true,
            data: alreadyCreated,
            isCached: true,
          });
        }
      }

      throw saveError;
    }

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
// UPDATE PROGRESS
// ======================================================

const updateSemesterProgress = async (req, res) => {
  try {
    const semester = Number(req.params.semester);

    if (!isValidSemester(semester)) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8.",
      });
    }

    const { kind, index, itemType, itemIndex, value } = req.body;

    if (!kind || !Number.isInteger(index)) {
      return res.status(400).json({
        success: false,
        message: "Progress update is missing required fields.",
      });
    }

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

    // Always reconcile before mutating — cheap, and guarantees
    // progress.weeklyPlan/dailyPlan/milestones exactly match the
    // roadmap's actual plan shape, so index lookups never miss
    // even on legacy documents with drifted/short progress arrays.
    roadmap.progress = reconcileProgress(roadmap);
    const progress = roadmap.progress;

    if (kind === "weekly") {
      const weekProgress = progress.weeklyPlan[index];

      if (!weekProgress) {
        return res.status(400).json({
          success: false,
          message: "Week not found in progress tracker.",
        });
      }

      if (!itemType || !Number.isInteger(itemIndex)) {
        return res.status(400).json({
          success: false,
          message: "Weekly item details are required.",
        });
      }

      const itemList = weekProgress[itemType];

      if (!Array.isArray(itemList) || itemIndex < 0 || itemIndex >= itemList.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid weekly item index.",
        });
      }

      setArrayValue(itemList, itemIndex, Boolean(value));

      weekProgress.completed = isFullyComplete([
        ...weekProgress.topics,
        ...weekProgress.dsa,
        ...weekProgress.projectWork,
      ]);
    } else if (kind === "daily") {
      const dayProgress = progress.dailyPlan[index];

      if (!dayProgress) {
        return res.status(400).json({
          success: false,
          message: "Day not found in progress tracker.",
        });
      }

      if (!itemType || !Number.isInteger(itemIndex)) {
        return res.status(400).json({
          success: false,
          message: "Daily item details are required.",
        });
      }

      const itemList = dayProgress[itemType];

      if (!Array.isArray(itemList) || itemIndex < 0 || itemIndex >= itemList.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid daily item index.",
        });
      }

      setArrayValue(itemList, itemIndex, Boolean(value));

      dayProgress.completed = isFullyComplete([
        ...dayProgress.activities,
        ...dayProgress.dsa,
        ...dayProgress.collegeWork,
      ]);
    } else if (kind === "milestone") {
      if (!Number.isInteger(itemIndex)) {
        return res.status(400).json({
          success: false,
          message: "Milestone index is required.",
        });
      }

      if (itemIndex < 0 || itemIndex >= progress.milestones.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid milestone index.",
        });
      }

      setArrayValue(progress.milestones, itemIndex, Boolean(value));
    } else {
      return res.status(400).json({
        success: false,
        message: "Unsupported progress type.",
      });
    }

    // Belt-and-suspenders: explicitly flag the path as modified in case
    // any nested mutation above wasn't auto-detected by Mongoose.
    roadmap.markModified("progress");

    await roadmap.save();

    return res.status(200).json({
      success: true,
      data: roadmap.progress,
    });
  } catch (error) {
    console.error("❌ UPDATE SEMESTER PROGRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update roadmap progress.",
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

    if (!isValidSemester(semester)) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8.",
      });
    }

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
  updateSemesterProgress,
};
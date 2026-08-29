const mongoose = require("mongoose");

const studyBlockSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    dayType: {
      type: String,
      enum: ["normal", "college_exam", "pre_exam_break", "college_holiday"],
      default: "normal",
    },

    availableHours: {
      type: Number,
      default: 0,
    },

    activities: {
      type: [String],
      default: [],
    },

    dsa: {
      type: [String],
      default: [],
    },

    collegeWork: {
      type: [String],
      default: [],
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const semesterRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    masterRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GeneratedRoadmap",
      required: true,
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

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    semesterObjective: {
      type: String,
      default: "",
    },

    roadmapSummary: {
      type: String,
      default: "",
    },

    collegeCalendar: {
      semesterStart: {
        type: String,
        default: "",
      },

      semesterEnd: {
        type: String,
        default: "",
      },

      exams: {
        type: [
          {
            name: String,
            startDate: String,
            endDate: String,
          },
        ],
        default: [],
      },

      holidays: {
        type: [
          {
            name: String,
            startDate: String,
            endDate: String,
          },
        ],
        default: [],
      },
    },

    weeklyPlan: {
      type: [
        {
          week: Number,
          focus: String,
          topics: [String],
          dsa: [String],
          projectWork: [String],
          expectedOutcome: String,
        },
      ],
      default: [],
    },

    dailyPlan: {
      type: [studyBlockSchema],
      default: [],
    },

    milestones: {
      type: [String],
      default: [],
    },

    progress: {
      type: {
        weeklyPlan: [
          {
            week: Number,
            completed: { type: Boolean, default: false },
            topics: [Boolean],
            dsa: [Boolean],
            projectWork: [Boolean],
          },
        ],
        dailyPlan: [
          {
            date: String,
            completed: { type: Boolean, default: false },
            activities: [Boolean],
            dsa: [Boolean],
            collegeWork: [Boolean],
          },
        ],
        milestones: [Boolean],
      },
      default: {},
    },

    semesterOutcome: {
      type: String,
      default: "",
    },

    generatedBy: {
      type: String,
      default: "gemini-2.5-flash",
    },
  },

  {
    timestamps: true,
    collection: "semester_roadmaps",
  },
);

semesterRoadmapSchema.index(
  {
    userId: 1,
    semester: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("SemesterRoadmap", semesterRoadmapSchema);

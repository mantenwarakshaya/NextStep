const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branch_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    branch_name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    aliases: {
      type: [String],
      default: [],
    },

    about: {
      type: String,
      default: "",
    },

    core_subjects: {
      type: [String],
      default: [],
    },

    key_skills: {
      type: [String],
      default: [],
    },

    career_opportunities: {
      type: [String],
      default: [],
    },

    decision_factors: {
      coding_level: {
        type: String,
        default: "",
      },

      mathematics_level: {
        type: String,
        default: "",
      },

      physics_level: {
        type: String,
        default: "",
      },

      hardware_level: {
        type: String,
        default: "",
      },

      overall_difficulty: {
        type: String,
        default: "",
      },
    },

    simple_explanation: {
      type: String,
      default: "",
    },

    recommended_languages: {
      type: [String],
      default: [],
    },

    common_tools: {
      type: [String],
      default: [],
    },

    practical_work: {
      type: [String],
      default: [],
    },

    project_areas: {
      type: [String],
      default: [],
    },

    internship_areas: {
      type: [String],
      default: [],
    },

    higher_studies: {
      type: [String],
      default: [],
    },

    best_for: {
      type: [String],
      default: [],
    },

    may_not_suit: {
      type: [String],
      default: [],
    },

    first_year_preparation: {
      type: [String],
      default: [],
    },

    software_career: {
      type: Boolean,
      default: false,
    },

    industries: {
      type: [String],
      default: [],
    },

    career_paths: [
      {
        career: {
          type: String,
          default: "",
        },

        why_it_fits: {
          type: String,
          default: "",
        },
      },
    ],

    career_count: {
      type: Number,
      default: 0,
    },

    career_goals: {
      type: [String],
      default: [],
    },

    career_goal_note: {
      type: String,
      default: "",
    },

    year_wise_roadmap: {
      year_1: {
        type: [String],
        default: [],
      },

      year_2: {
        type: [String],
        default: [],
      },

      year_3: {
        type: [String],
        default: [],
      },

      year_4: {
        type: [String],
        default: [],
      },
    },

    parent_guidance: {
      what_parents_should_know: {
        type: String,
        default: "",
      },

      important_parent_questions: {
        type: [String],
        default: [],
      },
    },

    student_faq: [
      {
        question: {
          type: String,
          default: "",
        },

        answer: {
          type: String,
          default: "",
        },
      },
    ],

    career_notes: {
      salary_data_available: {
        type: Boolean,
        default: false,
      },

      placement_data_available: {
        type: Boolean,
        default: false,
      },

      reason: {
        type: String,
        default: "",
      },

      recommendation: {
        type: String,
        default: "",
      },
    },
  },

  {
    timestamps: true,
    collection: "branches",
  },
);

module.exports = mongoose.model("Branch", branchSchema);

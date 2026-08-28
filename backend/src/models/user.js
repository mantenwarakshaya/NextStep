const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const BRANCHES = [
  "CSE-CORE",
  "CSE-AI",
  "CSE-AIML",
  "CSE-DS",
  "CSE-CS",
  "CSE-IOT",
  "CSE-NET",
  "CSD",
  "CSBS",
  "CE-SE",

  "ECE",
  "EEE",
  "EIE",
  "ECOMP",
  "ETELE",
  "ECI",
  "ACT",
  "VLSI",

  "MECH",
  "MECHATRONICS",
  "AUTOMOBILE",
  "AUTOROBOTICS",
  "INDPROD",
  "MFGSYS",
  "THERMAL",

  "CIVIL",
  "CIVILENV",
  "BSE",
  "GEOINFO",
  "DTDP",

  "CHEM",
  "BIOTECH",
  "BIOMED",
  "AGRI",
  "FOODTECH",
  "DAIRYTECH",
  "TEXTILE",

  "MINING",
  "METALLURGY",
  "PETROLEUM",
  "PHARMA",
  "AEROSPACE",
  "AERONAUTICAL",
  "NANOTECH",
];

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Student's B.Tech branch
    branch: {
      type: String,
      enum: BRANCHES,
      default: null,
    },

    // Student's actual career target
    careerGoal: {
      type: String,
      trim: true,
      default: null,
    },

    // Optional specialization for the selected career goal
    specialization: {
      type: [String],
      default: [],
    },

    aiUsage: {
      creditsRemaining: {
        type: Number,
        min: 0,
        default: 1,
      },
    },

    currentSemester: {
      type: Number,
      min: 1,
      max: 8,
      default: null,
    },

    curriculum: [
      {
        semester: {
          type: Number,
          min: 1,
          max: 8,
          required: true,
        },

        fileUrl: {
          type: String,
          required: true,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

// =====================================================
// SOFT DELETE FILTER
// =====================================================

userSchema.pre(/^find/, function () {
  if (this.getOptions().includeDeleted) {
    return;
  }

  this.where({
    isDeleted: false,
  });
});

// =====================================================
// HASH PASSWORD
// =====================================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

// =====================================================
// LOCK BRANCH
// =====================================================

userSchema.pre("save", async function () {
  if (this.isNew) {
    return;
  }

  if (!this.isModified("branch")) {
    return;
  }

  const existing = await this.constructor
    .findById(this._id)
    .setOptions({ includeDeleted: true })
    .select("branch");

  if (existing?.branch && existing.branch !== this.branch) {
    throw new Error("Branch has already been selected and cannot be changed.");
  }
});

// =====================================================
// LOCK BRANCH FOR UPDATE QUERIES
// =====================================================

userSchema.pre(["findOneAndUpdate", "updateOne"], async function () {
  const update = this.getUpdate() || {};

  const newBranch = update.branch ?? update.$set?.branch;

  if (newBranch === undefined) {
    return;
  }

  const existing = await this.model
    .findOne(this.getQuery())
    .setOptions({ includeDeleted: true })
    .select("branch");

  if (existing?.branch && existing.branch !== newBranch) {
    throw new Error("Branch has already been selected and cannot be changed.");
  }
});

// =====================================================
// JWT
// =====================================================

userSchema.methods.getJWT = function () {
  const secret = process.env.JWT_SECRET || "your_fallback_jwt_secret_key";

  return jwt.sign(
    {
      _id: this._id,
    },
    secret,
    {
      expiresIn: "7d",
    },
  );
};

// =====================================================
// PASSWORD VALIDATION
// =====================================================

userSchema.methods.validatePassword = async function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
module.exports.BRANCHES = BRANCHES;

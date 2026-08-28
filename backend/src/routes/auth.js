const express = require("express");
const User = require("../models/user");
const validator = require("validator");
const { userAuth } = require("../middleware/auth");
const { validateSignUpData } = require("../utils/validation");
const Branch = require("../models/Branch");

const authRouter = express.Router();

const isProd = process.env.NODE_ENV === "production";
const cookieConfig = (ms) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  ...(ms && { expires: new Date(Date.now() + ms) }),
});

const publicUser = (user) => ({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName || "",
  emailId: user.emailId,
  branch: user.branch,
  careerGoal: user.careerGoal,
  specialization: user.specialization || [],
  currentSemester: user.currentSemester,
  curriculum: user.curriculum || [],
  createdAt: user.createdAt,
});

// =====================================================
// SIGNUP
// =====================================================

authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, emailId, password } = req.body;

    const normalizedEmail = emailId.trim().toLowerCase();

    // -------------------------------------------------
    // CHECK EXISTING USER
    // -------------------------------------------------

    const existingUser = await User.findOne({
      emailId: normalizedEmail,
    }).setOptions({
      includeDeleted: true,
    });

    if (existingUser) {
      if (existingUser.isDeleted) {
        return res.status(400).json({
          success: false,
          message:
            "This email belongs to a deactivated account. Please restore it instead.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // -------------------------------------------------
    // CREATE USER
    // -------------------------------------------------

    const user = new User({
      firstName: firstName.trim(),
      emailId: normalizedEmail,
      password,

      // These are intentionally NOT collected during signup.
      // They will be selected after login.
      branch: null,
      careerGoal: null,
      specialization: [],
      currentSemester: null,
    });

    await user.save();

    // -------------------------------------------------
    // CREATE JWT
    // -------------------------------------------------

    const token = user.getJWT();

    res.cookie("jwt_token", token, cookieConfig(7 * 24 * 60 * 60 * 1000));

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: publicUser(user),
    });
  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err);

    return res.status(400).json({
      success: false,
      message: err.message || "Signup failed",
    });
  }
});

// 2. LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const normalizedEmail = emailId?.trim().toLowerCase();
    const user = await User.findOne({ emailId: normalizedEmail }).setOptions({
      includeDeleted: true,
    });

    if (!user || !(await user.validatePassword(password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.isDeleted) {
      if (
        user.deletedAt &&
        user.deletedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) {
        return res.status(403).json({
          success: false,
          message: "This account has been permanently removed.",
        });
      }
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_DEACTIVATED",
        message:
          "Your account is deactivated. You can restore it within 7 days.",
      });
    }

    const token = user.getJWT();

    res.cookie("jwt_token", token, cookieConfig(7 * 24 * 60 * 60 * 1000));
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 3. GET CURRENT USER
authRouter.get("/me", userAuth, async (req, res) => {
  try {
    res.json({ success: true, user: publicUser(req.user) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4. EDIT PROFILE (name / semester only — branch is set exactly once
// via PATCH /profile/branch, career goal via PATCH /profile/career-goal;
// neither is touched here)
authRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const { firstName, lastName, currentSemester } = req.body;

    if (!firstName || !firstName.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "First name is required." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          firstName: firstName.trim(),
          lastName: lastName ? lastName.trim() : "",
          currentSemester:
            currentSemester || currentSemester === 0
              ? currentSemester
              : req.user.currentSemester,
        },
      },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: publicUser(updatedUser),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4b. SET BRANCH — one-time, permanent choice.
// Rejects immediately if the user already has a branch, so the
// frontend confirm flow gets a clean 409 instead of relying only
// on the model-level lock.
authRouter.patch("/profile/branch", userAuth, async (req, res) => {
  try {
    const { branch } = req.body;

    if (!branch) {
      return res
        .status(400)
        .json({ success: false, message: "branch is required." });
    }

    if (!User.BRANCHES.includes(branch)) {
      return res.status(400).json({
        success: false,
        message: `"${branch}" is not a recognized branch code.`,
      });
    }

    if (req.user.branch) {
      return res.status(409).json({
        success: false,
        message: "Branch has already been selected and cannot be changed.",
      });
    }

    req.user.branch = branch;
    await req.user.save();

    res.json({
      success: true,
      message: "Branch confirmed.",
      user: publicUser(req.user),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 4c. SET CAREER GOAL — the primary goal can come from ANY branch's
// career list, not just the student's own locked branch (e.g. an ECE
// student aiming to become a MERN developer). specialization is an
// optional array of extra interest tags layered on top. Both are
// re-verified here against real branch data — the frontend only lets
// you pick from a matched dropdown, but this guards direct API calls
// too. Unlike branch, neither field is locked once set.
authRouter.patch("/profile/career-goal", userAuth, async (req, res) => {
  try {
    const { careerGoal, specialization } = req.body;

    // -----------------------------------------
    // BRANCH REQUIRED
    // -----------------------------------------

    if (!req.user.branch) {
      return res.status(400).json({
        success: false,
        message: "Select your branch before choosing a career goal.",
      });
    }

    // -----------------------------------------
    // CAREER GOAL REQUIRED
    // -----------------------------------------

    if (!careerGoal || !careerGoal.trim()) {
      return res.status(400).json({
        success: false,
        message: "careerGoal is required.",
      });
    }

    const cleanCareerGoal = careerGoal.trim();

    const requestedSpecializations = Array.isArray(specialization)
      ? specialization
      : specialization
        ? [specialization]
        : [];
    const cleanSpecializations = requestedSpecializations
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

    if (cleanSpecializations.length > 3) {
      return res.status(400).json({
        success: false,
        message: "You can select up to 3 specializations.",
      });
    }

    // Validate the goal against the branch catalog before sending it to the LLM.
    const branches = await Branch.find({})
      .select("career_paths career_opportunities")
      .lean();
    const availableCareerOptions = new Map();
    branches.forEach((branch) => {
      (branch.career_paths || []).forEach((path) => {
        if (path.career)
          availableCareerOptions.set(path.career.toLowerCase(), path.career);
      });
      (branch.career_opportunities || []).forEach((career) => {
        if (career) availableCareerOptions.set(career.toLowerCase(), career);
      });
    });

    const canonicalCareerGoal = availableCareerOptions.get(
      cleanCareerGoal.toLowerCase(),
    );
    if (!canonicalCareerGoal) {
      return res.status(400).json({
        success: false,
        message: `"${cleanCareerGoal}" is not a recognized career goal.`,
      });
    }

    // -----------------------------------------
    // NO SPECIALIZATION
    // -----------------------------------------

    if (cleanSpecializations.length === 0) {
      req.user.careerGoal = canonicalCareerGoal;

      req.user.specialization = [];

      await req.user.save();

      return res.status(200).json({
        success: true,
        message: "Career goal saved successfully.",
        user: publicUser(req.user),
      });
    }

    // -----------------------------------------
    // VALIDATE SPECIALIZATIONS AGAINST CAREER OPTIONS
    // -----------------------------------------

    const validSpecializations = cleanSpecializations.every((selected) =>
      availableCareerOptions.has(selected.toLowerCase()),
    );

    if (!validSpecializations) {
      return res.status(400).json({
        success: false,
        message:
          "One or more selected specializations are not recognized career options.",
      });
    }

    // -----------------------------------------
    // SAVE
    // -----------------------------------------

    req.user.careerGoal = canonicalCareerGoal;

    req.user.specialization = cleanSpecializations;

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Career goal and specialization saved successfully.",
      user: publicUser(req.user),
    });
  } catch (err) {
    console.error("❌ CAREER GOAL ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save career goal.",
    });
  }
});

// 5. UPDATE PASSWORD
authRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill out all password fields.",
      });
    }

    const isCurrentMatch = await req.user.validatePassword(currentPassword);
    if (!isCurrentMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is not correct" });
    }

    if (
      !validator.isStrongPassword(newPassword, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password are not the same",
      });
    }

    if (await req.user.validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Your new password cannot be the same as your old password.",
      });
    }

    req.user.password = newPassword;
    await req.user.save();

    return res.json({
      success: true,
      message: "Password updated successfully!",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "An unexpected system error occurred.",
    });
  }
});

// 6. SOFT DELETE
authRouter.delete("/profile/delete", userAuth, async (req, res) => {
  try {
    req.user.isDeleted = true;
    req.user.deletedAt = new Date();
    await req.user.save();

    res
      .cookie("jwt_token", null, { ...cookieConfig(), expires: new Date(0) })
      .json({
        success: true,
        message: "Account deactivated. You can restore it within 7 days.",
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 7. RESTORE ACCOUNT
authRouter.post("/restore-account", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId }).setOptions({
      includeDeleted: true,
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "No account found." });
    if (!user.isDeleted)
      return res
        .status(400)
        .json({ success: false, message: "Account is already active." });
    if (!(await user.validatePassword(password)))
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    if (
      user.deletedAt &&
      user.deletedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Recovery timeframe expired." });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();
    res.json({
      success: true,
      message: "Account recovered successfully. You can now log in.",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 8. LOGOUT
authRouter.post("/logout", async (req, res) => {
  res
    .cookie("jwt_token", null, { ...cookieConfig(), expires: new Date(0) })
    .json({ success: true, message: "Logout successful." });
});

module.exports = authRouter;

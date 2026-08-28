const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt_token;

    if (!token) {
      return res.status(401).json({ success: false, message: "Please login" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_fallback_jwt_secret_key",
    );
    const user = await User.findById(decoded._id);

    if (!user || user.isDeleted) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("🔒 AUTH MIDDLEWARE ERROR:", err.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

module.exports = { userAuth };

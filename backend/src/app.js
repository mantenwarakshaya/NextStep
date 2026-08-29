const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");

const app = express();

// =====================================================
// CORS
// =====================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nextstep-bflm.onrender.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// =====================================================
// BODY / COOKIE MIDDLEWARE
// =====================================================

app.use(express.json());
app.use(cookieParser());

// =====================================================
// API ROUTES
// =====================================================

const branchRoutes = require("./routes/branchRoutes");
const authRoutes = require("./routes/auth");
const roadmapRouter = require("./routes/roadmap");

app.use("/api/branches", branchRoutes);
app.use("/api/roadmap", roadmapRouter);
app.use("/api", authRoutes);

// =====================================================
// FRONTEND INTEGRATION
// =====================================================

const frontendBuildPath = path.join(
  __dirname,
  "../../frontend/build"
);

app.use(express.static(frontendBuildPath));

// React SPA fallback
app.get(
  /^(?!\/api(?:\/|$)).*/,
  (req, res) => {
    res.sendFile(
      path.join(frontendBuildPath, "index.html")
    );
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database connection established");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      "Database cannot be connected:",
      err
    );
  });
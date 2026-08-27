const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
});

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());


const branchRoutes = require("./routes/branchRoutes");
const authRoutes = require("./routes/auth");
const roadmapRouter = require("./routes/roadmap");

app.use("/api/branches", branchRoutes);
app.use("/api/roadmap", roadmapRouter);
app.use("/api", authRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("NextStep Backend is running successfully 🚀");
});

const PORT = process.env.PORT || 7777;

// Connect MongoDB first, then start server
connectDB()
    .then(() => {
        console.log("Database connection established");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Database cannot be connected:", err);
    });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const branchRoutes = require("./routes/branchRoutes");

app.use("/api/branches", branchRoutes);

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
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.send("NextStep Backend is running successfully 🚀");
});

const PORT = process.env.PORT || 5000;

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
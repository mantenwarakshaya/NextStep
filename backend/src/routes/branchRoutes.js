const express = require("express");
const router = express.Router();
const {
  getAllBranches,
  getBranchById,
} = require("../controllers/branchController");

router.get("/", getAllBranches);
router.get("/:id", getBranchById);

module.exports = router;
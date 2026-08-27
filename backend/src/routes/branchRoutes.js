const express = require("express");

const router = express.Router();

const {
  getAllBranches,
  getBranchById,
  getBranchByCode,
} = require("../controllers/branchController");

router.get("/", getAllBranches);

router.get("/code/:branchCode", getBranchByCode);

router.get("/:id", getBranchById);

module.exports = router;
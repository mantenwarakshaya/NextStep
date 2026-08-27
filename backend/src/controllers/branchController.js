const Branch = require("../models/Branch");

const getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({})
      .sort({ branch_name: 1 });

    res.status(200).json(branches);
  } catch (error) {
    console.error(
      "Error fetching branches:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch branches",
    });
  }
};

const getBranchById = async (req, res) => {
  try {
    const branch =
      await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        error: "Branch not found",
      });
    }

    res.status(200).json(branch);
  } catch (error) {
    console.error(
      "Error fetching branch:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch branch",
    });
  }
};

const getBranchByCode = async (req, res) => {
  try {
    const branchCode =
      req.params.branchCode
        .trim()
        .toUpperCase();

    const branch =
      await Branch.findOne({
        branch_code: branchCode,
      });

    if (!branch) {
      return res.status(404).json({
        error:
          `No branch found for code "${branchCode}".`,
      });
    }

    res.status(200).json(branch);
  } catch (error) {
    console.error(
      "Error fetching branch by code:",
      error
    );

    res.status(500).json({
      error: "Failed to fetch branch",
    });
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  getBranchByCode,
};
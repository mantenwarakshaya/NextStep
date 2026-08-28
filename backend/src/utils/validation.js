const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, emailId, password, branch, careerGoal } = req.body;

  if (!firstName || !emailId || !password) {
    throw new Error("First name, email, and password are required.");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Please provide a valid email address.");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
    );
  }
};

module.exports = { validateSignUpData };

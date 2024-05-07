const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  verifyPassResetCode,
} = require("../controllers/authController");

const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyPassResetCodeValidator,
} = require("../utils/validators/authValidator");

const router = require("express").Router();
router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/forgotpassword", forgotPasswordValidator, forgotPassword);
router.post(
  "/verifyResetCode",
  verifyPassResetCodeValidator,
  verifyPassResetCode
);
router.post("/resetPassword/:token", resetPasswordValidator, resetPassword);

module.exports = router;

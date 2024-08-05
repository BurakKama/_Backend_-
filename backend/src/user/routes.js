const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgetPassword,
  resetCodeCheck,
  resetPassword,
} = require("./controller");
const authValidation = require("../validations/authValidation")


router.post("/register",authValidation.register, register);

router.post("/login", authValidation.login,login);

router.post("/forget-password", forgetPassword);

router.post("/reset-code-check", resetCodeCheck);

router.post("/reset-password", resetPassword);

module.exports = router;

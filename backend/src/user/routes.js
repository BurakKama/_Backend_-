const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgetPassword,
  resetCodeCheck,
  resetPassword,
} = require("./controller");

router.post("/register", register);

router.post("/login", login);

router.post("/forget-password", forgetPassword);

router.post("/reset-code-check", resetCodeCheck);

router.post("/reset-password", resetPassword);

module.exports = router;

const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const { createJSONToken } = require("../util/auth");
const { isValidEmail, isValidText } = require("../util/validation");

module.exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  let errors = {};

  if (!isValidText(username, 3)) {
    errors.username = "Invalid username!";
  } else {
    try {
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        errors.username = "Username already exists!";
      }
    } catch (err) {
      console.log(err);
    }
  }

  if (!isValidEmail(email)) {
    errors.email = "Invalid email!";
  } else {
    try {
      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        errors.email = "Email already exists!";
      }
    } catch (err) {
      console.log(err);
    }
  }

  if (!isValidText(password, 8)) {
    errors.password = "Invalid password. Must be at least 8 characters long.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "User signup failed due to validation errors.",
      errors,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      destinations: [],
    });
    delete user.password;

    const authToken = createJSONToken(user.username);
    res.status(201).json({
      message: "User created.",
      user: { id: user._id, username: user.username },
      token: authToken,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Authentication failed." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(422).json({
        message: "Invalid credentials.",
        errors: { credentials: "Invalid email or password entered." },
      });
    delete user.password;

    const token = createJSONToken(username);

    res.json({
      user: { id: user._id, username: user.username },
      token,
    });
  } catch (error) {
    next(error);
  }
};

const { sign, verify } = require("jsonwebtoken");

require("dotenv").config();

const KEY = process.env.KEY;

const User = require("../models/userModel");

function createJSONToken(username) {
  return sign({ username }, KEY, { expiresIn: "1h" });
}

function validateJSONToken(token) {
  return verify(token, KEY);
}

async function checkAuthMiddleware(req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }
  if (!req.headers.authorization) {
    console.log("NOT AUTH. AUTH HEADER MISSING.");
    return res.status(401).json({ msg: "Not authorised", status: false });
  }
  const authFragments = req.headers.authorization.split(" ");

  if (authFragments.length !== 2) {
    console.log("NOT AUTH. AUTH HEADER INVALID.");
    return res.status(401).json({ msg: "Not authorised", status: false });
  }
  const authToken = authFragments[1];
  try {
    const decoded = validateJSONToken(authToken);

    const user = await User.findOne({ username: decoded.username });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    req.user = user;
  } catch (error) {
    console.error(error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).send();
    } else {
      return res.status(500).send();
    }
  }
  next();
}

exports.createJSONToken = createJSONToken;
exports.validateJSONToken = validateJSONToken;
exports.checkAuth = checkAuthMiddleware;

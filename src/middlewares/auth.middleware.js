const asyncHandler = require("../utils/asyncHandler.js");
const jwt = require("jsonwebtoken");
const User = require("../models/user.models.js");
const api_error = require("../utils/api_error.js");

const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new api_error(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -confirmPassword"
    );

    if (!user) {
      throw new api_error(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new api_error(401, error?.message || "Invalid access token");
  }
});

module.exports = verifyJWT;

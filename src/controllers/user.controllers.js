const User = require("../models/user.models");
const asyncHandler = require("../utils/asyncHandler");
const api_error = require("../utils/api_error");
const api_response = require("../utils/api_response");
const { hash, compare } = require("bcrypt");

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user_acess = await User.findById(userId);
    console.log(user_acess, "User");
    const access_token = user_acess.generateAccess_token();
    return access_token;
  } catch (error) {
    throw new api_error(
      500,
      "Something went wrong while generating referesh and access token"
    );
    // console.log(error);
  }
};

/* asyncHandler is a higher order function which takes following function as a parameter ,
in which we use promise/try-catch to catch the errors if already found its been using for making code production level . 
so that we do not have to write try-catch block everytime for error handling :: - refernece @chai aur code hitesh choudhary  */

const register = asyncHandler(async (req, res) => {
  /*

  ------Steps To register User-------


  1. Get data from Frontend / User/ request 
  2. check if user already exists or not 
  3. add  validation: not null , email format , password format 
  4.create user object - create entry in db 
  4. check if user is created or not 
  5. if user is creteated return response , removing password ,confirmpassword , token 
  6.add encryption for password
  7.add jwt token for acessing 
  8. cookie --- for further consideration
   */

  // Destructuring the data which we are getting from req.body

  const { name, email, password, confirmPassword } = req.body;

  /*   validation

  if (name === "") {
    throw new api_error(400, "Name is Required");
  }

  if (email === "") {
    throw new api_error(400, "Email is Required");
  }

  if (password === "") {
    throw new api_error(400, "Password is Required");
  }

  if (confirmPassword === "") {
    throw new api_error(400, "confirm Password is Required");
  }
  OR
*/

  if (
    [name, email, password, confirmPassword].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new api_error(400, "All fields are required !!");
  }

  // checking if user already existed
  const existing_user = await User.findOne({ email });
  if (existing_user) {
    throw new api_error(409, "User is already Registered Please Login ");
  }

  // Encrypting password

  const encrypted_password = await hash(password, 10);
  const encrypted_confirm_password = await hash(confirmPassword, 10);

  const password_matches = await compare(password, encrypted_confirm_password);

  // checking if both passwords are matched or not if matched then create user else throw an error
  if (!password_matches) {
    throw new api_error(404, "Password must match ");
  }

  const user = await User.create({
    name,
    email,
    password: encrypted_password,
    confirmPassword: encrypted_confirm_password,
  });

  const created_user = await User.findById(user._id).select(
    "-password -confirmPassword "
  );

  if (!created_user) {
    throw new api_error(500, "Something went wrong while registering the user");
  }

  // api_response is also an higher order function
  return res
    .status(201)
    .json(
      new api_response(200, created_user, "User has been sucessfully created")
    );
});

const login_user = asyncHandler(async (req, res) => {
  /*
    ------------Steps For Login ------------------
    1. get data from body {email,password}
    2.find user 
    3.check if password matches
    4.generate jwt token for acess 
    5.valid token 
    6. send cookie 
   */

  // Destructuring the data
  const { email, password } = req.body;

  // check if user exists
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new api_error(400, "User is not Registered Please Register to Login");
  }
  const match_password = await compare(password, user.password);

  // console.log("match?", match_password);
  // console.log("user pass from db ", user.password);
  // console.log("pass from user", password);

  if (!match_password) {
    throw new api_error(401, "Invalid user credentials");
    // throw new Error();
  }

  const access_token = await generateAccessAndRefereshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password ");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("access_token", access_token, options)
    .json(
      new api_response(
        200,
        {
          user: loggedInUser,
          access_token,
        },
        "User logged In Successfully"
      )
    );
});

const logout_user = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    new: true,
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new api_response(200, {}, "User logged Out"));
});

const getUsers_data = asyncHandler(async (req, res) => {
  const user_details = await User.find().select("-password -confirmPassword");
  if (!user_details) {
    throw new api_error(500, "Internal Server Error Please Check Connection");
  }
  return res
    .status(200)
    .json(new api_response(204, user_details, "Data Fetched SucessFully"));
});

const particular_user = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new api_response(200, req.user, "User fetched successfully"));
});

const update_user = asyncHandler(async (req, res) => {
  /* ==========Steps to update the user data  ============
    1. get data from req.body (name,email,password,old password)
    2. check if new password and old passwords are same or not 
    3.if same then return error
    4. if not update password filed with a new password
    5. return sucess message
   */

  const { name, old_password, new_password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  const pass_check = await compare(old_password, user.password);

  if (!pass_check) {
    throw new api_error(405, "Invalid old password");
  }

  if (old_password == new_password) {
    throw new api_error(400, "Do not set new password  as old password");
  }

  const new_hash_pass = await hash(new_password, 10);

  user.password = new_hash_pass;

  if (!name) {
    throw new api_error(400, "Please Fill all Fields");
  }
  const updated_user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        name,
      },
    },
    { new: true }
  ).select("-password");

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new api_response(
        200,
        updated_user,
        "Password & Name  changed successfully"
      )
    );
});

module.exports = {
  register,
  login_user,
  logout_user,
  getUsers_data,
  particular_user,
  update_user,
};

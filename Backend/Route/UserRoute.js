const express = require('express');
const route = express.Router();
const Users = require('../models/UserSchema');
const { UserCreate, getUsers, getUserById, UpdateUser, deleteuser, loginUser, verifyEmail, GoogleAuth, followUser, userSetting, forgotpassword, resetpassword } = require('../controllers/UserController');
const verifyUser = require("../middleware/auth");
const upload = require('../utills/multer');
route.get("/users", getUsers)
route.post("/signin", loginUser)

route.post("/signup", UserCreate)

route.get("/users", getUsers)


route.get("/users/:username", getUserById)


route.put("/user/:id", verifyUser, upload.single('profilePic'), UpdateUser)

route.get("/verify-email/:verificationToken", verifyEmail)
//google auth route

route.post("/google-auth", GoogleAuth)

route.delete("/user/:id", deleteuser)

route.post("/follow/:creator", verifyUser, followUser)

route.post("/setting-visibility", verifyUser, userSetting)

route.post("/reset-password", forgotpassword)
route.put("/reset-password/:token", resetpassword)
module.exports = route
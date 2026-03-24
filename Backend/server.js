const express = require('express')
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dbconnect = require('./config/dbconnect');
const Users = require("./models/UserSchema")
const UserRoute = require("./Route/UserRoute")
const UserRoute2 = require("./Route/UserRoute2")
const BlogRoute = require("./Route/BlogRoute")
const cloudinaryConfig = require("./config/cloudinary")
const {  DB_URL, SERVER_PORT } = require("./config/dotenv.config")
const dotenv = require('dotenv')
dotenv.config();
const PORT = SERVER_PORT
app.use(express.json());
app.use(cors())
app.use("/api/v1", UserRoute)

app.use("/api/v2", UserRoute2)

app.use("/api/v1", BlogRoute)

app.get('/',(req,res)=>{
    res.send("app is runing")
})


app.listen(3000, () => {
    dbconnect(DB_URL)
    cloudinaryConfig()
})
const mongoose = require('mongoose');
const { MONGO_URL } = require('./dotenv.config');
require('dotenv').config()
async function dbconnect(URL) {
    try {
        await mongoose.connect(MONGO_URL) 
    }
    catch (err) {
     console.log("error")
    }
}
module.exports=dbconnect;
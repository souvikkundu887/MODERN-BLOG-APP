const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_SECRET, CLOUDINARY_API_KEY } = require("./dotenv.config")
async function cloudinaryConfig() {
    try {
        cloudinary.config(
            {
                cloud_name: CLOUDINARY_CLOUD_NAME,
                api_key: CLOUDINARY_API_KEY,
                api_secret: CLOUDINARY_SECRET
            }

        )
    } catch (err) {

    }
}

module.exports = cloudinaryConfig;
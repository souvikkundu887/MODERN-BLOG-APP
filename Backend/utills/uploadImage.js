const cloudinary = require('cloudinary').v2;

async function uploadImage(filePath) {
    try {
        const res = await cloudinary.uploader.upload(filePath, {
            folder: "blogimage",
        })
        return res;
    } catch (err) {
    }
}
async function deleteImage(public_id){
        const res =await cloudinary.uploader.destroy(public_id,function (error,result){
            if(error){
            }
            else{
            }
        })
    
  
}
module.exports = {uploadImage, deleteImage}
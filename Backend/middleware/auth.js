const { verifyJWT } = require("../utills/generateToken");

function verifyUser(req, res, next) {
   try{
     const token = req.headers.authorization.split(" ")[1]
        
     if (!token) {
        return res.status(401).json({ success: false, message: "unauthorized access in token" })
       }
    // now verify the token is valid or not
    let isValid = verifyJWT(token);
    if (!isValid) {
        return res.status(401).json({ success: false, message: "unauthorized access token expired" });
    }
   req.user={id:isValid.payload.id};
    next();
   }
   catch(error){

   }
}
module.exports = verifyUser
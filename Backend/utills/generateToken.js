const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config/dotenv.config')
require('dotenv').config()
function generateJWT(payload) {
  try {
    let token = jwt.sign({ payload }, JWT_SECRET)
    return token;
  } catch (error) {
 
  }
}


function verifyJWT(token) {
  try {
    let isValid = jwt.verify(token, JWT_SECRET)
    return isValid;
  }
  catch (error) {
    return false;
  }
}

function decodeJWT(token) {
  try {
    let isValid = jwt.verify(token, JWT_SECRET)
    let decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
  }
}

module.exports = { verifyJWT, generateJWT, decodeJWT }
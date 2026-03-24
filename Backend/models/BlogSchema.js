const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
       title: {
              type: String,
              trim: true,
              required: true
       },

       Desc: String,
       content:{
              type:Object,
              required:true
       }
       ,
       blogId:{
              type:String,
              requuired:true,
              unique:true
       },

       image: {
              type: String,
              required: true,
       },

       imageid: {
              type: String,
       },

       creator: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true
       },
       likes: [
              {
                     type: mongoose.Schema.Types.ObjectId,
                     ref: "User"
              }
       ],
       comments: [
              {
                     type: mongoose.Schema.Types.ObjectId,
                     ref: "comment"
              }
       ],
       totalSaves:[
              {
                     type:mongoose.Schema.Types.ObjectId,
                     ref:'User'

              }
       ],
       draft:{
        type:Boolean,
        default:false
       },
       tags:[
              {
                     type:String
              }
       ]
},
       { timestamps: true } 
)
const Blogs = mongoose.model('blog', BlogSchema);
module.exports = Blogs
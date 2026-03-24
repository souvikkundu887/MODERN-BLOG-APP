const express = require('express');
const { GetBlog, CreateBlog, UpdateBlog, DeleteBlog, GetBlogById, likeBlog,saveBlog,searchBlog } = require("../controllers/Blogcontroller")
const { commentBlog, deleteComment, editComment, likeComment,NestedComment } = require("../controllers/commentcontroller")
const route = express.Router();
const verifyUser = require("../middleware/auth");
const upload = require('../utills/multer');
route.get("/blogs", GetBlog)

route.get("/blogs/:id", GetBlogById)

route.post("/blogs", verifyUser, upload.fields([{ name: "image", maxCount:1 }, { name: "images" }]), CreateBlog)

route.put("/blogs/:id", verifyUser, upload.fields([{ name: "image",maxCount:1 }, { name: "images" }]), UpdateBlog)

route.delete("/blogs/:id", verifyUser, DeleteBlog)

route.post("/blogs/like/:id", verifyUser, likeBlog)

route.post("/blogs/comment/:id", verifyUser, commentBlog)

route.delete("/blogs/comment/:id", verifyUser, deleteComment)

route.put("/blogs/editcomment/:id", verifyUser, editComment)

route.post("/blogs/likecomment/:id", verifyUser, likeComment)

route.post("/blogs/save/:id",verifyUser,saveBlog)

route.get("/search-blogs",searchBlog)



route.post("/comment/:parentCommentId/:id",verifyUser,NestedComment)
module.exports = route;

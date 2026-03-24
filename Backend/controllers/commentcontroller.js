const Blogs = require("../models/BlogSchema")
const User = require("../models/UserSchema")
const comments = require("../models/commentSchema")
const Comment = require("../models/commentSchema")
const { verifyJWT, decodeJWT } = require("../utills/generateToken")

async function commentBlog(req, res) {
    // const { Title, Desc, Draft, Tags, Author } = req.body
    try {
        const { comment } = req.body;
        if (!comment) {
            return res.status(401).json({
                status: false,
                message: "please fill the comment section"
            })
        }
        const creator = req.user.id;
        const { id } = req.params

        const findblog = await Blogs.findOne({ blogId: id });

        if (!findblog) {
            return res.status(500).json({
                success: false,
                message: "blog is not fuond"
            })
        }

        const newComment = await Comment.create({
            comment: comment,
            blog: findblog._id,
            user: creator
        }).then((comment) => {
            return comment.populate({
                path: "user",
                select: "name email"
            })
        })
        // await User.findByIdAndUpdate(creator, { $push: { blog: newBlog._id } })
        const addcomment = await Blogs.findOneAndUpdate({ blogId: id }, { $push: { comments: newComment._id } }, { new: true })

        res.status(200).json({
            success: true,
            message: "comment added succesfully",
            newComment
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}

async function deleteComment(req, res) {
    // const { Title, Desc, Draft, Tags, Author } = req.body
    try {
        const creator = req.user.id
        const { id } = req.params

        const findComment = await Comment.findById(id);

        if (!findComment) {
            return res.status(500).json({
                success: false,
                message: "comment is not fuond"
            })
        }
        const blogid = findComment.blog
        const findblog = await Blogs.findById(blogid);

        async function deleteCommentReplies(id) {

            let comment = await Comment.findById(id)

            for (const reply of comment.replies) {
                await deleteCommentReplies(reply._id)
            }

            if (comment.parentComment) {
                await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: id } })
            }
            await Comment.findByIdAndDelete(id)
        }

        if (creator == findblog.creator._id) {
            await deleteCommentReplies(id)
            const deletecomment = await Blogs.findByIdAndUpdate(blogid, { $pull: { comments: id } }, { new: true })
            await Comment.findByIdAndDelete(id)
            return res.status(200).json({
                success: true,
                message: "comment deleted succesfully",
                comment:findComment
            })
        }

        if (!(creator == findComment.user)) {

            return res.status(401).json({
                success: false,
                message: "you are not authorized for this action"
            })

        }

        await deleteCommentReplies(id)

        const deletecomment = await Blogs.findByIdAndUpdate(blogid, { $pull: { comments: id } }, { new: true })


        res.status(200).json({
            success: true,
            message: "comment deleted succesfully",
            comment: findComment
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}
async function editComment(req, res) {
    // const { Title, Desc, Draft, Tags, Author } = req.body
    try {
        const creator = req.user.id;
        const { updatedCommentContent } = req.body;
        const { id } = req.params

        const findComment = await Comment.findById(id);
        if (!findComment) {
            return res.status(500).json({
                success: false,
                message: "comment is not fuond"
            })
        }
        if (creator != findComment.user) {
            return res.status(401).json({
                success: false,
                message: "you are not authorized to edit the comment"
            })
        }
        const updatedComment = await Comment.findByIdAndUpdate(id, {
            comment: updatedCommentContent,
            blog: findComment.blog,
            user: creator
        }, { new: true })

        await updatedComment.populate({
            path: "user",
            select: "name"
        })
        // await User.findByIdAndUpdate(creator, { $push: { blog: newBlog._id } })
        // const addcomment = await Blogs.findByIdAndUpdate(id, { $push: { comments:updatedComment._id } }, { new: true })

        res.status(200).json({
            success: true,
            message: "comment updated succesfully",
            updatedComment
        })
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}

async function likeComment(req, res) {
    try {
        const { id } = req.params
        const creator = req.user.id

        const findComment = await Comment.findById(id);
        if (!findComment) {
            return res.status(401).json({
                success: false,
                message: "comment is not found"
            })
        }

        if (!findComment.likes.includes(creator)) {
            await Comment.findByIdAndUpdate(id, { $push: { likes: creator } })
            return res.status(200).json({
                success: true,
                message: "liked succesfully",
            })
        }
        else {
            await Comment.findByIdAndUpdate(id, { $pull: { likes: creator } })
            return res.status(200).json({
                success: true,
                message: "disliked succesfully",
            })
        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}

async function NestedComment(req, res) {
    try {
        const userId = req.user.id
        const { id, parentCommentId } = req.params
        const { reply } = req.body

        const comment = await Comment.findById(parentCommentId)
        if (!comment) {
            return res.status(401).json(
                {
                    success: false,
                    message: "comment not found"
                }
            )
        }

        const blog = await Blogs.findOne({ blogId: id })
        if (!blog) {
            return res.status(401).json(
                {
                    success: false,
                    message: "comment not found"
                }
            )
        }

        const newReply = await Comment.create({
            blog: blog._id,
            comment: reply,
            parentComment: parentCommentId,
            user: userId
        })
        await newReply.populate({
            path: "user",
            select: "name email"
        })

        await Comment.findByIdAndUpdate(parentCommentId, { $push: { replies: newReply._id } })

        return res.status(200).json({
            success: true,
            message: "reply  added successfully",
            newReply
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }

}



module.exports = { commentBlog, deleteComment, editComment, likeComment, NestedComment };
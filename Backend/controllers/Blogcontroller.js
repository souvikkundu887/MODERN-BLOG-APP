const Blogs = require("../models/BlogSchema")
const User = require("../models/UserSchema")
const comments = require("../models/commentSchema")
const Comment = require("../models/commentSchema")
const { uploadImage, deleteImage } = require("../utills/uploadImage")
const { verifyJWT, decodeJWT } = require("../utills/generateToken")
const fs = require('fs');
const uniqueid = require("uniqid");
const { json } = require("stream/consumers")
const path = require("path")

async function CreateBlog(req, res) {
    try {
        const { title, Desc, draft } = req.body
        const { image, images } = req.files
        const content = JSON.parse(req.body.content)
        const tags = JSON.parse(req.body.tags)
        let imgIndex = 0;

        for (let i = 0; i < content.blocks.length; i++) {
            const block = content.blocks[i]

            if (block.type === 'image') {

                const base64 = images[imgIndex].buffer.toString("base64")
                const dataUrl = `data:image/jpeg;base64,${base64}`

                const { url, public_id } = await uploadImage(dataUrl)

                imgIndex++
                block.data.file.url = url
                block.data.file.public_id = public_id
            }
        }


        const { url, public_id } = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)
        //create a custom blog id
        const blogId = title.toLowerCase().split(" ").join("-") + "-" + uniqueid();
        const newBlog = await Blogs.create({
            title,
            image: url,
            imageid: public_id,
            Desc,
            creator: req.user.id,
            blogId,
            content,
            tags,
            draft
        })

        await User.findByIdAndUpdate(req.user.id, { $push: { blog: newBlog._id } })
        if (draft) {
            return res.status(200).json({
                success: true,
                message: "Draft saved succesfully"
            })
        }
        res.status(201).json({
            success: true,
            message: "Blog has been created for you",
            newBlog
        })
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            error
        })
    }
}

async function GetBlog(req, res) {
    try {

        const page = req.query.page - '0';
        const limit = req.query.limit - '0';
        const skip = (page - 1) * limit
        const blog = await Blogs.find({ draft: false })
            .populate({ path: "creator" })
            .populate({
                path: "comments",
                populate: [
                    { path: "user", select: "name followers" },
                    { path: "replies" }
                ]
            }).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalBlogs = await Blogs.countDocuments({ draft: false })
        res.status(200).json({
            success: true,
            message: "got the blog",
            blog,
            hasMore: skip + limit >= totalBlogs ? false : true
        })
        
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}
async function GetBlogById(req, res) {
    try {
        const { id } = req.params
        const blog = await Blogs.findOne({ blogId: id }).populate({ path: "creator" }).populate({
            path: "comments",
            populate:
                { path: "user", select: "name" },

        }).lean();

        async function populateReplies(comments) {
            for (const comment of comments) {
                let populatedComment = await Comment.findById(comment._id).populate({
                    path: "replies",
                    populate: {
                        path: "user", select: "name"
                    }
                }).lean()

                comment.replies = populatedComment.replies

                if (populatedComment.replies.length > 0) {


                    await populateReplies(populatedComment.replies)
                }
            }

            return comments


        }

        blog.comments = await populateReplies(blog.comments)

        res.status(200).json({
            success: true,
            message: "got the blog",
            blog
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
async function UpdateBlog(req, res) {
    try {
        const { title, Desc, draft } = req.body
        const { id } = req.params

        const blogId = id
        const imageUrl = req?.body?.image

        const creator = req.user.id
        let content = JSON.parse(req.body.content)
        const tags = JSON.parse(req.body.tags)
        const { images, image } = req.files

        const existingImages = JSON.parse(req.body.existingImages)
        const findblog = await Blogs.findOne({ blogId });

        if (!(req.user.id == findblog.creator)) {
            return res.status(401).json({
                success: false,
                message: "you are not authorized for this action"
            })
        }
        const imageid = findblog.imageid
        let imageToDelete = findblog.content.blocks.filter((block) => (block.type == 'image')).filter(
            (block) => !existingImages.find(({ url }) => url == block.data.file.url)
        ).map((block) => block.data.file.public_id)

        if (imageToDelete.length > 0) {

            await Promise.all(
                imageToDelete.map((id) => deleteImage(id))
            )


        }


        if (images) {
            let imgIndex = 0;
            for (let i = 0; i < content.blocks.length; i++) {
                const block = content.blocks[i]

                if (block.type === 'image' && block.data.file.image) {

                    const base64 = images[imgIndex].buffer.toString("base64")
                    const dataUrl = `data:image/jpeg;base64,${base64}`

                    const { url, public_id } = await uploadImage(dataUrl)

                    imgIndex++
                    block.data.file.url = url
                    block.data.file.public_id = public_id
                }
            }
        }
       if (image) {
            await deleteImage(imageid)
            const { url, public_id } = await uploadImage(`data:image/jpeg;base64,${image[0].buffer.toString("base64")}`)
            imageUrl = url;
            imageid = public_id
        }

        const blog = await Blogs.findOneAndUpdate({ blogId: id }, {
            title,
            image: imageUrl,
            imageid: imageid,
            Desc,
            creator: req.user.id,
            blogId,
            content,
            draft,
            tags
        },
            { new: true })
         if (draft) {
          return res.status(200).json({
                success: true,
                message: "Draft saved succesfully"
            })
        }
        res.status(200).json({
            success: true,
            message: "updated succesfully",
            blog
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
async function DeleteBlog(req, res) {
    try {
        const creator = req.user.id
        const { id } = req.params

        const findblog = await Blogs.findById(id);

        if (!(req.user.id == findblog.creator)) {
            return res.status(401).json({
                success: false,
                message: "you are not authorized for this action"
            })
        }
        const imageid = findblog.imageid;
        await deleteImage(imageid);
        const blog = await Blogs.findByIdAndDelete(id)


        await User.findByIdAndUpdate(creator, { $pull: { blog: id } })
        res.status(200).json({
            success: true,
            message: "Deleted succesfully",
            blog
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


async function likeBlog(req, res) {
    try {
        const { id } = req.params

        let findblog = await Blogs.findOne({ blogId: id });
        if (!findblog) {
            return res.status(500).json({
                success: false,
                message: "blog is not fuond"
            })
        }
        if (!findblog.likes.includes(req.user.id)) {
            findblog = await Blogs.findOneAndUpdate({ blogId: id }, { $push: { likes: req.user.id } }, { new: true })
            await User.findByIdAndUpdate(req.user.id, { $push: { likeBlogs: findblog._id } })
            return res.status(200).json({
                success: true,
                message: "liked succesfully",
                blog: findblog
            })
        }
        else {
            findblog = await Blogs.findOneAndUpdate({ blogId: id }, { $pull: { likes: req.user.id } }, { new: true })
            await User.findByIdAndUpdate(req.user.id, { $pull: { likeBlogs: findblog._id } })

            return res.status(200).json({
                success: true,
                message: "disliked succesfully",
                blog: findblog
            })
        }
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}

async function saveBlog(req, res) {
    try {
        const { id } = req.params
        const user = req.user.id;
        const blog = await Blogs.findById(id);
        if (!blog) {
            return res.status(400).json({
                status: 'error',
                message: "blog not found"
            })
        }

        if (!blog.totalSaves.includes(user)) {
            await User.findByIdAndUpdate(user, { $set: { saveBlogs: id } })
            await Blogs.findByIdAndUpdate(id, { $set: { totalSaves: user } })
            return res.status(200).json({
                status: "success",
                message: "blog saved successfully"
            })
        }
        else {
            await User.findByIdAndUpdate(user, { $pull: { saveBlogs: id } })
            await Blogs.findByIdAndUpdate(id, { $pull: { totalSaves: user } })
            return res.status(200).json({
                status: "success",
                message: "blog unsaved successfully"
            })
        }

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}

async function searchBlog(req, res) {
    try {
        const { search } = req.query
        const page = req.query.page - '0';
        const limit = req.query.limit - '0';
        const skip = (page - 1) * limit
        const query = {
            $or: [
                { title: { $regex: search, $options: "i" } },
                { Desc: { $regex: search, $options: "i" } },

            ]
        }
        const blogs = await Blogs.find(query, { draft: false }).sort({ createdAt: -1 }).skip(skip).limit(limit)

        const totalBlogs = await Blogs.countDocuments(query, { draft: false })

        return res.status(200).json({
            status: "success",
            message: "blogs fetched success fully",
            blogs,
            hasMore: skip + limit >= totalBlogs ? false : true
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server err",
            err
        })
    }
}


module.exports = { CreateBlog, GetBlog, UpdateBlog, DeleteBlog, GetBlogById, likeBlog, saveBlog, searchBlog };
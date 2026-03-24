const mongoose = require('mongoose');
const Blogs = require('./BlogSchema');
const { verify } = require('../utills/transporter');
const { deleteApp } = require('firebase-admin/app');
const crypto = require('crypto')
const UserSChema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    blog: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        },
    ],
    profilePic: {
        type: String,
        default: null
    },
    verified: { 
        type: Boolean,
        default: false,

    },
    googleAuth: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String
    },

    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    saveBlogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }
    ],
    likeBlogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'blog'
        }
    ],
    showLikeBlogs: {
        type: Boolean,
        default: true
    },
    showSavedBlogs: {
        type: Boolean,
        default: true
    },
    imageId: {
        type: String,
    },
    resetpasswordToken: {
        type: String
    },
    resetpasswordexpire: {
        type: Date
    }


},
)
const User = mongoose.model("User", UserSChema);
module.exports = User
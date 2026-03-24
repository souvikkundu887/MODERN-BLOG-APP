const User = require("../models/UserSchema");
const bcrypt = require("bcrypt")
const { generateJWT, decodeJWT, verifyJWT } = require("../utills/generateToken");
const transporter = require("../utills/transporter");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 5 })
const { getAuth } = require("firebase-admin/auth")
var admin = require("firebase-admin");
const { uploadImage, deleteImage } = require("../utills/uploadImage");
const Comment = require("../models/commentSchema");
const Blogs = require("../models/BlogSchema");
const crypto = require("crypto");
const { FRONTEND_URL } = require("../config/dotenv.config");
const { FIREBASE_TYPE, FIREBASE_PROJECTID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID, FIREBASE_AUTH_URL, FIREBASE_TOKEN_URL, FIREBASE_AUTH_PROVIDER_x509_CERT_URL, FIREBASE_CLIENT_x509_CERT_URL, FIREBASE_UNIVERSE_DOMAIN } = require("../config/dotenv.config");




admin.initializeApp({
    credential: admin.credential.cert({
        "type": FIREBASE_TYPE,
        "project_id": FIREBASE_PROJECTID,
        "private_key_id": FIREBASE_PRIVATE_KEY_ID,
        "private_key": FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        "client_email": FIREBASE_CLIENT_EMAIL,
        "client_id": FIREBASE_CLIENT_ID,
        "auth_uri": FIREBASE_AUTH_URL,
        "token_uri": FIREBASE_TOKEN_URL,
        "auth_provider_x509_cert_url": FIREBASE_AUTH_PROVIDER_x509_CERT_URL,
        "client_x509_cert_url": FIREBASE_CLIENT_x509_CERT_URL,
        "universe_domain": FIREBASE_UNIVERSE_DOMAIN
    }
    )
});

async function deleteReplies(commentId) {
    let comment = await Comment.findById(commentId);

    for (let reply of comment.replies) {
        await deleteReplies(reply._id)
    }
    if (comment.parentComment) {
        await Comment.findByIdAndUpdate(comment.parentComment, { $pull: { replies: commentId } })
    }
    await Comment.findByIdAndDelete(commentId)
}

async function sendVerfificationEmail(mail,verificationToken) {
    await transporter.sendMail({
        from: "Blogapp",
        to: mail,
        subject: "Email verification",
        text: "this from modern-Blog-app",
        html: `<h1 >Please click on the link to<a href="${FRONTEND_URL}/verify-email/${verificationToken}"> verify </a>your email</h1>`
    })
}

//finding all comments of the user and delete that and its replies








async function UserCreate(req, res) {
    try {
        const { name, email, password } = req.body
        if (!name || !password || !email) {
            res.status(400).send("All fields are required");
            return;
        }
        //check password length and mix combinations of letter,numeric,and special character
        const checkexistinguser = await User.findOne({ email })

        if (checkexistinguser) {
            if (checkexistinguser.googleAuth) {
                return res.status(400).json({
                    success: false,
                    message: "user already registered with google."
                })
            }


            if (checkexistinguser.verified) {
                return res.status(400).json({
                    success: false,
                    message: "users already exists with this email."
                })
            }
            else {
                // sendVerfificationEmail
                let verificationToken = generateJWT({
                    email: checkexistinguser.email,
                    id: checkexistinguser._id
                })

                await sendVerfificationEmail(checkexistinguser.email,verificationToken)

            }
        }

        const hashpassword = await bcrypt.hash(password, 10)
        const username = email.toLowerCase().split("@")[0] + randomUUID();



        let newuser = await User.create({
            name,
            email,
            password: hashpassword,
            username
        })

        let verificationToken = generateJWT({
            email: email,
            id: newuser._id
        })


        await sendVerfificationEmail(email,verificationToken)


        res.status(201).json({
            success: true,
            message: "please check your Email to verify"

        });

    } catch (err) {
        console.log(err)
        res.status(500).json({ success: false, message: "Internal Server Error", error: err });
    }
}

async function getUsers(req, res) {
    try {
        const { token } = req.body;
        const newUser = await User.find({}, { password: 0 })
        const decode = decodeJWT(token)
        return res.status(200).json({
            success: true,
            message: "users get successfully",
            user: decode
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error" + error });
    }
}
async function getUserById(req, res) {
    try {

        const username = req.params.username;
        const user = await User.findOne({ username }).populate("blog  likeBlogs saveBlogs").populate({
            path: "following",
            select: "name username"
        }).select("-password -verified");

        if (!user) {
            return res.status(404).json({ success: false, message: "user was not found" })
        }
        res.status(200).json({
            success: true,
            message: "user was found",
            user
        })
    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", err });

    }
}
async function UpdateUser(req, res) {
    try {
        const { name, username, bio } = req.body
        const { id } = req.params;
        const img = req.file
        const user = await User.findById(id);
        const imageId = user.imageId

        if (user.username !== username) {
            //is username already exist with the help of db
            const finduser = await User.findOne({ username })
            if (finduser) {
                return res.status(400).json({
                    status: false,
                    message: "user name is already taken"
                })
            }
            user.username = username
        }
        user.name = name;
        user.bio = bio;

        if (!req.body.profilePic) {
            if (imageId)
                await deleteImage(imageId)
            user.profilePic = null;
            user.imageId = null;
        }

        if (img) {
            if (imageId)
                await deleteImage(imageId)
            const { url, public_id } = await uploadImage(`data:image/jpeg;base64,${img.buffer.toString("base64")}`)
            user.profilePic = url;
            user.imageId = public_id
        }



        await user.save()
        return res.status(200).json({
            success: "true",
            message: "users data updated succesfully",
            user: {
                name: user.name,
                username: user.username,
                bio: user.bio,
                profilePic: user.profilePic
            }

        })
    }
    catch (err) {
        return res.status(500).json({ message: "internal server error", err })
    }
}

async function deleteuser(req, res) {
    try {
        const { id } = req.params
        let userComments = await Comment.find({ user: id })
        for (let comment of userComments) {
            await deleteReplies(comment._id)
        }

        //delete all the blogs and its comments 

        let userBlogs = await Blogs.find({ creator: id })
        for (let blog of userBlogs) {
            for (let commentId of blog.comments) {
                await deleteReplies(commentId)
            }
            //delete all the images of the blog from the cloud storage
            await deleteImage(blog.imageid)

            //remove savedblogs from the the users
            for (let userId of blog.totalSaves) {
                await User.findByIdAndUpdate(userId, { $pull: { totalSaves: blog._id } })
            }

            for (let userId of blog.likes) {
                await User.findByIdAndUpdate(userId, { $pull: { likeBlogs: blog._id } })
            }

            //delete all the content images
            for (let block of blog.content.blocks) {
                if (block.type == "image")
                    await deleteImage(block.id)
            }

            await Blogs.findByIdAndDelete(blog._id)
        }

        //handle followers and following of the user
        let followers = await User.find({ followers: id })

        for (let user of followers) {
            await User.findByIdAndUpdate(user._id, { $pull: { followers: id } })
        }
        //now delete the user 
        let following = await User.find({ following: id })
        for (let user of following) {
            await User.findByIdAndUpdate(user._id, { $pull: { following: id } })
        }

        const user = await User.findByIdAndDelete(id);


        return res.status(200).json({
            success: true,
            message: "user was removed",
            user
        })
    } catch (err) {
        return res.status(200).json({
            status: "error",
            message: "internal server error"
        })
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body
        const checkexistinguser = await User.findOne({ email })
        if (!checkexistinguser) {
            return res.status(400).json({
                success: false,
                message: "email"
            })
        }
        if (checkexistinguser.googleAuth) {
            return res.status(400).json({
                success: false,
                message: "users already registered with ggogle."
            })
        }
        if (!checkexistinguser.verified) {
            //send verification email
            let VerificationToken = generateJWT({
                email: checkexistinguser.email,
                id: checkexistinguser._id
            })

            await sendVerfificationEmail(checkexistinguser.email,VerificationToken)

            return res.status(400).json({
                success: false,
                message: "please verify your email before login"
            })
        }


        let matchpassword = await bcrypt.compare(password, checkexistinguser.password)



        if (!matchpassword) {
            return res.status(400).json({
                success: false,
                message: "password"
            })
        }
        let token = generateJWT({
            email: checkexistinguser.email,
            id: checkexistinguser._id
        })

        res.status(201).json({
            success: true, message: "user loggedin successfully", user: {
                id: checkexistinguser._id,
                name: checkexistinguser.name,
                email: checkexistinguser.email,
                username: checkexistinguser.username,
                profilePic: checkexistinguser.profilePic,
                bio: checkexistinguser.bio,
                following: checkexistinguser.following,
                showLikeBlogs: checkexistinguser.showLikeBlogs,
                showSavedBlogs: checkexistinguser.showSavedBlogs,
                followers: checkexistinguser.followers,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: "email is already registered" });
    }
}

async function verifyEmail(req, res) {
    try {
        const { verificationToken } = req.params;
        const verifyToken = await verifyJWT(verificationToken)


        if (!verifyToken) {
            return res.status(400).json({
                succes: false,
                message: "invalid token"
            })
        }

        const id = verifyToken.payload.id;

        const user = await User.findByIdAndUpdate(id, { verified: true }, { new: true })
        return res.status(200).json({
            success: true,
            message: "user verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                bio: user.bio,
                token: verificationToken
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
}

async function GoogleAuth(req, res) {
    try {
        const { accessToken } = req.body;
        const response = await getAuth().verifyIdToken(accessToken)
        const { name, email } = response
        let user = await User.findOne({ email })

        if (user) {//already registered
            if (user.googleAuth) {
                let token = await generateJWT({
                    email: user.email,
                    id: user._id
                })

                return res.status(201).json({
                    success: true, message: "user loggedin successfully", user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        profilePic: user.profilePic,
                        bio: user.bio,
                        following: user.following,
                        token,
                    }
                });
            } else {
                return res.status(400).json({
                    success: false, message: "this email already registered without google please try throgh login form", user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    }
                });
            }

        }
        const username = email.toLowerCase().split("@")[0] + randomUUID();

        const newUser = await User.create({
            name,
            email,
            googleAuth: true,
            verified: true,
            username
        })
        let token = await generateJWT({
            email: newUser.email,
            id: newUser._id
        })

        res.status(201).json({
            success: true, message: "user loggedin successfully", user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                profilePic: newUser.profilePic,
                bio: newUser.bio,
                followers: newUser.followers,
                token,
            }
        });
    } catch (e) {
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }
}

async function followUser(req, res) {
    try {
        const followerId = req.user.id;
        const { creator } = req.params

        const user = await User.findById(creator)
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "user does not exist"
            })
        }

        if (!user.followers.includes(followerId)) {
            await User.findByIdAndUpdate(creator, { $push: { followers: followerId } })
            await User.findByIdAndUpdate(followerId, { $push: { following: creator } })
            return res.status(200).json({
                status: "success",
                message: "you followed successfully",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    profilePic: user.profilePic,
                    bio: user.bio,
                    following: user.following,
                    showLikeBlogs: user.showLikeBlogs,
                    showSavedBlogs: user.showSavedBlogs,
                    followers: user.followers
                }
            })
        }
        else {
            await User.findByIdAndUpdate(creator, { $pull: { followers: followerId } })
            await User.findByIdAndUpdate(followerId, { $pull: { following: creator } })
            return res.status(200).json({
                status: "success",
                message: "blog unfollowed successfully"
            })
        }
    } catch (e) {

        res.status(500).json({
            status: "error",
            message: "internal server error"
        })
    }

}

async function userSetting(req, res) {
    try {
        const { showLikeBlogs, showSavedBlogs } = req.body.setting

        const creator = req.user.id

        const user = await User.findById(creator);

        user.showLikeBlogs = showLikeBlogs;
        user.showSavedBlogs = showSavedBlogs

        user.save();

        return res.status(200).json({
            status: "success",
            message: "setting updated succesfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                bio: user.bio,
                following: user.following,
                showLikeBlogs: user.showLikeBlogs,
                showSavedBlogs: user.showSavedBlogs,
                followers: user.followers
            }
        })

    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }

}

async function forgotpassword(req, res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "user not found"
            })
        }

        const resetToken = crypto.randomBytes(32).toString("hex")

        const hashToken = crypto.createHash("sha256").update(resetToken).digest("hex")

        user.resetpasswordToken = hashToken
        user.resetpasswordexpire = Date.now() + 10 * 60 * 1000;

        await user.save()

        const resetURl = `${FRONTEND_URL}/resetpassword/${resetToken}`

        const message = `Reset your password here:${resetURl}`

        await transporter.sendMail({
            from: "Blogapp",
            to: user.email,
            subject: "Reset  password",
            text: "Reset  your password",
            html: `<div style="font-family: Arial, sans-serif; padding:20px;">
            <h2 style="color:#333;">Password Reset Request</h2>
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetURl}" 
               style="
                 display:inline-block;
                 padding:12px 20px;
                 background-color:#4CAF50;
                 color:white;
                 text-decoration:none;
                 border-radius:5px;
                 font-weight:bold;
               ">
               Reset Password
            </a>

            <p style="margin-top:20px; font-size:14px; color:gray;">
                This link will expire in 10 minutes.
            </p>
        </div>`
        })

        return res.status(200).json({
            status: true,
            message: "reser link sent"
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
}

async function resetpassword(req, res) {
    try {
        const { token } = req.params
        const { password } = req.body

        const hashToken = crypto.createHash("sha256").update(token).digest("hex")

        const user = await User.findOne({
            resetpasswordToken: hashToken,
            resetpasswordexpire: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "link is expired"
            })
        }

        const hashpassword = await bcrypt.hash(password, 10)

        user.password = hashpassword;
        //after changing at once the password we will not chage the password through the link
        user.resetpasswordToken = undefined;
        user.resetpasswordexpire = undefined;
        await user.save()
        return res.status(200).json({
            status: true,
            message: "password has been changed succesfully"
        })
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Internal server error"
        })
    }
}






module.exports = { UserCreate, getUsers, getUserById, UpdateUser, deleteuser, loginUser, verifyEmail, GoogleAuth, followUser, userSetting, forgotpassword, resetpassword };
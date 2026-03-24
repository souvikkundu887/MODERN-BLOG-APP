import { useEffect, useState } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import axios from "axios"
import { LikeCompo } from "./components/Homepage"
import CommentCompo from "./components/Comment"
import { Save } from "./components/Blogpage"
import { useSelector } from "react-redux"
import toast from "react-hot-toast"


function ProfilePage() {
    const { token, id, profilePic, name,
    } = useSelector((state) => state.user)
    const { username } = useParams();
    const [following, setfollwing] = useState(false)
    const location = useLocation();
    const [userData, setuserData] = useState(null)
    async function getProfileData() {
        try {
            let res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/users/${username}`
            )
            setuserData(res.data.user)
        } catch (err) {
            toast.error("There is an error")
        }
    }

    async function handleFollow(creatorId) {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/follow/${creatorId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setfollwing(!following)
            // dispatch(setfollowers({ userid, creatorId }))

        } catch (err) {
            toast.error("There is an error")
        }
    }
    function renderComponent() {
        if (location.pathname == `/${userData.username}`)
            return <DisplayBlogs blogs={userData.blog} token={token} id={id} />
        else if (location.pathname == `/${userData.username}/saved-blogs`) {
            return <DisplayBlogs blogs={userData.saveBlogs} token={token} id={id} />
        } else if (location.pathname == `/${userData.username}/Liked-blogs`) {
            return <DisplayBlogs blogs={userData.likeBlogs} token={token} id={id} />
        } else {
            return <DisplayBlogs blogs={userData.blog.filter((blog) => blog.draft)} token={token} id={id} />
        }
    }
    useEffect(() => {
        getProfileData()
    }, [username, following])

    if (!userData) return <div className="text-center mt-10">Loading...</div>

    return (
        <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4">

            {/* LEFT SECTION - BLOGS */}
            <div className="w-full lg:w-2/3 mt-8">

                {/* Username Header */}
                <div className="flex justify-between items-center">
                    <p className="font-bold text-2xl">{userData.username}</p>
                    <i className="fi fi-rs-menu-dots cursor-pointer"></i>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mt-4 border-b pb-2 text-gray-600">
                    <Link className={`${location.pathname == `/${userData.username}` ? "text-black font-bold border-b-2" : "text-gray" + "hover:cursor-pointer"}`} to={`/${username}`}>
                        Home
                    </Link>
                    {(userData.showSavedBlogs || userData._id == id) && <Link className={`${location.pathname == `/${userData.username}/saved-blogs` ? "text-black font-bold border-b-2" : "text-gray" + "hover:cursor-pointer"}`} to={`/${username}/saved-blogs`}>
                        saved Blogs
                    </Link>}
                    {(userData.showLikeBlogs || userData._id == id) && <Link className={`${location.pathname == `/${userData.username}/Liked-blogs` ? "text-black font-bold border-b-2" : "text-gray" + "hover:cursor-pointer"}`} to={`/${username}/Liked-blogs`}>
                        Liked Blogs
                    </Link>}
                    {id == userData._id ? <Link className={`${location.pathname == `/${userData.username}/draft-blogs` ? "text-black font-bold border-b-2" : "text-gray" + "hover:cursor-pointer"}`} to={`/${username}/draft-blogs`}>
                        Draft Blogs
                    </Link> : <nav></nav>}
                </div>

                {/* BLOG LIST */}
                {
                    renderComponent()
                }
            </div>

            {/* RIGHT SECTION - PROFILE INFO */}
            <div className="w-full lg:w-1/3 mt-10 lg:mt-8 lg:pl-8 border-t lg:border-t-0 lg:border-l">

                <div className="p-4">

                    {/* Avatar */}
                    <div className="w-24 h-24">
                        {profilePic ? <img
                            src={profilePic}
                            alt="avatar"
                            className="rounded-full w-full h-full"
                        /> : <img
                            src={`https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`}
                            alt="avatar"
                            className="rounded-full w-full h-full"
                        />}
                    </div>

                    {/* User Info */}
                    <div className="font-bold flex flex-col gap-3 mt-4">
                        <p className="text-xl">{userData.name}</p>
                        <p className="text-gray-500">
                            {userData.followers.length} followers
                        </p>
                        <p className="text-gray-500">{userData?.bio}</p>

                        {/* Follow Button */}
                        {id === userData._id ? (
                            <Link
                                to="/editprofile"
                                className="bg-black text-white p-2 rounded-xl text-center"
                            >
                                Edit Profile
                            </Link>
                        ) : userData.followers?.includes(id) ? (
                            <button className="border rounded-xl py-2" onClick={() => {
                                handleFollow(userData._id)
                            }}>
                                Following
                            </button>
                        ) : (
                            <button className="bg-black text-white py-2 rounded-xl" onClick={() => {
                                handleFollow(userData._id)
                            }}>
                                Follow
                            </button>
                        )}
                    </div>

                    {/* Following List */}
                    <div className="mt-8">
                        <h2 className="font-semibold mb-4">Following</h2>

                        {userData.following.map((data) => (
                            <Link key={data._id} to={`/${data.username}`}>
                                <div className="flex justify-between items-center mb-4">

                                    <div className="flex gap-3 items-center">
                                        <img
                                            src={`https://api.dicebear.com/9.x/initials/svg?seed=${data.name}`}
                                            alt="avatar"
                                            className="w-8 rounded-full"
                                        />
                                        <p className="font-semibold">
                                            {data.username}
                                        </p>
                                    </div>

                                    <i className="fi fi-rs-menu-dots cursor-pointer"></i>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProfilePage


export function DisplayBlogs({ blogs, token, id }) {
    return (
        <>
            {<div className="mt-6">
                {blogs.length > 0 ? blogs.map((data) => (
                    <Link key={data._id} to={`/blog/${data.blogId}`}>
                        <div className="my-6 flex flex-col sm:flex-row gap-4  p-4 rounded-xl shadow-md hover:shadow-xl transition">

                            {/* TEXT */}
                            <div className="w-full sm:w-2/3 flex flex-col gap-3">
                                <p className="font-semibold text-gray-500">
                                    {data?.creator?.name}
                                </p>

                                <h2 className="font-bold text-xl line-clamp-2">
                                    {data.title}
                                </h2>

                                <p className="text-gray-600 line-clamp-2">
                                    {data.Desc}
                                </p>

                                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500">
                                    <p>
                                        {new Date(data.createdAt).toDateString()}
                                    </p>

                                    <LikeCompo
                                        len={{
                                            blogid: data.blogId,
                                            likes: data.likes,
                                            token,
                                            id
                                        }}
                                    />

                                    <CommentCompo len={data.comments?.length} />

                                    <Save
                                        _id={data._id}
                                        token={token}
                                        totalSaves={data.totalSaves}
                                        user={id}
                                    />
                                </div>
                            </div>

                            {/* IMAGE */}
                            <div className="w-full sm:w-1/3">
                                <img
                                    src={data.image}
                                    className="w-full h-40 object-cover rounded-lg"
                                    alt="blog"
                                />
                            </div>
                        </div>
                    </Link>
                )) : <h1 className="font-bold text-center text-2xl">No data found</h1>}
            </div>}

        </>
    )
}


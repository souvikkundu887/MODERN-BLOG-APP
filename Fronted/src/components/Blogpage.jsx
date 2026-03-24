import { useParams, Link } from "react-router-dom"
import axios from "axios"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

import { addBlog, removeBlog, setSave } from "../../utils/blogSlice"
import { setfollowers } from "../../utils/userSlice"
import { LikeCompo } from "./Homepage"
import CommentCompo, { Comment } from "./Comment"
import toast from "react-hot-toast"

function Blogpage() {
    const { id } = useParams()
    const [response, setresponse] = useState(null)
    const [following, setfollwing] = useState(false)

    const dispatch = useDispatch()
    const { token, id: userid } = useSelector((state) => state.user)
    const { comments, content, totalSaves, creator } = useSelector(state => state.blog)
    const { isOpen } = useSelector((state) => state.comment)

    async function fetchBlog() {
        try {
            let res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`
            )

            setresponse(res.data.blog)
            dispatch(addBlog(res.data.blog))

        } catch (err) {
            toast.error("something went wrong")
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

            // dispatch(setfollowers({ userid, creatorId }))

        } catch (err) {

        }
    }

    useEffect(() => {
        fetchBlog()
        return () => dispatch(removeBlog())
    }, [id, following])

    if (!response) return <h1 className="text-center mt-10">Loading...</h1>
   
    
    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">


            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">

                <div className="flex items-center gap-4">
                    <img
                        src={`https://api.dicebear.com/9.x/initials/svg?seed=${response.creator.name}`}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                    />

                    <div>
                        <Link to={`/${response.creator.username}`}>
                            <h2 className="font-bold hover:underline">
                                {response.creator.name}
                            </h2>
                        </Link>

                        <p
                            className="text-sm text-green-600 cursor-pointer hover:underline"
                            onClick={() => {
                                setfollwing(!following)
                                handleFollow(response.creator._id)
                            }}
                        >
                            {creator.followers?.includes(userid)
                                ? "Following"
                                : "Follow"}
                        </p>
                    </div>
                </div>


                <div className="flex gap-6 text-sm font-semibold">
                    <div className="text-center">
                        <p>Followers</p>
                        <p>{creator.followers?.length}</p>
                    </div>
                    <div className="text-center">
                        <p>Following</p>
                        <p>{creator.following?.length}</p>
                    </div>
                </div>
            </div>


            <h1 className="text-2xl sm:text-3xl font-extrabold mt-6 mb-6">
                {response.title}
            </h1>


            {response.image && (
                <img
                    src={response.image}
                    alt="blog"
                    className="w-full h-64 sm:h-96 object-cover rounded-xl mb-6"
                />
            )}


            <div className="space-y-4 text-gray-800 leading-relaxed">
                {content?.blocks?.map((block, index) => {

                    if (block.type === "header") {
                        if (block.data.level === 2)
                            return (
                                <h2
                                    key={index}
                                    className="text-2xl font-bold"
                                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                                />
                            )

                        if (block.data.level === 3)
                            return (
                                <h3
                                    key={index}
                                    className="text-xl font-semibold"
                                    dangerouslySetInnerHTML={{ __html: block.data.text }}
                                />
                            )
                    }

                    if (block.type === "paragraph")
                        return (
                            <p
                                key={index}
                                dangerouslySetInnerHTML={{ __html: block.data.text }}
                            />
                        )

                    if (block.type === "image")
                        return (
                            <div key={index} className="w-full">
                                <img
                                    src={block.data.file.url}
                                    className="w-full rounded-lg"
                                    alt=""
                                />
                                <p className="text-center text-sm text-gray-500">
                                    {block.data.caption}
                                </p>
                            </div>
                        )

                    if (block.type === "List")
                        return (
                            <ul key={index} className="list-decimal ml-6 space-y-1">
                                {block.data.items.map((item, i) => (
                                    <li key={i}>{item.content}</li>
                                ))}
                            </ul>
                        )

                    return null
                })}
            </div>


            <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-6">

                <div className="flex gap-6 items-center">
                    <LikeCompo
                        len={{
                            blogid: response.blogId,
                            token,
                            id: userid,
                            likes: response.likes
                        }}
                    />

                    <CommentCompo len={comments.length} />

                    <Save
                        _id={response._id}
                        token={token}
                        user={userid}
                        totalSaves={totalSaves}
                    />
                </div>

                {creator._id ==userid && <Link to={`/editblog/${response.blogId}`}>
                    <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900">
                        Edit
                    </button>
                </Link>}
            </div>

            {isOpen && <Comment />}
        </div>
    )
}




export function Save({ _id, token, user, totalSaves }) {
    const dispatch = useDispatch()

    async function handleSave() {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/blogs/save/${_id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            dispatch(setSave(user))
            alert(res.data.message)

        } catch (e) {

        }
    }

    return (
        <div
            className="cursor-pointer"
            onClick={(e) => {
                e.preventDefault()
                handleSave()
            }}
        >
            {totalSaves?.includes(user) ? (
                <i className="fi fi-sr-bookmark text-blue-600"></i>
            ) : (
                <i className="fi fi-rr-bookmark"></i>
            )}
        </div>
    )
}

export default Blogpage

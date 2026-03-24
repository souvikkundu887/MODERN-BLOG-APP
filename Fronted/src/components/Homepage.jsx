import axios from "axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { addLike } from "../../utils/changeLikes"
import CommentCompo from "./Comment"
import { Save } from "./Blogpage"
import toast from "react-hot-toast"
function Homepage() {
    const [blogs, setblogs] = useState([])
    const { token, id } = useSelector((state) => state.user)
    const [page, setpage] = useState(1)
    const [hasMore, sethasMore] = useState(null)

    async function fetchblogs() {
        try {
            let res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/blogs`,
                { params: { page, limit: 2 } }
            )

            setblogs(prev => {
                const existingIds = new Set(prev.map(b => b._id))
                const newBlogs = res.data.blog.filter(
                    b => !existingIds.has(b._id)
                )
                return [...prev, ...newBlogs]
            })

            sethasMore(res.data.hasMore)
        } catch (err) {
          toast.error("something went wrong")
        }
    }

    useEffect(() => {
        fetchblogs()
    }, [page])

    return (
        <div className="flex flex-col lg:flex-row mx-auto max-w-7xl">

         
            <div className="w-full lg:w-2/3 p-4">

                {blogs.length > 0 && blogs.map((data) => (
                    <Link key={data._id} to={`blog/${data.blogId}`}>
                        <div className="my-5 flex flex-col sm:flex-row gap-4  p-4 rounded-xl shadow-sm hover:shadow-md transition">

                            {/* TEXT */}
                            <div className="w-full sm:w-2/3 flex flex-col gap-3">
                                <p className="font-semibold text-gray-500">
                                    {data?.creator?.name}
                                </p>

                                <h2 className="line-clamp-2 font-bold text-xl">
                                    {data.title}
                                </h2>

                                <h3 className="text-gray-600 line-clamp-2">
                                    {data.Desc}
                                </h3>

                                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500">
                                    <p>{new Date(data.createdAt).toDateString()}</p>

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
                                    className="w-full h-48 sm:h-40 object-cover rounded-lg"
                                    alt="blog"
                                />
                            </div>
                        </div>
                    </Link>
                ))}

                {hasMore && (
                    <button
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
                        onClick={() => setpage(prev => prev + 1)}
                    >
                        Load more
                    </button>
                )}
            </div>

            {/* RIGHT SIDEBAR (VISIBLE ON ALL DEVICES) */}
            <div className="w-full max-lg:hidden min-h-screen lg:w-1/3 p-6 border-t lg:border-t-0 lg:border-l bg-gray-50">
                <h1 className="font-bold text-lg">Recommended topics</h1>

                <div className="flex flex-wrap gap-3 mt-4">
                    {["React", "Web dev", "Javascript", "Dsa", "SpringBoot", "AI", "ML", "Tech"]
                        .map((data, index) => (
                            <Link
                                key={index}
                                to={`tag/${data.trim().toLowerCase()}`}
                            >
                                <div className="px-4 py-2 rounded-2xl bg-gray-200 hover:bg-blue-400 hover:text-white transition cursor-pointer">
                                    {data}
                                </div>
                            </Link>
                        ))}
                </div>
            </div>

        </div>
    )
}




export function LikeCompo({ len }) {
    const { blogid, likes, token, id } = len
    const [isLike, setLike] = useState(likes.includes(id))
    const [Likes, seLikes] = useState(likes.length)
    const dispatch = useDispatch()

    async function handleLike(e) {
        e.preventDefault()

        try {
            if (!token) return alert("Please sign in first!")

            let res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogid}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            dispatch(addLike(id))
            setLike(res.data.blog.likes.includes(id))
            seLikes(res.data.blog.likes.length)

        } catch (err) {
           toast.error("something went wrong")
        }
    }

    return (
        <p
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={handleLike}
        >
            {Likes}
            {isLike ? (
                <i className="fi fi-sr-heart text-red-500"></i>
            ) : (
                <i className="fi fi-rr-heart"></i>
            )}
        </p>
    )
}

export default Homepage
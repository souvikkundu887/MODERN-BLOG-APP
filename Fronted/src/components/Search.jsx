import { useParams, useSearchParams } from "react-router-dom"
import { useEffect, useState } from "react";
import axios from "axios"
import CommentCompo from "./Comment"
import { Save } from "./Blogpage"
import { Link } from "react-router-dom"
import { LikeCompo } from "./Homepage";
import { useSelector } from "react-redux";
import { DisplayBlogs } from "../ProfilePage";
import toast from "react-hot-toast";
function SearchPage() {
    const { token, id } = useSelector((state) => (state.user));
    const { tag } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [page, setpage] = useState(1)
    const [hasMore, sethasMore] = useState(null)
    const searchQuery = searchParams.get("q")
    const [blogs, setblogs] = useState([])

    const query = tag ? tag : searchQuery
    async function SearchContent() {
        try {
            let res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/search-blogs`, {
                params: { page, limit: 1, search: query }
            })
            setblogs((prev) => ([...prev, ...res.data.blogs]))
            sethasMore(res.data.hasMore)
        } catch (e) {
            toast.error("something went wrong")
        }
    }
   
    useEffect(() => {
        if (query)
            SearchContent();

    }, [page])

    return <>

        <div className="">

            <div className=" mx-auto w-[60%]">
                <h1 className="text-3xl text-gray-400 mt-5 ">Results for <span className="font-bold text-gray-800">{searchQuery || tag}</span></h1>
                <DisplayBlogs blogs={blogs} token={token} id={id} />
                {hasMore && <button className="bg-green-500 px-4 py-2 rounded-xl" onClick={() => { setpage((prev) => (prev + 1)) }}>Load more</button>}

            </div>
        </div>
    </>
}

export default SearchPage
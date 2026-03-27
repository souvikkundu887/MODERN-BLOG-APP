import { data, Navigate, useParams } from "react-router-dom";
// import {Authform} from "./signin";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addBlog, removeBlog } from "../../utils/blogSlice";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header'
import EditorjsList from '@editorjs/list';
import Marker from '@editorjs/marker';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import toast from "react-hot-toast"
function Addblog() {
    const { id } = useParams()
    // console.log(id)
    const { token } = useSelector((state) => state.user)
    const formData = new FormData()
    const { title, Desc, image, content, tags, draft } = useSelector((state) => state.blog)
    const editorjsRef = useRef(null)
    const dispatch = useDispatch()
    // console.log( title, Desc, image, content, tags, draft)

    const [blogData, setBlogData] = useState({
        title: "",
        Desc: "",
        image: null,
        content: "",
        tags: ["React", "Web dev", "Javascript", "Dsa", "SpringBoot"],
        draft: true
    })


    function fetchBlog() {
        const updatedData = { title, Desc, image, content, tags, draft };

        setBlogData(updatedData);
        dispatch(addBlog(updatedData));
    }
    // dispatch(addBlog(blogData))



    useEffect(() => {
        if (id) {
            fetchBlog()
        }else{
            dispatch(addBlog(blogData))
        }
    }, [id])
    // console.log(draft)
    async function handlepostblog() {
        try {
            formData.append('title', blogData.title)
            formData.append('Desc', blogData.Desc)
            formData.append('image', blogData.image)
            formData.append('content', JSON.stringify(blogData.content))
            formData.append('tags', JSON.stringify(blogData.tags))
            formData.append('draft', blogData.draft)

            blogData.content.blocks.forEach((block) => {
                if (block.type === 'image')
                    formData.append("images", block.data.file.image)
            })

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            toast.success("blog has been created succesfully")

        } catch (err) {
            toast.error("something went wrong")
        }

    }

    async function handleUpdateblog() {
        try {
            let existingImages = []
            const formData = new FormData();
            formData.append('title', blogData.title)
            formData.append('Desc', blogData.Desc)
            formData.append('image', blogData.image)
            formData.append('content', JSON.stringify(blogData.content))
            formData.append('tags', JSON.stringify(blogData.tags))
            formData.append('draft', blogData.draft)
            blogData.content.blocks.forEach((block) => {
                if (block.type === 'image') {
                    if (block.data.file.image)
                        formData.append("images", block.data.file.image)
                    else {
                        existingImages.push(
                            {
                                url: block.data.file.url,
                                imageId: block.data.file.public_id
                            }
                        )
                    }
                }
            })
            formData.append('existingImages', JSON.stringify(existingImages));
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            )

        } catch (err) {
            if (!err.response.data.success) {
                alert(err.response.data.message)
            }
        }

    }
    function initiateEditor() {
        editorjsRef.current = new EditorJS({
            holder: 'editor',
            placeholder: 'write something....',
            data: content,

            tools: {
                header: {
                    class: Header,
                    shortcut: 'CMD+SHIFT+H',
                    inlineToolbar: true,
                    config: {
                        placeholder: 'Enter a header',
                        levels: [2, 3, 4],

                    }
                },
                List: {
                    class: EditorjsList,
                    inlineToolbar: true,
                    config: {
                        defaultStyle: 'unordered'
                    }
                },
                Marker: {
                    class: Marker,
                    inlineToolbar: true,
                    shortcut: 'CMD+SHIFT+M'
                },
                embed: {
                    class: Embed,
                    inlineToolbar: true,
                    config: {
                        services: {
                            youtube: true,
                            coub: true,
                            codepen: {
                                regex: /https?:\/\/codepen.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
                                embedUrl: 'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
                                html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
                                height: 300,
                                width: 600,
                                id: (groups) => groups.join('/embed/')
                            }
                        }
                    }
                },
                image: {
                    class: ImageTool,
                    inlineToolbar: true,
                    config: {
                        uploader: {
                            uploadByFile: async (image) => {
                                return {
                                    success: 1,
                                    file: {
                                        url: URL.createObjectURL(image),
                                        image
                                    }
                                }
                            }
                        }
                    }

                },
            },
            onChange: async () => {
                let data = await editorjsRef.current.save();
                setBlogData((blogData) => ({ ...blogData, content: data }))

            }
        })
    }

    function deleteTag(index) {
        const updatedTags = blogData.tags.filter((tags, i) => i != index)
        setBlogData({ ...blogData, tags: updatedTags })
    }

    function handlekeydown(e) {
        if (e.code == "Enter") {
            const val = e.target.value.trim().toLowerCase();
            if (!val || blogData.tags.includes(val) || blogData.tags.length == 10) return
            setBlogData((prev) => ({ ...prev, tags: [...prev.tags, val] }))
            e.target.value = ""
        }

    }
    useEffect(() => {
        if (editorjsRef.current == null)
            initiateEditor()
    }, [])


    return token == null ? (
        <Navigate to={"/signin"} />
    ) : (
        <div className="min-h-screen max-sm:mt-16 bg-gray-100 py-10 text-wrap">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8">

                <h1 className="text-3xl font-bold mb-8 text-gray-800">
                    {id ? "Update Blog" : "Create New Blog"}
                </h1>


                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold text-gray-600">
                        Blog Title
                    </label>
                    <input
                        type="text"
                        placeholder="Enter blog title"
                        className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
                        onChange={(e) =>
                            setBlogData((blogData) => ({
                                ...blogData,
                                title: e.target.value,
                            }))
                        }
                        value={blogData.title}
                    />
                </div>


                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold text-gray-600">
                        Short Description
                    </label>
                    <textarea
                        placeholder="Write a short description..."
                        className="w-full p-3 rounded-xl border border-gray-300 h-24 resize-none focus:ring-2 focus:ring-black focus:outline-none"
                        onChange={(e) =>
                            setBlogData((blogData) => ({
                                ...blogData,
                                Desc: e.target.value,
                            }))
                        }
                        value={blogData.Desc}
                    />
                </div>


                <div className="mb-6">
                    <label className="block mb-2 text-sm font-semibold text-gray-600">
                        Tags
                    </label>
                    <input
                        placeholder="e.g. React, JavaScript, WebDev"
                        className="w-full p-3 rounded-xl border border-gray-300 h-16 resize-none focus:ring-2 focus:ring-black focus:outline-none"
                        onKeyDown={(e) => { handlekeydown(e) }}
                    />
                    <div className="flex justify-between max-sm:flex-col">
                        <p className="text-red-400">*click on spacebar or Enter to add a tag</p>
                        <p className="text-red-400">{10 - blogData.tags?.length} tags remaining</p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-4">{
                        blogData.tags?.map((tag, index) => (
                            <div className="flex  gap-4  justify-center p-2 items-center  rounded-2xl bg-gray-400 hover:bg-blue-400 hover:cursor-pointer">
                                <p>{tag}</p>
                                <i className="fi fi-rr-cross-circle mt-1.5" onClick={() => { deleteTag(index) }}></i>
                            </div>
                        ))
                    }
                    </div>
                </div>


                <div className="mb-8">
                    <label className="block mb-3 text-sm font-semibold text-gray-600">
                        Blog Content
                    </label>
                    <div
                        id="editor"
                        className="bg-gray-50 border border-gray-300 rounded-xl p-5 min-h-[300px]"
                    ></div>
                </div>


                <div className="mb-8">
                    <label className="block mb-3 text-sm font-semibold text-gray-600">
                        Cover Image
                    </label>

                    <label
                        htmlFor="image"
                        className="cursor-pointer block rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-black transition"
                    >
                        {blogData?.image ? (
                            <img
                                src={
                                    typeof blogData.image === "string"
                                        ? blogData.image
                                        : URL.createObjectURL(blogData.image)
                                }
                                alt="cover"
                                className="w-full h-[300px] object-cover"
                            />
                        ) : (
                            <div className="h-[300px] flex flex-col justify-center items-center text-gray-400">
                                <span className="text-lg font-medium">Click to upload image</span>
                                <span className="text-sm">JPEG, PNG, JPG</span>
                            </div>
                        )}
                    </label>

                    <input
                        id="image"
                        type="file"
                        accept=".jpeg,.png,.jpg"
                        className="hidden"
                        onChange={(e) =>
                            setBlogData((blogData) => ({
                                ...blogData,
                                image: e.target.files[0],
                            }))
                        }
                    />
                </div>


                <div className="flex flex-wrap flex-col gap-4">
                    <button
                        onClick={id ? handleUpdateblog : handlepostblog}
                        className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition shadow-lg"
                    >
                        {id ? "Update  Blog" : "Publish Blog"}
                    </button>

                    {draft && <div className="mb-8 p-2">
                        <h2 className="font-bold text-xl">save as a Draft?</h2>
                        <select name="" id="" className="w-1/3 border mt-2 rounded-2xl p-2" onClick={(e) => {
                            e.preventDefault()
                            setBlogData((prev) => ({ ...prev, draft: e.target.value == "true" ? true : false }))
                        }}>
                            <option value="true" >True</option>
                            <option value="false">False</option>
                        </select>
                    </div>}
                </div>
            </div>
        </div>
    );


}
export default Addblog

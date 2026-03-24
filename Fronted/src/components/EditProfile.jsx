import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import axios from "axios"
import { logIn } from "../../utils/userSlice"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
function EditProfile() {
    const { name, id, username, profilePic, bio, token, email } = useSelector(state => state.user)
    const [userData, setuserData] = useState({
        profilePic,
        username,
        bio,
        name
    })
    const navigate = useNavigate()
    const [isDisable, setDisable] = useState(true)
    const dispatch = useDispatch()
    const [initialData, setinitialData] = useState({
        profilePic,
        username,
        bio,
        name
    })

    function handleChange(e) {
        const { value, name, files } = e.target;
        if (files) {
            setuserData((prev) => ({ ...prev, [name]: files[0] }))
        }
        else
            setuserData((prev) => ({ ...prev, [name]: value }))


    }

    useEffect(() => {
        const isEqual = JSON.stringify(userData) === JSON.stringify(initialData)
        setDisable(isEqual || userData.name === "")
    }, [userData, initialData])

    async function handleSave() {
        try {
            const formData = new FormData();
            formData.append('name', userData.name)
            formData.append('username', userData.username)
            if (userData.profilePic) {
                formData.append('profilePic', userData.profilePic)
            }
            formData.append('bio', userData.bio)
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/user/${id}`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            dispatch(logIn({ ...res.data.user, email, token, id }))

        } catch (e) {
            toast.error("something went wrong")
        }
    }
    return <>
        <div className="mx-auto max-lg:w-full w-1/2 flex flex-col gap-8 justify-center p-4 m-10  relative">
            <h1 className="text-xl font-bold text-center">Profile Information</h1>

            <div>
                <p className="font-bold text-gray-400 mb-2">Photo</p>
                <label htmlFor="image" className="bg-black w-[200px] md:w-[500px] ">
                    {
                        userData.profilePic ? <img src={typeof (userData.profilePic) == "string" ? userData.profilePic : URL.createObjectURL(userData.profilePic)} alt="" className="h-[100px] w-[100px] rounded-full" /> :
                            <div className="aspect-video border rounded-full h-[100px] w-[100px] md:w-[100px] bg-white flex justify-center items-center text-lg text-center">
                              
                                <img src="https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_hybrid&w=740&q=80" className="w-full rounded-full " alt="" />
                            </div>

                    }

                </label>
                <input id="image" type="File" accept=".jpeg,.png,.jpg" placeholder="image" className="border hidden shadow-xl" onChange={handleChange} name="profilePic" />
                <button className="px-4 text-center text-red-500" onClick={() => { setuserData((prev) => ({ ...prev, profilePic: null })) }}>Remove</button>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-bold ">Name*</label>
                <textarea type="text" placeholder="Name" name="name" className="focus:outline-none p-2 rounded-lg shadow-2xl focus:none focus:border-none h-[50px] " defaultValue={userData.name} onChange={handleChange}></textarea>
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="" className="font-bold ">Username</label>
                <textarea type="text" placeholder="username" name="username" className="focus:outline-none p-2 rounded-lg shadow-2xl focus:none focus:border-none h-[50px] " defaultValue={userData.username} onChange={handleChange}></textarea>
            </div>

            <div className="flex flex-col gap-2 mb-20">
                <label htmlFor="" className="font-bold ">Short bio</label>
                <textarea type="text" placeholder="Short bio" name="bio" className="focus:outline-none p-2 rounded-lg shadow-2xl focus:none focus:border-none h-[50px] " defaultValue={userData.bio} onChange={handleChange}></textarea>
            </div>
            <button className={`${isDisable ? "bg-green-300 " : "bg-green-600"}  absolute bottom-0 right-5 max-sm:right-12 mb-4 p-2 rounded-2xl text-white`} disabled={isDisable} onClick={handleSave}>Save</button>
        </div>

    </>


}

export default EditProfile
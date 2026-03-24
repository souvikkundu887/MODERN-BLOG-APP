import { useState } from "react"
import axios from "axios"
import { useSelector, useDispatch } from "react-redux"
import { logIn } from "../utils/userSlice"
import { logOut } from "../utils/userSlice"
import toast from "react-hot-toast"
export default function Setting() {
  const { id, token,
    showLikeBlogs,
    showSavedBlogs

  } = useSelector(state => state.user)
  const [setting, setsetting] = useState({
    showLikeBlogs,
    showSavedBlogs
  })
  const dispatch = useDispatch()

  const [popUp, setPopup] = useState(false)

  async function handleVisibilty() {
    try {
      let res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/setting-visibility`, { setting },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )
      dispatch(logIn({ ...res.data.user, token }))
      toast.success("setting updated successfully.")
    } catch (err) {
     toast.error("something is going wrong")
    }
  }


   async function handleDelete() {
    try {
      let res = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/user/${id}`, {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )
      dispatch(logOut())
    } catch (err) {
     toast.error("something is going wrong")
    }
  }
  return (
    <div className="min-h-screen p-4 ">
      <h1 className="text-2xl font-bold mb-4 ">Your settings </h1>
      <div className="flex flex-col justify-center border  relative p-4">
        <div className="my-4 p-2">
          <h2 className="font-bold text-xl">Show Saved Blogs?</h2>
          <select name="" id="" className="w-1/3 border mt-2 rounded-2xl p-2" onClick={(e) => {
            e.preventDefault()
            setsetting((prev) => ({ ...prev, showSavedBlogs: e.target.value == "true" ? true : false }))
          }}>
            <option value="true" >True</option>
            <option value="false">False</option>
          </select>
        </div>

        <div className="mb-8 p-2">
          <h2 className="font-bold text-xl">Show Liked Blogs?</h2>
          <select name="" id="" className="w-1/3 border mt-2 rounded-2xl p-2" onClick={(e) => {
            e.preventDefault()
            setsetting((prev) => ({ ...prev, showLikeBlogs: e.target.value == "true" ? true : false }))
          }}>
            <option value="true" >True</option>
            <option value="false">False</option>
          </select>
        </div>

        <button onClick={handleVisibilty} className="bg-green-300  p-2 rounded-2xl m-4 hover:bg-green-500 absolute bottom-0 right-0">Save</button>

      </div>

      <div>
        <p className="text-red-500 hover:cursor-pointer" onClick={() => { setPopup(true) }}>Delete account</p>
        <p className="text-sm">Permanently delete your account and all of your content.</p>
      </div>

      {popUp && <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto border p-4 sm:p-6 bg-white shadow-2xl rounded-lg">

  <h1 className="text-xl sm:text-2xl font-semibold mb-2">
    Delete Account
  </h1>

  <p className="font-medium text-sm sm:text-base">
    Do you want to delete your account? If you really want, click "Yes".
  </p>

  <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:justify-end">
    <button
      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:cursor-pointer w-full sm:w-auto"
      onClick={handleDelete}
    >
      Yes
    </button>

    <button
      className="bg-red-500 text-white px-4 py-2 rounded-xl hover:cursor-pointer w-full sm:w-auto"
      onClick={() => setPopup(false)}
    >
      No
    </button>
  </div>

</div>}
    </div>
  )
}
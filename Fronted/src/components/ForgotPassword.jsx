import axios from "axios"
import { useState } from "react"
import toast from 'react-hot-toast'
import { Link } from "react-router-dom"

export default function ForgotPassword() {
    const [email, setemail] = useState('')
    const [success, setSuccess] = useState(false)
    async function handlePassword() {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reset-password`, { email })
            toast.success("check your Email or may be it will be in spam")
            setSuccess(true)
        } catch (err) {
            toast.error("user not found")
           
        }
    }
    return <div className="bg-red-300 w-full flex justify-center items-center min-h-screen">
        {!success ? <div className="bg-amber-100 flex flex-col justify-center items-center gap-4 px-8 py-6 rounded-xl w-1/2 text-center h-[1/2]">
            <h1 className="font-bold text-xl">Reset your Password</h1>
            <p className="text-wrap ">Enter your user account's verified email address and we will send you a password reset link.</p>
            <input type="email" className="border border-gray-300 rounded-lg px-4 py-2 w-full" placeholder="Enter your email" onChange={(e) => { setemail(e.target.value) }} />
            <button className="bg-green-700 rounded-xl p-2 text-white" onClick={handlePassword} >send password reset link</button>
        </div> : <div className="bg-amber-100 flex flex-col justify-center items-center gap-4 px-8 py-6 rounded-xl w-1/2 text-center h-[1/2]">
            <p>return to <Link to={'/signin'}><span className="text-blue-500 font-bold"> Sign in</span></Link></p>
        </div>}
    </div>


}
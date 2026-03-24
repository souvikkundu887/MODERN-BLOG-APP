import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom"
export default function ResetPassword() {
    const { token } = useParams();
    const [password, setpassword] = useState('')
    const [confirm, setconfirm] = useState('')

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/
        return regex.test(password)
    }
    async function handlePassword() {
        try {
            if (password != confirm) {
                toast.error('confirm your password correctly')
                return;
            }
            const res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/reset-password/${token}`, { password })

            toast.success("password changed succesfully")
        } catch (err) {

            toast.error('link expired')
        }
    }

    useEffect(() => {
    }, [password])
    return (
        <div className="bg-red-300 w-full flex justify-center items-center min-h-screen">
            <div className="bg-amber-100 flex flex-col justify-center items-center gap-4 px-8 py-6 rounded-xl w-1/2 text-center h-[1/2]">
                <input type="password" className="border border-gray-300 rounded-lg px-4 py-2 w-full" placeholder="New Password" onChange={(e) => { setpassword((prev) => (e.target.value)) }}></input>
                {
                    !validatePassword(password) && <p className="text-red-500 text-sm text-wrap">*Password must be 8+ characters with uppercase, lowercase, number, and special character.</p>
                }
                <input type="password" className="border border-gray-300 rounded-lg px-4 py-2 w-full" placeholder="confirm password" onChange={(e) => { setconfirm(e.target.value) }} />
                <button className="bg-green-700 rounded-xl p-2 text-white" onClick={handlePassword} >change password</button>
            </div>
        </div>
    )
}
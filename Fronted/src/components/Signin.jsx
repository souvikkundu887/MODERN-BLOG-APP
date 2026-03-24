import { Link, Navigate, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useDispatch } from "react-redux"

import axios from "axios"
import { logIn } from "../../utils/userSlice"
import Input from "./input"
import GoogleAuth from "../../utils/FireBase"
import toast from "react-hot-toast"
export function Authform({ type }) {

    const [Val, setVal] = useState({ name: "", email: " ", password: "" })

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [res, setresponse] = useState({ success: true, message: "" })
    async function submit() {
        try {
            const result = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/${type}`, Val)

            const { data } = result?.response || result
            setresponse((prev) => ({ ...prev, success: data?.success }));
            setresponse((prev) => ({ ...prev, message: data?.message }));
            if (data?.success) {
            }
            if (data?.success && type == "signin") {
                alert("logged in succesfully")
                navigate('/', { replace: true })
                dispatch(logIn(data.user))
            }
            else {
                dispatch(logIn(data.user))
                alert("sign up successfully")
                toast.success("verify your Email")
            }
        } catch (err) {
            toast.error("something wrong")
            console.log(err)
            if (err.response) {
                setresponse((prev) => ({ ...prev, success: false, message: err.response.data?.message || "Server Error" }));
            } else {
                setresponse((prev) => ({ ...prev, success: false, message: err.message }));
            }
        }
        finally {
            setVal({
                name: "",
                email: "",
                password: ""
            })
        }

    }

    async function handleGoogleAuth() {
        try {
            let G_data = await GoogleAuth();
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/google-auth`, {
                accessToken: G_data.accessToken
            })
            const { data } = res?.response || res
            setresponse((prev) => ({ ...prev, success: data?.success }));
            setresponse((prev) => ({ ...prev, message: data?.message }));
            if (data?.success) {
            }
            if (data?.success && type == "signin") {
                alert("logged in succesfully")
                navigate('/')
                dispatch(logIn(data.user))
            }
            else {
                dispatch(logIn(data.user))
                alert("sign up successfully")
            }
        } catch (e) {
            toast.error("something went wrong")
        }
    }
    return (
        <div className="min-h-screen flex justify-center items-center bg-red-300">
            <div className="bg-amber-100 flex flex-col justify-center items-center gap-4 px-8 py-6 rounded-xl relative">
                <h1 className="font-bold text-2xl">Welcome to Blog App</h1>
                <h2 className="font-bold text-xl">{type == "signin" ? "signin" : "Register"}</h2>

                {type == "signup" && <Input type={"text"} placeholder={"Enter your name"} setVal={setVal} field={'name'} value={Val.name} />}
                <Input type={"email"} placeholder={"Enter your email"} setVal={setVal} field={'email'} value={Val.email} />
                <Input type={"password"} placeholder={"Enter your password"} setVal={setVal} field={'password'} value={Val.password} />

                {res.message == "email" && type == "signin" && (
                    <p class="text-red-600">User does not exist. Please sign up.</p>
                )}
                {res.message == "password" && type == "signin" && (
                    <p class="text-red-600">Invalid password</p>
                )}
                {!res.success && type == "signup" && (
                    <p class="text-red-600">{res.message}</p>
                )}
                {
                    type == "signin" && <Link to={'/resetpassword'}><p className="text-blue-500 hover:cursor-pointer">Forgot password?</p></Link>
                }
                <div onClick={handleGoogleAuth} className="bg-white w-full p-2 rounded-2xl flex gap-4 hover:cursor-pointer hover:bg-green-300">
                    <div>
                        <svg width="30px" height="30px" className="rounded-2xl" viewBox="-3 0 262 262" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" /><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" /><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" /><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" /></svg>

                    </div>
                    <div>
                        <p className="font-bold ">continue with Google</p>
                    </div>
                </div>
                <button
                    onClick={submit}
                    class="bg-gray-300 px-4 py-2 rounded-xl font-bold hover:bg-gray-400 transition"
                >
                    {type == "signin" ? "Sign in" : "Sign up"}
                </button>

                {
                    type == "signin" && <p>
                        Don’t have an account?
                        <Link to={"/Signup"}>
                            <span class="text-blue-600 underline">Sign up</span>
                        </Link>
                    </p>}
            </div>
        </div>


    )
}
export default Authform
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios";
import { useDispatch } from "react-redux";

export function VerifyUser() {
    const { verificationToken } = useParams();
    const dispatch=useDispatch()
    const navigate=useNavigate()
    async function verifyEmail() {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/verify-email/${verificationToken}`)
           
            dispatch(logIn(res.data.user))
            // alert(res?.data?.message)
            // navigate('/signin')
        }
        catch (err) {
            // alert(err?.response?.data?.message)
        }finally{
            navigate('/signin')
        }
    }

    useEffect(() => {
        verifyEmail();
    }, [])
    return (
        <>
            <div>
                verify user
            </div>
        </>
    )
}
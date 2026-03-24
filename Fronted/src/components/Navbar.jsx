import React, { useEffect } from "react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Outlet, useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
import { logOut } from "../../utils/userSlice"

function Navbar() {
  const { token, name, username, profilePic } = useSelector(state => state.user)
  const navigate = useNavigate();

  const [popup, setpopup] = useState(false)
  const [searchQuery, setSearchQuery] = useState(null);
  const dispatch = useDispatch()

  async function handleSearch(){
    if(searchQuery)
    navigate(`/search?q=${searchQuery}`)
 }
  function handleLogOut() {
    dispatch(logOut())
  }
  useEffect(() => {

  if(window.location.pathname!="/search")
    setSearchQuery('')
  }, [window.location.pathname])

  return (
    <>
      <div >
        <div className="bg-amber-100 h-[57px] px-8 py-2 flex max-sm:mb-10 justify-between relative w-full ">
          <div className="flex gap-4 items-center">
            <svg width="55" height="41" viewBox="0 0 55 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M35.5 0.5C45.9934 0.5 54.5 9.00659 54.5 19.5V40.5C50.0817 40.5 46.5 36.9183 46.5 32.5V19.5C46.5 13.4249 41.5751 8.5 35.5 8.5H30.2988C27.6467 8.50004 25.1029 9.55339 23.2275 11.4287L9.67188 24.9854C8.92179 25.7354 8.50006 26.7527 8.5 27.8135V28.5C8.5 30.7091 10.2909 32.5 12.5 32.5H30.5C30.5 36.7801 27.1389 40.2748 22.9121 40.4893L22.5 40.5H12.5C5.87259 40.5 0.5 35.1274 0.5 28.5V27.8135C0.500062 24.631 1.76427 21.5785 4.01465 19.3281L17.5713 5.77246C20.9469 2.39685 25.525 0.500044 30.2988 0.5H35.5Z" fill="#FF500B"></path>
              <path d="M37.5 12.5C40.2614 12.5 42.5 14.7386 42.5 17.5V40.5C38.0817 40.5 34.5 36.9183 34.5 32.5V20.5H31.1562L24.6207 27.0355C23.683 27.9732 22.4113 28.5 21.0852 28.5H12.9775C12.5588 28.5 12.3491 27.9937 12.6452 27.6976L26.3789 13.9648C27.3165 13.0272 28.588 12.5 29.9141 12.5H37.5Z" fill="#FF500B"></path>
            </svg>
            <div className="relative  max-sm:absolute max-sm:top-15  max-sm:w-[calc(100vw-70px)]">
              <i class="fi fi-rr-search text-xl text-gray-600 absolute top-1/2 -translate-y-1/2 mx-1 opacity-60" onClick={handleSearch} 
               ></i>
              <input type="text" className="  focus:outline-none rounded-xl px-8 py-2 bg-gray-200  w-full" placeholder="Search" onChange={(e) => { setSearchQuery(e.target.value.trim()) }} value={searchQuery} onKeyDown={(e)=>{ if(e.code=="Enter"){
                    handleSearch()
              }
              }} />
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Link to={'/addblog'}><i class="fi fi-rr-edit text-xl" ></i></Link>
              <p>Write</p>
            </div>
            {token ? <div className="w-10 h-10" onClick={() => (setpopup((Prev) => !Prev))}> <img src={`${profilePic ? profilePic : `https://api.dicebear.com/9.x/initials/svg?seed=${name}`}`} alt="" className="w-full h-full  rounded-full" />
            </div> : <div className={`flex gap-2 `}>
              <Link to={'/signin'}> <button className="bg-green-400 p-2 rounded-2xl">Sign in</button></Link>
              <Link to={'/signup'}><button className="bg-green-400 p-2 rounded-2xl">Sign up</button></Link>
            </div>}
          </div>

          {popup && <div className="w-[150px] z-5 bg-red-300 absolute right-4  top-15 rounded-xl shadow-md flex flex-col gap-2   items-center">
            <Link to={`/${username}`} className="hover:bg-blue-300 py-1 hover:rounded-t-xl hover:text-white hover:cursor-pointer w-full text-center"><p onClick={() => (setpopup(false))}>Profile</p></Link>
            <Link className="hover:bg-blue-300 py-1 hover:rounded-t-xl hover:text-white hover:cursor-pointer w-full text-center" onClick={() => (setpopup(false))} to={`/setting`}>Setting</Link>
            <p className="hover:bg-blue-300 py-1 hover:rounded-t-xl hover:text-white  hover:cursor-pointer w-full text-center" onClick={() => {
              setpopup(false)
              handleLogOut()
            }} >Logout</p>

          </div>}
        </div>
        <Outlet></Outlet>
      </div>
    </>

  )
}
export default Navbar
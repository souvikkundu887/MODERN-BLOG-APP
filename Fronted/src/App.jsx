
import { useState } from 'react';
import './App.css'
import { Router, Routes, Route } from 'react-router-dom';
// import { ShowBlog } from './components/ShowBlog';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import { Authform } from './components/Signin';
import Addblog from './components/Addblog';
import Blogpage from './components/Blogpage';
import { VerifyUser } from './components/VerifyUser';
import ProfilePage from './ProfilePage';
import EditProfile from './components/EditProfile';
import SearchPage from './components/Search';
import Setting from './setting';
import ForgotPassword from './components/ForgotPassword';
import { Toaster } from "react-hot-toast";
import ResetPassword from './components/ResetPassword';
function App() {
  return (
    
    <>
    <Toaster/>
    <Routes>
      <Route path='/' element={<Navbar />}>
        <Route path='/signin' element={<Authform type={"signin"} />}></Route>
        <Route path='/signup' element={<Authform type={"signup"} />}></Route>
        <Route path="/" element={<Homepage />}></Route>
        <Route path="/addblog" element={<Addblog />}></Route>
        <Route path="/blog/:id" element={<Blogpage />}></Route>
        <Route path="editblog/:id" element={<Addblog />}></Route>
        <Route path='/account' element={<ProfilePage />}></Route>
        <Route path='/editprofile' element={<EditProfile />}></Route>
        <Route path='/search' element={<SearchPage />}></Route>
        <Route path='/tag/:tag' element={<SearchPage />}></Route>
        <Route path='/:username'element={<ProfilePage/>}></Route>
        <Route path="/:username/saved-blogs" element={<ProfilePage />}></Route>
        <Route path="/:username/Liked-blogs" element={<ProfilePage />}></Route>
        <Route path="/:username/draft-blogs" element={<ProfilePage />}></Route>
        <Route  path="/setting" element={<Setting/>}></Route>
      </Route>
      <Route path='/resetpassword' element={<ForgotPassword/>}></Route>
      <Route path='/resetpassword/:token' element={<ResetPassword/>}></Route>

      <Route path='/verify-email/:verificationToken' element={<VerifyUser />}></Route>

    
    </Routes>
    </>


  )

}

export default App

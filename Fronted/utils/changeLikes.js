import reducer from "./userSlice";
import { createSlice } from "@reduxjs/toolkit";

const likeSlice= createSlice({
    name:"likes",
    initialState:{
       likes:[]
    },
    reducers:{
        addLike:(state,action)=>{
            
            state.likes.push(action.payload)
         
        },
        removeLike:(state,action)=>{
            return state.filter((item)=>item!==action.payload)
        }
    }
})
export const{addLike,removeLike}=likeSlice.actions
export default likeSlice.reducer
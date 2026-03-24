import { createSlice } from "@reduxjs/toolkit";

const CommentSlice = createSlice({
    name: "Comment",
    initialState: {
        isOpen: false,
        Comment:[]
    },
    reducers: {
        SetisOpen: (state, action) => {
            const { payload } = action
            state.isOpen =  payload===false?false:!state.isOpen
        },

       addComment:(state,action)=>{
          
       }
    }
})
export const { SetisOpen } = CommentSlice.actions
export default CommentSlice.reducer
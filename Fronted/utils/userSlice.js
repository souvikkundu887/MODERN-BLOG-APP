import { createSlice } from "@reduxjs/toolkit"

const userFromStorage = localStorage.getItem("user");
const userSlice = createSlice({
    name: "userSlice",
    initialState: userFromStorage!="undefined"&&userFromStorage!=null ? JSON.parse(userFromStorage) : { token: null },
    reducers: {
        logIn: (state, action) => {
            const { payload } = action;
            state.user={...state.user , payload};
            localStorage.setItem('user', JSON.stringify(payload))
            // return payload;
        },
        logOut: (state, action) => {
            const { payload } = action;
            localStorage.removeItem('user')
            return { token: null }
          
        },

          setfollowers: (state, action) => {
            const { userid } = action.payload
            if (!state.user.followers.includes(userid)) {
                state.user.followers = [...state.user.followers, userid]
            }
            else {
                state.user.followers = state.user.followers.filter(id => id != userid)
            }
        }

    },
})
export const { logIn, logOut,setfollowers } = userSlice.actions
export default userSlice.reducer
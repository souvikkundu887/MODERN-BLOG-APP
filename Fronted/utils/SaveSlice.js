import reducer from "./userSlice";
import { createSlice } from "@reduxjs/toolkit";

const SaveSlice = createSlice({
    name: "Saves",
    initialState: {
        Saves: []
    },
    reducers: {
        setSave: (state, action) => {
            const id = action.payload
            if (!state.Saves.includes(id)) {
                state.Saves = [...state.Saves, id]
            }
            else {
                state.Saves = state.Saves.filter((user) => user != id)
            }
        }
    }
})
export const { setSave } = SaveSlice.actions
export default SaveSlice.reducer
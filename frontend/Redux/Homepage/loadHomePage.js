// i want to create a reducer:
import {createSlice} from "@reduxjs/toolkit";

const initialState = [];

const homePageSlicer = createSlice({
    name:"homepageLoadData",
    initialState,
    reducers : {
        loadData:(state,action)=>{
            return action.payload;
        }
    }
});

export const {loadData} = homePageSlicer.actions;
export default homePageSlicer.reducer;

//loadData = [[randomProducts],[allProducts]];

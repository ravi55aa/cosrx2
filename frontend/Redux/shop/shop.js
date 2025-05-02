import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const shopSlice = createSlice({
    
    name:"shopSlice",
    
    initialState,

    reducers: { 
        loadProducts : (state,actions)=>{
            console.log("actions.payload",actions.payload);
            return actions.payload;
        },
    }
})


export const {loadProducts} = shopSlice.actions;

export default shopSlice.reducer;
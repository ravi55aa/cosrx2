import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

export const CategorySlice = createSlice({
    name:"adminCategory",
    initialState ,
    reducers : {
        loadCategory : (state,action)=>{
            return action.payload || [];
        },
        addCategory : (state,action)=>{  
            state.push(action.payload);
        },
        updateSearchedCategory : (state,action)=>{
            return action.payload;
        },
        updateListing : (state,action) => {
            const {id,listing} = action.payload;

            const toggleListing = !listing ; 

            return state.map((category)=>
                category._id == id 
                ? {...category, isListed:toggleListing}
                : category
            )
        },
        updateSoftDelete:(state,action)=>{
            console.log("the store is ",state);
            const {id} = action.payload;
            console.log(id,action.payload.id);

            return state.filter((ele)=> ele._id !== id );
        }
    }
})

export const { loadCategory,addCategory,updateSearchedCategory, updateListing,updateSoftDelete} = CategorySlice.actions;

export default CategorySlice.reducer;
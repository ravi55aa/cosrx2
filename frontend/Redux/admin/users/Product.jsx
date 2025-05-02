import {createSlice} from "@reduxjs/toolkit";

const initialState = [];

const ProductSlice = createSlice({
    name:"Products",
    initialState,
    reducers : {
        updateProducts: (state,action)=>{
            return action.payload;
        },
        updateAddProducts: (state,action)=>{
            const {newProduct} = action.payload;
            console.log(action.payload);
            return state.push(newProduct);
        }
    }
})


export const {updateProducts,updateAddProducts} = ProductSlice.actions; 

export default ProductSlice.reducer;

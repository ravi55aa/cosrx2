import {configureStore} from "@reduxjs/toolkit";

import userReducer from "./Reducer";
import adminCategory from "./Category";
import productReducer from "./Product";
import homePageLoadingData from "../../Homepage/loadHomePage";
import shopReducer from "../../shop/shop";

export const store = configureStore({
    reducer : {
        users : userReducer,
        category : adminCategory,
        products: productReducer,
        homePage: homePageLoadingData,
        shop: shopReducer,
    }
})

export default store;
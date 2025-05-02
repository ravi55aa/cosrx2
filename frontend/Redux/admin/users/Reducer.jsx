import { createSlice } from "@reduxjs/toolkit";

const initialState = []; //

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    loadUsers: (state, action) => {
      return action.payload;
    },
    updateUserStatus: (state, action) => {
      return state.map((user) =>
        user._id === action.payload.id
          ? { ...user, isBlocked: action.payload.status }
          : user
      );
    },
    updateSearchedUsers: (state, action) => {
      return action.payload;
    },
  },
});

export const { loadUsers, updateUserStatus, updateSearchedUsers } =
  usersSlice.actions;

export default usersSlice.reducer;

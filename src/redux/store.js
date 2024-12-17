// store.js
import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./authSlice";
import userReducer from "./userReducer";
const store = configureStore({
  reducer: {
    auth: authReducer,
    userReducer: userReducer,
  },
});

export default store;

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     userReducer: userReducer
//   }
// });

import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from "./types";

const initialState = {
  isAuthenticated: false,
  user: JSON.parse(localStorage.getItem("userData")) || null,
  token: localStorage.getItem("token"),
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case LOGIN_FAIL:
    case LOGOUT:
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

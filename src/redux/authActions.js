// src/redux/actions/authActions.js
import axios from "axios";
import { LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT } from "./types";
import { API_BASE_URL } from "../config";
import Cookies from "js-cookie";
import { showToast } from "../utils/toast";

// authActions.js
export const login = (email, password) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/api/AdminApplicationUser/Login`,
      { Email: email, Password: password }
    );
    if (res.data.IsSuccess) {
      const userData = {
        userId: res.data.UserId,
        fullName: res.data.FullName,
        email: res.data.Email,
        roleId: res.data.RoleId,
      };
      console.log(res.data);

      // User məlumatlarını localStorage-də saxlayırıq
      localStorage.setItem("token", res.data.JwtToken);
      localStorage.setItem("userData", JSON.stringify(userData));

      dispatch({
        type: LOGIN_SUCCESS,
        payload: {
          user: userData,
          token: res.data.JwtToken,
        },
      });

      Cookies.set("jwtToken", res.data.JwtToken, { expires: 30 });
      showToast(res.data.Message || "N/A", "success");
      return true;
    } else {
      dispatch({ type: LOGIN_FAIL });
      return false;
    }
  } catch (err) {
    dispatch({ type: LOGIN_FAIL });
    return false;
  }
};

export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
  Cookies.remove("jwtToken");
  dispatch({ type: LOGOUT });
};

// Yeni action - localStorage-dən user məlumatlarını yükləmək üçün
export const loadUserFromStorage = () => (dispatch) => {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("userData");

  if (token && userData) {
    dispatch({
      type: LOGIN_SUCCESS,
      payload: {
        user: JSON.parse(userData),
        token,
      },
    });
  }
};

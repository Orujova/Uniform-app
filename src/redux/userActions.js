import axios from "axios";
import { API_BASE_URL } from "../config";
import {
  FETCH_ROLES_REQUEST,
  FETCH_ROLES_SUCCESS,
  FETCH_ROLES_FAILURE,
  CREATE_USER_SUCCESS,
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  UPDATE_USER_SUCCESS,
  CHANGE_PASSWORD_SUCCESS,
  DELETE_USER_SUCCESS,
  FETCH_USER_BY_ID_SUCCESS,
  FETCH_USER_BY_ID_FAILURE,
} from "./types";
import { showToast } from "../utils/toast";

// Fetch roles
export const fetchRoles = () => async (dispatch) => {
  dispatch({ type: FETCH_ROLES_REQUEST });
  try {
    const response = await axios.get(`${API_BASE_URL}/api/Role`, {
      headers: { "ngrok-skip-browser-warning": "any-value" },
    });

    dispatch({ type: FETCH_ROLES_SUCCESS, payload: response.data[0].Roles });
  } catch (error) {
    dispatch({ type: FETCH_ROLES_FAILURE, payload: "Failed to fetch roles." });
  }
};

export const fetchUsers =
  (page = 1, pageSize = 10) =>
  async (dispatch, getState) => {
    dispatch({ type: FETCH_USERS_REQUEST });
    try {
      const {
        auth: { token },
      } = getState();
      const response = await axios.get(
        `${API_BASE_URL}/api/AdminApplicationUser`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { Page: page, "ShowMore.Take": pageSize },
        }
      );
      dispatch({
        type: FETCH_USERS_SUCCESS,
        payload: response.data[0].AppUsers,
      });
    } catch (error) {
      dispatch({ type: FETCH_USERS_FAILURE, payload: error.message });
    }
  };

export const fetchUserById = (id) => async (dispatch, getState) => {
  try {
    const {
      auth: { token },
    } = getState(); // Redux'dan token alın
    const response = await axios.get(
      `${API_BASE_URL}/api/AdminApplicationUser/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch({
      type: FETCH_USER_BY_ID_SUCCESS,
      payload: response.data, // Kullanıcı bilgilerini Redux'a kaydet
    });
  } catch (error) {
    dispatch({ type: FETCH_USER_BY_ID_FAILURE, payload: error.message });
  }
};

export const updateUser = (userData) => async (dispatch, getState) => {
  try {
    const {
      auth: { token },
    } = getState();
    await axios.put(`${API_BASE_URL}/api/AdminApplicationUser`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Dispatch with form data
    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: userData,
    });
  } catch (error) {
    console.error("Error updating user:", error);
  }
};
export const changePassword = (passwordData) => async (dispatch, getState) => {
  try {
    const {
      auth: { token },
    } = getState();
    await axios.put(
      `${API_BASE_URL}/api/AdminApplicationUser/ChangePassword`,
      passwordData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch({ type: CHANGE_PASSWORD_SUCCESS });
    showToast("Password changed successfully", "success");
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error("Failed to change password");
  }
};

export const deleteUser = (userId) => async (dispatch, getState) => {
  try {
    const {
      auth: { token },
    } = getState();
    await axios.delete(`${API_BASE_URL}/api/AdminApplicationUser/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: DELETE_USER_SUCCESS, payload: userId });
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const createUser = (userData) => async (dispatch, getState) => {
  try {
    const roleIDs = userData.RoleIds.map((id) => `RoleIds=${id}`).join("&");
    const {
      auth: { token },
    } = getState();
    await axios.post(
      `${API_BASE_URL}/api/AdminApplicationUser/CreateUser?${roleIDs}`,
      "",
      {
        params: {
          Email: userData.Email,
          FullName: userData.FullName,
          Password: userData.Password,
          PhoneNumber: userData.PhoneNumber,
          UserName: userData.UserName,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: userData,
    });
    showToast("Employee Created Succesfuly", "success");
  } catch (error) {
    console.error("Error creating user:", error);
    showToast(" Error creating user", "error");
  }
};

// export const createUser = (formData) => async (dispatch, getState) => {
//     const { auth: { token } } = getState();
//     dispatch({ type: CREATE_USER_REQUEST });

//     try {
//         await axios.post(
//             `${API_BASE_URL}/api/AdminApplicationUser/CreateUser`,
//             formData, // Pass formData as the request body
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'ngrok-skip-browser-warning': 'any-value',
//                 },
//             }
//         );
//         dispatch({ type: CREATE_USER_SUCCESS });
//         alert("User created successfully!");
//     } catch (error) {
//         console.error('Error creating user:', error); // Log the error for debugging
//         dispatch({ type: CREATE_USER_FAILURE, payload: "Failed to create user." });
//     }
// };

export const UPDATE_EMPLOYEE_LOCATION = "UPDATE_EMPLOYEE_LOCATION";

import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  DELETE_USER_SUCCESS,
  FETCH_ROLES_REQUEST,
  FETCH_ROLES_SUCCESS,
  FETCH_ROLES_FAILURE,
  UPDATE_USER_SUCCESS,
  CHANGE_PASSWORD_SUCCESS,
  FETCH_USER_BY_ID_SUCCESS,
  FETCH_USER_BY_ID_FAILURE,
} from "./types";

const initialState = {
  users: [],
  roles: [],
  loading: false,
  error: null,
  userCreationSuccess: false,
  passwordChangeSuccess: false,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS_REQUEST:
    case FETCH_ROLES_REQUEST:
    case CREATE_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };

    case FETCH_USER_BY_ID_SUCCESS:
      return { ...state, user: action.payload, loading: false };

    case FETCH_USER_BY_ID_FAILURE:
      return { ...state, error: action.payload, loading: false };

    case FETCH_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_ROLES_SUCCESS:
      return { ...state, loading: false, roles: action.payload };

    case FETCH_ROLES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CREATE_USER_SUCCESS:
      return { ...state, loading: false, userCreationSuccess: true };

    case CREATE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.map((user) =>
          user.Id === action.payload.Id ? { ...user, ...action.payload } : user
        ),
      };
    case DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((user) => user.Id !== action.payload),
      };
    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        passwordChangeSuccess: true, // Set flag on password change success
      };
    default:
      return state;
  }
};

export default userReducer;

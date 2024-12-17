import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { changePassword } from "../redux/userActions";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const UserChangePasswordModal = ({ open, handleClose, user }) => {
  const dispatch = useDispatch();
  const [passwordData, setPasswordData] = useState({
    CurrentPassword: "",
    NewPassword: "",
    RepeatNewPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    repeat: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordVisibilityToggle = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = () => {
    dispatch(changePassword({ Id: user.Id, ...passwordData }));
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ color: "rgb(46, 125, 50)" }}>
        Change Password
      </DialogTitle>
      <DialogContent>
        <TextField
          name="CurrentPassword"
          label="Current Password"
          type={showPassword.current ? "text" : "password"}
          value={passwordData.CurrentPassword}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handlePasswordVisibilityToggle("current")}
                  edge="end"
                >
                  {showPassword.current ? (
                    <VisibilityOff sx={{ color: "rgb(46, 125, 50)" }} />
                  ) : (
                    <Visibility sx={{ color: "rgb(46, 125, 50)" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          name="NewPassword"
          label="New Password"
          type={showPassword.new ? "text" : "password"}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handlePasswordVisibilityToggle("new")}
                  edge="end"
                >
                  {showPassword.new ? (
                    <VisibilityOff sx={{ color: "rgb(46, 125, 50)" }} />
                  ) : (
                    <Visibility sx={{ color: "rgb(46, 125, 50)" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          name="RepeatNewPassword"
          label="Confirm New Password"
          type={showPassword.repeat ? "text" : "password"}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handlePasswordVisibilityToggle("repeat")}
                  edge="end"
                >
                  {showPassword.repeat ? (
                    <VisibilityOff sx={{ color: "rgb(46, 125, 50)" }} />
                  ) : (
                    <Visibility sx={{ color: "rgb(46, 125, 50)" }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: "rgb(46, 125, 50)" }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} sx={{ color: "rgb(46, 125, 50)" }}>
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserChangePasswordModal;

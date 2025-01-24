// UserChangePasswordModal.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import { Lock, Eye, EyeOff } from "lucide-react";
import { changePassword } from "../redux/userActions";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

const UserChangePasswordModal = ({ open, handleClose, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!passwordData.CurrentPassword) {
      newErrors.CurrentPassword = "Current password is required";
    }
    if (!passwordData.NewPassword || passwordData.NewPassword.length < 6) {
      newErrors.NewPassword = "New password must be at least 6 characters long";
    }
    if (passwordData.NewPassword !== passwordData.RepeatNewPassword) {
      newErrors.RepeatNewPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handlePasswordVisibilityToggle = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        setLoading(true);
        await dispatch(
          changePassword({ Id: user.Id, ...passwordData })
        ).unwrap();
        showToast(
          "Password changed successfully. Please login again.",
          "success"
        );
        localStorage.removeItem("token"); // Clear token
        setTimeout(() => {
          handleClose();
          navigate("/login"); // Redirect to login page
        }, 2000);
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          padding: "24px",
        },
      }}
    >
      <Box textAlign="center" mb={3}>
        <Lock size={48} color="#74ebd5" />
        <DialogTitle
          sx={{
            color: "#1f2937",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Change Password
        </DialogTitle>
      </Box>

      <DialogContent>
        {errors.submit && (
          <Typography color="error" textAlign="center" mb={2}>
            {errors.submit}
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            name="CurrentPassword"
            placeholder="Current Password"
            type={showPassword.current ? "text" : "password"}
            value={passwordData.CurrentPassword}
            onChange={handleChange}
            error={!!errors.CurrentPassword}
            helperText={errors.CurrentPassword}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="#6b7280" size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handlePasswordVisibilityToggle("current")}
                    edge="end"
                  >
                    {showPassword.current ? (
                      <EyeOff color="#6b7280" size={20} />
                    ) : (
                      <Eye color="#6b7280" size={20} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            name="NewPassword"
            placeholder="New Password"
            type={showPassword.new ? "text" : "password"}
            value={passwordData.NewPassword}
            onChange={handleChange}
            error={!!errors.NewPassword}
            helperText={errors.NewPassword}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="#6b7280" size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handlePasswordVisibilityToggle("new")}
                    edge="end"
                  >
                    {showPassword.new ? (
                      <EyeOff color="#6b7280" size={20} />
                    ) : (
                      <Eye color="#6b7280" size={20} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            name="RepeatNewPassword"
            placeholder="Confirm New Password"
            type={showPassword.repeat ? "text" : "password"}
            value={passwordData.RepeatNewPassword}
            onChange={handleChange}
            error={!!errors.RepeatNewPassword}
            helperText={errors.RepeatNewPassword}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="#6b7280" size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handlePasswordVisibilityToggle("repeat")}
                    edge="end"
                  >
                    {showPassword.repeat ? (
                      <EyeOff color="#6b7280" size={20} />
                    ) : (
                      <Eye color="#6b7280" size={20} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: "20px", flexDirection: "column", gap: 1 }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{
            py: 1.5,
            fontWeight: "bold",
            background: "linear-gradient(to left, #74ebd5, #9face6)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(to right, #74ebd5, #9face6)",
            },
          }}
        >
          {loading ? "CHANGING PASSWORD..." : "CHANGE PASSWORD"}
        </Button>
        <Button
          onClick={handleClose}
          variant="text"
          fullWidth
          disabled={loading}
          sx={{
            color: "#6b7280",
            "&:hover": {
              backgroundColor: "rgba(107, 114, 128, 0.04)",
            },
          }}
        >
          Cancel
        </Button>
      </DialogActions>
      <ToastContainer />
    </Dialog>
  );
};

export default UserChangePasswordModal;

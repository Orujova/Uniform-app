import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createUser, fetchRoles } from "../redux/userActions";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Container,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { User, Mail, Lock, Eye, EyeOff, UserPlus } from "lucide-react";
import ToastContainer from "../utils/ToastContainer"; // Sonner Toaster
import { showToast } from "../utils/toast"; // Sonner toast utility

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roles, loading } = useSelector((state) => state.userReducer);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    FullName: "",
    UserName: "",
    Email: "",
    Password: "",
    RoleIds: [],
  });

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.UserName || formData.UserName.length < 5) {
      newErrors.UserName = "Username must be at least 5 characters long";
    }
    if (!formData.Email || !/\S+@\S+\.\S+/.test(formData.Email)) {
      newErrors.Email = "Please enter a valid email address";
    }
    if (!formData.Password || formData.Password.length < 6) {
      newErrors.Password = "Password must be at least 6 characters long";
    }
    if (!formData.FullName) {
      newErrors.FullName = "Full Name is required";
    }
    if (formData.RoleIds.length === 0) {
      newErrors.RoleIds = "Please select at least one role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleRoleChange = (event) => {
    setFormData({ ...formData, RoleIds: event.target.value });
    setErrors({ ...errors, RoleIds: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await dispatch(createUser(formData)); // Handle fulfilled action
        setTimeout(() => {
          navigate("/transaction"); // Redirect after toast
        }, 3000); // Matches showToast duration
      } catch (error) {
        setErrors({ submit: error.message });
      }
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        backgroundImage: `url("https://colorlib.com/etc/regform/colorlib-regform-8/images/signup-bg.jpg")`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
            maxWidth: "400px",
            margin: "auto",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Box textAlign="center" mb={2}>
            <UserPlus size={36} color="#74ebd5" />
            <Typography
              variant="h6"
              fontWeight="600"
              mt={1}
              sx={{
                background: "linear-gradient(to right, #74ebd5, #9face6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CREATE ACCOUNT
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              name="FullName"
              placeholder="Full Name"
              value={formData.FullName}
              onChange={handleChange}
              fullWidth
              error={!!errors.FullName}
              helperText={errors.FullName}
              margin="dense"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#74ebd5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9face6",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User color="#74ebd5" size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="UserName"
              placeholder="Username"
              value={formData.UserName}
              onChange={handleChange}
              fullWidth
              error={!!errors.UserName}
              helperText={errors.UserName}
              margin="dense"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#74ebd5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9face6",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User color="#74ebd5" size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="Email"
              placeholder="Email"
              value={formData.Email}
              onChange={handleChange}
              fullWidth
              error={!!errors.Email}
              helperText={errors.Email}
              margin="dense"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#74ebd5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9face6",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color="#74ebd5" size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="Password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={formData.Password}
              onChange={handleChange}
              fullWidth
              error={!!errors.Password}
              helperText={errors.Password}
              margin="dense"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                    borderColor: "#74ebd5",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#9face6",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="#74ebd5" size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{
                        "&:hover": {
                          color: "#9face6",
                        },
                      }}
                    >
                      {showPassword ? (
                        <EyeOff color="#74ebd5" size={20} />
                      ) : (
                        <Eye color="#74ebd5" size={20} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              fullWidth
              margin="dense"
              error={!!errors.RoleIds}
              size="small"
            >
              <InputLabel sx={{ "&.Mui-focused": { color: "#9face6" } }}>
                Roles
              </InputLabel>
              <Select
                multiple
                value={formData.RoleIds}
                onChange={handleRoleChange}
                renderValue={(selected) =>
                  selected
                    .map(
                      (roleId) =>
                        roles?.find((role) => role.Id === roleId)?.RoleName
                    )
                    .join(", ")
                }
                sx={{
                  borderRadius: "8px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#74ebd5",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#9face6",
                  },
                }}
              >
                {roles?.map((role) => (
                  <MenuItem key={role.Id} value={role.Id}>
                    {role.RoleName}
                  </MenuItem>
                ))}
              </Select>
              {errors.RoleIds && (
                <Typography
                  color="error"
                  variant="caption"
                  sx={{ mt: 0.5, ml: 1 }}
                >
                  {errors.RoleIds}
                </Typography>
              )}
            </FormControl>

            {errors.submit && (
              <Typography
                color="error"
                textAlign="center"
                mt={1}
                variant="caption"
                sx={{ background: "rgba(239, 68, 68, 0.1)", p: 0.5, borderRadius: 1 }}
              >
                {errors.submit}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="small"
              sx={{
                mt: 2,
                py: 1,
                fontWeight: "600",
                background: "linear-gradient(45deg, #74ebd5, #9face6)",
                color: "#fff",
                borderRadius: "8px",
                textTransform: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  background: "linear-gradient(45deg, #9face6, #74ebd5)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : "Sign Up"}
            </Button>
          </form>
        </Paper>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default RegisterPage;
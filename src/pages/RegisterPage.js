import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

const RegisterPage = () => {
  const dispatch = useDispatch();
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
        await dispatch(createUser(formData));
        // Navigate to success page or show success message
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
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "white",
            maxWidth: "500px",
            margin: "auto",
          }}
        >
          <Box textAlign="center" mb={4}>
            <UserPlus size={48} color="#74ebd5" />
            <Typography variant="h5" fontWeight="bold" mt={2} color="#1f2937">
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
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User color="#6b7280" />
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
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <User color="#6b7280" />
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
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail color="#6b7280" />
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
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="#6b7280" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <EyeOff color="#6b7280" />
                      ) : (
                        <Eye color="#6b7280" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth margin="normal" error={!!errors.RoleIds}>
              <InputLabel>Roles</InputLabel>
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
              >
                {roles?.map((role) => (
                  <MenuItem key={role.Id} value={role.Id}>
                    {role.RoleName}
                  </MenuItem>
                ))}
              </Select>
              {errors.RoleIds && (
                <Typography color="error" variant="caption">
                  {errors.RoleIds}
                </Typography>
              )}
            </FormControl>

            {errors.submit && (
              <Typography color="error" textAlign="center" mt={2}>
                {errors.submit}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 3,
                py: 1.5,
                fontWeight: "bold",
                background: "linear-gradient(to left, #74ebd5, #9face6)",
                color: "#fff",
                border: "none",
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "SIGN UP"}
            </Button>
          </form>
        </Paper>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default RegisterPage;

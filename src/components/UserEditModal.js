import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { updateUser, fetchRoles } from "../redux/userActions";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const UserEditModal = ({ open, handleClose, user }) => {
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.userReducer);
  const [formData, setFormData] = useState({
    FullName: user.FullName || "",
    UserName: user.UserName || "",
    Email: user.Email || "",
    PhoneNumber: user.PhoneNumber || "",
    Password: user.Password || "",
    RoleIds: user.RoleIds || [],
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) dispatch(fetchRoles());
  }, [dispatch, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (event) => {
    setFormData({ ...formData, RoleIds: event.target.value });
  };

  const handlePasswordVisibilityToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = () => {
    dispatch(updateUser({ Id: user.Id, ...formData }));
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        <TextField
          name="FullName"
          label="Full Name"
          value={formData.FullName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="UserName"
          label="Username"
          value={formData.UserName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="Email"
          label="Email"
          value={formData.Email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="PhoneNumber"
          label="Phone Number"
          value={formData.PhoneNumber}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="Password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={formData.Password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handlePasswordVisibilityToggle} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Roles</InputLabel>
          <Select
            multiple
            value={formData.RoleIds}
            onChange={handleRoleChange}
            renderValue={(selected) =>
              selected
                .map(
                  (roleId) => roles.find((role) => role.Id === roleId)?.RoleName
                )
                .join(", ")
            }
          >
            {roles.map((role) => (
              <MenuItem key={role.Id} value={role.Id}>
                {role.RoleName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditModal;

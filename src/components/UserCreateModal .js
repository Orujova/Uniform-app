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
  CircularProgress,
} from "@mui/material";
import { createUser, fetchRoles } from "../redux/userActions";

const UserCreateModal = ({ open, handleClose }) => {
  const dispatch = useDispatch();
  const { roles, loading } = useSelector((state) => state.userReducer);
  const [formData, setFormData] = useState({
    FullName: "",
    UserName: "",
    Email: "",
    PhoneNumber: "",
    Password: "",
    RoleIds: [],
  });

  useEffect(() => {
    if (open) dispatch(fetchRoles());
  }, [dispatch, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    console.log(formData);
  };

  const handleRoleChange = (event) => {
    setFormData({ ...formData, RoleIds: event.target.value });
    console.log(formData);
  };

  const handleSubmit = () => {
    dispatch(createUser(formData));
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <TextField
          name="FullName"
          label="Full Name"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="UserName"
          label="Username"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="Email"
          label="Email"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="PhoneNumber"
          label="Phone Number"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="Password"
          label="Password"
          type="password"
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Roles</InputLabel>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
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
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserCreateModal;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Paper,
} from "@mui/material";
import { fetchUsers, deleteUser } from "../redux/userActions";
import UserCreateModal from "../components/UserCreateModal ";
import UserEditModal from "../components/UserEditModal";
import UserChangePasswordModal from "../components/UserChangePasswordModal";

const UserCreatingPage = () => {
  const dispatch = useDispatch();
  const { users = [], loading } = useSelector(
    (state) => state.userReducer || {}
  );
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState({
    open: false,
    user: null,
  });
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState({
    open: false,
    user: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenCreateUser = () => setOpenCreateModal(true);
  const handleCloseCreateUser = () => setOpenCreateModal(false);

  const handleOpenEditUser = (user) => setOpenEditModal({ open: true, user });
  const handleCloseEditUser = () =>
    setOpenEditModal({ open: false, user: null });

  const handleOpenChangePassword = (user) =>
    setOpenChangePasswordModal({ open: true, user });
  const handleCloseChangePassword = () =>
    setOpenChangePasswordModal({ open: false, user: null });

  const handleDeleteUser = (userId) => setDeleteDialog({ open: true, userId });

  const confirmDeleteUser = () => {
    dispatch(deleteUser(deleteDialog.userId));
    setDeleteDialog({ open: false, userId: null });
  };

  return (
    <Container>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenCreateUser}
        sx={{ mb: 3, mt: 3 }}
      >
        Create New User
      </Button>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        {loading ? (
          <CircularProgress sx={{ display: "block", margin: "auto", my: 4 }} />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(users) &&
                users.map((user) => (
                  <TableRow key={user.Id}>
                    <TableCell>{user.UserName}</TableCell>
                    <TableCell>{user.FullName}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.PhoneNumber}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenEditUser(user)}>
                        Edit
                      </Button>
                      <Button onClick={() => handleOpenChangePassword(user)}>
                        Change Password
                      </Button>
                      <Button
                        color="error"
                        onClick={() => handleDeleteUser(user.Id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, userId: null })}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, userId: null })}
          >
            Cancel
          </Button>
          <Button onClick={confirmDeleteUser} color="error">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modals for User Actions */}
      <UserCreateModal
        open={openCreateModal}
        handleClose={handleCloseCreateUser}
      />
      {openEditModal.open && (
        <UserEditModal
          open={openEditModal.open}
          handleClose={handleCloseEditUser}
          user={openEditModal.user}
        />
      )}
      {openChangePasswordModal.open && (
        <UserChangePasswordModal
          open={openChangePasswordModal.open}
          handleClose={handleCloseChangePassword}
          user={openChangePasswordModal.user}
        />
      )}
    </Container>
  );
};

export default UserCreatingPage;

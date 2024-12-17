import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import { fetchUserById } from "../redux/userActions";
import UserChangePasswordModal from "../components/UserChangePasswordModal";

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  // const history = useNavigate();

  const { user: authUser } = useSelector((state) => state.auth);
  console.log("Auth User:", authUser);
  const { user, loading, error } = useSelector((state) => state.userReducer);
  const { userId: id } = authUser || {};

  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!authUser) {
      // history.push("/login");
    } else if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id, authUser]);

  const handleOpenChangePassword = () => setOpenChangePasswordModal(true);
  const handleCloseChangePassword = () => setOpenChangePasswordModal(false);

  if (loading) {
    return (
      <CircularProgress
        sx={{
          display: "block",
          margin: "auto",
          mt: 2,
          color: "rgb(46, 125, 50)",
        }}
      />
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: "red", textAlign: "center", mt: 4 }}>
        {error || "An error occurred. Please try again later."}
      </Typography>
    );
  }

  if (!user) {
    return (
      <Typography sx={{ color: "red", textAlign: "center", mt: 4 }}>
        User not found.
      </Typography>
    );
  }

  return (
    <Container>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          color: "rgb(46, 125, 50)",
          fontWeight: "bold",
          marginTop: "20px",
        }}
      >
        Change Password
      </Typography>
      <TableContainer component={Paper} sx={{ marginTop: 2 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "rgb(46, 125, 50)" }}>
                Full Name
              </TableCell>
              <TableCell>{user?.FullName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", color: "rgb(46, 125, 50)" }}>
                Email
              </TableCell>
              <TableCell>{user?.Email}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        onClick={handleOpenChangePassword}
        sx={{
          color: "rgb(46, 125, 50)",
          textTransform: "none",
          fontWeight: "bold",
          marginTop: 2,
        }}
      >
        Change Password
      </Button>

      {openChangePasswordModal && (
        <UserChangePasswordModal
          open={openChangePasswordModal}
          handleClose={handleCloseChangePassword}
          user={user}
        />
      )}
    </Container>
  );
};

export default ChangePasswordPage;

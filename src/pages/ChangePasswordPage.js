import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById } from "../redux/userActions";
import UserChangePasswordModal from "../components/UserChangePasswordModal";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Lock, User, Mail } from "lucide-react";

import { ToastContainer } from "../utils/ToastContainer";

const ChangePasswordPage = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { user, loading, error } = useSelector((state) => state.userReducer);
  const { userId: id } = authUser || {};
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress sx={{ color: "#74ebd5" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography color="error">
          {error || "An error occurred. Please try again later."}
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography color="error">User not found.</Typography>
      </Box>
    );
  }

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
            <Lock size={48} color="#74ebd5" />
            <Typography variant="h5" fontWeight="bold" mt={2} color="#1f2937">
              CHANGE PASSWORD
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <User color="#6b7280" size={20} />
              <Box>
                <Typography color="#6b7280" variant="caption">
                  Full Name
                </Typography>
                <Typography color="#1f2937" fontWeight="500">
                  {user?.FullName}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box display="flex" alignItems="center" gap={2}>
              <Mail color="#6b7280" size={20} />
              <Box>
                <Typography color="#6b7280" variant="caption">
                  Email
                </Typography>
                <Typography color="#1f2937" fontWeight="500">
                  {user?.Email}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={() => setOpenChangePasswordModal(true)}
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
            CHANGE PASSWORD
          </Button>
        </Paper>

        <ToastContainer />

        {openChangePasswordModal && (
          <UserChangePasswordModal
            open={openChangePasswordModal}
            handleClose={() => setOpenChangePasswordModal(false)}
            user={user}
          />
        )}
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;

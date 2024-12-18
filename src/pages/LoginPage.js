import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../redux/authActions";
import { API_BASE_URL } from "../config";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Divider,
} from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import login0 from "../assets/login_0.png";
import login1 from "../assets/login_1.jpg";
import login2 from "../assets/login_2.jpg";
import login3 from "../assets/login_3.jpg";

const images = [login0, login1, login2, login3];

// Role-based routing configuration
const ROLE_ROUTES = {
  1: "/transaction",
  2: "/stock",
  3: "/requestsPage",
  4: "/managerResponse",
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/Role`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch roles");
        }

        const data = await response.json();
        const rolesData = data[0]?.Roles || [];
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching roles:", err);
        toast.error("Error loading roles");
      }
    };

    const token = localStorage.getItem("token");
    if (token) {
      fetchRoles();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const success = await dispatch(login(username, password));

      if (success) {
        const token = localStorage.getItem("token");
        const userDataString = localStorage.getItem("userData");

        if (!token || !userDataString) {
          throw new Error("Authentication failed - missing token or user data");
        }

        const userData = JSON.parse(userDataString);
        const { roleId } = userData;

        // If user has multiple roles, redirect to the highest priority role's page
        if (Array.isArray(roleId) && roleId.length > 0) {
          // Sort roles by priority (assuming lower number means higher priority)
          const primaryRole = Math.min(...roleId);
          const redirectPath = ROLE_ROUTES[primaryRole];

          if (redirectPath) {
            navigate(redirectPath);
          } else {
            toast.error("No valid route found for user role");
          }
        } else {
          toast.error("No roles assigned to user");
        }
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login");
      toast.error("Login failed");
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#e6feed" }}>
      <Carousel
        autoPlay
        interval={3000}
        indicators={false}
        navButtonsAlwaysVisible={true}
        animation="slide"
        duration={500}
        NavButton={({ onClick, className, style, next, prev }) => {
          return (
            <Button
              onClick={onClick}
              className={className}
              style={{
                ...style,
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#fff",
                zIndex: 2,
                [next ? "right" : "left"]: 10,
              }}
            >
              {next ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </Button>
          );
        }}
        sx={{ flex: 1, height: "100vh" }}
      >
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              backgroundImage: `url(${image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "100vh",
            }}
          />
        ))}
      </Carousel>

      <Container
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: "#bedec7",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" sx={{ marginBottom: "10px", color: "#333" }}>
            Uniform
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginBottom: "20px", color: "#333" }}
          >
            Login your account
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#999" },
                  "&:hover fieldset": { borderColor: "#333" },
                  "&.Mui-focused fieldset": { borderColor: "#333" },
                },
              }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#999" },
                  "&:hover fieldset": { borderColor: "#333" },
                  "&.Mui-focused fieldset": { borderColor: "#333" },
                },
              }}
            />
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                backgroundColor: "#333",
                color: "white",
                marginTop: "20px",
                "&:hover": {
                  backgroundColor: "#555",
                },
              }}
            >
              Sign In
            </Button>

            <Divider sx={{ margin: "20px 0" }} />
          </form>
        </Box>
      </Container>

      <ToastContainer />
    </Box>
  );
};

export default LoginPage;

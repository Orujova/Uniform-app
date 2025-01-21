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

// Professional uniform management images
const carouselImages = [
  {
    url: "https://uniformsbyunitec.com/wp-content/uploads/2024/02/Workers-in-a-Warehouse.jpg",
    title: "Distribution Management",
  },
  {
    url: "https://plus.unsplash.com/premium_photo-1671469875519-944b48b1520e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Transaction",
  },
  {
    url: "https://smartfill.store/wp-content/uploads/2024/04/Why-stock-control-is-important-for-businesses-of-any-size.jpeg",
    title: "Stock Control",
  },
  {
    url: "https://www.shutterstock.com/image-photo/portrait-young-asian-workers-holding-260nw-2233098729.jpg",
    title: "Uniforms Management",
  },
];

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

        if (Array.isArray(roleId) && roleId.length > 0) {
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
    <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f0f2f5" }}>
      <Carousel
        autoPlay
        interval={4000}
        indicators={false}
        navButtonsAlwaysVisible={true}
        animation="slide"
        duration={800}
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
                backgroundColor: "rgba(0, 68, 102, 0.5)",
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
        {carouselImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: "relative",
              height: "100vh",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 68, 102, 0.7)",
                zIndex: 1,
              },
            }}
          >
            <Box
              sx={{
                backgroundImage: `url(${image.url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100%",
              }}
            />
            <Typography
              variant="h3"
              sx={{
                position: "absolute",
                bottom: "20%",
                left: "50px",
                color: "white",
                zIndex: 2,
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {image.title}
            </Typography>
          </Box>
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
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{ marginBottom: "10px", color: "#004466", fontWeight: "600" }}
          >
            Uniform
          </Typography>
          <Typography
            variant="body1"
            sx={{ marginBottom: "20px", color: "#666" }}
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
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#004466" },
                  "&.Mui-focused fieldset": { borderColor: "#004466" },
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
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#004466" },
                  "&.Mui-focused fieldset": { borderColor: "#004466" },
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
                backgroundColor: "#004466",
                color: "white",
                marginTop: "20px",
                padding: "12px",
                fontSize: "16px",
                "&:hover": {
                  backgroundColor: "#003355",
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

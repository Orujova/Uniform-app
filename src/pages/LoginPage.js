import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../redux/authActions";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CssBaseline,
  IconButton,
  InputAdornment,
  Link,
  Fade,
  Slide,
  Avatar,
  Stack,
} from "@mui/material";
import { keyframes } from "@mui/system";
import Carousel from "react-material-ui-carousel";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Visibility,
  VisibilityOff,
  PersonOutline,
  LockOutlined,
  Storefront,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// --- Data ---
const carouselImages = [
  {
    url: "https://uniformsbyunitec.com/wp-content/uploads/2024/02/Workers-in-a-Warehouse.jpg",
    title: "Intelligent Distribution",
  },
  {
    url: "https://plus.unsplash.com/premium_photo-1671469875519-944b48b1520e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Seamless Transactions",
  },
  {
    url: "https://smartfill.store/wp-content/uploads/2024/04/Why-stock-control-is-important-for-businesses-of-any-size.jpeg",
    title: "Effective Stock Control",
  },
  {
    url: "https://www.shutterstock.com/image-photo/portrait-young-asian-workers-holding-260nw-2233098729.jpg",
    title: "Modern Uniform Management",
  },
];
const ROLE_ROUTES = {
  1: "/transaction",
  9: "/stock",
  3: "/transaction",
  12: "/responses/operation",
  10: "/requests",
  7: "/payroll",
  2: "/transaction",
  4: "/transaction",
  8: "/reports/stock",
  11: "/reports/stock",
};

const kenburnsAnimations = [
  keyframes`0% { transform: scale(1.1) translate(-2%, -2%); } 100% { transform: scale(1) translate(0, 0); }`,
  keyframes`0% { transform: scale(1.1) translate(2%, 2%); } 100% { transform: scale(1) translate(0, 0); }`,
  keyframes`0% { transform: scale(1); } 100% { transform: scale(1.1); }`,
  keyframes`0% { transform: scale(1.1) translate(-2%, 2%); } 100% { transform: scale(1) translate(0, 0); }`,
];
const revealGradient = keyframes`
  from { transform: scaleY(0); transform-origin: bottom; }
  to { transform: scaleY(1); transform-origin: bottom; }
`;
const revealText = keyframes`
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
`;
// --- End of Data ---

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const success = await dispatch(login(username, password));
      if (success) {
        toast.success("Login successful. Redirecting...");
        setTimeout(() => {
          const userDataString = localStorage.getItem("userData");
          if (!userDataString) {
            toast.error("Authentication session error. Please log in again.");
            return;
          }
          const userData = JSON.parse(userDataString);
          const { roleId } = userData;
          if (Array.isArray(roleId) && roleId.length > 0) {
            const primaryRole = Math.min(...roleId);
            const redirectPath = ROLE_ROUTES[primaryRole];
            if (redirectPath) {
              navigate(redirectPath);
            } else {
              toast.error("No valid route found for this user role.");
            }
          } else {
            toast.error("No roles assigned to the user.");
          }
        }, 2000);
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login.");
    }
  };
  // --- End of Logic ---

  return (
    <>
      <CssBaseline />
      <Grid container component="main" sx={{ height: "100vh" }}>
        {/* --- CAROUSEL (SOL TARAF) --- */}
        <Grid
          item
          xs={false}
          sm={7}
          md={7}
          sx={{
            display: { xs: "none", sm: "block" },
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Carousel
            autoPlay
            interval={6000}
            animation="slide"
            duration={1000}
            indicators={true}
            navButtonsAlwaysVisible={true}
            onChange={(index) => setActiveStep(index)}
            indicatorIconButtonProps={{
              style: { padding: "8px", color: "rgba(255, 255, 255, 0.5)" },
            }}
            activeIndicatorIconButtonProps={{ style: { color: "#ffffff" } }}
            indicatorContainerProps={{
              style: {
                position: "absolute",
                bottom: "40px",
                textAlign: "center",
                zIndex: 3,
              },
            }}
            NavButton={({ onClick, next }) => (
              <IconButton
                onClick={onClick}
                sx={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.2)",
                  backdropFilter: "blur(4px)",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.4)" },
                  [next ? "right" : "left"]: 20,
                  zIndex: 3,
                }}
              >
                {next ? (
                  <KeyboardArrowRight fontSize="large" />
                ) : (
                  <KeyboardArrowLeft fontSize="large" />
                )}
              </IconButton>
            )}
            sx={{ height: "100%", width: "100%" }}
          >
            {carouselImages.map((item, index) => (
              <Box
                key={index}
                sx={{
                  position: "relative",
                  height: "100vh",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `url(${item.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    animation: `${
                      kenburnsAnimations[index % kenburnsAnimations.length]
                    } 20s ease-out infinite alternate`,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(to top, rgba(0, 10, 15, 0.9) 25%, transparent 70%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    p: { xs: 4, md: 8 },
                    animation:
                      activeStep === index
                        ? `${revealGradient} 0.8s ease-out forwards`
                        : "none",
                    transform: "scaleY(0)",
                  }}
                >
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography
                      variant="h2"
                      component="h1"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        textShadow: "2px 3px 8px rgba(0,0,0,0.7)",
                        fontSize: { sm: "2.25rem", md: "3rem", lg: "3.5rem" },
                        opacity: 0,
                        animation:
                          activeStep === index
                            ? `${revealText} 0.9s ease-out forwards`
                            : "none",
                        animationDelay: activeStep === index ? "0.4s" : "0s",
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Carousel>
        </Grid>

        {/* --- LOGIN FORM (SAĞ TARAF) --- */}
        <Grid
          item
          xs={12}
          sm={5}
          md={5}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          }}
        >
          <Slide
            direction="left"
            in={true}
            timeout={700}
            mountOnEnter
            unmountOnExit
          >
            <Box
              sx={{
                p: { xs: 3, sm: 5 },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(12px)",
                borderRadius: "24px",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: 420,
                mx: 2,
                border: "1px solid rgba(255, 255, 255, 0.9)",
              }}
            >
              <Fade in={true} timeout={1000}>
                <Avatar
                  sx={{ m: 1, bgcolor: "primary.main", width: 64, height: 64 }}
                >
                  <Storefront sx={{ fontSize: 40 }} />
                </Avatar>
              </Fade>
              <Fade in={true} timeout={1200}>
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  {" "}
                  <Typography
                    component="h1"
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#101828", mt: 2 }}
                  >
                    {" "}
                    Store Operations{" "}
                  </Typography>{" "}
                  <Typography variant="body1" color="#667085" sx={{ mt: 1 }}>
                    {" "}
                    Please enter your credentials to proceed.{" "}
                  </Typography>{" "}
                </Box>
              </Fade>

              <Stack
                component="form"
                onSubmit={handleSubmit}
                spacing={3}
                sx={{ width: "100%" }}
              >
                <Fade in={true} timeout={1400}>
                  <TextField
                    variant="filled"
                    required
                    fullWidth
                    label="Username or Email"
                    autoComplete="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutline color="action" />
                        </InputAdornment>
                      ),
                      disableUnderline: true,
                    }}
                    sx={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "rgba(230, 230, 240, 0.5)",
                      "&:hover": {
                        backgroundColor: "rgba(220, 220, 230, 0.7)",
                      },
                      "& .MuiFilledInput-root": {
                        backgroundColor: "transparent",
                        "&:focus-within": { backgroundColor: "#fff" },
                      },
                    }}
                  />
                </Fade>
                <Fade in={true} timeout={1600}>
                  <TextField
                    variant="filled"
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      disableUnderline: true,
                    }}
                    sx={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "rgba(230, 230, 240, 0.5)",
                      "&:hover": {
                        backgroundColor: "rgba(220, 220, 230, 0.7)",
                      },
                      "& .MuiFilledInput-root": {
                        backgroundColor: "transparent",
                        "&:focus-within": { backgroundColor: "#fff" },
                      },
                    }}
                  />
                </Fade>
                {error && (
                  <Typography
                    color="error"
                    variant="body2"
                    sx={{ textAlign: "center" }}
                  >
                    {error}
                  </Typography>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <Link href="#" variant="body2" sx={{ fontWeight: 500 }}>
                    {" "}
                    Forgot password?{" "}
                  </Link>
                </Box>

                <Fade in={true} timeout={1800}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      py: 1.5,
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "none",
                      borderRadius: "12px",
                      color: "white",
                      background:
                        "linear-gradient(45deg, #007BFF 30%, #00C6FF 90%)",
                      boxShadow: "0 4px 15px 0 rgba(0, 116, 217, 0.5)",
                      position: "relative",
                      overflow: "hidden",
                      zIndex: 1,
                      transition: "box-shadow 0.3s ease",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background:
                          "linear-gradient(45deg, #46a3ff 30%, #00d4ff 90%)",
                        transform: "translateX(-100%)",
                        transition: "transform 0.4s ease-in-out",
                        zIndex: -1,
                      },
                      "&:hover": {
                        boxShadow: "0 6px 20px 0 rgba(0, 116, 217, 0.6)",
                        "&::before": { transform: "translateX(0)" },
                      },
                    }}
                  >
                    Sign In
                  </Button>
                </Fade>

                <Fade in={true} timeout={2000}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ pt: 4, textAlign: "center" }}
                  >
                    {" "}
                    Don't have an account?{" "}
                    <Link href="#" fontWeight="bold">
                      {" "}
                      Contact Support{" "}
                    </Link>{" "}
                  </Typography>
                </Fade>
              </Stack>
            </Box>
          </Slide>
        </Grid>
      </Grid>
      {/* --- GÜNCELLENDİ: Bildirim konumu sağ üste taşındı --- */}
      <ToastContainer position="top-right" theme="light" />
    </>
  );
};

export default LoginPage;

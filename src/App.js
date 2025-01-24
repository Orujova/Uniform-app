import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromStorage, logout } from "./redux/authActions";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";
import ConfirmationModal from "./components/ConfirmationModal";
import FirstDistribution from "./pages/FirstDistribution";
import Transaction from "./pages/Transaction";
import Stock from "./pages/StockPage";
import UniformsPage from "./pages/UniformsPage";
import PDFsPage from "./pages/PDFsPage";
import PdfUploadPage from "./pages/PdfUploadPage";
import UniformCondition from "./pages/UniformCondition";
import RequestsPage from "./pages/RequestsPage";
import StockResponse from "./pages/StockResponse";
import ManagerResponse from "./pages/ManagerResponse";
import DCResponse from "./pages/DCResponse";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import PayrollPage from "./pages/PayrollPage";
import PayyrolDetucted from "./pages/PayyrolDetucted";
import NotFoundPage from "./pages/NotFoundPage";
import StockRequirements from "./pages/StockRequirements";
import ProvisionReport from "./pages/ProvisionReport";
import ForecastReport from "./pages/ForecastReport";
import Home from "./pages/Home";

const AuthPagesContainer = styled.div`
  min-height: 100vh;
  width: 100%;
`;

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  padding: 20px;
  padding-bottom: 0;
  background-color: #ffffff;
  border-radius: 12px;
  margin-left: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 70%;
  overflow-y: auto;
`;

const AuthLayout = () => {
  return (
    <AuthPagesContainer>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/changePassword" element={<ChangePasswordPage />} />
      </Routes>
    </AuthPagesContainer>
  );
};

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPage, setSelectedPage] = useState("first-distribution");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNavigation = (page) => {
    setSelectedPage(page);
  };

  const handleLogout = async () => {
    try {
      dispatch(logout());
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie =
          name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });

      navigate("/loginPage");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AppContainer>
      <Sidebar
        onSelect={handleNavigation}
        onLogOut={() => setShowLogoutModal(true)}
      />
      <ContentArea>
        <Routes>
          <Route
            path="/distribution"
            element={
              <ProtectedRoute>
                <FirstDistribution />
              </ProtectedRoute>
            }
          />

          <Route
            path="/responses/operation"
            element={
              <ProtectedRoute>
                <ManagerResponse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/responses/dc"
            element={
              <ProtectedRoute>
                <DCResponse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/transaction"
            element={
              <ProtectedRoute>
                <Transaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock"
            element={
              <ProtectedRoute>
                <Stock />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uniforms"
            element={
              <ProtectedRoute>
                <UniformsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documents/handover"
            element={
              <ProtectedRoute>
                <PDFsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents/upload"
            element={
              <ProtectedRoute>
                <PdfUploadPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/condition"
            element={
              <ProtectedRoute>
                <UniformCondition />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/responses/bgs"
            element={
              <ProtectedRoute>
                <StockResponse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <PayrollPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payroll/deductions"
            element={
              <ProtectedRoute>
                <PayyrolDetucted />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/stock"
            element={
              <ProtectedRoute>
                <StockRequirements />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/provision"
            element={
              <ProtectedRoute>
                <ProvisionReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/forecast"
            element={
              <ProtectedRoute>
                <ForecastReport />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </ContentArea>

      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          handleLogout();
          setShowLogoutModal(false);
        }}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        confirmButtonText="Logout"
        cancelButtonText="Cancel"
        confirmButtonColor="#ef4444"
      />
    </AppContainer>
  );
};
const AppContent = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await dispatch(loadUserFromStorage());
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [dispatch]);

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/changePassword";

  // Show nothing while checking authentication
  if (isLoading) {
    return null; // or return a loading spinner
  }

  // Only redirect to login if not authenticated, not on an auth page, and there's no token
  if (!isAuthenticated && !isAuthPage && !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return isAuthPage ? <AuthLayout /> : <MainLayout />;
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!isAuthenticated && !token) {
        navigate("/login", { replace: true, state: { from: location } });
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [isAuthenticated, navigate, location]);

  if (isChecking) {
    return null; // or return a loading spinner
  }

  return isAuthenticated || localStorage.getItem("token") ? children : null;
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;

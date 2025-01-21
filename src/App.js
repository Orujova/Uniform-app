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

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/loginPage", { replace: true, state: { from: location } });
    }
  }, [isAuthenticated, navigate, location]);

  return isAuthenticated ? children : null;
};

const AuthLayout = () => {
  return (
    <AuthPagesContainer>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/not-found" element={<NotFoundPage />} />
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
            path="/first-distribution"
            element={
              <ProtectedRoute>
                <FirstDistribution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/managerResponse"
            element={
              <ProtectedRoute>
                <ManagerResponse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dCResponse"
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
            path="/handover-packing"
            element={
              <ProtectedRoute>
                <PDFsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-pdf"
            element={
              <ProtectedRoute>
                <PdfUploadPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/uniformcondition"
            element={
              <ProtectedRoute>
                <UniformCondition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requestsPage"
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stockResponse"
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
            path="/payrollDeduct"
            element={
              <ProtectedRoute>
                <PayyrolDetucted />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-requirement"
            element={
              <ProtectedRoute>
                <StockRequirements />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provision-detail"
            element={
              <ProtectedRoute>
                <ProvisionReport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forecast-report"
            element={
              <ProtectedRoute>
                <ForecastReport />
              </ProtectedRoute>
            }
          />
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
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const isAuthPage =
    location.pathname === "/loginPage" ||
    location.pathname === "/register" ||
    location.pathname === "/changePassword" ||
    location.pathname === "/not-found";

  // Redirect to login if not authenticated and not on an auth page
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/loginPage" replace />;
  }

  return isAuthPage ? <AuthLayout /> : <MainLayout />;
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;

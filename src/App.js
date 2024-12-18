import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUserFromStorage, logout } from "./redux/authActions";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";
import FirstDistribution from "./pages/FirstDistribution";
import Transaction from "./pages/Transaction";
import Stock from "./pages/StockPage";
import UniformsPage from "./pages/UniformsPage";
import PDFsPage from "./pages/PDFsPage";
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
  background-color: #ffffff;
  border-radius: 12px;
  margin: 12px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 70%;
`;

const AuthLayout = () => {
  return (
    <AuthPagesContainer>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/loginPage" element={<LoginPage />} />
        <Route path="/changePassword" element={<ChangePasswordPage />} />
      </Routes>
    </AuthPagesContainer>
  );
};

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedPage, setSelectedPage] = useState("first-distribution");

  const handleNavigation = (page) => {
    setSelectedPage(page);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
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
    }
  };

  return (
    <AppContainer>
      <Sidebar onSelect={handleNavigation} onLogOut={handleLogout} />
      <ContentArea>
        <Routes>
          <Route path="/first-distribution" element={<FirstDistribution />} />
          <Route path="/managerResponse" element={<ManagerResponse />} />
          <Route path="/dCResponse" element={<DCResponse />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/uniforms" element={<UniformsPage />} />
          <Route path="/pdfs" element={<PDFsPage />} />
          <Route path="/uniformcondition" element={<UniformCondition />} />
          <Route path="/requestsPage" element={<RequestsPage />} />
          <Route path="/stockResponse" element={<StockResponse />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/payrollDeduct" element={<PayyrolDetucted />} />
        </Routes>
      </ContentArea>
    </AppContainer>
  );
};

const AppContent = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const isAuthPage =
    location.pathname === "/loginPage" ||
    location.pathname === "/register" ||
    location.pathname === "/changePassword";

  return isAuthPage ? <AuthLayout /> : <MainLayout />;
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;

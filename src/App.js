import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "./redux/authActions";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";
import FirstDistribution from "./pages/FirstDistribution";
import Distribution from "./pages/Distribution";
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
// import UserCreatingPage from "./pages/UserCreatingPage ";
import RegisterPage from "./pages/RegisterPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// Auth səhifələri üçün container
const AuthPagesContainer = styled.div`
  min-height: 100vh;
  width: 100%;
`;

// Əsas app layoutu üçün container
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
  margin: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 80%;
`;

// Auth layoutu üçün ayrı komponent
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

// Əsas app layoutu üçün komponent
const MainLayout = () => {
  const [selectedPage, setSelectedPage] = useState("first-distribution");

  const handleNavigation = (page) => {
    setSelectedPage(page);
  };

  const handleLogout = () => {
    alert("Logging out...");
  };

  return (
    <AppContainer>
      <Sidebar onSelect={handleNavigation} onLogOut={handleLogout} />
      <ContentArea>
        <Routes>
          <Route path="/first-distribution" element={<FirstDistribution />} />
          <Route path="/managerResponse" element={<ManagerResponse />} />
          <Route path="/dCResponse" element={<DCResponse />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/uniforms" element={<UniformsPage />} />
          <Route path="/pdfs" element={<PDFsPage />} />
          <Route path="/uniformcondition" element={<UniformCondition />} />
          <Route path="/requestsPage" element={<RequestsPage />} />
          <Route path="/stockResponse" element={<StockResponse />} />
        </Routes>
      </ContentArea>
    </AppContainer>
  );
};

const AppContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  const location = useLocation();
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

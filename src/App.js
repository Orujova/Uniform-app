import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";
import FirstDistribution from "./pages/FirstDistribution";
import Distribution from "./pages/Distribution";
import Transaction from "./pages/Transaction";
import Stock from "./pages/StockPage";
import UniformsPage from "./pages/UniformsPage"; // New UniformsPage
import PDFsPage from "./pages/PDFsPage";
import UniformCondition from "./pages/UniformCondition";
import RequestsPage from "./pages/RequestsPage";

// Main Application Layout with Sidebar and Content
const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
`;

// Content area next to the sidebar
const ContentArea = styled.div`
  flex-grow: 1;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  margin: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const App = () => {
  const [selectedPage, setSelectedPage] = useState("first-distribution");

  // Handle Sidebar Navigation
  const handleNavigation = (page) => {
    setSelectedPage(page);
  };

  // Mock logout function
  const handleLogout = () => {
    alert("Logging out...");
  };

  return (
    <Router>
      <AppContainer>
        {/* Sidebar Component */}
        <Sidebar onSelect={handleNavigation} onLogOut={handleLogout} />

        {/* Main Content Area */}
        <ContentArea>
          <Routes>
            <Route path="/first-distribution" element={<FirstDistribution />} />
            <Route path="/distribution" element={<Distribution />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/stock" element={<Stock />} />
            <Route path="/uniforms" element={<UniformsPage />} />{" "}
            <Route path="/pdfs" element={<PDFsPage />} />
            <Route path="/uniformcondition" element={<UniformCondition />} />
            <Route path="/requestsPage" element={<RequestsPage />} />
          </Routes>
        </ContentArea>
      </AppContainer>
    </Router>
  );
};

export default App;

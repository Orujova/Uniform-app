import React, { useState } from "react";
import styled from "styled-components";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomButton from "./CustomButton"; // Ensure CustomButton is correctly imported

// Styled Sidebar Container with light theme
const SidebarContainer = styled.div`
  width: 240px;
  background-color: #ffffff; /* Clean white background */
  color: #2d3a45; /* Dark gray text */
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.03);
  border-radius: 12px;
`;

// Container for Menu Items with light padding
const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// User Profile Section with lighter colors
const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e6e9ec;
  margin-bottom: 16px;
`;

// Modern Typography for User Info
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 16px;
  font-weight: bold;
  color: #2d3a45;
`;

const UserRole = styled.span`
  font-size: 14px;
  color: #7d8996;
`;

// Sidebar Button with pastel hover effect
const SidebarButton = styled.button`
  background: ${(props) => (props.active ? "#4A90E2" : "transparent")};
  color: ${(props) => (props.active ? "#FFFFFF" : "#2D3A45")};
  border: none;
  padding: 12px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: ${(props) =>
    props.active ? "0px 4px 12px rgba(74, 144, 226, 0.2)" : "none"};

  &:hover {
    background: #b3d4fc;
    color: #2d3a45;
  }
`;

// Log Out Button with light styling
const LogOutButton = styled(CustomButton)`
  background-color: #f76c6c !important; /* Soft salmon for log out */
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  font-size: 16 px;
  border-radius: 8px;

  &:hover {
    background-color: #ff8989;
  }
`;

const Sidebar = ({
  onSelect,
  onLogOut,
  user = { username: "Shahin Babazade", role: "HR" },
}) => {
  const navigate = useNavigate();
  const [active, setActive] = useState("firstDist");

  const menuItems = [
    {
      label: "First Distribution",
      value: "first-dist",
      path: "/first-distribution",
    },
    { label: "Distribution", value: "distribution", path: "/distribution" },
    { label: "Transaction", value: "transaction", path: "/transaction" },
    {
      label: "Projects",
      value: "projects",
      path: "/handover-pdf-list",
    },
    {
      label: "Uniform Condition",
      value: "uniformcondition",
      path: "/uniformcondition",
    },
    { label: "Stock", value: "stock", path: "/stock" }, // Consolidated Stock item
    { label: "Uniforms", value: "uniforms", path: "/uniforms" },
    {
      label: "BGS Stock Requests",
      value: "requestsPage",
      path: "/requestsPage",
    },
    {
      label: "Stock Response",
      value: "stockResponse",
      path: "/stock-response",
    },
    { label: "Payroll", value: "payroll", path: "/payroll" },
    { label: "PDF", value: "pdfs", path: "/pdfs" },
  ];

  const handleSelect = (item) => {
    setActive(item.value);
    onSelect(item.value);
    navigate(item.path); // Use navigate to change the URL
  };

  return (
    <SidebarContainer>
      {/* User Profile Section */}
      <div>
        <UserProfile>
          <FaUserCircle size={48} color="#7D8996" />
          <UserInfo>
            <Username>{user.username}</Username>
            <UserRole>{user.role}</UserRole>
          </UserInfo>
        </UserProfile>

        {/* Menu Items */}
        <MenuContainer>
          {menuItems.map((item) => (
            <SidebarButton
              key={item.value}
              active={active === item.value}
              onClick={() => handleSelect(item)}
            >
              {item.label}
            </SidebarButton>
          ))}
        </MenuContainer>
      </div>

      {/* Log Out Button */}
      <LogOutButton onClick={onLogOut}>
        <FaSignOutAlt style={{ marginRight: "8px" }} /> Log Out
      </LogOutButton>
    </SidebarContainer>
  );
};

export default Sidebar;

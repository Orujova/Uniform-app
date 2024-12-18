import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaKey,
  FaChevronDown,
  FaUserPlus,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Styled Components
const SidebarContainer = styled.div`
  background-color: #ffffff;
  color: #2d3a45;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  min-height: 95vh;
  position: relative;
  width: 20%;
  // margin: 12px 0 0 0;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const UserProfile = styled.div`
  position: relative;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e6e9ec;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
    border-color: #d1d5db;
  }
`;

const UserProfileContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
`;

const UserInfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #2d3a45;
`;

const UserRole = styled.span`
  font-size: 14px;
  color: #7d8996;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
  overflow: hidden;
  border: 1px solid #e6e9ec;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  transform: translateY(${(props) => (props.isOpen ? "0" : "-10px")});
  transition: all 0.3s ease;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${(props) => (props.isLogout ? "#f76c6c" : "#2d3a45")};
  transition: all 0.2s ease;
  cursor: pointer;
  border-top: ${(props) => (props.isLogout ? "1px solid #e6e9ec" : "none")};
  margin-top: ${(props) => (props.isLogout ? "4px" : "0")};

  &:hover {
    background-color: ${(props) => (props.isLogout ? "#fff1f1" : "#f8f9fa")};
    color: ${(props) => (props.isLogout ? "#ff8989" : "#4a90e2")};
  }
`;

const GroupHeader = styled.div`
  padding: 14px 16px;
  font-weight: 600;
  color: #2d3a45;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  ${(props) =>
    props.isOpen &&
    `
    background-color: #EDF2FF;
    color: #4A90E2;
  `}
`;

const GroupContent = styled.div`
  padding-left: 16px;
  max-height: ${(props) => (props.isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease;
`;

const SidebarButton = styled.button`
  background: ${(props) => (props.active ? "#EDF2FF" : "transparent")};
  color: ${(props) => (props.active ? "#4A90E2" : "#2d3a45")};
  border: none;
  padding: 14px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  box-shadow: ${(props) =>
    props.active ? "0px 4px 12px rgba(74, 144, 226, 0.1)" : "none"};

  &:hover {
    background: ${(props) => (props.active ? "#EDF2FF" : "#f8f9fa")};
    transform: translateX(${(props) => (props.active ? "0" : "4px")});
  }
`;

const ChevronIcon = styled(FaChevronDown)`
  transition: transform 0.3s ease;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const Sidebar = ({ onSelect, onLogOut }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState("firstDist");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("userData"));

  const menuGroups = {
    distribution: {
      label: "Distribution Management",
      items: [
        {
          label: "First Distribution",
          value: "first-dist",
          path: "/first-distribution",
        },
        { label: "DC Stock", value: "stock", path: "/stock" },
        { label: "DC Response", value: "dCResponse", path: "/dCResponse" },
        {
          label: "BGS Response",
          value: "stockResponse",
          path: "/stockResponse",
        },
      ],
    },
    payroll: {
      label: "Payroll Management",
      items: [
        { label: "Payroll", value: "payroll", path: "/payroll" },
        {
          label: "Payroll Deducted",
          value: "payrollDeduct",
          path: "/payrollDeduct",
        },
      ],
    },
  };

  const standaloneItems = [
    {
      label: "BGS Stock Requests",
      value: "requestsPage",
      path: "/requestsPage",
    },
    { label: "Transaction", value: "transaction", path: "/transaction" },
    {
      label: "Manager Response",
      value: "ManagerResponse",
      path: "/managerResponse",
    },
    {
      label: "Uniform Condition",
      value: "uniformcondition",
      path: "/uniformcondition",
    },
    { label: "Uniforms", value: "uniforms", path: "/uniforms" },
    { label: "PDF", value: "pdfs", path: "/pdfs" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleSelect = (item) => {
    setActive(item.value);
    onSelect(item.value);
    navigate(item.path);
  };

  const handleChangePassword = () => {
    navigate("/changePassword");
    setIsUserDropdownOpen(false);
  };

  const handleLogOut = () => {
    onLogOut();
    setIsUserDropdownOpen(false);
  };

  const handleCreateUser = () => {
    navigate("/register");
    setIsUserDropdownOpen(false);
  };

  return (
    <SidebarContainer>
      <div>
        <UserProfile
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          ref={dropdownRef}
        >
          <UserProfileContent>
            <UserInfoSection>
              <FaUserCircle size={38} color="#4A90E2" />
              <UserInfo>
                <Username>{user.fullName}</Username>
                <UserRole>{user.email}</UserRole>
              </UserInfo>
            </UserInfoSection>
            <ChevronIcon isOpen={isUserDropdownOpen} />
          </UserProfileContent>

          <DropdownMenu isOpen={isUserDropdownOpen}>
            <DropdownItem onClick={handleCreateUser}>
              <FaUserPlus size={16} />
              Create User
            </DropdownItem>
            <DropdownItem onClick={handleChangePassword}>
              <FaKey size={16} />
              Change Password
            </DropdownItem>
            <DropdownItem isLogout onClick={handleLogOut}>
              <FaSignOutAlt size={16} />
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </UserProfile>

        <MenuContainer>
          {/* Grouped Items */}
          {Object.entries(menuGroups).map(([key, group]) => (
            <div key={key}>
              <GroupHeader
                isOpen={openGroups[key]}
                onClick={() => toggleGroup(key)}
              >
                {group.label}
                <ChevronIcon isOpen={openGroups[key]} />
              </GroupHeader>
              <GroupContent isOpen={openGroups[key]}>
                {group.items.map((item) => (
                  <SidebarButton
                    key={item.value}
                    active={active === item.value}
                    onClick={() => handleSelect(item)}
                  >
                    {item.label}
                  </SidebarButton>
                ))}
              </GroupContent>
            </div>
          ))}

          {/* Standalone Items */}
          {standaloneItems.map((item) => (
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
    </SidebarContainer>
  );
};

export default Sidebar;

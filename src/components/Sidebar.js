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
import WorkDaysModal from "../components/WeekdayManager";

const SidebarContainer = styled.div`
  background-color: #ffffff;
  color: #2d3a45;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  height: 95vh;
  position: relative;
  width: 20%;
  overflow: hidden;
`;

const ScrollableContent = styled.div`
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;

  /* Custom Scrollbar Styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
    margin: 8px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: #e6e9ec;
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }

  /* Firefox Scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #e6e9ec transparent;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-bottom: 20px;
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
  opacity: ${(props) => (props.disabled ? "0.5" : "1")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background: ${(props) => (props.active ? "#EDF2FF" : "#f8f9fa")};
    transform: ${(props) => (props.disabled ? "none" : "translateX(4px)")};
  }
`;

const WorkDayButton = styled.button`
  background: ${(props) =>
    props.active ? "#EDF2FF" : "linear-gradient(to right, #f8f9fa, #ffffff)"};

  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  padding: 14px 16px;
  border-radius: 10px;
  border: none;

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
  const [showWorkDaysModal, setShowWorkDaysModal] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const hasRole3 = user.roleId?.includes(3);

  const menuGroups = {
    distribution: {
      label: "Distribution Management",
      items: [
        {
          label: "First Distribution",
          value: "first-dist",
          path: "/distribution",
          allowedRoles: [3, 2, 9],
        },
        {
          label: "DC Stock",
          value: "stock",
          path: "/stock",
          allowedRoles: [3, 2, 9, 4, 10, 12],
        },
        {
          label: "DC Response - Store Order",
          value: "dCResponse",
          path: "/responses/dc",
          allowedRoles: [3, 4, 2, 1, 9],
        },
        {
          label: "DC Response - BGS Order",
          value: "stockResponse",
          path: "/responses/bgs",
          allowedRoles: [3, 2, 9],
        },
      ],
    },
    payroll: {
      label: "Payroll Management",
      items: [
        {
          label: "Payroll",
          value: "payroll",
          path: "/payroll",
          allowedRoles: [3, 2, 7],
        },
        {
          label: "Payroll Deducted",
          value: "payrollDeduct",
          path: "/payroll/deductions",
          allowedRoles: [3, 2, 7],
        },
      ],
    },
    PDFs: {
      label: "PDF Management",
      items: [
        {
          label: "Handover & Packing List",
          value: "handover-packing",
          path: "/documents/handover",
          allowedRoles: [3, 4, 2, 1, 9, 10, 12],
        },
        {
          label: "Upload PDF",
          value: "upload-pdf",
          path: "/documents/upload",
          allowedRoles: [3, 4, 2, 1, 9, 10, 12, 7],
        },
      ],
    },
    Reports: {
      label: "Report Management",
      items: [
        {
          label: "Stock Requirements",
          value: "stock-requirement",
          path: "/reports/stock",
          allowedRoles: [3, 9, 10, 4, 2, 8, 11, 12],
        },
        {
          label: "Provision Details",
          value: "provision-detail",
          path: "/reports/provision",
          allowedRoles: [3, 9, 10, 4, 2, 8, 11, 12],
        },
        {
          label: "Forecast Report",
          value: "forecast-report",
          path: "/reports/forecast",
          allowedRoles: [3, 9, 10, 4, 2, 8, 11, 12],
        },
      ],
    },
  };

  const standaloneItems = [
    {
      label: "BGS Stock Requests",
      value: "requestsPage",
      path: "/requests",
      allowedRoles: [3, 2, 10, 4, 9],
    },
    {
      label: "Transaction",
      value: "transaction",
      path: "/transaction",
      allowedRoles: [3, 4, 2, 1, 8, 12, 9, 11],
    },
    {
      label: "Operation Response",
      value: "OperationResponse",
      path: "/responses/operation",
      allowedRoles: [3, 4, 2, 11, 12],
    },
    {
      label: "Uniform Condition",
      value: "uniformcondition",
      path: "/condition",
      allowedRoles: [3, 4, 2, 12],
    },
    {
      label: "Uniforms",
      value: "uniforms",
      path: "/uniforms",
      allowedRoles: [3, 4, 2, 9, 10],
    },
  ];

  const hasAccess = (allowedRoles) => {
    if (!user.roleId) return false;
    return allowedRoles.some((role) => user.roleId.includes(role));
  };

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
    if (!hasAccess(item.allowedRoles)) return;

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
      <ScrollableContent>
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
                    disabled={!hasAccess(item.allowedRoles)}
                  >
                    {item.label}
                  </SidebarButton>
                ))}
              </GroupContent>
            </div>
          ))}

          {standaloneItems.map((item) => (
            <SidebarButton
              key={item.value}
              active={active === item.value}
              onClick={() => handleSelect(item)}
              disabled={!hasAccess(item.allowedRoles)}
            >
              {item.label}
            </SidebarButton>
          ))}

          {hasRole3 && (
            <WorkDayButton onClick={() => setShowWorkDaysModal(true)}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#4A90E2",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Work days
              </div>
            </WorkDayButton>
          )}
        </MenuContainer>
      </ScrollableContent>
      <WorkDaysModal
        isOpen={showWorkDaysModal}
        onClose={() => setShowWorkDaysModal(false)}
      />
    </SidebarContainer>
  );
};

export default Sidebar;

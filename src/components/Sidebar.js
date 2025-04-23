import React, { useState, useRef, useEffect, useCallback } from "react"; // useCallback eklendi
import styled from "styled-components";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaKey,
  FaChevronDown,
  FaUserPlus,
  FaCalendarAlt, // Changed from SVG to icon
  FaShoppingCart, // Added icon for trolley
  // *** EKLENDİ: Yönetim grupları için ikonlar (opsiyonel) ***
  FaClipboardList,
  FaCashRegister,
  FaFilePdf,
  FaChartBar,
  FaTruckLoading, // Örnek ikonlar
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import WorkDaysModal from "../components/WeekdayManager";
import TrolleyWorkDaysModal from "../components/TrolleyCountingAllowDay"; // Import the new modal

const SidebarContainer = styled.div`
  /* ... önceki stillemeler ... */
  background-color: #ffffff;
  color: #2d3a45;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  height: 94.5vh;
  position: relative;
  width: 20%;
  overflow: hidden;
`;
const ScrollableContent = styled.div`
  /* ... önceki stillemeler ... */
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
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
  scrollbar-width: thin;
  scrollbar-color: #e6e9ec transparent;
`;
const MenuContainer = styled.div`
  /* ... önceki stillemeler ... */
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-bottom: 20px;
`;
const UserProfile = styled.div`
  /* ... önceki stillemeler ... */
  position: relative;
  cursor: pointer;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #e6e9ec;
  transition: all 0.3s ease;
  max-width: 100%;
  &:hover {
    background-color: #f8f9fa;
    border-color: #d1d5db;
  }
`;
const UserProfileContent = styled.div`
  /* ... önceki stillemeler ... */
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`;
const UserInfoSection = styled.div`
  /* ... önceki stillemeler ... */
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
`;
const UserAvatar = styled(FaUserCircle)`
  /* ... önceki stillemeler ... */
  flex-shrink: 0;
  min-width: 38px;
`;
const UserInfo = styled.div`
  /* ... önceki stillemeler ... */
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
`;
const Username = styled.span`
  /* ... önceki stillemeler ... */
  font-size: 14px;
  font-weight: 600;
  color: #2d3a45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;
const UserRole = styled.span`
  /* ... önceki stillemeler ... */
  font-size: 14px;
  color: #7d8996;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;
const ChevronContainer = styled.div`
  /* ... önceki stillemeler ... */
  flex-shrink: 0;
`;
const DropdownMenu = styled.div`
  /* ... önceki stillemeler ... */
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
  /* ... önceki stillemeler ... */
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
  /* ... önceki stillemeler ... */
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
  ${(props) => props.isOpen && ` background-color: #EDF2FF; color: #4A90E2; `}
`;
const GroupContent = styled.div`
  /* ... önceki stillemeler ... */
  padding-left: 16px;
  max-height: ${(props) => (props.isOpen ? "500px" : "0")};
  overflow: hidden;
  transition: all 0.3s ease;
`;
const SidebarButton = styled.button`
  /* ... önceki stillemeler ... */
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
const ManagementButton = styled.button`
  /* ... önceki stillemeler ... */
  background: linear-gradient(to right, #f8f9fa, #ffffff);
  color: #4a90e2;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  padding: 14px 16px;
  border-radius: 10px;
  border: none;
  width: 100%;
  text-align: left;
  transition: all 0.3s ease;
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
`;
const ChevronIcon = styled(FaChevronDown)`
  /* ... önceki stillemeler ... */
  transition: transform 0.3s ease;
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0)")};
`;

const Sidebar = ({ onSelect, onLogOut }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState("firstDist");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [showWorkDaysModal, setShowWorkDaysModal] = useState(false);
  const [showTrolleyModal, setShowTrolleyModal] = useState(false);
  const dropdownRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const hasRole3 = user.roleId?.includes(3); // Admin rolü (3) kontrolü

  // *** GÜNCELLENDİ: Menu grupları ve standalone itemlar ***
  const menuGroups = {
    distribution: {
      label: "Distribution Management",
      icon: FaTruckLoading, // İkon eklendi
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
      icon: FaCashRegister, // İkon eklendi
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
      icon: FaFilePdf, // İkon eklendi
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
      icon: FaChartBar, // İkon eklendi
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
    // *** YENİ: Trolley Management Grubu ***
    trolleyMgmt: {
      label: "Trolley Management",
      icon: FaShoppingCart, // İkon eklendi
      items: [
        {
          label: "Trolley Types",
          value: "trolley-types",
          path: "/trolley-types",
          allowedRoles: [3, 12],
        },
        {
          label: "Trolley Records",
          value: "trolleys",
          path: "/trolleys",
          allowedRoles: [3, 1, 12],
        },
        // Trolley Counting Days butonu admin ise grup içine alınabilir (opsiyonel)
        // Veya Management butonları ayrı kalabilir, mevcut haliyle devam ediyoruz
      ],
    },
    // *** --- ***
  };

  // Standalone item'lar arasından Trolley ve Trolley Types kaldırıldı
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
      allowedRoles: [3, 4, 2, 12, 9],
    },
    {
      label: "Uniforms",
      value: "uniforms",
      path: "/uniforms",
      allowedRoles: [3, 4, 2, 9, 10],
    },
    // Trolley ile ilgili olanlar yukarıdaki gruba taşındı
  ];

  // Rol kontrol fonksiyonu (Aynı)
  const hasAccess = (allowedRoles) => {
    /* ... */ if (!user.roleId) return false;
    return allowedRoles.some((role) => user.roleId.includes(role));
  };

  // Dışarı tıklama eventi (Aynı)
  useEffect(() => {
    /* ... */ const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Grup açma/kapama fonksiyonu (Aynı)
  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Menü elemanı seçme (Aynı)
  const handleSelect = (item) => {
    if (!hasAccess(item.allowedRoles)) return;
    setActive(item.value || item.path);
    /* value yoksa path kullan */ onSelect(item.value || item.path);
    navigate(item.path);
  };

  // Şifre değiştirme (Aynı)
  const handleChangePassword = () => {
    navigate("/changePassword");
    setIsUserDropdownOpen(false);
  };

  // Çıkış yapma (Aynı)
  const handleLogOut = () => {
    onLogOut();
    setIsUserDropdownOpen(false);
  };

  // Kullanıcı oluşturma (Aynı)
  const handleCreateUser = () => {
    navigate("/register");
    setIsUserDropdownOpen(false);
  };

  return (
    <SidebarContainer>
      <ScrollableContent>
        {/* Kullanıcı Profili ve Dropdown (Aynı) */}
        <UserProfile
          onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          ref={dropdownRef}
        >
          <UserProfileContent>
            {" "}
            <UserInfoSection>
              {" "}
              <UserAvatar size={38} color="#4A90E2" />{" "}
              <UserInfo>
                {" "}
                <Username>{user.fullName}</Username>{" "}
                <UserRole>{user.email}</UserRole>{" "}
              </UserInfo>{" "}
            </UserInfoSection>{" "}
            <ChevronContainer>
              {" "}
              <ChevronIcon isOpen={isUserDropdownOpen} />{" "}
            </ChevronContainer>{" "}
          </UserProfileContent>
          <DropdownMenu isOpen={isUserDropdownOpen}>
            {" "}
            {hasRole3 && (
              <DropdownItem onClick={handleCreateUser}>
                {" "}
                <FaUserPlus size={16} /> Create User{" "}
              </DropdownItem>
            )}{" "}
            <DropdownItem onClick={handleChangePassword}>
              {" "}
              <FaKey size={16} /> Change Password{" "}
            </DropdownItem>{" "}
            <DropdownItem isLogout onClick={handleLogOut}>
              {" "}
              <FaSignOutAlt size={16} /> Log Out{" "}
            </DropdownItem>{" "}
          </DropdownMenu>
        </UserProfile>

        <MenuContainer>
          {/* Grupları Render Et */}
          {Object.entries(menuGroups).map(
            ([key, group]) =>
              // *** Grup başlığına ikon eklendi (opsiyonel) ***
              hasAccess(group.items.flatMap((item) => item.allowedRoles)) && ( // Gruba erişim varsa göster
                <div key={key}>
                  <GroupHeader
                    isOpen={openGroups[key]}
                    onClick={() => toggleGroup(key)}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {group.icon && React.createElement(group.icon)}{" "}
                      {/* İkon varsa göster */}
                      {group.label}
                    </span>
                    <ChevronIcon isOpen={openGroups[key]} />
                  </GroupHeader>
                  <GroupContent isOpen={openGroups[key]}>
                    {group.items.map(
                      (item) =>
                        hasAccess(item.allowedRoles) && ( // Öğeye erişim varsa göster
                          <SidebarButton
                            key={item.value || item.path}
                            active={active === (item.value || item.path)}
                            onClick={() => handleSelect(item)}
                          >
                            {item.label}
                          </SidebarButton>
                        )
                    )}
                  </GroupContent>
                </div>
              )
          )}

          {/* Standalone Item'ları Render Et */}
          {standaloneItems.map(
            (item) =>
              hasAccess(item.allowedRoles) && ( // Öğeye erişim varsa göster
                <SidebarButton
                  key={item.value || item.path}
                  active={active === (item.value || item.path)}
                  onClick={() => handleSelect(item)}
                >
                  {/* İkon eklemek isterseniz buraya ekleyebilirsiniz */}
                  {item.label}
                </SidebarButton>
              )
          )}

          {/* Yönetim Butonları (Admin için) */}
          {hasRole3 && (
            <>
              <ManagementButton onClick={() => setShowWorkDaysModal(true)}>
                {" "}
                <FaCalendarAlt /> Work days{" "}
              </ManagementButton>
              <ManagementButton onClick={() => setShowTrolleyModal(true)}>
                {" "}
                <FaShoppingCart /> Trolley Counting Days{" "}
              </ManagementButton>
            </>
          )}
        </MenuContainer>
      </ScrollableContent>

      {/* Modallar (Aynı) */}
      <WorkDaysModal
        isOpen={showWorkDaysModal}
        onClose={() => setShowWorkDaysModal(false)}
      />
      <TrolleyWorkDaysModal
        isOpen={showTrolleyModal}
        onClose={() => setShowTrolleyModal(false)}
      />
    </SidebarContainer>
  );
};

export default Sidebar;

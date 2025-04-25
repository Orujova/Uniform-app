// src/pages/ManagerResponse.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaEraser, // Alternative/specific icon for Clear
  FaAngleDoubleLeft,  // <-- Bu satırı kontrol edin
  FaAngleDoubleRight,
} from "react-icons/fa";
import Table from "../components/TableOperation"; // Varsayılan yolu kullanıyorum
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import Select from "react-select";

// --- Keyframes (No changes) ---
const fadeIn = keyframes` from { opacity: 0; } to { opacity: 1; } `;
const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;

// --- Base Styling (Colors remain the same) ---
const colors = {
  /* ... Colors remain unchanged ... */ primary: "#3b82f6",
  primaryDark: "#2563eb",
  success: "#10b981",
  successDark: "#059669",
  danger: "#ef4444",
  dangerDark: "#dc2626",
  warning: "#f97316",
  grayLight: "#f3f4f6",
  grayMedium: "#d1d5db",
  grayDark: "#6b7280",
  textPrimary: "#1f2937",
  textSecondary: "#4b5563",
  white: "#ffffff",
  border: "#e5e7eb",
  background: "#f9fafb",
  shadow: "rgba(0, 0, 0, 0.05)",
  tableHeaderBg: "#f9fafb",
};

// --- Styled Components (Compacted Layout & Visuals) ---

const StockContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); /* Adjust 60px based on actual nav height */
  background-color: ${colors.background};
  padding: 0.35rem; /* Reduced padding */
  gap: 0.35rem; /* Reduced gap between major sections */
  overflow: hidden;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Card = styled.div`
  background-color: ${colors.white};
  border-radius: 8px; /* Slightly less radius */
  box-shadow: 0 1px 3px ${colors.shadow};
  border: 1px solid ${colors.border};
`;

// --- Header Kartı (Compacted) ---
const Header = styled(Card)`
  padding: 0.5rem 0.75rem; /* Reduced padding significantly */
  flex-shrink: 0;
`;

const Title = styled.h1`
  margin: 0 0 1.75rem 0; /* Reduced bottom margin */
  font-size: 1.6rem; /* Reduced font size */
  color: ${colors.textPrimary};
  font-weight: 600;
  line-height: 1; /* Tighter line height */
  /* Removed border bottom for compactness */
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem; /* Tighter gap */
  flex-wrap: wrap;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem; /* Very tight gap */
  flex: 1 1 140px; /* Allow shrinking more, smaller base */
  min-width: 130px; /* Minimum width reduced */
`;

const FilterLabel = styled.label`
  font-size: 0.7rem; /* Smaller label */
  color: ${colors.textSecondary};
  font-weight: 500;
  padding-left: 0.1rem;
  margin-bottom: 1px; /* Minimal space */
`;

const BaseInputStyles = `
  padding: 0.4rem 0.6rem; /* Reduced padding */
  border: 1px solid ${colors.border};
  border-radius: 5px; /* Slightly less radius */
  font-size: 0.8rem; /* Slightly smaller font */
  box-sizing: border-box;
  height: 34px; /* Reduced height */
  background-color: ${colors.white};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.04); /* Subtle inset */

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); /* Tighter focus ring */
  }

  &::placeholder {
    color: ${colors.grayMedium}; /* Lighter placeholder */
    font-size: 0.75rem;
  }
`;

const FilterInput = styled.input`
  ${BaseInputStyles}
`;

const customSelectStyles = {
  // Adjusted for 34px height
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused
      ? `1px solid ${colors.primary}`
      : `1px solid ${colors.border}`,
    borderRadius: "5px",
    minHeight: "34px",
    height: "34px",
    boxShadow: state.isFocused
      ? `0 0 0 2px rgba(59, 130, 246, 0.2)`
      : "inset 0 1px 1px rgba(0, 0, 0, 0.04)",
    fontSize: "0.8rem",
    backgroundColor: colors.white,
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      borderColor: state.isFocused ? colors.primary : colors.grayMedium,
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "34px",
    padding: "0 0.6rem",
  }),
  input: (provided) => ({
    ...provided,
    margin: "0px",
    padding: "0px",
    height: "auto",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (provided) => ({ ...provided, height: "34px" }),
  menu: (provided) => ({
    ...provided,
    zIndex: 20,
    border: `1px solid ${colors.border}`,
    borderRadius: "5px",
    boxShadow: `0 3px 8px ${colors.shadow}`,
    marginTop: "3px",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? colors.primary
      : state.isFocused
      ? colors.grayLight
      : colors.white,
    color: state.isSelected ? colors.white : colors.textPrimary,
    fontSize: "0.8rem",
    padding: "6px 10px",
    /* Reduced option padding */ cursor: "pointer",
    "&:active": {
      backgroundColor: !state.isSelected ? colors.primaryDark : undefined,
      color: !state.isSelected ? colors.white : undefined,
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: colors.grayMedium,
    fontSize: "0.75rem",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: colors.grayDark,
    "&:hover": { color: colors.danger },
    cursor: "pointer",
    padding: "5px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: colors.grayDark,
    "&:hover": { color: colors.textPrimary },
    cursor: "pointer",
    padding: "5px",
  }),
};

const ActionButton = styled.button`
  cursor: pointer;
  background-color: ${(props) => props.$bgColor || colors.primary};
  color: ${colors.white};
  padding: 0.4rem 0.8rem; /* Adjusted padding */
  border: none;
  border-radius: 5px;
  font-size: 0.75rem; /* Smaller font */
  font-weight: 500;
  transition: background-color 0.15s, box-shadow 0.15s, transform 0.05s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem; /* Reduced gap */
  white-space: nowrap;
  line-height: 1;
  height: 34px; /* Match input height */

  svg {
    vertical-align: middle;
    font-size: 0.8em; /* Scale icon with text */
  }

  &:hover:not(:disabled) {
    background-color: ${(props) => props.$hoverColor || colors.primaryDark};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  }
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${colors.grayMedium};
    box-shadow: none;
  }
`;

// --- Bulk Actions Kartı (Compacted) ---
const BulkActionsContainer = styled(Card)`
  padding: 0.5rem 1rem; /* Reduced padding */
  display: flex;
  gap: 0.5rem; /* Reduced gap */
  align-items: center;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

// --- Status Badge (Compacted) ---
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px; /* Reduced padding */
  border-radius: 9999px;
  font-size: 0.65rem; /* Very small font */
  font-weight: 500;
  text-transform: capitalize;
  background-color: ${(props) => props.$bgColor};
  color: ${(props) => props.$textColor};
  letter-spacing: 0.2px;
  white-space: nowrap;

  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 4px;
    background-color: ${(props) => props.$dotColor};
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

// --- Clear Button (Made Very Compact) ---
const ClearFilterButton = styled(ActionButton)`
  background-color: ${colors.grayLight};
  color: ${colors.textSecondary};
  font-weight: 500;
  height: 34px; /* Match inputs */
  border: 1px solid ${colors.border};
  box-shadow: none;
  padding: 0 0.6rem; /* Reduced padding */

  svg {
    font-size: 0.9em; /* Slightly larger icon relative to smaller text */
  }
  /* Keep text, but very short */
  span {
    display: inline;
    margin-left: 3px;
    font-size: 0.7rem;
  }

  &:hover:not(:disabled) {
    background-color: ${colors.grayMedium};
    color: ${colors.textPrimary};
    border-color: ${colors.grayMedium};
  }
`;

// Filter Group specifically for the Clear Button, no label, minimal width
const ClearButtonGroup = styled(FilterGroup)`
  flex-grow: 0; /* Don't grow */
  flex-basis: auto; /* Size based on content */
  min-width: auto;
  /* No label needed here */
`;

// --- Table Area (Layout structure remains the same) ---
const TableWrapper = styled(Card)`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden; /* Wrapper scroll hidden */
`;

const TableContainer = styled.div`
  flex: 1;
  overflow: auto; /* Table content scrolls here */
`;

// --- Pagination Kartı (Compacted) ---
const PaginationContainer = styled(Card)`
  padding: 0.35rem 1rem; /* Reduced padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem; /* Reduced gap */
  flex-shrink: 0;
`;

const PaginationInfo = styled.span`
  font-size: 0.75rem; /* Smaller font */
  color: ${colors.textSecondary};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.2rem; /* Tightest gap */
`;

const PaginationButton = styled.button`
  padding: 0;
  width: 28px; /* Smaller button */
  height: 28px;
  margin: 0;
  border: 1px solid ${colors.border};
  background-color: ${(props) =>
    props.active ? colors.primary : colors.white};
  color: ${(props) => (props.active ? colors.white : colors.textSecondary)};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px; /* Less radius */
  transition: all 0.1s ease-in-out;

  svg {
    font-size: 0.8em;
  }

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.active ? colors.primaryDark : colors.grayLight};
    border-color: ${(props) =>
      props.active ? colors.primaryDark : colors.grayMedium};
    color: ${(props) => (props.active ? colors.white : colors.textPrimary)};
    z-index: 1;
  }
  &:disabled {
    background-color: ${colors.grayLight};
    color: ${colors.grayMedium};
    border-color: ${colors.border};
    cursor: not-allowed;
    opacity: 0.7;
  }
  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 1px;
    z-index: 2;
  }
`;

// --- Boş Durum / Yükleme / Hata (Compacted) ---
const InfoContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem; /* Reduced padding */
  text-align: center;
  color: ${colors.textSecondary};
  background-color: ${colors.white};
  border: 1px dashed ${colors.border};
  border-radius: 8px;
  min-height: 150px; /* Reduced min-height */

  svg {
    font-size: 2rem; /* Reduced icon size */
    margin-bottom: 0.8rem;
  }
  h3 {
    margin: 0 0 0.4rem 0;
    font-weight: 500;
    font-size: 1rem;
  } /* Smaller header */
  p {
    font-size: 0.8rem;
  } /* Smaller text */
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  font-size: 1.5rem; /* Smaller spinner */
  color: ${colors.primary};
`;

// ================== ManagerResponse Component (Logic Unchanged) ==================
const ManagerResponse = () => {
  // --- State and Hooks (Logic remains identical) ---
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    projectId: null,
  });
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); 
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [apiParams, setApiParams] = useState({
    ProjectId: null,
    OperationOrderStatus: null,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const user = useMemo(
    () => JSON.parse(localStorage.getItem("userData") || "{}"),
    []
  );
  const isActionAllowed = useMemo(
    () =>
      Array.isArray(user?.roleId) &&
      (user.roleId.includes(3) ||
        user.roleId.includes(2) ||
        user.roleId.includes(12)),
    [user]
  );
  const statusOptions = useMemo(
    () => [
      /* ... identical options ... */ { value: null, label: "All Statuses" },
      { value: 1, label: "Pending" },
      { value: 2, label: "Approved" },
      { value: 3, label: "Rejected" },
    ],
    []
  );

  // --- Data Fetching Callbacks (Logic remains identical) ---
  const fetchProjects = useCallback(async () => {
    /* ... identical logic ... */
    setProjectsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      const data = await response.json();
      const projectsData =
        data?.[0]?.Projects || (Array.isArray(data) ? data : []);
      const projectOptions = projectsData
        .filter((p) => p.Id && p.ProjectCode)
        .map((project) => ({ value: project.Id, label: project.ProjectCode }));
      setProjects(projectOptions);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, [token]);

  const fetchStockData = useCallback(async () => {
    /* ... identical logic ... */
    setIsLoading(true);
    setError("");
    try {
      const queryParams = new URLSearchParams();
      if (apiParams.ProjectId)
        queryParams.append("ProjectId", apiParams.ProjectId);
      if (apiParams.OperationOrderStatus !== null)
        queryParams.append(
          "OperationOrderStatus",
          apiParams.OperationOrderStatus
        );
      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/api/UniformForEmployee/GetPendingStoreRequestUniformForEmployee${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.message || errData.title || errorMsg;
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      const stockRequests = data?.[0]?.UniformForEmployees || [];
      const sortedUniforms = [...stockRequests]
        .map((item) => ({ ...item, Id: item.Id?.toString() }))
        .sort((a, b) => parseInt(b.Id || "0", 10) - parseInt(a.Id || "0", 10));
      setStockData(sortedUniforms);
      setCurrentPage(1);

      setSelectedRowIds((prevSelected) => {
        const newSelected = new Set();
        const currentIds = new Set(sortedUniforms.map((item) => item.Id));
        prevSelected.forEach((id) => {
          if (currentIds.has(id)) {
            newSelected.add(id);
          }
        });
        return newSelected;
      });
    } catch (err) {
      console.error("API Error in fetchStockData:", err);
      setError(`Failed to fetch stock data: ${err.message || "Unknown error"}`);
      setStockData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiParams, token]);

  useEffect(() => {
    fetchProjects();
    fetchStockData();
  }, [fetchProjects, fetchStockData]);

  // --- Client-Side Filtering (Logic remains identical) ---
  useEffect(() => {
    /* ... identical logic ... */
    let filtered = [...stockData];
    if (filters.startDate && filters.endDate) {
      try {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (!isNaN(startDate) && !isNaN(endDate) && startDate <= endDate) {
          filtered = filtered.filter((item) => {
            try {
              const createdDate = new Date(item.CreatedDate);
              return (
                !isNaN(createdDate) &&
                createdDate >= startDate &&
                createdDate <= endDate
              );
            } catch {
              return false;
            }
          });
        }
      } catch {
        console.error("Invalid date for filtering");
      }
    }
    setFilteredData(filtered);
  }, [stockData, filters.startDate, filters.endDate]);

  // --- Pagination Calculation (Logic remains identical) ---
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(
    () => filteredData.slice(indexOfFirstItem, indexOfLastItem),
    [filteredData, indexOfFirstItem, indexOfLastItem]
  );

  // --- Selection Handling (Logic remains identical) ---
  const getSelectedRows = useCallback(
    () => stockData.filter((row) => selectedRowIds.has(row.Id)),
    [stockData, selectedRowIds]
  );
  const handleSelectedRowsChange = useCallback((selectedRowOriginals) => {
    /* ... identical logic ... */
    setSelectedRowIds((prevSet) => {
      const newSet = new Set(
        selectedRowOriginals.map((row) => row.Id?.toString()).filter(Boolean)
      );
      if (
        prevSet.size === newSet.size &&
        [...prevSet].every((id) => newSet.has(id))
      ) {
        return prevSet;
      }
      return newSet;
    });
  }, []);
  const selectedRowIdsOnCurrentPage = useMemo(() => {
    /* ... identical logic ... */
    const currentPageItemIds = new Set(currentItems.map((item) => item.Id));
    return [...selectedRowIds].filter((id) => currentPageItemIds.has(id));
  }, [selectedRowIds, currentItems]);

  // --- Action Handlers (Logic remains identical) ---
  const handleFilterChange = (e) => {
    /* ... identical logic ... */ const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };
  const handleProjectChange = (selectedOption) => {
    /* ... identical logic ... */ const newProjectId = selectedOption
      ? selectedOption.value
      : null;
    setApiParams((prev) => ({ ...prev, ProjectId: newProjectId }));
    setFilters((prev) => ({ ...prev, projectId: newProjectId }));
  };
  const handleStatusChange = (selectedOption) => {
    /* ... identical logic ... */ const newStatusValue = selectedOption
      ? selectedOption.value
      : null;
    setApiParams((prev) => ({ ...prev, OperationOrderStatus: newStatusValue }));
    setStatusFilter(selectedOption);
  };
  const handleClearFilters = () => {
    /* ... identical logic ... */ setFilters({
      startDate: "",
      endDate: "",
      projectId: null,
    });
    setStatusFilter(null);
    setApiParams({ ProjectId: null, OperationOrderStatus: null });
  };
  const handlePageChange = (pageNumber) => {
    /* ... identical logic ... */ setCurrentPage(
      Math.max(1, Math.min(pageNumber, totalPages || 1))
    );
  };
  const getPageNumbers = useCallback(() => {
    /* ... identical (potentially complex) logic ... */
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);
    if (totalPages <= 1) return [];
    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage > halfPagesToShow + 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
      } else {
        for (let i = 1; i <= 2 && i < currentPage - halfPagesToShow; i++) {
          if (!pageNumbers.includes(i)) pageNumbers.push(i);
        }
      }
      let startPage = Math.max(1, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages, currentPage + halfPagesToShow);
      if (currentPage <= halfPagesToShow + 1) {
        startPage = 1;
        endPage = Math.min(totalPages, maxPagesToShow);
      }
      if (currentPage >= totalPages - halfPagesToShow) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
        endPage = totalPages;
      }
      for (let i = startPage; i <= endPage; i++) {
        if (!pageNumbers.includes(i)) pageNumbers.push(i);
      }
      if (currentPage < totalPages - halfPagesToShow - 1) {
        if (endPage < totalPages - 1 && !pageNumbers.includes("..."))
          pageNumbers.push("...");
        if (!pageNumbers.includes(totalPages)) pageNumbers.push(totalPages);
      } else {
        for (
          let i = Math.max(endPage + 1, totalPages - 1);
          i <= totalPages;
          i++
        ) {
          if (!pageNumbers.includes(i)) pageNumbers.push(i);
        }
      }
      let cleaned = [];
      let lastItem = null;
      for (const item of pageNumbers) {
        if (item === "..." && lastItem === "...") continue;
        if (
          typeof item === "number" &&
          typeof lastItem === "number" &&
          item === lastItem + 1 &&
          cleaned[cleaned.length - 1] === "..."
        ) {
          if (cleaned[cleaned.length - 2] === item - 2) {
            cleaned.pop();
          }
        }
        cleaned.push(item);
        lastItem = item;
      }
      if (cleaned[1] === "..." && cleaned[2] === 2) cleaned.splice(1, 1);
      if (
        cleaned[cleaned.length - 2] === "..." &&
        cleaned[cleaned.length - 3] === totalPages - 1
      )
        cleaned.splice(cleaned.length - 2, 1);
      return cleaned;
    }
    return pageNumbers;
  }, [currentPage, totalPages]);

  const updateItemStatus = useCallback(
    async (ids, approve) => {
      /* ... identical logic ... */
      const stringIds = ids.map((id) => id?.toString()).filter(Boolean);
      if (stringIds.length === 0) return;
      setIsUpdating(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/UniformForEmployee/ApproveRejectOperationOrder`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              UniformForEmployeeIds: stringIds.map((id) => parseInt(id, 10)),
              IsApproved: approve,
            }),
          }
        );
        if (!response.ok) {
          let errorMsg = `Operation failed (${response.status})`;
          try {
            const errData = await response.json();
            errorMsg = errData.message || errorMsg;
          } catch (_) {}
          throw new Error(errorMsg);
        }
        showToast(
          `Request(s) ${approve ? "approved" : "rejected"} successfully`,
          "success"
        );
        await fetchStockData();
      } catch (err) {
        console.error(`Error ${approve ? "approving" : "rejecting"}:`, err);
        showToast(`Error: ${err.message || "Operation failed"}`, "error");
      } finally {
        setIsUpdating(false);
      }
    },
    [token, fetchStockData]
  );

  const handleAccept = useCallback(
    (requestId) => updateItemStatus([requestId], true),
    [updateItemStatus]
  );
  const handleReject = useCallback(
    (requestId) => updateItemStatus([requestId], false),
    [updateItemStatus]
  );
  const handleBulkAction = useCallback(
    (approve) => {
      /* ... identical logic ... */ const eligibleRows =
        getSelectedRows().filter(
          (row) =>
            row.StoreRequestStatus === "Pending" &&
            row.OperationOrderStatus !== "Approved" &&
            row.OperationOrderStatus !== "Rejected"
        );
      const idsToAction = eligibleRows.map((row) => row.Id);
      if (idsToAction.length === 0) {
        showToast(
          `Select eligible 'Pending' requests to ${
            approve ? "approve" : "reject"
          }.`,
          "warning"
        );
        return;
      }
      updateItemStatus(idsToAction, approve);
    },
    [getSelectedRows, updateItemStatus]
  );
  const handleBulkAccept = useCallback(
    () => handleBulkAction(true),
    [handleBulkAction]
  );
  const handleBulkReject = useCallback(
    () => handleBulkAction(false),
    [handleBulkAction]
  );

  // --- Status Badge Styling (Logic remains identical) ---
  const getStatusStyles = useCallback((status) => {
    /* ... identical logic ... */ switch (status) {
      case "Pending":
        return {
          $bgColor: "#fffbeb",
          $textColor: "#b45309",
          $dotColor: "#f59e0b",
        };
      case "Accepted":
      case "Approved":
        return {
          $bgColor: "#f0fdf4",
          $textColor: "#15803d",
          $dotColor: "#22c55e",
        };
      case "Rejected":
        return {
          $bgColor: "#fef2f2",
          $textColor: "#b91c1c",
          $dotColor: "#ef4444",
        };
      case "Intransit":
      case "Shipped":
        return {
          $bgColor: "#eff6ff",
          $textColor: "#1d4ed8",
          $dotColor: "#3b82f6",
        };
      default:
        return {
          $bgColor: colors.grayLight,
          $textColor: colors.grayDark,
          $dotColor: colors.grayDark,
        };
    }
  }, []);

  // --- Table Columns Definition (Compacted Cell Actions) ---
  const columns = useMemo(
    () => [
      /* ... column definitions mostly identical ... */
      {
        Header: "Employee Name",
        accessor: "EmployeeName",
        width: 180,
        sticky: "left",
      },
      { Header: "Project", accessor: "EmployeeProject", width: 110 },
      { Header: "Uniform", accessor: "UniformName", width: 200 },
      { Header: "Count", accessor: "RequestCount", width: 60, align: "center" }, // Slightly reduced width
      {
        Header: "Created",
        accessor: "CreatedDate",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString("en-CA") : "-",
        width: 95,
        align: "center",
      }, // Reduced width
      { Header: "Creator", accessor: "CreatedBy", width: 140 },
      {
        Header: "Price(AZN)",
        accessor: "UniformDCStockUnitPrice",
        Cell: ({ value }) =>
          value != null ? `${Number(value).toFixed(2)}` : "-",
        width: 80,
        align: "right",
      }, // Reduced width
      {
        Header: "Store St.",
        accessor: "StoreRequestStatus",
        Cell: ({ value }) => {
          const s = getStatusStyles(value);
          return <StatusBadge {...s}>{value || "N/A"}</StatusBadge>;
        },
        width: 100,
      }, // Reduced width
      {
        Header: "Ops St.",
        accessor: "OperationOrderStatus",
        Cell: ({ value }) => {
          const s = getStatusStyles(value);
          return <StatusBadge {...s}>{value || "N/A"}</StatusBadge>;
        },
        width: 100,
      }, // Reduced width
      {
        Header: "Actions",
        id: "actions",
        disableSortBy: true,
        width: 80,
        /* Reduced actions width */ align: "center",
        sticky: "right",
        Cell: ({ row }) => {
          const { StoreRequestStatus, OperationOrderStatus, Id } = row.original;
          const isPending = StoreRequestStatus === "Pending";
          const isOpsDecided =
            OperationOrderStatus === "Approved" ||
            OperationOrderStatus === "Rejected";
          const canAct = isPending && !isOpsDecided && isActionAllowed;
          return (
            <div
              style={{
                display: "flex",
                gap: "4px",
                /* Tighter gap */ justifyContent: "center",
                height: "100%",
                alignItems: "center",
              }}
            >
              {" "}
              {canAct ? (
                <>
                  {" "}
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(Id);
                    }}
                    $bgColor={colors.success}
                    $hoverColor={colors.successDark}
                    title="Approve"
                    disabled={isUpdating}
                    style={{
                      padding: "0.3rem",
                      width: "26px",
                      height: "26px",
                    }} /* Even smaller */
                  >
                    {" "}
                    <FaCheck size={10} />{" "}
                  </ActionButton>{" "}
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(Id);
                    }}
                    $bgColor={colors.danger}
                    $hoverColor={colors.dangerDark}
                    title="Reject"
                    disabled={isUpdating}
                    style={{
                      padding: "0.3rem",
                      width: "26px",
                      height: "26px",
                    }} /* Even smaller */
                  >
                    {" "}
                    <FaTimes size={10} />{" "}
                  </ActionButton>{" "}
                </>
              ) : OperationOrderStatus === "Approved" ? (
                <FaCheckCircle
                  style={{
                    fontSize: "16px",
                    /* Smaller Icon */ color: colors.success,
                  }}
                  title="Approved"
                />
              ) : OperationOrderStatus === "Rejected" ? (
                <FaTimesCircle
                  style={{
                    fontSize: "16px",
                    /* Smaller Icon */ color: colors.danger,
                  }}
                  title="Rejected"
                />
              ) : (
                <span title="Awaiting Store Action">-</span>
              )}{" "}
            </div>
          );
        },
      },
    ],
    [getStatusStyles, isActionAllowed, handleAccept, handleReject, isUpdating]
  );

  // --- UI Counts (Logic remains identical) ---
  const pendingItemsCount = useMemo(
    () =>
      /* ... identical logic ... */ filteredData.filter(
        (item) =>
          item.StoreRequestStatus === "Pending" &&
          item.OperationOrderStatus !== "Approved" &&
          item.OperationOrderStatus !== "Rejected"
      ).length,
    [filteredData]
  );
  const selectedEligibleCount = useMemo(() => {
    /* ... identical logic ... */ const selectedObjects = getSelectedRows();
    return selectedObjects.filter(
      (row) =>
        row.StoreRequestStatus === "Pending" &&
        row.OperationOrderStatus !== "Approved" &&
        row.OperationOrderStatus !== "Rejected"
    ).length;
  }, [selectedRowIds, getSelectedRows]);

  // --- View State Helper (Logic remains identical) ---
  const getViewState = () => {
    /* ... identical logic ... */ if (isLoading) return "loading";
    if (error) return "error";
    if (stockData.length === 0) return "noDataInitial";
    if (filteredData.length === 0) return "noDataFiltered";
    return "data";
  };
  const viewState = getViewState();

  // --- Render Logic (Compacted structure) ---
  return (
    <StockContainer>
      <ToastContainer />

      {/* Header Card (Compacted) */}
      <Header>
        <Title>Operations Response</Title>
        <FilterContainer>
          {/* Filter Groups */}
          <FilterGroup>
            <FilterLabel htmlFor="startDate">Start Date</FilterLabel>
            <FilterInput
              id="startDate"
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              max={filters.endDate || undefined}
              disabled={isLoading || isUpdating}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel htmlFor="endDate">End Date</FilterLabel>
            <FilterInput
              id="endDate"
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              min={filters.startDate || undefined}
              disabled={isLoading || isUpdating}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel htmlFor="projectFilter">Project</FilterLabel>
            <Select
              inputId="projectFilter"
              isClearable
              isSearchable
              options={projects}
              value={
                projects.find((p) => p.value === apiParams.ProjectId) || null
              }
              onChange={handleProjectChange}
              placeholder="Project..."
              isLoading={projectsLoading}
              styles={customSelectStyles}
              aria-label="Filter by project"
              isDisabled={isLoading || isUpdating}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel htmlFor="statusFilter">Ops Status</FilterLabel>
            <Select
              inputId="statusFilter"
              isClearable
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusChange}
              placeholder="Status..."
              styles={customSelectStyles}
              aria-label="Filter by operation status"
              isDisabled={isLoading || isUpdating}
            />
          </FilterGroup>
          {/* Clear Button in its own group */}
          <ClearButtonGroup>
            {/* Invisible label placeholder to align height */}
            <FilterLabel>&nbsp;</FilterLabel>
            <ClearFilterButton
              onClick={handleClearFilters}
              title="Clear Filters"
              disabled={
                isLoading ||
                isUpdating ||
                (!filters.startDate &&
                  !filters.endDate &&
                  !apiParams.ProjectId &&
                  !statusFilter)
              }
            >
              <FaEraser size={12} /> <span>Clear</span>
            </ClearFilterButton>
          </ClearButtonGroup>
        </FilterContainer>
      </Header>

      {/* Bulk Actions Card (Compacted, Conditional) */}
      {isActionAllowed && viewState === "data" && pendingItemsCount > 0 && (
        <BulkActionsContainer>
          <ActionButton
            onClick={handleBulkAccept}
            $bgColor={colors.success}
            $hoverColor={colors.successDark}
            disabled={selectedEligibleCount === 0 || isLoading || isUpdating}
            title={`Approve ${selectedEligibleCount} selected`}
          >
            <FaCheckCircle /> Approve ({selectedEligibleCount})
          </ActionButton>
          <ActionButton
            onClick={handleBulkReject}
            $bgColor={colors.danger}
            $hoverColor={colors.dangerDark}
            disabled={selectedEligibleCount === 0 || isLoading || isUpdating}
            title={`Reject ${selectedEligibleCount} selected`}
          >
            <FaTimesCircle /> Reject ({selectedEligibleCount})
          </ActionButton>
          {isUpdating && (
            <LoadingSpinner
              style={{ fontSize: "1rem", marginLeft: "8px" }}
              title="Processing..."
            />
          )}
        </BulkActionsContainer>
      )}

      {/* Table Area (Flexible + Handles Internal Scroll) */}
      <TableWrapper>
        {/* --- View State Rendering --- */}
        {viewState === "loading" && (
          <InfoContainer>
            <LoadingSpinner />
            <h3>Loading...</h3>
          </InfoContainer>
        )}
        {viewState === "error" && (
          <InfoContainer
            style={{ borderColor: colors.danger, color: colors.danger }}
          >
            <FaExclamationTriangle style={{ color: colors.danger }} />
            <h3>Error</h3>
            <p>{error}</p>
          </InfoContainer>
        )}
        {viewState === "noDataInitial" && (
          <InfoContainer>
            <FaInfoCircle />
            <h3>No Requests</h3>
            <p>No operation responses available.</p>
          </InfoContainer>
        )}
        {viewState === "noDataFiltered" && (
          <InfoContainer>
            <FaFilter />
            <h3>No Matches</h3>
            <p>No requests match your filters.</p>
          </InfoContainer>
        )}
        {viewState === "data" && (
          <TableContainer>
            <Table
              columns={columns}
              data={currentItems}
              selectable={isActionAllowed && pendingItemsCount > 0}
              onSelectedRowsChange={handleSelectedRowsChange}
              selectedRowIdsOnPage={selectedRowIdsOnCurrentPage}
              stickyHeader
            />
          </TableContainer>
        )}
      </TableWrapper>

      {/* Pagination Card (Compacted, Conditional) */}
      {viewState === "data" && totalPages > 1 && (
        <PaginationContainer>
          <PaginationInfo>
            {" "}
            {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of{" "}
            {totalItems}{" "}
          </PaginationInfo>
          <PaginationControls>
            <PaginationButton
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading || isUpdating}
              title="First"
              aria-label="First Page"
            >
              <FaAngleDoubleLeft size={10} />
            </PaginationButton>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading || isUpdating}
              title="Prev"
              aria-label="Previous Page"
            >
              {" "}
              <FaChevronLeft size={10} />{" "}
            </PaginationButton>
            {getPageNumbers().map((number, index) =>
              number === "..." ? (
                <PaginationButton
                  key={`ellipsis-${index}`}
                  disabled
                  style={{
                    cursor: "default",
                    border: "none",
                    background: "none",
                    color: colors.grayMedium,
                    width: "15px",
                  }}
                >
                  …
                </PaginationButton>
              ) : (
                <PaginationButton
                  key={number}
                  active={currentPage === number}
                  onClick={() => handlePageChange(number)}
                  disabled={isLoading || isUpdating}
                  aria-label={`Page ${number}`}
                  aria-current={currentPage === number ? "page" : undefined}
                >
                  {" "}
                  {number}{" "}
                </PaginationButton>
              )
            )}
            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading || isUpdating}
              title="Next"
              aria-label="Next Page"
            >
              {" "}
              <FaChevronRight size={10} />{" "}
            </PaginationButton>
            <PaginationButton
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading || isUpdating}
              title="Last"
              aria-label="Last Page"
            >
             <FaAngleDoubleRight size={10} />
            </PaginationButton>
          </PaginationControls>
        </PaginationContainer>
      )}
    </StockContainer>
  );
};

export default ManagerResponse;
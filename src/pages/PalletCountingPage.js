// src/pages/PalletCountingPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSpinner,
  FaTimesCircle,
  FaBoxes,
  FaCalendarAlt,
  FaEraser,
  FaWarehouse,
  FaArrowDown,
  FaArrowUp,
  FaClipboardList,
  FaCalculator,
  FaFileExport, // Export için ikon
} from "react-icons/fa";
import Table from "../components/Table";
import CreatePalletCountingModal from "../components/CreatePalletCountingModal";
import EditPalletCountingModal from "../components/EditPalletCountingModal";
import DeleteModal from "../components/DeleteModal";
import { API_BASE_URL } from "../config";
import { ToastContainer as CustomToastContainerWrapper } from "../utils/ToastContainer";
import debounce from "lodash/debounce";

// --- Styled Components ---
const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const spin = keyframes`0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}`;

const PageContainer = styled.div`
  padding: 8px 12px;
  background-color: #f8f9fc;
  min-height: calc(100vh - 60px);
  font-family: "Inter", sans-serif;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  padding: 20px 25px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e5eb;
  margin-bottom: 0;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  svg {
    color: #17a2b8;
    font-size: 22px;
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  padding: 5px 0 10px 0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10px;
  @media (max-width: 1100px) {
    flex-wrap: wrap;
  }
`;

const FilterItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 185px;
  flex-shrink: 0;
  .react-datepicker-wrapper,
  .react-select-container {
    width: 100%;
  }
  @media (max-width: 576px) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-size: 11px;
  font-weight: 500;
  color: #6c757d;
  margin-left: 3px;
`;

const StyledDatePickerInput = styled(DatePicker)`
  height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #ced4da;
  font-size: 13px;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  &:focus {
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 1px rgba(13, 110, 253, 0.25);
  }
  &::placeholder {
    color: #adb5bd;
  }
`;

const StyledButton = styled.button`
  padding: 0 15px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  white-space: nowrap;
  border: 1px solid transparent;
  box-sizing: border-box;
  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    box-shadow: none;
  }
  svg {
    margin-right: -2px;
    font-size: 0.95em;
  }
`;

const CreateButton = styled(StyledButton)`
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.15);
  &:hover:not(:disabled) {
    background-color: #0056b3;
    border-color: #0056b3;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 86, 179, 0.2);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 86, 179, 0.15);
  }
`;

const ExportButton = styled(StyledButton)`
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.15);
  margin-left: 2px;
  &:hover:not(:disabled) {
    background-color: #218838;
    border-color: #1e7e34;
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(30, 126, 52, 0.2);
  }
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(30, 126, 52, 0.15);
  }
`;

const ClearButton = styled(StyledButton)`
  color: #6c757d;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  margin-left: auto;
  &:hover:not(:disabled) {
    background-color: #e9ecef;
    border-color: #adb5bd;
    color: #495057;
  }
  @media (max-width: 1100px) {
    margin-left: 0;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 1350px;
    thead th {
      position: sticky;
      top: 0;
      z-index: 0;
      background-color: #f8f9fa;
    }
  }
  th,
  td {
    padding: 12px 15px;
    border-bottom: 1px solid #e9ecef;
    text-align: left;
    vertical-align: middle;
    font-size: 13.5px;
    white-space: nowrap;
    line-height: 1.5;
  }
  th {
    font-weight: 600;
    color: #495057;
    border-top: none;
    border-bottom-width: 2px;
    border-bottom-color: #dee2e6;
  }
  tbody tr {
    transition: background-color 0.15s ease-in-out;
    &:last-child td {
      border-bottom: none;
    }
    &:hover {
      background-color: #f1f3f5;
    }
  }
  .col-numeric {
    text-align: right;
    font-feature-settings: "tnum";
    > div {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    svg {
      flex-shrink: 0;
      font-size: 1.05em;
      vertical-align: middle;
    }
  }
  .col-date {
    text-align: center;
  }
  .col-actions {
    text-align: center;
    width: 110px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 7px;
  border-radius: 50%;
  color: #6c757d;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin: 0 2px;
  &:hover {
    background-color: #e9ecef;
    transform: scale(1.1);
  }
  &.edit:hover {
    color: #ffc107;
    background-color: #fff3cd;
  }
  &.delete:hover {
    color: #dc3545;
    background-color: #f8d7da;
  }
  svg {
    display: block;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
  margin-top: 5px;
  flex-wrap: wrap;
  gap: 6px;
`;

const PaginationButton = styled(StyledButton)`
  min-width: 28px;
  height: 28px;
  padding: 0 5px;
  font-size: 13px;
  margin: 0;
  border-color: ${(p) => (p.active ? "#0069d9" : "#dee2e6")};
  background-color: ${(p) => (p.active ? "#0069d9" : "#fff")};
  color: ${(p) => (p.active ? "#fff" : "#0d6efd")};
  &:hover:not(:disabled):not(:active) {
    border-color: ${(p) => (p.active ? "#0056b3" : "#adb5bd")};
    background-color: ${(p) => (p.active ? "#0056b3" : "#e9ecef")};
    color: ${(p) => (p.active ? "#fff" : "#0056b3")};
    z-index: 1;
  }
  &:disabled {
    background-color: #e9ecef;
    color: #adb5bd;
    border-color: #dee2e6;
    cursor: not-allowed;
    opacity: 0.7;
  }
  svg {
    margin-right: 0;
    font-size: 12px;
  }
`;

const MessageContainer = styled.div`
  padding: 18px 22px;
  text-align: center;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 14.5px;
  font-weight: 500;
  border: 1px solid;
  &.error {
    color: #721c24;
    background-color: #f8d7da;
    border-color: #f5c6cb;
  }
  &.loading,
  &.no-data {
    color: #383d41;
    background-color: #e2e3e5;
    border-color: #d6d8db;
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  vertical-align: middle;
`;

const reactSelectStylesFilter = {
  control: (p, s) => ({
    ...p,
    minHeight: "36px",
    height: "36px",
    fontSize: "13px",
    borderColor: s.isFocused ? "#86b7fe" : "#ced4da",
    boxShadow: s.isFocused ? "0 0 0 1px rgba(13, 110, 253, 0.25)" : "none",
    "&:hover": { borderColor: s.isFocused ? "#86b7fe" : "#adb5bd" },
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  }),
  valueContainer: (p) => ({ ...p, height: "36px", padding: "0 10px" }),
  input: (p) => ({ ...p, margin: "0", padding: "0" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (p) => ({ ...p, height: "36px" }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected
      ? "#007bff"
      : s.isFocused
      ? "#e9ecef"
      : "#fff",
    color: s.isSelected ? "#fff" : s.isFocused ? "#212529" : "#495057",
    padding: "8px 12px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: s.isSelected ? 500 : 400,
  }),
  menu: (p) => ({
    ...p,
    borderRadius: "6px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    zIndex: 1101,
    width: "100%",
  }),
  menuList: (p) => ({
    ...p,
    maxHeight: "200px",
    overflowY: "auto",
    padding: "5px 0",
  }),
  placeholder: (p) => ({ ...p, color: "#6c757d", fontSize: "13px" }),
  singleValue: (p) => ({ ...p, color: "#495057" }),
};

// --- Ana Bileşen ---
const PalletCountingPage = () => {
  const [palletCountingData, setPalletCountingData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    projectId: null,
    startDate: null,
    endDate: null,
  });
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [itemToDeleteName, setItemToDeleteName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const debouncedHandleFilterChange = useMemo(
    () =>
      debounce((name, value) => {
        setActiveFilters((prev) => ({ ...prev, [name]: value }));
        setCurrentPage(1);
      }, 400),
    []
  );
  const handleDateChange = (name, date) => {
    setActiveFilters((prev) => ({ ...prev, [name]: date }));
    setCurrentPage(1);
  };
  useEffect(
    () => () => {
      debouncedHandleFilterChange.cancel();
    },
    [debouncedHandleFilterChange]
  );

  // Projeleri Getir
  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setIsDropdownLoading(true);
    const url = `${API_BASE_URL}/api/Project`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        let body = {};
        try {
          body = await response.json();
        } catch {}
        throw new Error(
          body.Message || body.title || `HTTP ${response.status}`
        );
      }
      const data = await response.json();
      let projectsList = (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.Projects))
        ? data[0].Projects
        : Array.isArray(data) ? data : [];

      const formattedProjects = projectsList
        .filter(p => p && p.Id != null)
        .map(p => ({
          value: p.Id.toString(),
          label: p.ProjectCode || `Project ${p.Id}`
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setProjects(formattedProjects);
    } catch (err) {
      console.error("Fetch Projects error:", err);
      toast.error(`Failed to load projects: ${err.message}`, { theme: "colored" });
      setProjects([]);
    } finally {
      setIsDropdownLoading(false);
    }
  }, [token]);

  const fetchPalletCountings = useCallback(
    async (page = 1, filters = {}) => {
      setIsLoading(true);
      setError("");
      if (!token) {
        setError("Auth required.");
        setIsLoading(false);
        return;
      }
      const params = new URLSearchParams({
        Page: page.toString(),
        "ShowMore.Take": itemsPerPage.toString(),
      });
      const pid = filters.projectId?.value;
      if (pid) params.set("ProjectId", pid);
      if (filters.startDate)
        params.set("StartDate", filters.startDate.toISOString().split("T")[0]);
      if (filters.endDate)
        params.set("EndDate", filters.endDate.toISOString().split("T")[0]);
      const fetchUrl = `${API_BASE_URL}/api/PalletCounting?${params.toString()}`;
      try {
        const response = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          let e = `HTTP ${response.status}`;
          try {
            const d = await response.json();
            e = d.Message || d.title || e;
          } catch {}
          if (response.status === 401 || response.status === 403)
            setError("Unauthorized.");
          else setError(`Load err: ${e}`);
          setPalletCountingData([]);
          setTotalItems(0);
          setTotalPages(1);
          return;
        }
        const data = await response.json();
        if (
          data &&
          Array.isArray(data) &&
          data.length > 0 &&
          data[0] &&
          typeof data[0].TotalPalletCountingCount === "number"
        ) {
          const r = data[0];
          const c = Array.isArray(r.PalletCountings) ? r.PalletCountings : [];
          const cnt = r.TotalPalletCountingCount;
          setPalletCountingData(c);
          setTotalItems(cnt);
          const calcPg = Math.ceil(cnt / itemsPerPage) || 1;
          setTotalPages(calcPg);
          if (page > calcPg && cnt > 0) {
            setCurrentPage(calcPg);
          }
        } else {
          console.warn("Unexpected data:", data);
          setPalletCountingData([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (e) {
        console.error("Fetch Err:", e);
        setError("Load error.");
        setPalletCountingData([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [token, itemsPerPage]
  );

  // Excel Export Fonksiyonu
  const handleExportToExcel = useCallback(async () => {
    if (!token) {
      toast.error("Authentication required to export data.", { theme: "colored" });
      return;
    }

    const toastId = toast.loading("Excel'e aktarılıyor...");
    try {
      const params = new URLSearchParams();
      const pid = activeFilters.projectId?.value;
      if (pid) params.set("ProjectId", pid);
      if (activeFilters.startDate)
        params.set("StartDate", activeFilters.startDate.toISOString().split("T")[0]);
      if (activeFilters.endDate)
        params.set("EndDate", activeFilters.endDate.toISOString().split("T")[0]);

      const exportUrl = `${API_BASE_URL}/api/PalletCounting/export-palletcountings?${params.toString()}`;
      const response = await fetch(exportUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const data = await response.json();
          errorMsg = data || "Bilinmeyen hata.";
        } catch {
          if (response.status === 401 || response.status === 403) {
            errorMsg = "Yetkisiz işlem: Bu işlemi gerçekleştirmek için gerekli yetkiye sahip değilsiniz.";
          } else if (response.status === 400) {
            errorMsg = "Dışa aktarılacak veri bulunamadı.";
          }
        }
        throw new Error(errorMsg);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `PalletCountingDetails_${new Date().toISOString().replace(/[-:T]/g, "").split(".")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.update(toastId, {
        render: "Excel'e başarıyla aktarıldı!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        theme: "colored",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.update(toastId, {
        render: `Export failed: ${error.message || "Bilinmeyen hata."}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        theme: "colored",
      });
    }
  }, [token, activeFilters]);

  useEffect(() => {
    if (token) fetchProjects();
    else {
      setError("Auth required.");
      setIsLoading(false);
      setIsDropdownLoading(false);
    }
  }, [fetchProjects, token]);

  useEffect(() => {
    if (token) fetchPalletCountings(currentPage, activeFilters);
  }, [currentPage, activeFilters, fetchPalletCountings, token]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("az-AZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  }, []);

  const formatNumber = useCallback((number) => {
    if (number == null || isNaN(number)) return "-";
    return number.toLocaleString("az-AZ");
  }, []);

  const getPageNumbers = useCallback(() => {
    const pgs = [];
    const maxPg = 5;
    const hlf = Math.floor(maxPg / 2);
    let st = Math.max(1, currentPage - hlf);
    let end = Math.min(totalPages, currentPage + hlf);
    if (totalPages <= maxPg + 2) {
      for (let i = 1; i <= totalPages; i++) pgs.push(i);
    } else {
      if (currentPage <= hlf + 1) end = maxPg;
      else if (currentPage >= totalPages - hlf) st = totalPages - maxPg + 1;
      pgs.push(1);
      if (st > 2) pgs.push("...");
      for (let i = st; i <= end; i++) {
        if (i > 1 && i < totalPages) pgs.push(i);
      }
      if (end < totalPages - 1) pgs.push("...");
      pgs.push(totalPages);
    }
    return pgs;
  }, [currentPage, totalPages]);

  const handleClearFilters = useCallback(() => {
    setActiveFilters({ projectId: null, startDate: null, endDate: null });
    if (currentPage !== 1) setCurrentPage(1);
  }, [currentPage]);

  const handlePageChange = useCallback(
    (pageNum) => {
      if (
        pageNum >= 1 &&
        pageNum <= totalPages &&
        pageNum !== currentPage &&
        typeof pageNum === "number"
      ) {
        setCurrentPage(pageNum);
      }
    },
    [currentPage, totalPages]
  );

  const handleCreate = useCallback(() => setCreateModalOpen(true), []);

  const handleEdit = useCallback((rowData) => {
    setEditData(rowData);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    (id, pCode, cDate) => {
      setDeleteId(id);
      const dStr = cDate ? ` from ${formatDate(cDate).split(" ")[0]}` : "";
      const pStr = pCode || "N/A";
      setItemToDeleteName(`counting for ${pStr}${dStr} (ID:${id})`);
      setDeleteModalOpen(true);
    },
    [formatDate]
  );

  const handleSaveCreate = useCallback(async () => {
    setCreateModalOpen(false);
    toast.success("Created!", { theme: "colored" });
    if (currentPage !== 1) setCurrentPage(1);
    else await fetchPalletCountings(1, activeFilters);
  }, [currentPage, fetchPalletCountings, activeFilters]);

  const handleSaveEdit = useCallback(async () => {
    setEditModalOpen(false);
    setEditData(null);
    toast.success("Updated!", { theme: "colored" });
    await fetchPalletCountings(currentPage, activeFilters);
  }, [currentPage, fetchPalletCountings, activeFilters]);

  const confirmDelete = useCallback(async () => {
    if (!deleteId || !token) {
      toast.error("Error: Cannot delete. ID or token missing.", {
        theme: "colored",
      });
      setDeleteModalOpen(false);
      return;
    }
    const toastId = toast.loading("Deleting pallet counting record...");
    try {
      const response = await fetch(`${API_BASE_URL}/api/PalletCounting`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ Id: deleteId }),
      });
      let responseData = {};
      try {
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          responseData = await response.json();
        }
      } catch {}
      if (!response.ok || (responseData && responseData.IsSuccess === false)) {
        const errorMsg = responseData?.Message || `Failed with status: ${response.status}`;
        throw new Error(errorMsg);
      }
      toast.update(toastId, {
        render: responseData?.Message || "Record deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        theme: "colored",
      });
      const newTotalItems = totalItems - 1;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage) || 1;
      if (
        palletCountingData.length === 1 &&
        currentPage > 1 &&
        currentPage > newTotalPages
      ) {
        setCurrentPage(currentPage - 1);
      } else {
        const pageToFetch = Math.min(currentPage, newTotalPages);
        if (currentPage !== pageToFetch) {
          setCurrentPage(pageToFetch);
        } else {
          await fetchPalletCountings(pageToFetch, activeFilters);
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.update(toastId, {
        render: `Error deleting record: ${error.message || "Unknown error"}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        theme: "colored",
      });
    } finally {
      setDeleteId(null);
      setItemToDeleteName("");
      setDeleteModalOpen(false);
    }
  }, [
    deleteId,
    token,
    totalItems,
    itemsPerPage,
    palletCountingData.length,
    currentPage,
    fetchPalletCountings,
    activeFilters,
  ]);

  const columns = useMemo(
    () => [
      {
        Header: "Project Code",
        accessor: "ProjectCode",
        width: 120,
        Cell: ({ value }) => value || <i style={{ color: "#adb5bd" }}>N/A</i>,
      },
      {
        Header: "Format",
        accessor: "Format",
        width: 100,
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Op. Director",
        accessor: "OperationDirector",
        width: 150,
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Area Mgr.",
        accessor: "AreaManager",
        width: 150,
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Depo.",
        accessor: "DepositPaletSayı",
        className: "col-numeric",
        Cell: ({ value }) => (
          <div>
            <FaWarehouse color="#3b82f6" title="Deposit" />{" "}
            {formatNumber(value)}
          </div>
        ),
      },
      {
        Header: "DC Qəbul",
        accessor: "DCQəbulPaletSayı",
        className: "col-numeric",
        Cell: ({ value }) => (
          <div>
            <FaArrowDown color="#10b981" title="Accepted" />{" "}
            {formatNumber(value)}
          </div>
        ),
      },
      {
        Header: "DC Təhvil",
        accessor: "DCTəhvilPaletSayı",
        className: "col-numeric",
        Cell: ({ value }) => (
          <div>
            <FaArrowUp color="#ef4444" title="Delivered" />{" "}
            {formatNumber(value)}
          </div>
        ),
      },
      {
        Header: "Qalıq (Manual)",
        accessor: "DepozitPaletQalığı",
        className: "col-numeric",
        Cell: ({ value }) => (
          <div>
            <FaClipboardList color="#8b5cf6" title="Manual Remainder" />{" "}
            {formatNumber(value)}
          </div>
        ),
      },
      {
        Header: "Qalıq (Avto)",
        accessor: "QalıqAvto",
        className: "col-numeric",
        Cell: ({ value }) => (
          <div>
            <FaCalculator color="#14b8a6" title="Auto Remainder" />{" "}
            {formatNumber(value)}
          </div>
        ),
      },
      {
        Header: "Created",
        accessor: "CreatedDate",
        className: "col-date",
        width: 160,
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Created By",
        accessor: "CreatedBy",
        width: 140,
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Modified",
        accessor: "ModifiedDate",
        className: "col-date",
        width: 160,
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Modified By",
        accessor: "ModifiedBy",
        width: 140,
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Actions",
        id: "actions",
        className: "col-actions",
        Cell: ({ row }) => (
          <div
            style={{
              display: "flex",
              gap: "5px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActionButton
              className="edit"
              onClick={() => handleEdit(row.original)}
              title="Edit Record"
            >
              <FaEdit size={15} />
            </ActionButton>{" "}
            <ActionButton
              className="delete"
              onClick={() =>
                handleDelete(
                  row.original.Id,
                  row.original.ProjectCode,
                  row.original.CreatedDate
                )
              }
              title="Delete Record"
            >
              <FaTrash size={14} />
            </ActionButton>{" "}
          </div>
        ),
      },
    ],
    [formatDate, formatNumber, handleEdit, handleDelete]
  );

  const projectOptionsForFilter = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects;
  }, [projects]);

  const hasActiveFilter =
    activeFilters.projectId || activeFilters.startDate || activeFilters.endDate;
  const projectOptionsAvailable = !isDropdownLoading && projects.length > 0;

  return (
    <PageContainer>
      <Card>
        <Header>
          <Title>
            <FaBoxes /> Pallet Counting Records
          </Title>
          <div style={{ display: "flex", gap: "10px" }}>
            <CreateButton
              onClick={handleCreate}
              disabled={isLoading || !projectOptionsAvailable}
              title={!projectOptionsAvailable ? "No projects" : "Create Record"}
            >
              <FaPlus size={14} /> Create Record
            </CreateButton>
            <ExportButton
              onClick={handleExportToExcel}
              disabled={isLoading || palletCountingData.length === 0}
              title={
                palletCountingData.length === 0
                  ? "No data to export"
                  : "Export to Excel"
              }
            >
              <FaFileExport size={14} /> Export to Excel
            </ExportButton>
          </div>
        </Header>

        <FilterBar>
          <FilterGroup>
            <FilterItem>
              <FilterLabel htmlFor="projectFilter">Project</FilterLabel>
              <Select
                inputId="projectFilter"
                options={projectOptionsForFilter}
                value={activeFilters.projectId}
                onChange={(option) =>
                  debouncedHandleFilterChange("projectId", option)
                }
                placeholder={
                  isDropdownLoading ? "Loading..." : "All Projects"
                }
                styles={reactSelectStylesFilter}
                isClearable
                isSearchable
                isLoading={isDropdownLoading}
                isDisabled={
                  isLoading || isDropdownLoading || !projectOptionsAvailable
                }
                aria-label="Filter by Project"
                noOptionsMessage={() => "No projects found"}
                classNamePrefix="react-select"
              />
            </FilterItem>
            <FilterItem>
              <FilterLabel htmlFor="startDateFilter">Start Date</FilterLabel>
              <StyledDatePickerInput
                id="startDateFilter"
                selected={activeFilters.startDate}
                onChange={(date) => handleDateChange("startDate", date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Start Date"
                isClearable
                selectsStart
                startDate={activeFilters.startDate}
                endDate={activeFilters.endDate}
                maxDate={activeFilters.endDate || new Date()}
                showIcon
                icon={<FaCalendarAlt color="#6c757d" />}
                disabled={isLoading}
              />
            </FilterItem>
            <FilterItem>
              <FilterLabel htmlFor="endDateFilter">End Date</FilterLabel>
              <StyledDatePickerInput
                id="endDateFilter"
                selected={activeFilters.endDate}
                onChange={(date) => handleDateChange("endDate", date)}
                dateFormat="dd/MM/yyyy"
                placeholderText="End Date"
                isClearable
                selectsEnd
                startDate={activeFilters.startDate}
                endDate={activeFilters.endDate}
                minDate={activeFilters.startDate}
                maxDate={new Date()}
                showIcon
                icon={<FaCalendarAlt color="#6c757d" />}
                disabled={isLoading}
              />
            </FilterItem>
          </FilterGroup>
          {hasActiveFilter && (
            <ClearButton
              onClick={handleClearFilters}
              disabled={isLoading}
              title="Clear filters"
            >
              {" "}
              <FaEraser size={13} /> Clear Filters{" "}
            </ClearButton>
          )}
        </FilterBar>

        {isLoading && (
          <MessageContainer className="loading">
            <Spinner size={18} /> Loading...
          </MessageContainer>
        )}
        {error && (
          <MessageContainer className="error">{error}</MessageContainer>
        )}
        {!isLoading &&
          !error &&
          (palletCountingData.length > 0 ? (
            <TableWrapper>
              {" "}
              <Table columns={columns} data={palletCountingData} />{" "}
            </TableWrapper>
          ) : (
            <MessageContainer className="no-data">
              {" "}
              {hasActiveFilter ? "No records found." : "No records yet."}{" "}
            </MessageContainer>
          ))}

        {!isLoading && !error && totalItems > 0 && totalPages > 1 && (
          <PaginationContainer>
            {" "}
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              title="Previous"
            >
              <FaChevronLeft />
            </PaginationButton>{" "}
            {getPageNumbers().map((page, index) =>
              typeof page === "number" ? (
                <PaginationButton
                  key={`page-${page}`}
                  active={currentPage === page}
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                >
                  {page}
                </PaginationButton>
              ) : (
                <span
                  key={`ellipsis-${index}`}
                  style={{
                    padding: "0 6px",
                    alignSelf: "center",
                    color: "#adb5bd",
                    fontSize: "14px",
                  }}
                >
                  {page}
                </span>
              )
            )}{" "}
            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              title="Next"
            >
              <FaChevronRight />
            </PaginationButton>{" "}
          </PaginationContainer>
        )}
      </Card>

      {isCreateModalOpen && (
        <CreatePalletCountingModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSaveCreate}
          apiBaseUrl={API_BASE_URL}
          token={token}
          projects={projects}
        />
      )}
      {isEditModalOpen && editData && (
        <EditPalletCountingModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditData(null);
          }}
          onSave={handleSaveEdit}
          initialData={editData}
          apiBaseUrl={API_BASE_URL}
          token={token}
          projects={projects}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteId(null);
            setItemToDeleteName("");
          }}
          onConfirm={confirmDelete}
          itemName={itemToDeleteName}
          message={`Delete record: "${itemToDeleteName || "N/A"}"?`}
        />
      )}
      <CustomToastContainerWrapper
        position="bottom-right"
        autoClose={4000}
        theme="colored"
      />
    </PageContainer>
  );
};

export default PalletCountingPage;
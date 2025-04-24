import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import Select from "react-select";
// --- react-toastify importları ---
import { toast } from 'react-toastify'; // Doğrudan react-toastify'ı import ediyoruz
import 'react-toastify/dist/ReactToastify.css'; // CSS dosyasını import etmeyi unutmayın (genellikle App.js'de yapılır)
// --- Diğer importlar ---
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSpinner,
  FaTimesCircle,
  FaWarehouse,
} from "react-icons/fa";
import Table from "../components/Table";
import CreatePalletDepositModal from "../components/CreatePalletDepositModal";
import EditPalletDepositModal from "../components/EditPalletDepositModal";
import DeleteModal from "../components/DeleteModal";
import { API_BASE_URL } from "../config";
// import { showToast } from "../utils/toast"; // Artık burada showToast'a ihtiyacımız olmayabilir, yorum satırı yapabiliriz
import { ToastContainer as CustomToastContainerWrapper } from "../utils/ToastContainer"; // Kendi container'ınızın adı buysa
// VEYA eğer react-toastify'nin kendi container'ını kullanıyorsanız:
// import { ToastContainer } from 'react-toastify';
import debounce from "lodash/debounce";

// --- Styled Components (Değişiklik yok) ---
const fadeIn = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`;
const spin = keyframes`0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}`;

const PageContainer = styled.div`
  padding: 20px;
  background-color: #f4f7fc;
  min-height: calc(100vh - 60px);
  font-family: "Inter", sans-serif;
  animation: ${fadeIn} 0.4s ease-out;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 15px 20px;
  padding-bottom: 18px;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 25px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 21px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  svg {
    color: #3498db;
    font-size: 18px;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-grow: 1;
  min-width: 50%;
  @media (max-width: 768px) {
    flex-wrap: wrap;
    min-width: auto;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 180px; /* Sabit genişlik */
  @media (max-width: 768px) {
    width: 100%; /* Mobil cihazlarda tam genişlik */
  }
`;

const StyledButton = styled.button`
  padding: 8px 15px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  border: 1px solid transparent;
  height: 36px;
  box-sizing: border-box;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CreateButton = styled(StyledButton)`
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.15);
  &:hover:not(:disabled) {
    background-color: #0056b3;
    border-color: #0056b3;
    box-shadow: 0 2px 5px rgba(0, 123, 255, 0.2);
  }
  &:disabled {
    background-color: #adb5bd;
    border-color: #adb5bd;
    box-shadow: none;
  }
`;

const ClearButton = styled(StyledButton)`
  color: #495057;
  background-color: #e9ecef;
  border-color: #dee2e6;
  &:hover:not(:disabled) {
    background-color: #dfe3e7;
    border-color: #adb5bd;
  }
  &:disabled {
    background-color: #e9ecef;
    border-color: #dee2e6;
  }
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 700px;
  }
  th,
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #e9ecef;
    text-align: left;
    vertical-align: middle;
    font-size: 14px;
    white-space: nowrap;
  }
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #495057;
    border-top: none;
    border-bottom-width: 2px;
    border-bottom-color: #dee2e6;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:hover {
    background-color: #f1f3f5;
  }
  .col-deposit {
    text-align: right;
    font-weight: 500;
  }
  .col-date {
    text-align: center;
  }
  .col-actions {
    text-align: center;
    width: 100px;
  }
`;

const ActionButton = styled.button`
  background: 0 0;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  color: #6c757d;
  transition: background-color 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  &:hover {
    background-color: #f1f3f5;
  }
  &.edit:hover {
    color: #ffc107; /* Sarı */
    background-color: #fff3cd; /* Açık sarı */
  }
  &.delete:hover {
    color: #dc3545; /* Kırmızı */
    background-color: #f8d7da; /* Açık kırmızı */
  }
  svg {
    display: block;
  }
`;


const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 5px;
  border-top: 1px solid #e9ecef;
  margin-top: 5px;
`;

const PaginationButton = styled.button`
  padding: 5px 10px;
  min-width: 30px;
  height: 30px;
  margin: 0 3px;
  border: 1px solid ${(p) => (p.active ? "#0d6efd" : "#dee2e6")};
  background-color: ${(p) => (p.active ? "#0d6efd" : "#fff")};
  color: ${(p) => (p.active ? "#fff" : "#0d6efd")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  border-radius: 6px;
  &:hover:not(:disabled) {
    border-color: ${(p) => (p.active ? "#0a58ca" : "#adb5bd")};
    background-color: ${(p) => (p.active ? "#0a58ca" : "#f8f9fa")};
    color: ${(p) => (p.active ? "#fff" : "#0a58ca")};
    z-index: 1;
  }
  &:disabled {
    background-color: #e9ecef;
    color: #adb5bd;
    border-color: #dee2e6;
    cursor: not-allowed;
  }
`;

const MessageContainer = styled.div`
  padding: 16px;
  text-align: center;
  border-radius: 8px;
  margin: 16px 0;
  font-size: 14.5px;
  &.error {
    color: #842029;
    background-color: #f8d7da;
    border: 1px solid #f5c2c7;
  }
  &.loading,
  &.no-data {
    color: #6c757d;
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    padding: 25px;
  }
`;

const Spinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
`;

const reactSelectStylesFilter = {
  control: (p, s) => ({
    ...p,
    minHeight: "36px",
    height: "36px",
    fontSize: "13px",
    borderColor: s.isFocused ? "#007bff" : "#ced4da",
    boxShadow: s.isFocused ? "0 0 0 1px #007bff" : "none",
    "&:hover": { borderColor: s.isFocused ? "#007bff" : "#adb5bd" },
    borderRadius: "4px",
    cursor: "pointer",
    width: "180px", // Sabit genişlik
    boxSizing: "border-box",
  }),
  valueContainer: (p) => ({ ...p, height: "36px", padding: "0 8px", width: "100%" }),
  input: (p) => ({ ...p, margin: "0", padding: "0", width: "100%" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (p) => ({ ...p, height: "36px" }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected ? "#007bff" : s.isFocused ? "#e9ecef" : "#fff",
    color: s.isSelected ? "#fff" : s.isFocused ? "#000" : "#495057",
    padding: "6px 10px", fontSize: "13px", cursor: "pointer",
  }),
  menu: (p) => ({ ...p, borderRadius: "4px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 1101, width: "180px" }),
  menuList: (p) => ({ ...p, maxHeight: "150px", overflowY: "auto", padding: "4px 0" }),
  placeholder: (p) => ({ ...p, color: "#6c757d", fontSize: "13px" }),
  singleValue: (p) => ({ ...p, color: "#495057" }),
};

// --- Main Component ---
const PalletDepositPage = () => {
  // State'ler (değişiklik yok)
  const [palletDepositData, setPalletDepositData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeFilters, setActiveFilters] = useState({ projectId: null });
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
  const [itemsPerPage] = useState(7);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const token = useMemo(() => localStorage.getItem("token"), []);

  const debouncedHandleFilterChange = useMemo(
    () => debounce((name, option) => {
      setActiveFilters((prev) => ({ ...prev, [name]: option }));
      setCurrentPage(1); // Filtre değişince 1. sayfaya git
    }, 300),
    [] // Bağımlılık yok, fonksiyon sadece bir kere oluşturulacak
  );

  // Debounce temizleme (değişiklik yok)
  useEffect(() => {
    return () => {
      debouncedHandleFilterChange.cancel();
    };
  }, [debouncedHandleFilterChange]);

  // --- Fonksiyonlar ---

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setIsDropdownLoading(true);
    const url = `${API_BASE_URL}/api/Project`; // API endpoint doğru olmalı
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        let body = null; try { body = await response.json(); } catch { }
        const message = body?.Message || body?.title || `HTTP Error ${response.status}`;
        throw new Error(message);
      }
      const data = await response.json();
      let projectsList = [];
      // Gelen veri yapısına göre doğru proje listesini al
      if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.Projects)) {
        projectsList = data[0].Projects;
      } else if (Array.isArray(data)) {
        projectsList = data; // Eğer direkt liste geliyorsa
      }

      if (projectsList.length > 0) {
         // Proje nesnelerinin Id ve ProjectCode içerdiğinden emin ol
         const formattedProjects = projectsList
            .filter(p => p && p.Id != null) // Geçerli projeleri filtrele
            .map(p => ({
                value: p.Id.toString(), // react-select için string değer
                label: p.ProjectCode || `Project ${p.Id}` || "Unnamed Project" // Öncelik ProjectCode, yoksa fallback
            }))
            .sort((a, b) => a.label.localeCompare(b.label)); // Alfabetik sırala
        setProjects(formattedProjects);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("Fetch Projects error:", err);
      // ** HATA DURUMUNDA toast KULLANIMI (Artık react-toastify) **
      toast.error(`Failed to load projects: ${err.message}`, { theme: "colored" });
      setProjects([]);
    } finally {
      setIsDropdownLoading(false);
    }
  }, [token]);

  const fetchPalletDeposits = useCallback(async (page = 1, filters = {}) => {
    setIsLoading(true);
    setError("");
    if (!token) {
      setError("Authentication token is missing. Please log in.");
      setIsLoading(false);
      return;
    }
    const params = new URLSearchParams({
      Page: page.toString(),
      "ShowMore.Take": itemsPerPage.toString(),
      // Sıralama parametreleri (opsiyonel, API destekliyorsa eklenebilir)
      // "ShowMore.OrderBy": "CreatedDate",
      // "ShowMore.OrderDirection": "DESC",
    });
    const projectId = filters.projectId?.value; // Filtre nesnesinden 'value' alınır
    if (projectId) {
      params.set("ProjectId", projectId.toString());
    }
    const fetchUrl = `${API_BASE_URL}/api/PalletDeposit?${params.toString()}`;
    try {
      const response = await fetch(fetchUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!response.ok) {
        let errorMsg = `HTTP Error ${response.status}`;
        try { const data = await response.json(); errorMsg = data.Message || data.title || errorMsg; } catch {}
        if (response.status === 401 || response.status === 403) setError("Unauthorized access.");
        else setError(`Failed to fetch data: ${errorMsg}`);
        setPalletDepositData([]); setTotalItems(0); setTotalPages(1);
        return;
      }
      const data = await response.json();
      // API'den dönen veri yapısını dikkatlice kontrol et
      if (data && Array.isArray(data) && data.length > 0 && data[0]) {
        const result = data[0];
        const deposits = Array.isArray(result.PalletDeposits) ? result.PalletDeposits : [];
        const count = typeof result.TotalPalletDepositCount === "number" ? result.TotalPalletDepositCount : 0;

        setPalletDepositData(deposits);
        setTotalItems(count);
        const calculatedTotalPages = Math.ceil(count / itemsPerPage) || 1;
        setTotalPages(calculatedTotalPages);
        // Eğer mevcut sayfa, toplam sayfadan büyükse ve veri varsa, son sayfaya git
        if (page > calculatedTotalPages && count > 0) {
            setCurrentPage(calculatedTotalPages);
        }
      } else {
        // Veri yoksa veya format hatalıysa state'leri sıfırla
        setPalletDepositData([]); setTotalItems(0); setTotalPages(1);
      }
    } catch (e) {
      console.error("Fetch Pallet Deposits error:", e);
      setError("An error occurred while loading data. Please try again.");
      setPalletDepositData([]); setTotalItems(0); setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [token, itemsPerPage]);


  // İlk Yükleme (fetchProjects token gelince tetiklenir)
  useEffect(() => {
    if (token) {
      fetchProjects();
    } else {
      setError("Authentication required. Please log in.");
      setIsLoading(false);
      setIsDropdownLoading(false);
    }
  }, [fetchProjects, token]); // fetchProjects token'a bağlı olduğu için sadece token yeterli

  // Sayfa veya filtre değişince veriyi çek (token varsa)
  useEffect(() => {
    if (token) {
      fetchPalletDeposits(currentPage, activeFilters);
    }
    // token değişirse de tetiklenir (yukarıdaki useEffect sayesinde zaten dolaylı bağlı)
  }, [currentPage, activeFilters, fetchPalletDeposits, token]);

  // Format Date (değişiklik yok)
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", { // Lokalizasyon (ör: tr-TR)
        day: "2-digit",
        month: "2-digit", // Kısa yerine 2 haneli ay
        year: "numeric",
      });
    } catch (e) {
      console.error("Date format error:", dateString, e);
      return "Invalid Date";
    }
  }, []);


  // Pagination Numaraları (değişiklik yok)
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxPagesToShow = 5; // Ortada gösterilecek maksimum sayfa sayısı (tek olmalı)
    const ellipsis = "...";

    if (totalPages <= maxPagesToShow + 2) {
      // Çok az sayfa varsa hepsini göster
      for (let i = 1; i <= totalPages; i++) { pages.push(i); }
    } else {
      // Daha fazla sayfa varsa
      const startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 2) / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);

       pages.push(1); // İlk sayfa her zaman gösterilir
      if (startPage > 2) { pages.push(ellipsis); } // Başta ellipsis

      for (let i = startPage; i <= endPage; i++) { pages.push(i); } // Ortadaki sayfalar

      if (endPage < totalPages - 1) { pages.push(ellipsis); } // Sonda ellipsis
      pages.push(totalPages); // Son sayfa her zaman gösterilir
    }
    return pages;
  }, [currentPage, totalPages]);

  // Filtreleri Temizle (değişiklik yok)
  const handleClearFilters = useCallback(() => {
    setActiveFilters({ projectId: null });
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // Fetch işlemi zaten activeFilters veya currentPage değiştiğinde tetiklenecek
  }, [currentPage]);

  // Sayfa Değiştirme (değişiklik yok)
  const handlePageChange = useCallback((pageNum) => {
      if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
          setCurrentPage(pageNum);
      }
  }, [currentPage, totalPages]);

  // Modal Açma/Kapama Handler'ları (değişiklik yok)
  const handleCreate = useCallback(() => setCreateModalOpen(true), []);

  // Kaydetme Sonrası Veri Yenileme Handler'ları
   const handleSaveCreate = useCallback(async () => {
    setCreateModalOpen(false);
    toast.success("New pallet deposit created successfully!", { theme: "colored"});
    // En son eklenen kaydı görmek için 1. sayfaya git ve filtreleri koru
    if (currentPage !== 1) {
        setCurrentPage(1);
    } else {
        // Zaten 1. sayfadaysak direkt veriyi yenile
       await fetchPalletDeposits(1, activeFilters);
    }
  }, [currentPage, fetchPalletDeposits, activeFilters]);

  const handleEdit = useCallback((rowData) => {
    setEditData(rowData); // Tüm satır verisini state'e ata
    setEditModalOpen(true);
  }, []);

   const handleSaveEdit = useCallback(async () => {
    setEditModalOpen(false);
    setEditData(null);
    toast.success("Pallet deposit updated successfully!", { theme: "colored" });
    // Mevcut sayfadaki veriyi yenile
    await fetchPalletDeposits(currentPage, activeFilters);
  }, [currentPage, fetchPalletDeposits, activeFilters]);

  const handleDelete = useCallback((id, projectCode) => {
      setDeleteId(id);
      // Daha anlamlı bir silme mesajı için Project Code kullan
      setItemToDeleteName(projectCode ? `deposit for project ${projectCode}` : `record #${id}`);
      setDeleteModalOpen(true);
  }, []);


  // --- DELETE İşlemi (toast.update kullanımı ile düzeltildi) ---
  const confirmDelete = useCallback(async () => {
    if (!deleteId || !token) {
      // Artık toast kullanıyoruz
      toast.error("Error: Cannot delete item. ID or token missing.", { theme: "colored" });
      setDeleteModalOpen(false);
      return;
    }

    // react-toastify'nin loading toast'ını kullan
    const toastId = toast.loading("Deleting item...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/PalletDeposit`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        // Body genellikle ID içerir
        body: JSON.stringify({ Id: deleteId }),
      });

      let responseData = {};
      try {
         // Yanıt JSON olmasa bile okumayı dene, başarısız olursa sorun değil
         if (response.headers.get("content-type")?.includes("application/json")) {
            responseData = await response.json();
         }
      } catch (e) { console.warn("Could not parse JSON response on delete.", e); }

      // Hem HTTP status hem de IsSuccess kontrolü (varsa)
      if (!response.ok || (responseData && responseData.IsSuccess === false)) { // IsSuccess false ise de hata kabul et
          const errorMsg = responseData?.Message || `Failed with status: ${response.status}`;
          throw new Error(errorMsg);
      }

      // Başarılı: toast'ı güncelle
      toast.update(toastId, {
        render: responseData?.Message || "Item deleted successfully!",
        type: "success",
        isLoading: false, // Spinner'ı kaldır
        autoClose: 3000,  // Otomatik kapanma süresi
        theme: "colored"
      });

      // Veriyi yeniden yükle veya state'i güncelle
      const newTotalItems = totalItems - 1;
      const newTotalPages = Math.ceil(newTotalItems / itemsPerPage) || 1;

      // Eğer sildiğimiz son eleman sayfadaki tek elemansa ve son sayfadaysak bir önceki sayfaya git
      if (palletDepositData.length === 1 && currentPage > 1 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages); // Bir önceki sayfaya git
      } else {
        // Mevcut sayfayı yeniden yükle
        await fetchPalletDeposits(currentPage, activeFilters);
      }

    } catch (error) {
      console.error("Delete confirmation error:", error);
      // Başarısız: toast'ı güncelle
      toast.update(toastId, {
        render: `Error deleting item: ${error.message || "Unknown error"}`,
        type: "error",
        isLoading: false,
        autoClose: 5000, // Hata mesajı biraz daha uzun kalsın
        theme: "colored"
      });
    } finally {
      // Modal'ı kapat ve ID'leri sıfırla
      setDeleteId(null);
      setItemToDeleteName("");
      setDeleteModalOpen(false);
    }
  }, [ deleteId, token, totalItems, itemsPerPage, palletDepositData.length, currentPage, fetchPalletDeposits, activeFilters ]); // Bağımlılıklar güncellendi


  // --- Tablo Sütunları (useMemo içinde) ---
  const columns = useMemo(
    () => [
      { Header: "Project Code", accessor: "ProjectCode", Cell: ({ value }) => value || <span style={{ color: "#adb5bd" }}>N/A</span> },
      { Header: "Deposit", accessor: "Deposit", className: "col-deposit", Cell: ({ value }) => (value != null ? value.toLocaleString('tr-TR') : "-") }, // Sayı formatlama
      { Header: "Created", accessor: "CreatedDate", className: "col-date", Cell: ({ value }) => formatDate(value) },
      { Header: "Created By", accessor: "CreatedBy", Cell: ({ value }) => value || "-" },
      { Header: "Modified", accessor: "ModifiedDate", className: "col-date", Cell: ({ value }) => formatDate(value) },
      { Header: "Modified By", accessor: "ModifiedBy", Cell: ({ value }) => value || "-" },
      {
        Header: "Actions", id: "actions", className: "col-actions",
        Cell: ({ row }) => (
          <div style={{ display: "flex", gap: "5px", justifyContent: "center", alignItems: "center" }}>
            <ActionButton className="edit" onClick={() => handleEdit(row.original)} title="Edit">
              <FaEdit size={15} />
            </ActionButton>
            <ActionButton className="delete" onClick={() => handleDelete(row.original.Id, row.original.ProjectCode)} title="Delete">
              <FaTrash size={14} />
            </ActionButton>
          </div>
        ),
      },
    ],
    [formatDate, handleEdit, handleDelete] // handleEdit ve handleDelete buraya eklenmeli
  );

  // --- Render ---
  const hasActiveFilter = activeFilters.projectId !== null;
  const projectOptionsAvailable = !isDropdownLoading && projects.length > 0;


  return (
    <PageContainer>
      <Card>
        <Header>
          <Title><FaWarehouse /> Pallet Deposits</Title>
          <Controls>
            <FilterGroup>
              <Select
                inputId="projectFilter"
                options={projects}
                value={activeFilters.projectId}
                onChange={(option) => debouncedHandleFilterChange("projectId", option)}
                placeholder={ isDropdownLoading ? "Loading..." : "Filter by Project..." }
                styles={reactSelectStylesFilter}
                isClearable
                isSearchable
                isLoading={isDropdownLoading}
                isDisabled={isLoading || isDropdownLoading || projects.length === 0} // Proje yoksa da disable
                aria-label="Filter by Project"
                noOptionsMessage={() => isDropdownLoading ? 'Loading...' : 'No projects found'}
              />
            </FilterGroup>
            {hasActiveFilter && (
              <ClearButton onClick={handleClearFilters} disabled={isLoading || isDropdownLoading}>
                <FaTimesCircle size={13} /> Clear Filter
              </ClearButton>
            )}
            <CreateButton
              onClick={handleCreate}
              disabled={ isLoading || isDropdownLoading || !projectOptionsAvailable }
              title={ !projectOptionsAvailable ? "No projects available to create deposit" : "Create New Pallet Deposit" }
            >
              <FaPlus size={13} /> Create New
            </CreateButton>
          </Controls>
        </Header>

        {isLoading && (
          <MessageContainer className="loading"><Spinner size={16} /> Loading data...</MessageContainer>
        )}
        {error && (
          <MessageContainer className="error">{error}</MessageContainer>
        )}
        {!isLoading && !error && (
          palletDepositData.length > 0 ? (
            <TableWrapper>
              <Table columns={columns} data={palletDepositData} />
            </TableWrapper>
          ) : (
            <MessageContainer className="no-data">
              {hasActiveFilter ? "No records found matching your filter criteria." : "No pallet deposit records available."}
            </MessageContainer>
          )
        )}

        {/* Pagination (isLoading, error, totalPages kontrolü eklendi) */}
        {!isLoading && !error && totalItems > 0 && totalPages > 1 && (
           <PaginationContainer>
                <PaginationButton onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} title="Previous Page">
                    <FaChevronLeft size={12} />
                </PaginationButton>
                {getPageNumbers().map((page, index) => (
                    typeof page === 'number' ? (
                        <PaginationButton key={`page-${page}`} active={currentPage === page} onClick={() => handlePageChange(page)} disabled={isLoading}>
                            {page}
                        </PaginationButton>
                    ) : (
                        <span key={`ellipsis-${index}`} style={{ padding: '0 8px', alignSelf: 'center', color: '#adb5bd', fontSize: '13px' }}>{page}</span>
                    )
                ))}
                <PaginationButton onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} title="Next Page">
                    <FaChevronRight size={12} />
                </PaginationButton>
            </PaginationContainer>
        )}
      </Card>

      {/* Modals (Props geçişleri kontrol edildi) */}
      {isCreateModalOpen && (
        <CreatePalletDepositModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSaveCreate} // onSaveSuccess -> onSave olabilir, Create modal tanımına bağlı
          apiBaseUrl={API_BASE_URL}
          token={token}
          // `projects` prop'u Create modal için gerekli (react-select options olarak kullanmak için)
          projects={projects} // Project listesini Create modala gönderiyoruz
        />
      )}
      {isEditModalOpen && editData && (
        <EditPalletDepositModal
          isOpen={isEditModalOpen}
          onClose={() => { setEditModalOpen(false); setEditData(null); }}
          onSave={handleSaveEdit} // onSaveSuccess -> onSave olabilir
          initialData={editData}
          apiBaseUrl={API_BASE_URL}
          token={token}
          // Edit modalında proje dropdown'ı göstermiyorsak 'projects' prop'una gerek yok.
          // Eğer gösteriyorsak veya başka bir amaçla lazımsa:
          // projects={projects}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setDeleteId(null); setItemToDeleteName(''); }}
          onConfirm={confirmDelete}
          itemName={itemToDeleteName}
          // Mesaj daha dinamik hale getirildi
          message={`Are you sure you want to permanently delete this item: "${itemToDeleteName || 'N/A'}"?`}
        />
      )}

      {/* react-toastify'nin kendi container'ını kullanıyoruz */}
      {/* Custom wrapper'ınız sadece stil içeriyorsa onu kullanabilirsiniz */}
      <CustomToastContainerWrapper position="bottom-right" autoClose={4000} theme="colored" />
       {/* VEYA doğrudan: <ToastContainer position="bottom-right" autoClose={4000} theme="colored" /> */}

    </PageContainer>
  );
};

export default PalletDepositPage;
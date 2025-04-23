import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import styled from "styled-components";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaHistory,
  FaChevronLeft,
  FaChevronRight,
  FaProjectDiagram,
  FaShoppingCart,
  FaTimesCircle,
  FaCalendarAlt,
  FaTags,
  FaFileExcel,
  FaImage, // Eklendi
  FaExclamationTriangle, // Eklendi
} from "react-icons/fa";
import Table from "../components/Table";
import CreateTrolleyModal from "../components/CreateTrolleyModal";
import EditTrolleyModal from "../components/EditTrolleyModal";
import DeleteModal from "../components/DeleteModal";
import TrolleyHistoryModal from "../components/TrolleyHistoryModal";
import ImageZoomModal from "../components/ImageZoomModal"; // *** Image Zoom Modal import edildi ***
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

// --- Helper Function for Image URL Transformation ---
const generateDisplayImageUrl = (backendUrl) => {
  // Ensures the URL is valid and prepends '/uploads/' if necessary
  if (
    !backendUrl ||
    typeof backendUrl !== "string" ||
    !backendUrl.startsWith("http")
  ) {
    return null;
  }
  try {
    const url = new URL(backendUrl);
    if (url.pathname.startsWith("/uploads/")) {
      return backendUrl;
    } // Already has prefix
    const newPathname = `/uploads${url.pathname}`; // Prepend the prefix
    return `${url.origin}${newPathname}`; // Combine
  } catch (e) {
    console.error("Error constructing image display URL:", backendUrl, e);
    return null;
  }
};

// --- Styled Components (Mevcut olanlar ve yeni eklenenler) ---
const TrolleyContainer = styled.div`
  /* ... */
  padding: 3px;
  background-color: #f8f9fa;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 11px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
`;
const Header = styled.div`
  /* ... */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
  flex-wrap: wrap;
  gap: 10px;
`;
const Title = styled.h1`
  /* ... */
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #343a40;
  display: flex;
  align-items: center;
  gap: 10px;
`;
const ButtonGroup = styled.div`
  /* ... */
  display: flex;
  gap: 12px;
  align-items: center;
`;
const StyledButton = styled.button`
  /* ... */
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease,
    opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.2);
  line-height: 1.4;
  &:hover:not(:disabled) {
    background-color: #0056b3;
    box-shadow: 0 2px 5px rgba(0, 123, 255, 0.3);
  }
  &:disabled {
    background-color: #c0c0c0;
    opacity: 0.7;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
const DeleteSelectedButton = styled(StyledButton)`
  /* ... */
  background-color: #dc3545;
  box-shadow: 0 1px 3px rgba(220, 53, 69, 0.3);
  &:hover:not(:disabled) {
    background-color: #c82333;
    box-shadow: 0 2px 5px rgba(220, 53, 69, 0.4);
  }
  &:disabled {
    background-color: #f8d7da;
    color: #721c24;
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
    border: 1px solid #f5c6cb;
  }
`;
const sharedInputStyles = ` /* ... */ padding: 8px 10px; border: 1px solid #ced4da; border-radius: 4px; font-size: 13px; color: #495057; background-color: #fff; transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; &:focus { border-color: #80bdff; outline: 0; box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); } `;
const FilterContainer = styled.div`
  /* ... */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 15px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
  margin-bottom: 15px;
  max-width: 1000px;
  margin: 0 auto 15px auto; /* ... DatePicker ... */
  .react-datepicker-wrapper {
    width: 100%;
  }
  .react-datepicker__input-container input {
    ${sharedInputStyles} width: 100%;
    box-sizing: border-box;
    cursor: pointer;
  }
  .react-datepicker__header {
    background-color: #007bff;
    color: white;
    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      color: white;
    }
    .react-datepicker__day-name {
      color: #f8f9fa;
    }
  }
  .react-datepicker__navigation--previous,
  .react-datepicker__navigation--next {
    top: 12px;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #007bff;
  }
  .react-datepicker__day:hover {
    background-color: #e9ecef;
  }
`;
const FilterGroup = styled.div`
  /* ... */
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const FilterLabel = styled.label`
  /* ... */
  font-weight: 500;
  color: #495057;
  font-size: 12px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const ClearButton = styled(StyledButton)`
  /* ... */
  background-color: #6c757d;
  box-shadow: 0 1px 3px rgba(108, 117, 125, 0.3);
  &:hover:not(:disabled) {
    background-color: #5a6268;
    box-shadow: 0 2px 5px rgba(108, 117, 125, 0.4);
  }
  height: 36px;
  width: 67%;
  box-sizing: border-box;
`;
const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: auto;
  }
  th,
  td {
    padding: 8px 10px;
    white-space: nowrap;
    box-sizing: border-box;
    vertical-align: middle;
  }
  .col-select {
    width: 40px;
    text-align: center;
  }
  .col-image {
    width: 60px;
    text-align: center;
  }
  .col-counts {
    width: 75px;
    text-align: center;
  }
  .col-actions {
    min-width: 110px;
    text-align: center;
  }
`;
const reactSelectStylesFilter = {
  /* ... */ control: (p, s) => ({
    ...p,
    minHeight: "36px",
    height: "36px",
    fontSize: "13px",
    borderColor: s.isFocused ? "#007bff" : "#ced4da",
    boxShadow: s.isFocused ? "0 0 0 1px #007bff" : "none",
    "&:hover": { borderColor: s.isFocused ? "#007bff" : "#adb5bd" },
    borderRadius: "4px",
    cursor: "pointer",
  }),
  valueContainer: (p) => ({ ...p, height: "36px", padding: "0 8px" }),
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
    color: s.isSelected ? "#fff" : s.isFocused ? "#000" : "#495057",
    padding: "6px 10px",
    fontSize: "13px",
    cursor: "pointer",
  }),
  menu: (p) => ({
    ...p,
    borderRadius: "4px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1101,
  }),
  menuList: (p) => ({ ...p, maxHeight: "150px", overflowY: "auto" }),
  placeholder: (p) => ({ ...p, color: "#6c757d", fontSize: "13px" }),
  singleValue: (p) => ({ ...p, color: "#495057" }),
};
const PaginationContainer = styled.div`
  /* ... */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
`;
const PaginationButton = styled.button`
  /* ... */
  padding: 4px 8px;
  min-width: 32px;
  height: 32px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
  background-color: ${(props) => (props.active ? "#007bff" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#212529")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  border-radius: 6px;
  &:hover:not(:disabled) {
    background-color: ${(props) => (props.active ? "#007bff" : "#e9ecef")};
    z-index: 2;
  }
  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
    border-color: #dee2e6;
  }
`;
const LoadingOverlay = styled.div`
  /* ... */
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  font-size: 18px;
  color: #333;
`;
const ErrorMessage = styled.p`
  /* ... */
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px 15px;
  border-radius: 6px;
  margin: 10px 0;
`;
const ImageCellContainer = styled.div`
  width: 40px;
  height: 40px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  color: #adb5bd;
  border: 1px solid #e9ecef;
  /* ** GÜNCELLENDİ: Resim varsa veya hata yoksa cursor pointer olsun */
  cursor: ${(props) => (props.hasValidUrl ? "pointer" : "help")};
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: ${(props) =>
      props.hasValidUrl ? "scale(1.15)" : "none"}; // Resim varsa hafif büyüsün
    box-shadow: ${(props) =>
      props.hasValidUrl ? "0 2px 5px rgba(0,0,0,0.2)" : "none"};
  }
  &.error {
    border-color: #f5c6cb;
    background-color: #f8d7da;
    color: #721c24;
    cursor: help;
  }
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// --- IndeterminateCheckbox Component (Aynı) ---
const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    /* ... */ const defaultRef = useRef();
    const resolvedRef = ref || defaultRef;
    useEffect(() => {
      if (resolvedRef.current)
        resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);
    return (
      <input
        type="checkbox"
        ref={resolvedRef}
        {...rest}
        style={{ cursor: "pointer" }}
      />
    );
  }
);
IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

// --- Trolley Page Component ---
const TrolleyPage = () => {
  // --- State'ler ---
  const [trolleys, setTrolleys] = useState([]);
  const [projects, setProjects] = useState([]);
  const [trolleyTypes, setTrolleyTypes] = useState([]);
  const [trolleyTypesMap, setTrolleyTypesMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownLoading, setIsDropdownLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedTrolley, setSelectedTrolley] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const token = localStorage.getItem("token");
  const headerCheckboxRef = useRef();
  const [activeFilters, setActiveFilters] = useState({
    projectId: null,
    trolleyTypeId: null,
    startDate: null,
    endDate: null,
  });

  // *** YENİ: Image Zoom Modal State'leri ***
  const [isImageZoomModalOpen, setImageZoomModalOpen] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState(null);
  // *** --- ***

  // --- Data Fetching ---
  const fetchProjects = useCallback(async () => {
    /* ... önceki fetchProjects ... */ setIsDropdownLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/Project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      setProjects(
        d[0]?.Projects?.map((p) => ({ value: p.Id, label: p.ProjectCode })) ||
          []
      );
    } catch (e) {
      setError(`Proj Err: ${e.message}`);
      setProjects([]);
    } finally {
      setIsDropdownLoading(false);
    }
  }, [token]);
  const fetchTrolleyTypes = useCallback(async () => {
    /* ... önceki fetchTrolleyTypes image ve map ile ... */ setIsDropdownLoading(
      true
    );
    try {
      const r = await fetch(`${API_BASE_URL}/api/TrolleyType`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const typesFromApi =
        data && data.length > 0 && data[0]?.TrolleyTypes
          ? data[0].TrolleyTypes
          : [];
      const formattedTypes = typesFromApi.map((t) => ({
        value: t.Id,
        label: t.Name,
        imageUrl: generateDisplayImageUrl(t.ImageUrl),
      }));
      setTrolleyTypes(formattedTypes);
      const typeMap = formattedTypes.reduce((acc, t) => {
        if (t.value != null) {
          acc[t.value] = t.imageUrl;
        }
        return acc;
      }, {});
      setTrolleyTypesMap(typeMap);
    } catch (e) {
      setError(`Type Err: ${e.message}`);
      console.error("Error fetching trolley types:", e);
      setTrolleyTypes([]);
      setTrolleyTypesMap({});
    } finally {
      setIsDropdownLoading(false);
    }
  }, [token]);
  const fetchTrolleys = useCallback(
    async (page = 1, filtersToUse = {}) => {
      /* ... önceki fetchTrolleys ... */ setIsLoading(true);
      setError("");
      setSelectedRowIds({});
      try {
        const params = new URLSearchParams({
          Page: page.toString(),
          "ShowMore.Take": itemsPerPage.toString(),
        });
        if (filtersToUse.projectId)
          params.append("ProjectId", filtersToUse.projectId.toString());
        if (filtersToUse.trolleyTypeId)
          params.append("TrolleyTypeId", filtersToUse.trolleyTypeId.toString());
        if (filtersToUse.startDate) {
          const startDate = new Date(filtersToUse.startDate);
          const formattedStartDate = `${(startDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${startDate
            .getDate()
            .toString()
            .padStart(2, "0")}-${startDate.getFullYear()}`;
          params.append("StartDate", formattedStartDate);
        }
        if (filtersToUse.endDate) {
          const endDate = new Date(filtersToUse.endDate);
          const formattedEndDate = `${(endDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${endDate
            .getDate()
            .toString()
            .padStart(2, "0")}-${endDate.getFullYear()}`;
          params.append("EndDate", formattedEndDate);
        }
        const response = await fetch(
          `${API_BASE_URL}/api/Trolley?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          if (response.status === 401) setError("Unauthorized.");
          else throw new Error(`HTTP ${response.status}`);
          setTrolleys([]);
          setTotalItems(0);
          setTotalPages(1);
          return;
        }
        const data = await response.json();
        if (data && data.length > 0 && data[0]?.Trolleys) {
          const d = data[0];
          setTrolleys(d.Trolleys || []);
          setTotalItems(d.TotalTrolleyCount || 0);
          setTotalPages(
            Math.ceil((d.TotalTrolleyCount || 0) / itemsPerPage) || 1
          );
        } else {
          setTrolleys([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (err) {
        setError(err.message || "Fetch Trolleys Error");
        setTrolleys([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    },
    [token, itemsPerPage]
  );

  // --- Initial Load & Filter Effect (Aynı) ---
  useEffect(() => {
    if (token) {
      fetchProjects();
      fetchTrolleyTypes();
    } else {
      setError("Token not found.");
    }
  }, [token, fetchProjects, fetchTrolleyTypes]);
  useEffect(() => {
    if (
      token &&
      projects.length > 0 &&
      Object.keys(trolleyTypesMap).length > 0
    ) {
      fetchTrolleys(currentPage, {
        projectId: activeFilters.projectId?.value,
        trolleyTypeId: activeFilters.trolleyTypeId?.value,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
      });
    } else if (
      token &&
      (projects.length > 0 || Object.keys(trolleyTypesMap).length > 0)
    ) {
      fetchTrolleys(currentPage, {
        projectId: activeFilters.projectId?.value,
        trolleyTypeId: activeFilters.trolleyTypeId?.value,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
      });
    }
  }, [
    token,
    currentPage,
    activeFilters,
    projects,
    trolleyTypesMap,
    fetchTrolleys,
  ]);

  // --- Seçim Fonksiyonları & State (Aynı) ---
  const handleRowSelect = (id) =>
    setSelectedRowIds((prev) => ({ ...prev, [id]: !prev[id] }));
  const handleSelectAll = (e) => {
    const chkd = e.target.checked;
    const newIds = {};
    if (chkd)
      trolleys.forEach((t) => {
        if (t.Id != null) newIds[t.Id] = true;
      });
    setSelectedRowIds(newIds);
  };
  const getHeaderCheckboxState = useMemo(() => {
    const pageIds = trolleys.map((t) => t.Id).filter((id) => id != null);
    const selCnt = pageIds.filter((id) => selectedRowIds[id]).length;
    if (pageIds.length === 0) return { c: false, i: false };
    if (selCnt === pageIds.length) return { c: true, i: false };
    return { c: false, i: selCnt > 0 };
  }, [selectedRowIds, trolleys]);
  const getSelectedIdsArray = useCallback(
    () =>
      Object.keys(selectedRowIds)
        .filter((id) => selectedRowIds[id])
        .map(Number),
    [selectedRowIds]
  );
  useEffect(() => {
    if (headerCheckboxRef.current)
      headerCheckboxRef.current.indeterminate = getHeaderCheckboxState.i;
  }, [getHeaderCheckboxState]);

  // *** YENİ: Image Zoom Modal Fonksiyonları ***
  const handleImageClick = useCallback((imageUrl) => {
    if (imageUrl) {
      setZoomedImageUrl(imageUrl);
      setImageZoomModalOpen(true);
    }
  }, []);

  const handleCloseImageZoomModal = useCallback(() => {
    setImageZoomModalOpen(false);
    setTimeout(() => setZoomedImageUrl(null), 300); // Animasyon süresi kadar bekle
  }, []);
  // *** --- ***

  // --- Table Columns (Img Cell güncellendi) ---
  const columns = useMemo(
    () => [
      {
        id: "selection",
        Header: () => (
          <IndeterminateCheckbox
            ref={headerCheckboxRef}
            checked={getHeaderCheckboxState.c}
            onChange={handleSelectAll}
            title="Select/deselect all"
          />
        ),
        Cell: ({ row }) => {
          const id = row.original?.Id;
          if (id == null) return null;
          return (
            <input
              type="checkbox"
              checked={!!selectedRowIds[id]}
              onChange={() => handleRowSelect(id)}
            />
          );
        },
        headerClassName: "col-select",
        className: "col-select",
      },
      { Header: "Project", accessor: "ProjectName" },
      // ** DEĞİŞTİ: Image Sütunu, Type sütunundan ÖNCE ve tıklanabilir **
      {
        Header: "Img",
        id: "typeImage",
        Cell: ({ row }) => {
          const typeId = row.original?.TrolleyTypeId;
          const displayUrl = typeId != null ? trolleyTypesMap[typeId] : null;
          const [imgError, setImgError] = useState(false);
          useEffect(() => {
            setImgError(false);
          }, [displayUrl]);
          // Sadece URL varsa ve hata yoksa tıklanabilir yap
          const canZoom = displayUrl && !imgError;
          return (
            <ImageCellContainer
              className={imgError ? "error" : ""}
              title={
                imgError
                  ? "Error loading"
                  : displayUrl
                  ? `Zoom ${row.original?.TrolleyTypeName}`
                  : "No image"
              }
              onClick={canZoom ? () => handleImageClick(displayUrl) : undefined} // onClick handler
              hasValidUrl={canZoom} // Stil için prop
            >
              {displayUrl && !imgError ? (
                <img
                  src={displayUrl}
                  alt=""
                  onError={() => setImgError(true)}
                />
              ) : imgError ? (
                <FaExclamationTriangle />
              ) : (
                <FaImage />
              )}
            </ImageCellContainer>
          );
        },
        headerClassName: "col-image",
        className: "col-image",
      },
      { Header: "Type", accessor: "TrolleyTypeName" },
      {
        Header: "Work",
        accessor: "WorkingTrolleysCount",
        Cell: ({ value }) => (
          <div
            style={{ textAlign: "center", color: "#16a34a", fontWeight: "600" }}
          >
            {value ?? "-"}
          </div>
        ),
        headerClassName: "col-counts",
        className: "col-counts",
      },
      {
        Header: "Broken",
        accessor: "BrokenTrolleysCount",
        Cell: ({ value }) => (
          <div
            style={{ textAlign: "center", color: "#dc2626", fontWeight: "600" }}
          >
            {value ?? "-"}
          </div>
        ),
        headerClassName: "col-counts",
        className: "col-counts",
      },
      {
        Header: "Total",
        id: "totalCount",
        accessor: (r) =>
          (r.WorkingTrolleysCount || 0) + (r.BrokenTrolleysCount || 0),
        Cell: ({ value }) => (
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              color: "#212529",
            }}
          >
            {value}
          </div>
        ),
        headerClassName: "col-counts",
        className: "col-counts",
      },
      {
        Header: "Created",
        accessor: "CreatedDate",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        Header: "Creator",
        accessor: "CreatedBy",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Modified",
        accessor: "ModifiedDate",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleDateString() : "-",
      },
      {
        Header: "Modifier",
        accessor: "ModifiedBy",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {" "}
            <FaEdit
              title="Edit Counts"
              style={{ cursor: "pointer", color: "#ffc107", fontSize: "16px" }}
              onClick={() => {
                setSelectedRowIds({});
                setSelectedTrolley(row.original);
                setEditModalOpen(true);
              }}
            />{" "}
            <FaTrash
              title="Delete Record"
              style={{ cursor: "pointer", color: "#dc3545", fontSize: "15px" }}
              onClick={() => handleDelete(row.original.Id)}
            />{" "}
            <FaHistory
              title="View History"
              style={{ cursor: "pointer", color: "#17a2b8", fontSize: "15px" }}
              onClick={() => {
                setSelectedRowIds({});
                setSelectedTrolley(row.original);
                setHistoryModalOpen(true);
              }}
            />{" "}
          </div>
        ),
        headerClassName: "col-actions",
        className: "col-actions",
      },
    ],
    [selectedRowIds, getHeaderCheckboxState, trolleyTypesMap, handleImageClick] // handleImageClick eklendi
  );

  // --- Export Handler (Aynı) ---
  const handleExport = useCallback(async () => {
    /* ... önceki export kodu ... */ setIsLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeFilters.projectId)
        params.append("ProjectId", activeFilters.projectId.value.toString());
      if (activeFilters.trolleyTypeId)
        params.append(
          "TrolleyTypeId",
          activeFilters.trolleyTypeId.value.toString()
        );
      if (activeFilters.startDate) {
        const startDate = new Date(activeFilters.startDate);
        const formattedStartDate = `${(startDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${startDate
          .getDate()
          .toString()
          .padStart(2, "0")}-${startDate.getFullYear()}`;
        params.append("StartDate", formattedStartDate);
      }
      if (activeFilters.endDate) {
        const endDate = new Date(activeFilters.endDate);
        const formattedEndDate = `${(endDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${endDate
          .getDate()
          .toString()
          .padStart(2, "0")}-${endDate.getFullYear()}`;
        params.append("EndDate", formattedEndDate);
      }
      const response = await fetch(
        `${API_BASE_URL}/api/Trolley/export-trolleys?${params.toString()}`,
        {
          method: "GET",
          headers: { Accept: "*/*", Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `TrolleyDetails_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("Export successful", "success");
    } catch (err) {
      console.error("Export Error:", err);
      showToast(`Export failed: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, [token, activeFilters, API_BASE_URL]);
  // --- CRUD Handlers & Diğer Fonksiyonlar (Aynı) ---
  const handleCreate = () => {
    setSelectedRowIds({});
    setCreateModalOpen(true);
  };
  const handleSaveNew = useCallback(async () => {
    setCreateModalOpen(false);
    if (currentPage !== 1) setCurrentPage(1);
    else
      fetchTrolleys(1, {
        projectId: activeFilters.projectId?.value,
        trolleyTypeId: activeFilters.trolleyTypeId?.value,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
      });
  }, [currentPage, fetchTrolleys, activeFilters]);
  const handleSaveEdit = useCallback(async () => {
    setEditModalOpen(false);
    setSelectedTrolley(null);
    fetchTrolleys(currentPage, {
      projectId: activeFilters.projectId?.value,
      trolleyTypeId: activeFilters.trolleyTypeId?.value,
      startDate: activeFilters.startDate,
      endDate: activeFilters.endDate,
    });
  }, [currentPage, fetchTrolleys, activeFilters]);
  const handleCloseHistory = () => {
    setHistoryModalOpen(false);
    setSelectedTrolley(null);
  };
  const handleDelete = (id) => {
    setItemToDelete(id);
    setIsBulkDelete(false);
    setDeleteModalOpen(true);
  };
  const handleBulkDelete = () => {
    const ids = getSelectedIdsArray();
    if (ids.length === 0) {
      showToast("Select rows", "warn");
      return;
    }
    setItemToDelete(ids);
    setIsBulkDelete(true);
    setDeleteModalOpen(true);
  };
  const confirmDelete = useCallback(async () => {
    const ids = Array.isArray(itemToDelete)
      ? itemToDelete
      : itemToDelete != null
      ? [itemToDelete]
      : [];
    if (ids.length === 0) {
      setDeleteModalOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const payload = { Ids: ids };
      const r = await fetch(`${API_BASE_URL}/api/Trolley`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok)
        throw new Error((await r.json()).Message || `HTTP ${r.status}`);
      showToast(`${ids.length} deleted`, "success");
      const total = totalItems - ids.length;
      const pages = Math.ceil(total / itemsPerPage) || 1;
      const left = trolleys.length - ids.length;
      setSelectedRowIds({});
      const targetPage = Math.max(1, Math.min(currentPage, pages));
      if (left <= 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentPage !== targetPage) {
        setCurrentPage(targetPage);
      } else {
        fetchTrolleys(targetPage, {
          projectId: activeFilters.projectId?.value,
          trolleyTypeId: activeFilters.trolleyTypeId?.value,
          startDate: activeFilters.startDate,
          endDate: activeFilters.endDate,
        });
      }
    } catch (e) {
      console.error("Del Err:", e);
      showToast(`Err: ${e.message}`, "error");
    } finally {
      setItemToDelete(null);
      setDeleteModalOpen(false);
      setIsBulkDelete(false);
      setIsLoading(false);
    }
  }, [
    itemToDelete,
    token,
    totalItems,
    itemsPerPage,
    trolleys,
    currentPage,
    fetchTrolleys,
    activeFilters,
  ]);
  const handleFilterChange = (filterName, value) => {
    setActiveFilters((prev) => ({ ...prev, [filterName]: value }));
    if (currentPage !== 1) setCurrentPage(1);
  };
  const handleClearFilters = () => {
    setActiveFilters({
      projectId: null,
      trolleyTypeId: null,
      startDate: null,
      endDate: null,
    });
    if (currentPage !== 1) setCurrentPage(1);
  };
  const handlePageChange = (pageNumber) => {
    if (
      pageNumber >= 1 &&
      pageNumber <= totalPages &&
      pageNumber !== currentPage
    ) {
      setCurrentPage(pageNumber);
    }
  };
  const getPageNumbers = () => {
    /* ... önceki pagination kodu ... */ const p = [],
      m = 5,
      h = Math.floor(m / 2);
    if (totalPages <= m) {
      for (let i = 1; i <= totalPages; i++) p.push(i);
    } else {
      p.push(1);
      let s = Math.max(
          2,
          currentPage -
            h +
            (totalPages - currentPage < h
              ? h - (totalPages - currentPage) + 1
              : 1)
        ),
        e = Math.min(totalPages - 1, s + m - 3);
      if (currentPage - 1 <= h) {
        s = 2;
        e = m - 1;
      } else if (totalPages - currentPage < h) {
        s = totalPages - m + 2;
        e = totalPages - 1;
      }
      if (s > 2) p.push("...");
      for (let i = s; i <= e; i++) p.push(i);
      if (e < totalPages - 1) p.push("...");
      p.push(totalPages);
    }
    return p;
  };

  // --- Render ---
  const selectedCount = getSelectedIdsArray().length;
  const canRenderContent =
    !isDropdownLoading &&
    projects.length > 0 &&
    Object.keys(trolleyTypesMap).length > 0;

  return (
    <TrolleyContainer>
      {isLoading && <LoadingOverlay>Loading...</LoadingOverlay>}
      <Header>
        {" "}
        <Title>
          {" "}
          <FaShoppingCart /> Trolley Management{" "}
        </Title>{" "}
        <ButtonGroup>
          {" "}
          {selectedCount > 0 && (
            <DeleteSelectedButton
              onClick={handleBulkDelete}
              disabled={isLoading}
            >
              {" "}
              <FaTrash /> Delete ({selectedCount}){" "}
            </DeleteSelectedButton>
          )}{" "}
          <StyledButton
            onClick={handleExport}
            disabled={!canRenderContent || isLoading}
            title="Export to Excel"
          >
            {" "}
            <FaFileExcel /> Export{" "}
          </StyledButton>{" "}
          <StyledButton
            onClick={handleCreate}
            disabled={!canRenderContent || isLoading}
          >
            {" "}
            <FaPlus /> Add Records{" "}
          </StyledButton>{" "}
        </ButtonGroup>{" "}
      </Header>

      <FilterContainer>
        {" "}
        {/* Filtreler */}{" "}
        <FilterGroup>
          {" "}
          <FilterLabel htmlFor="filterProject">
            {" "}
            <FaProjectDiagram /> Project{" "}
          </FilterLabel>{" "}
          <Select
            inputId="filterProject"
            options={projects}
            value={activeFilters.projectId}
            onChange={(value) => handleFilterChange("projectId", value)}
            placeholder="All Projects..."
            styles={reactSelectStylesFilter}
            isClearable
            isSearchable
            isDisabled={isDropdownLoading || isLoading}
          />{" "}
        </FilterGroup>{" "}
        <FilterGroup>
          {" "}
          <FilterLabel htmlFor="filterTrolleyType">
            {" "}
            <FaTags /> Trolley Type{" "}
          </FilterLabel>{" "}
          <Select
            inputId="filterTrolleyType"
            options={trolleyTypes}
            value={activeFilters.trolleyTypeId}
            onChange={(value) => handleFilterChange("trolleyTypeId", value)}
            placeholder="All Types..."
            styles={reactSelectStylesFilter}
            isClearable
            isSearchable
            isDisabled={isDropdownLoading || isLoading}
          />{" "}
        </FilterGroup>{" "}
        <FilterGroup>
          {" "}
          <FilterLabel htmlFor="filterStartDate">
            {" "}
            <FaCalendarAlt /> Start Date{" "}
          </FilterLabel>{" "}
          <DatePicker
            id="filterStartDate"
            selected={activeFilters.startDate}
            onChange={(date) => handleFilterChange("startDate", date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Start Date"
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            disabled={isLoading}
            wrapperClassName="datePickerWrapper"
          />{" "}
        </FilterGroup>{" "}
        <FilterGroup>
          {" "}
          <FilterLabel htmlFor="filterEndDate">
            {" "}
            <FaCalendarAlt /> End Date{" "}
          </FilterLabel>{" "}
          <DatePicker
            id="filterEndDate"
            selected={activeFilters.endDate}
            onChange={(date) => handleFilterChange("endDate", date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="End Date"
            isClearable
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            minDate={activeFilters.startDate}
            disabled={isLoading}
            wrapperClassName="datePickerWrapper"
          />{" "}
        </FilterGroup>{" "}
        <FilterGroup>
          {" "}
          <FilterLabel> </FilterLabel>{" "}
          <ClearButton onClick={handleClearFilters} disabled={isLoading}>
            {" "}
            <FaTimesCircle /> Clear{" "}
          </ClearButton>{" "}
        </FilterGroup>{" "}
      </FilterContainer>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div style={{ minHeight: "300px" }}>
        {!canRenderContent && !isLoading && !error && (
          <p
            style={{ textAlign: "center", marginTop: "40px", color: "#6c757d" }}
          >
            {" "}
            Loading options...{" "}
          </p>
        )}
        {canRenderContent &&
          !error &&
          (trolleys.length > 0 ? (
            <>
              <TableWrapper>
                {" "}
                <Table columns={columns} data={trolleys} />{" "}
              </TableWrapper>
              {totalPages > 1 && (
                <PaginationContainer>
                  {" "}
                  <PaginationButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    {" "}
                    <FaChevronLeft size={12} />{" "}
                  </PaginationButton>{" "}
                  {getPageNumbers().map((num, idx) => (
                    <PaginationButton
                      key={`${num}-${idx}`}
                      active={currentPage === num}
                      onClick={() =>
                        typeof num === "number" && handlePageChange(num)
                      }
                      disabled={isLoading || typeof num !== "number"}
                      style={
                        typeof num !== "number"
                          ? {
                              background: "none",
                              border: "none",
                              cursor: "default",
                            }
                          : {}
                      }
                    >
                      {" "}
                      {num}{" "}
                    </PaginationButton>
                  ))}{" "}
                  <PaginationButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    {" "}
                    <FaChevronRight size={12} />{" "}
                  </PaginationButton>{" "}
                </PaginationContainer>
              )}
            </>
          ) : (
            !isLoading && (
              <p
                style={{
                  textAlign: "center",
                  marginTop: "40px",
                  color: "#6c757d",
                }}
              >
                {" "}
                {Object.values(activeFilters).some((v) => v != null)
                  ? "No records match filters."
                  : "No records found."}{" "}
              </p>
            )
          ))}
      </div>

      {/* Modallar */}
      {isCreateModalOpen && (
        <CreateTrolleyModal
          isOpen={isCreateModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSaveSuccess={handleSaveNew}
          projects={projects}
          trolleyTypes={trolleyTypes}
          apiBaseUrl={API_BASE_URL}
          token={token}
        />
      )}
      {isEditModalOpen && selectedTrolley && (
        <EditTrolleyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedTrolley(null);
          }}
          onSaveSuccess={handleSaveEdit}
          initialData={selectedTrolley}
          apiBaseUrl={API_BASE_URL}
          token={token}
        />
      )}
      {isHistoryModalOpen && selectedTrolley && (
        <TrolleyHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={handleCloseHistory}
          trolleyData={selectedTrolley}
          apiBaseUrl={API_BASE_URL}
          token={token}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setItemToDelete(null);
            setIsBulkDelete(false);
          }}
          onConfirm={confirmDelete}
          itemName={isBulkDelete ? `${selectedCount} records` : `Record`}
          message={
            isBulkDelete
              ? `Delete ${selectedCount} records?`
              : `Delete this record?`
          }
          isLoading={isLoading}
        />
      )}

      {/* *** YENİ Image Zoom Modal Render *** */}
      <ImageZoomModal
        isOpen={isImageZoomModalOpen}
        onClose={handleCloseImageZoomModal}
        imageUrl={zoomedImageUrl}
      />
      {/* *** --- *** */}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </TrolleyContainer>
  );
};

export default TrolleyPage;

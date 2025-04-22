import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import Table from "../components/TableOperation"; // Import your enhanced Table component
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import Select from "react-select";

const StockContainer = styled.div`
  padding: 12px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #2d3a45;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-radius: 8px;
  flex-wrap: wrap;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
  min-width: 180px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const FilterInput = styled.input`
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    minHeight: "34px",
    fontSize: "14px",
    "&:hover": {
      borderColor: "#0284c7",
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 10,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#0284c7"
      : state.isFocused
      ? "#e6f7ff"
      : "white",
    color: state.isSelected ? "white" : "#2d3a45",
    fontSize: "14px",
  }),
};

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
`;

const PaginationButton = styled.button`
  padding: 4px 8px;
  min-width: 32px;
  height: 32px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
  background-color: ${(props) => (props.active ? "#0284c7" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#212529")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.active ? "#0284c7" : "#f8f9fa")};
    z-index: 2;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const ActionButton = styled.button`
  cursor: pointer;
  background-color: ${(props) => props.bgColor};
  color: #fff;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => props.hoverColor};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const BulkActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

// Styled component with transient props (prefixed with $)
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: capitalize;
  background-color: ${(props) => props.$bgColor};
  color: ${(props) => props.$textColor};
  border: 1px solid ${(props) => props.$borderColor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${(props) => props.$dotColor};
  }
`;

const ClearFilterButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  color: #4a5568;
  background-color: #ebf4ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #4299e1;
  color: white;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #4a5568;
    background-color: #ebf4ff;
  }
`;

const SelectionInfo = styled.div`
  padding: 10px;
  background-color: #e6f7ff;
  border-radius: 4px;
  font-size: 14px;
  color: #0284c7;
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const ManagerResponse = () => {
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    projectId: null,
  });
  const [statusFilter, setStatusFilter] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate current page items - moved up before it's used in handleSelectedRowsChange
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Status options for dropdown
  const statusOptions = [
    { value: null, label: "All Statuses" },
    { value: 1, label: "Pending" },
    { value: 2, label: "Approved" },
    { value: 3, label: "Rejected" }
  ];

  // Projects state
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Selection state
  const [selectedRows, setSelectedRows] = useState([]);

  // API parameters
  const [apiParams, setApiParams] = useState({
    ProjectId: null,
    OperationOrderStatus: null
  });

  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const isActionAllowed =
    user.roleId?.includes(3) ||
    user.roleId?.includes(2) ||
    user.roleId?.includes(12);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchStockData();
  }, [apiParams]);

  useEffect(() => {
    applyFilters();
  }, [filters, stockData]);

  // Calculate currentItems here before it's used in handleSelectedRowsChange
  const currentItems = useMemo(() => {
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, indexOfFirstItem, indexOfLastItem]);

  // Handle selected rows change with memoization to prevent infinite loops
  const handleSelectedRowsChange = useCallback(
    (rows) => {
      // When rows are received from the Table component, they represent
      // the current selection state of the current page
      
      // Get the currently visible rows on this page
      const currentPageIds = currentItems.map(item => item.Id);
      
      // Keep selections from other pages (not on current page)
      const selectionsFromOtherPages = selectedRows.filter(
        row => !currentPageIds.includes(row.Id)
      );
      
      // Filter current page selections to only include eligible rows
      const eligibleRows = rows.filter(
        (row) =>
          row.StoreRequestStatus === "Pending" &&
          row.OperationOrderStatus !== "Approved" &&
          row.OperationOrderStatus !== "Rejected"
      );
      
      // Create a map of current page row IDs for faster lookups
      const currentPageRowMap = {};
      currentItems.forEach(item => {
        currentPageRowMap[item.Id] = item;
      });
      
      // Combine selections from other pages with new selections from current page
      const combinedSelections = [...selectionsFromOtherPages, ...eligibleRows];
      
      // Remove any duplicates by creating a map and then converting back to array
      const uniqueSelections = Object.values(
        combinedSelections.reduce((map, row) => {
          map[row.Id] = row;
          return map;
        }, {})
      );
      
      setSelectedRows(uniqueSelections);
    },
    [selectedRows, currentItems]
  );
  
  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      projectId: null,
    });
    setStatusFilter(null);
    setApiParams((prev) => ({
      ...prev,
      ProjectId: null,
      OperationOrderStatus: null
    }));
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    setProjectsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Project`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      // Handle the project data structure properly
      let projectOptions = [];
      if (Array.isArray(data)) {
        // First format (direct array of projects)
        projectOptions = data[0].Projects.map((project) => ({
          value: project.Id,
          label: `${project.ProjectCode} `,
        }));
      } else if (data[0]?.Projects && Array.isArray(data[0].Projects)) {
        // Second format (nested in Projects array)
        projectOptions = data[0].Projects.map((project) => ({
          value: project.Id,
          label: `${project.ProjectCode} `,
        }));
      }

      setProjects(projectOptions);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Build query parameters only if needed
      const queryParams = new URLSearchParams();
      if (apiParams.ProjectId) queryParams.append("ProjectId", apiParams.ProjectId);
      if (apiParams.OperationOrderStatus !== null) queryParams.append("OperationOrderStatus", apiParams.OperationOrderStatus);

      // Only add the query parameters if they exist
      const queryString = queryParams.toString();
      const url = `${API_BASE_URL}/api/UniformForEmployee/GetPendingStoreRequestUniformForEmployee${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const stockRequests = data[0]?.UniformForEmployees || [];

      // Sort by newest first (assuming Id is incremental or there's a timestamp field)
      const sortedUniforms = [...stockRequests].sort((a, b) => {
        // Sort by id in descending order (newest first)
        return b.Id - a.Id;
      });

      setStockData(sortedUniforms);
      setFilteredData(sortedUniforms);
      setTotalPages(Math.ceil(sortedUniforms.length / itemsPerPage));
    } catch (err) {
      setError("Failed to fetch stock data.");
      console.error("API Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stockData];

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((item) => {
        const createdDate = new Date(item.CreatedDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectChange = (selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      projectId: selectedOption ? selectedOption.value : null,
    }));

    setApiParams((prev) => ({
      ...prev,
      ProjectId: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleStatusChange = (selectedOption) => {
    setStatusFilter(selectedOption);
    
    setApiParams((prev) => ({
      ...prev,
      OperationOrderStatus: selectedOption ? selectedOption.value : null
    }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // We no longer clear selections when changing pages
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // Single item approval
  const handleAccept = async (requestId) => {
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
            UniformForEmployeeIds: [requestId],
            IsApproved: true,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve request");

      await fetchStockData();
      showToast("Request approved successfully", "success");
    } catch (err) {
      setError("Error approving the request.");
      showToast("Error approving the request", "error");
    }
  };

  // Single item rejection
  const handleReject = async (requestId) => {
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
            UniformForEmployeeIds: [requestId],
            IsApproved: false,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject request");

      await fetchStockData();
      showToast("Request rejected successfully", "success");
    } catch (err) {
      setError("Error rejecting the request.");
      showToast("Error rejecting the request", "error");
    }
  };

  // Bulk approval
  const handleBulkAccept = async () => {
    if (selectedRows.length === 0) {
      showToast("Please select at least one request", "warning");
      return;
    }

    try {
      const ids = selectedRows.map((row) => row.Id);
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/ApproveRejectOperationOrder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UniformForEmployeeIds: ids,
            IsApproved: true,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve requests");

      await fetchStockData();
      showToast(`${ids.length} requests approved successfully`, "success");
      setSelectedRows([]);
    } catch (err) {
      setError("Error approving the requests.");
      showToast("Error approving the requests", "error");
    }
  };

  // Bulk rejection
  const handleBulkReject = async () => {
    if (selectedRows.length === 0) {
      showToast("Please select at least one request", "warning");
      return;
    }

    try {
      const ids = selectedRows.map((row) => row.Id);
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/ApproveRejectOperationOrder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UniformForEmployeeIds: ids,
            IsApproved: false,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject requests");

      await fetchStockData();
      showToast(`${ids.length} requests rejected successfully`, "success");
      setSelectedRows([]);
    } catch (err) {
      setError("Error rejecting the requests.");
      showToast("Error rejecting the requests", "error");
    }
  };

  // Function to check if a row is selected
  const isRowSelected = useCallback(
    (rowId) => {
      return selectedRows.some(row => row.Id === rowId);
    },
    [selectedRows]
  );

  const getStatusStyles = (status) => {
    switch (status) {
      case "Pending":
        return {
          bg: "#FFF7ED",
          text: "#9A3412",
          border: "#FDBA74",
          dot: "#F97316",
        };
      case "Accepted":
      case "Approved":
        return {
          bg: "#F0FDF4",
          text: "#166534",
          border: "#86EFAC",
          dot: "#22C55E",
        };
      case "Rejected":
        return {
          bg: "#FEF2F2",
          text: "#991B1B",
          border: "#FECACA",
          dot: "#EF4444",
        };
      case "Intransit":
        return {
          bg: "#F0F9FF",
          text: "#075985",
          border: "#BAE6FD",
          dot: "#0EA5E9",
        };
      default:
        return {
          bg: "#F9FAFB",
          text: "#374151",
          border: "#D1D5DB",
          dot: "#6B7280",
        };
    }
  };

  const columns = useMemo(
    () => [
      { Header: "Employee Name", accessor: "EmployeeName" },
      { Header: "Employee Project", accessor: "EmployeeProject" },
      { Header: "Uniform Name", accessor: "UniformName" },
      { Header: "Request Count", accessor: "RequestCount" },
      { Header: "Created Date", accessor: "CreatedDate" },
      { Header: "Created By", accessor: "CreatedBy" },
      { Header: "Unit Price", accessor: "UniformDCStockUnitPrice" },
      {
        Header: "Store Request Status",
        accessor: "StoreRequestStatus",
        Cell: ({ value }) => {
          const styles = getStatusStyles(value);
          return (
            <StatusBadge
              $bgColor={styles.bg}
              $textColor={styles.text}
              $borderColor={styles.border}
              $dotColor={styles.dot}
            >
              {value}
            </StatusBadge>
          );
        },
      },
      {
        Header: "Operation Response Status",
        accessor: "OperationOrderStatus",
        Cell: ({ value }) => {
          const styles = getStatusStyles(value);
          return (
            <StatusBadge
              $bgColor={styles.bg}
              $textColor={styles.text}
              $borderColor={styles.border}
              $dotColor={styles.dot}
            >
              {value}
            </StatusBadge>
          );
        },
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => {
          const { StoreRequestStatus, OperationOrderStatus, Id } = row.original;
          const isPending = StoreRequestStatus === "Pending";
          const isApproved = OperationOrderStatus === "Approved";
          const isRejected = OperationOrderStatus === "Rejected";

          return (
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              {isPending && !isApproved && !isRejected ? (
                <>
                  <ActionButton
                    onClick={() => handleAccept(Id)}
                    bgColor="#28a745"
                    hoverColor="#218838"
                    disabled={!isActionAllowed}
                  >
                    Accept
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleReject(Id)}
                    bgColor="#dc3545"
                    hoverColor="#c82333"
                    disabled={!isActionAllowed}
                  >
                    Reject
                  </ActionButton>
                </>
              ) : isApproved ? (
                <FaCheck style={{ fontSize: "20px", color: "#28a745" }} />
              ) : isRejected ? (
                <FaTimes style={{ fontSize: "20px", color: "#dc3545" }} />
              ) : null}
            </div>
          );
        },
      },
    ],
    [isActionAllowed]
  );

  // Count how many pending items are available for action
  const pendingItemsCount = filteredData.filter(
    (item) =>
      item.StoreRequestStatus === "Pending" &&
      item.OperationOrderStatus !== "Approved" &&
      item.OperationOrderStatus !== "Rejected"
  ).length;

  return (
    <StockContainer>
      <Header>
        <Title>Operation Response</Title>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Start Date</FilterLabel>
            <FilterInput
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>End Date</FilterLabel>
            <FilterInput
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Project</FilterLabel>
            <Select
              isClearable
              isSearchable
              options={projects}
              value={
                projects.find((p) => p.value === filters.projectId) || null
              }
              onChange={handleProjectChange}
              placeholder="Select Project"
              isLoading={projectsLoading}
              styles={customSelectStyles}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <Select
              isClearable
              isSearchable
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusChange}
              placeholder="Select Status"
              styles={customSelectStyles}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>&nbsp;</FilterLabel>
            <ClearFilterButton onClick={handleClearFilters}>
              Clear Filters
            </ClearFilterButton>
          </FilterGroup>
        </FilterContainer>
      </Header>

      {pendingItemsCount > 0 && isActionAllowed && (
        <BulkActionsContainer>
          <ActionButton
            onClick={handleBulkAccept}
            bgColor="#28a745"
            hoverColor="#218838"
            disabled={selectedRows.length === 0}
          >
            <FaCheckCircle style={{ marginRight: "6px" }} />
            Approve Selected (
            {
              selectedRows.filter(
                (row) =>
                  row.StoreRequestStatus === "Pending" &&
                  row.OperationOrderStatus !== "Approved" &&
                  row.OperationOrderStatus !== "Rejected"
              ).length
            }
            )
          </ActionButton>
          <ActionButton
            onClick={handleBulkReject}
            bgColor="#dc3545"
            hoverColor="#c82333"
            disabled={selectedRows.length === 0}
          >
            <FaTimesCircle style={{ marginRight: "6px" }} />
            Reject Selected (
            {
              selectedRows.filter(
                (row) =>
                  row.StoreRequestStatus === "Pending" &&
                  row.OperationOrderStatus !== "Approved" &&
                  row.OperationOrderStatus !== "Rejected"
              ).length
            }
            )
          </ActionButton>
        </BulkActionsContainer>
      )}

      {isLoading ? (
        <p>Loading uniforms...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentItems}
            selectable={pendingItemsCount > 0 && isActionAllowed}
            onSelectedRowsChange={handleSelectedRowsChange}
            selectedRowIds={selectedRows.map(row => row.Id)}
          />

          <PaginationContainer>
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft size={12} />
            </PaginationButton>

            {getPageNumbers().map((number) => (
              <PaginationButton
                key={number}
                active={currentPage === number}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </PaginationButton>
            ))}

            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight size={12} />
            </PaginationButton>
          </PaginationContainer>
        </>
      )}
      <ToastContainer />
    </StockContainer>
  );
};

export default ManagerResponse;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaPlus,
  FaHistory,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/TableTrans";
import TransEmployeeModal from "../components/TransEmployeeModal";
import TrackStatusModal from "../components/TrackStatusModal";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReassignModal from "../components/ReassignModal ";

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
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #2d3a45;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledButton = styled.button`
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #0284c7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #075985;
  }
`;

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const FilterInput = styled.input`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const FilterSelect = styled.select`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

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
  border-radius: 6px;

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

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: ${(props) =>
    props.variant === "accept" ? "#16a34a" : "#0369a1"};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.variant === "accept" ? "#149343" : "#035f91"};
  }
`;

const TransactionPage = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // Add this line
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [isTrackStatusModalOpen, setTrackStatusModalOpen] = useState(false);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isReassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedRowForReassign, setSelectedRowForReassign] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    badge: "",
    order: "",
    startDate: "",
    endDate: "",
  });
  const token = localStorage.getItem("token");

  const columns = [
    { Header: "Employee Badge", accessor: "EmployeeBadge" },
    { Header: "Employee Name", accessor: "EmployeeFullName" },
    { Header: "Uni Code", accessor: "UniformCode" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Size", accessor: "UniformSize" },
    { Header: "Type", accessor: "UniformType" },
    { Header: "Unit Price", accessor: "UnitPrice" },
    { Header: "Project Name", accessor: "ProjectName" },
    { Header: "Count", accessor: "UniCount" },
    { Header: "Sender", accessor: "Sender" },
    { Header: "Sender Date", accessor: "SenderDate" },
    { Header: "HandoveredBy", accessor: "HandoveredBy" },
    { Header: "Enacted Date", accessor: "EnactedDate" },
    {
      Header: "Status",
      accessor: "TransactionStatus",
      Cell: ({ value }) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            backgroundColor:
              value?.toLowerCase() === "pending"
                ? "#FEF3C7"
                : value?.toLowerCase() === "accepted"
                ? "#DCFCE7"
                : "#E5E7EB",
            color:
              value?.toLowerCase() === "pending"
                ? "#92400E"
                : value?.toLowerCase() === "accepted"
                ? "#166534"
                : "#374151",
          }}
        >
          {value}
        </span>
      ),
    },
    {
      Header: "Reassign",
      accessor: "reassign",
      Cell: ({ row }) => {
        const status = row.original.TransactionStatus?.toLowerCase();
        const isDisabled = status === "handovered" || status === "pending";

        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                if (isDisabled) {
                  showToast(`Cannot reassign a ${status} transaction`, "error");
                  return;
                }
                setSelectedRowForReassign(row.original);
                setReassignModalOpen(true);
              }}
              style={{
                padding: "4px 8px",
                backgroundColor: isDisabled ? "#9CA3AF" : "#0284c7",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
              disabled={isDisabled}
            >
              Reassign
            </button>
          </div>
        );
      },
    },
  ];

  // Add these handlers
  const handleRowSelect = (rowId) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      }
      return [...prev, rowId];
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(currentItems.map((item) => item.Id));
    } else {
      setSelectedRows([]);
    }
  };
  useEffect(() => {
    fetchStockData();
  }, []);

  useEffect(() => {
    if (stockData.length > 0) {
      const statuses = [
        ...new Set(stockData.map((item) => item.TransactionStatus)),
      ].filter(Boolean);
      setUniqueStatuses(statuses.sort());
    }
  }, [stockData]);

  useEffect(() => {
    applyFilters();
  }, [filters, stockData]);

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL + "/api/TransactionPage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const transactions = data[0]?.Transactions || [];

      // Sort by Id in descending order
      const sortedTransactions = [...transactions].sort((a, b) => b.Id - a.Id);

      setStockData(sortedTransactions);
      setFilteredData(sortedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transaction data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stockData];

    if (filters.status) {
      filtered = filtered.filter(
        (item) =>
          String(item.TransactionStatus)?.toLowerCase() ===
          filters.status.toLowerCase()
      );
    }

    if (filters.badge) {
      filtered = filtered.filter((item) =>
        String(item.EmployeeBadge)
          ?.toLowerCase()
          .includes(filters.badge.toLowerCase())
      );
    }

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((item) => {
        const senderDate = new Date(item.SenderDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        return senderDate >= startDate && senderDate <= endDate;
      });
    }

    if (filters.order) {
      const now = new Date();
      const sixMonthsInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000;
      const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;

      switch (filters.order.toLowerCase()) {
        case "expired":
          filtered = filtered.filter((item) => {
            if (!item.EnactedDate) return false;
            const enactedDate = new Date(item.EnactedDate);
            const timeDiff = now - enactedDate;
            return timeDiff > sixMonthsInMilliseconds;
          });
          break;

        case "timeexpires":
          filtered = filtered.filter((item) => {
            if (!item.EnactedDate) return false;
            const enactedDate = new Date(item.EnactedDate);
            const timeDiff = now - enactedDate;
            return (
              timeDiff > sixMonthsInMilliseconds - oneMonthInMilliseconds &&
              timeDiff <= sixMonthsInMilliseconds
            );
          });
          break;

        case "suitableforuse":
          filtered = filtered.filter((item) => {
            if (!item.EnactedDate) return false;
            const enactedDate = new Date(item.EnactedDate);
            const timeDiff = now - enactedDate;
            return timeDiff <= sixMonthsInMilliseconds;
          });
          break;

        default:
          console.warn(`Invalid order value: ${filters.order}`);
      }
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleAction = async (actionType) => {
    if (selectedRows.length === 0) {
      alert("Please select at least one transaction");
      return;
    }

    const endpoints = {
      accept: "/api/TransactionPage/accept",
      handover: "/api/TransactionPage/handover",
      acceptAndHandover: "/api/TransactionPage/acceptandhandover",
    };

    const endpoint = endpoints[actionType];

    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          TransactionIds: selectedRows,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      console.log(selectedRows);
      // Refresh data after successful action
      await fetchStockData();
      setSelectedRows([]);

      showToast(
        `${
          actionType.charAt(0).toUpperCase() + actionType.slice(1)
        } action completed successfully`
      );
    } catch (error) {
      console.error(`Error performing ${actionType} action:`, error);
      alert(`Failed to perform ${actionType} action. Please try again.`);
    }
  };

  const renderActionButtons = () => {
    if (selectedRows.length === 0) return null;

    const selectedTransactions = currentItems.filter((item) =>
      selectedRows.includes(item.Id)
    );
    const allPending = selectedTransactions.every(
      (item) => item.TransactionStatus?.toLowerCase() === "pending"
    );
    const allAccepted = selectedTransactions.every(
      (item) => item.TransactionStatus?.toLowerCase() === "accepted"
    );

    return (
      <ActionButtonGroup>
        {allPending && (
          <>
            <ActionButton
              variant="accept"
              onClick={() => handleAction("accept")}
            >
              Accept
            </ActionButton>
            <ActionButton
              variant="accept"
              onClick={() => handleAction("acceptAndHandover")}
            >
              Accept & Handover
            </ActionButton>
          </>
        )}
        {(allAccepted || allPending) && (
          <ActionButton
            variant="handover"
            onClick={() => handleAction("handover")}
            disabled={allPending}
          >
            Handover
          </ActionButton>
        )}
      </ActionButtonGroup>
    );
  };

  return (
    <StockContainer>
      <Header>
        <Title>Transaction Page</Title>
        <ButtonGroup>
          <StyledButton onClick={() => setEmployeeModalOpen(true)}>
            <FaPlus style={{ marginRight: "8px" }} />
            Order For Employee
          </StyledButton>
          <StyledButton onClick={() => setTrackStatusModalOpen(true)}>
            <FaHistory style={{ marginRight: "8px" }} />
            Track Status
          </StyledButton>
        </ButtonGroup>
      </Header>

      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status.toLowerCase()}>
                {status}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>Badge</FilterLabel>
          <FilterInput
            type="text"
            name="badge"
            value={filters.badge}
            onChange={handleFilterChange}
            placeholder="Enter badge number"
          />
        </FilterGroup>
        <FilterGroup>
          <FilterLabel>Order Filter</FilterLabel>
          <FilterSelect
            name="order"
            value={filters.order}
            onChange={handleFilterChange}
          >
            <option value="">Select Order Type</option>
            <option value="expired">Expired</option>
            <option value="timeexpires">Time Expires</option>
            <option value="suitableforuse">Suitable For Use</option>
          </FilterSelect>
        </FilterGroup>
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
      </FilterContainer>

      {renderActionButtons()}

      {isLoading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentItems}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            onSelectAll={handleSelectAll}
            loading={isLoading}
            error={error}
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
      <TransEmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
      />

      <TrackStatusModal
        isOpen={isTrackStatusModalOpen}
        onClose={() => setTrackStatusModalOpen(false)}
      />

      <ReassignModal
        isOpen={isReassignModalOpen}
        onClose={() => {
          setReassignModalOpen(false);
          setSelectedRowForReassign(null);
        }}
        selectedRow={selectedRowForReassign}
        onReassignComplete={fetchStockData}
      />
    </StockContainer>
  );
};

export default TransactionPage;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

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

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-radius: 8px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
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
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: capitalize;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.textColor};
  border: 1px solid ${(props) => props.borderColor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${(props) => props.dotColor};
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

const ManagerResponse = () => {
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });
  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
    });
  };
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const isActionAllowed =
    user.roleId?.includes(3) ||
    user.roleId?.includes(2) ||
    user.roleId?.includes(12);

  useEffect(() => {
    fetchStockData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, stockData]);

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/GetPendingStoreRequestUniformForEmployee`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const stockRequests = data[0]?.UniformForEmployees || [];
      const sortedUniforms = [...stockRequests].sort((a, b) => a.Id - b.Id);
      setStockData(sortedUniforms);
      setFilteredData(sortedUniforms);
      setTotalPages(Math.ceil(stockRequests.length / itemsPerPage));
    } catch (err) {
      setError("Failed to fetch stock data.");
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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

      setFilteredData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.Id === requestId ? { ...item } : item
        );
        return updatedData.sort((a, b) => a.Id - b.Id);
      });
      await fetchStockData();
      showToast("Request approved successfully", "success");
    } catch (err) {
      setError("Error approving the request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}
/api/UniformForEmployee/ApproveRejectOperationOrder`,
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

      setFilteredData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.Id === requestId ? { ...item } : item
        );
        return updatedData.sort((a, b) => a.Id - b.Id);
      });
      await fetchStockData();
      showToast("Request rejected successfully", "success");
    } catch (err) {
      setError("Error rejecting the request.");
    }
  };

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

  // Calculate current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    { Header: "Employee Name", accessor: "EmployeeName" },
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
            bgColor={styles.bg}
            textColor={styles.text}
            borderColor={styles.border}
            dotColor={styles.dot}
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
            bgColor={styles.bg}
            textColor={styles.text}
            borderColor={styles.border}
            dotColor={styles.dot}
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
  ];

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
            <ClearFilterButton onClick={handleClearFilters}>
              Clear Filters
            </ClearFilterButton>
          </FilterGroup>
        </FilterContainer>
      </Header>

      {isLoading ? (
        <p>Loading uniforms...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={currentItems}
            selectable={false}
            editable={false}
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

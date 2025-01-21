import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
const SearchContainer = styled.div`
  display: flex;
  gap: 20px;
  margin: 10px 0;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateFilterContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #4b5563;
  font-weight: 500;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  width: 150px;

  &:focus {
    outline: none;
    border-color: #0284c7;
    box-shadow: 0 0 0 1px #0284c7;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;

  &:focus {
    outline: none;
    border-color: #0284c7;
    box-shadow: 0 0 0 1px #0284c7;
  }
`;

const PayyrolDetucted = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [badgeFilter, setBadgeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
    { Header: "Deducted Amount", accessor: "DeductedAmount" },
    { Header: "Sender Date", accessor: "SenderDate" },
    { Header: "Handed Over By", accessor: "HandoveredBy" },
    { Header: "Handed Over Date", accessor: "EnactedDate" },
    { Header: "Deducted By", accessor: "DeductedBy" },
    { Header: "Deducted Date ", accessor: "DeductedDate" },

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
  ];

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
    filterData();
  }, [stockData, badgeFilter]);

  const filterData = () => {
    let filtered = [...stockData];

    // Filter by badge if exists
    if (badgeFilter.trim()) {
      filtered = filtered.filter((item) =>
        item.EmployeeBadge.toLowerCase().includes(
          badgeFilter.toLowerCase().trim()
        )
      );
    }

    // Filter by date range if both dates are selected
    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        if (!item.DeductedDate) return false;
        const itemDate = new Date(item.DeductedDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Include the entire end date
        return itemDate >= start && itemDate <= end;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleBadgeFilterChange = (e) => {
    setBadgeFilter(e.target.value);
  };

  useEffect(() => {
    filterData();
  }, [stockData, badgeFilter, startDate, endDate]);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && new Date(newStartDate) > new Date(endDate)) {
      showToast("Start date cannot be later than end date", "error");
      return;
    }
    setStartDate(newStartDate);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && new Date(newEndDate) < new Date(startDate)) {
      showToast("End date cannot be earlier than start date", "error");
      return;
    }
    setEndDate(newEndDate);
  };

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        API_BASE_URL + "/api/TransactionPage/payroll-processed-transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const transactions = data[0]?.Transactions || [];

      // Sort by Id in descending order
      const sortedTransactions = [...transactions].sort((a, b) => b.Id - a.Id);

      setStockData(sortedTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transaction data. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/export-payroll-processed-transactions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.download = "transactions.xlsx";

      // Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      showToast("Export completed successfully", "success");
    } catch (error) {
      console.error("Error exporting transactions:", error);
      showToast("Failed to export transactions. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButtons = () => {
    return (
      <ButtonGroup>
        <StyledButton onClick={handleExport} disabled={isLoading}>
          {isLoading ? "Exporting..." : "Export"}
        </StyledButton>
      </ButtonGroup>
    );
  };

  return (
    <StockContainer>
      <Header>
        <Title>Payroll Page</Title>
        {renderActionButtons()}
      </Header>

      <SearchContainer>
        <FilterGroup>
          <FilterLabel>Date Range</FilterLabel>
          <DateFilterContainer>
            <DateInput
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start Date"
            />
            <DateInput
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End Date"
              min={startDate}
            />
          </DateFilterContainer>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Employee Badge</FilterLabel>
          <SearchInput
            type="text"
            placeholder="Search by badge..."
            value={badgeFilter}
            onChange={handleBadgeFilterChange}
          />
        </FilterGroup>
      </SearchContainer>

      {isLoading ? (
        <p>Loading...</p>
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

          {filteredData.length === 0 ? (
            <p>No records found matching the filter criteria.</p>
          ) : (
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
          )}
        </>
      )}

      <ToastContainer />
    </StockContainer>
  );
};

export default PayyrolDetucted;

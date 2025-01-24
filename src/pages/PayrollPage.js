import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Table from "../components/TablePayroll";
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
  align-items: center;
  gap: 10px;
  margin: 10px 0;
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

const PayrollPage = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [badgeFilter, setBadgeFilter] = useState("");

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
    { Header: "Handed Over By", accessor: "HandoveredBy" },
    { Header: "Handed Over Date", accessor: "EnactedDate" },
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
    filterData();
  }, [stockData, badgeFilter]);

  const filterData = () => {
    if (!badgeFilter.trim()) {
      setFilteredData(stockData);
    } else {
      const filtered = stockData.filter((item) =>
        item.EmployeeBadge.toLowerCase().includes(
          badgeFilter.toLowerCase().trim()
        )
      );
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  };

  const handleBadgeFilterChange = (e) => {
    setBadgeFilter(e.target.value);
  };

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        API_BASE_URL + "/api/TransactionPage/recent-transactions",
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

  const handleDeduct = async () => {
    if (selectedRows.length === 0) {
      showToast("Please select at least one transaction to deduct", "warning");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/deduct-transactions`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            TransactionIds: selectedRows,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      await fetchStockData();
      setSelectedRows([]);
      showToast("Transactions deducted successfully", "success");
    } catch (error) {
      console.error("Error deducting transactions:", error);
      showToast("Failed to deduct transactions. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/export-recent-transactions`,
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

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;

      // Set the file name - you might want to get this from the response headers
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
        <StyledButton onClick={handleDeduct} disabled={isLoading}>
          {isLoading ? "Processing..." : "Deduct Selected"}
        </StyledButton>
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
        <SearchInput
          type="text"
          placeholder="Employee Badge..."
          value={badgeFilter}
          onChange={handleBadgeFilterChange}
        />
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

export default PayrollPage;

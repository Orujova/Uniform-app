// pages/TransactionPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { Header } from "../components/TransactionComp/TransHeader";
import { Filters } from "../components/TransactionComp/TransFilters";
import { ActionButtons } from "../components/TransactionComp/ActionButtons";
import { Pagination } from "../components/Pagination";
import UploadModal from "../components/TransactionComp/UploadModal";
import Table from "../components/TableTrans";
import TransEmployeeModal from "../components/TransEmployeeModal";
import TrackStatusModal from "../components/TrackStatusModal";
import ReassignModal from "../components/ReassignModal ";
import SummaryModal from "../components/SummaryModal ";

const StockContainer = styled.div`
  padding: 12px;
  background-color: #ffffff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TransactionPage = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [isTrackStatusModalOpen, setTrackStatusModalOpen] = useState(false);
  const [isReassignModalOpen, setReassignModalOpen] = useState(false);
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRowForReassign, setSelectedRowForReassign] = useState(null);
  const [uniqueStatuses, setUniqueStatuses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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
        );
      },
    },
  ];

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
      const response = await fetch(`${API_BASE_URL}/api/TransactionPage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const transactions = data[0]?.Transactions || [];
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <StockContainer>
      <Header
        onOpenEmployeeModal={() => setEmployeeModalOpen(true)}
        onOpenTrackStatusModal={() => setTrackStatusModalOpen(true)}
        onOpenSummaryModal={() => setSummaryModalOpen(true)}
        onOpenUploadModal={() => setUploadModalOpen(true)}
      />

      <Filters
        filters={filters}
        onFilterChange={handleFilterChange}
        uniqueStatuses={uniqueStatuses}
      />

      <ActionButtons
        selectedTransactions={currentItems.filter((item) =>
          selectedRows.includes(item.Id)
        )}
        onAction={handleAction}
      />

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

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            getPageNumbers={getPageNumbers}
          />
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
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
      />
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />
    </StockContainer>
  );
};

export default TransactionPage;

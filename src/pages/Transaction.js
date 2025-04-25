// pages/TransactionPage.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ToastContainer } from "../utils/ToastContainer";
import { showToast } from "../utils/toast";
import { API_BASE_URL } from "../config";

import { Header } from "../components/TransactionComp/TransHeader";
import { Filters } from "../components/TransactionComp/TransFilters";
import { ActionButtons } from "../components/TransactionComp/ActionButtons";
import { Pagination } from "../components/Pagination";
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
  background-color: #4299e1; /* Hover-da gözəl mavi */
  color: white;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);
  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #4a5568;
    background-color: #ebf4ff;
  }
`;

const FilterActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
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
    handoveredDate: "", // Changed from handovered to handoveredDate
    projectId: "",
    transactionDate: "",
    distributionType: "",
  });

  const [projects, setProjects] = useState([]);
  const [projectID, setProjectID] = useState([]);
  const [handoveredDates, setHandoveredDates] = useState([]);
  const [transactionDates, setTransactionDates] = useState([]);

  const user = JSON.parse(localStorage.getItem("userData")) || {};
  const isProjectFilterAllowed =
    user.roleId?.includes(8) ||
    user.roleId?.includes(9) ||
    user.roleId?.includes(12) ||
    user.roleId?.includes(3);
  const isActionAllowed =
    user.roleId?.includes(3) ||
    user.roleId?.includes(2) ||
    user.roleId?.includes(1);

  const isTrackAllowed =
    user.roleId?.includes(3) ||
    user.roleId?.includes(12) ||
    user.roleId?.includes(1) ||
    user.roleId?.includes(2) ||
    user.roleId?.includes(4);

  const handleClearFilters = () => {
    setFilters({
      status: "",
      badge: "",
      order: "",
      handoveredDate: "",
      projectId: "",
      transactionDate: "",
      distributionType: "",
    });
  };

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData")) || {};

  const fetchHandoveredDates = async (projectId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/GetAllHandoveredDates?ProjectId=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(projectId);

      if (!response.ok) throw new Error("Failed to fetch handovered dates");
      const data = await response.json();
      console.log("Handovered dates response:", data);

      if (data && data[0]?.Transactions) {
        const datas = data[0].Transactions;
        console.log("Transactions data:", datas);

        if (Array.isArray(datas)) {
          datas.forEach((transaction) => {
            if (transaction.HandoveredDate) {
              setHandoveredDates((prev) => [
                ...new Set([...prev, transaction.HandoveredDate]),
              ]);
            }
          });
        }
      }
    } catch (error) {
      console.error(
        "Error fetching handovered dates for projectId:",
        projectId,
        error
      );
    }
  };

  const fetchTransactionDates = async (projectId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/GetAllTransactionDates?ProjectId=${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch handovered dates");
      const data = await response.json();
      console.log("Handovered dates response:", data);

      if (data && data[0]?.Transactions) {
        const datas = data[0].Transactions;
        console.log("Transactions data:", datas);

        if (Array.isArray(datas)) {
          datas.forEach((transaction) => {
            if (transaction.SenderDate) {
              setTransactionDates((prev) => [
                ...new Set([...prev, transaction.SenderDate]),
              ]);
            }
          });
        }
      }
    } catch (error) {
      console.error(
        "Error fetching handovered dates for projectId:",
        projectId,
        error
      );
    }
  };

  const fetchProjectID = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Project`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();

      const userProjects =
        data[0]?.Projects.filter(
          (project) => project.StoreManagerMail === userData.email
        ) || [];

      setProjectID(userProjects);
      setHandoveredDates([]); // Köhnə tarixləri təmizlə
      setTransactionDates([]); // Köhnə tarixləri təmizlə

      // Hər layihə üçün handovered tarixləri gətir
      for (const project of userProjects) {
        if (project.Id) {
          console.log("Fetching dates for project:", project.Id); // Debug log
          await fetchHandoveredDates(project.Id);
        }
      }
      for (const project of userProjects) {
        if (project.Id) {
          console.log("Fetching dates for project:", project.Id); // Debug log
          await fetchTransactionDates(project.Id);
        }
      }
    } catch (error) {
      console.error("Error in fetchProjectID:", error);
    }
  };

  // useEffect-də belə istifadə et
  useEffect(() => {
    const fetchData = async () => {
      await fetchProjectID();
    };

    fetchData();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Project`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      setProjects(data[0]?.Projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  // Call this in useEffect
  useEffect(() => {
    fetchProjects();
  }, [token]);

  // Update the columns definition in TransactionPage.js
  const columns = [
    { Header: "Employee Badge", accessor: "EmployeeBadge" },
    { Header: "Employee Name", accessor: "EmployeeFullName" },
    { Header: "Uni Code", accessor: "UniformCode" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Size", accessor: "UniformSize" },
    { Header: "Type", accessor: "UniformType" },
    { Header: "Unit Price(AZN)", accessor: "UnitPrice" },
    {
      Header: "Image",
      accessor: "UniformImageUrl",
      Cell: ({ value }) => {
        const imageUrl = value
          ? value.replace("/uniform/", "/uploads/uniform/")
          : null;

        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Uniform"
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <div>No Image</div>
            )}
          </div>
        );
      },
    },
    { Header: "Project Name", accessor: "ProjectName" },
    { Header: "Count", accessor: "UniCount" },
    { Header: "Sender", accessor: "Sender" },
    { Header: "Transaction Date", accessor: "SenderDate" },
    { Header: "Handed Over By", accessor: "HandoveredBy" },
    { Header: "Handed Over Date", accessor: "EnactedDate" },
    {
      Header: "Reception Status",
      accessor: "ReceptionStatus",
      Cell: ({ row }) => {
        const status = row.original.TransactionStatus?.toLowerCase();
        const receptionStatus =
          status === "accepted"
            ? "Accepted"
            : status === "pending"
            ? "Pending"
            : "-";

        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor:
                receptionStatus.toLowerCase() === "pending"
                  ? "#FEF3C7"
                  : receptionStatus.toLowerCase() === "accepted"
                  ? "#DCFCE7"
                  : "#E5E7EB",
              color:
                receptionStatus.toLowerCase() === "pending"
                  ? "#92400E"
                  : receptionStatus.toLowerCase() === "accepted"
                  ? "#166534"
                  : "#374151",
            }}
          >
            {receptionStatus}
          </span>
        );
      },
    },
    {
      Header: "Handed Over Status",
      accessor: "HandoverStatus",
      Cell: ({ row }) => {
        const status = row.original.TransactionStatus?.toLowerCase();
        const handoverStatus = status === "handovered" ? "Handovered" : "-";

        return (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "4px",
              backgroundColor:
                handoverStatus.toLowerCase() === "handovered"
                  ? "#E5E7EB"
                  : "#E5E7EB",
              color:
                handoverStatus.toLowerCase() === "handovered"
                  ? "#374151"
                  : "#374151",
            }}
          >
            {handoverStatus}
          </span>
        );
      },
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
                showToast(`Cannot reassign a ${status} transaction`, "warning");
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
            disabled={isDisabled || !isActionAllowed}
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
    setCurrentPage(1);
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

    // Project filter
    if (filters.projectId) {
      filtered = filtered.filter(
        (item) => String(item.ProjectId) === String(filters.projectId)
      );
    }

    if (filters.handoveredDate) {
      filtered = filtered.filter((item) => {
        if (!item.EnactedDate) return false;
        const itemDate = new Date(item.EnactedDate);
        const filterDate = new Date(filters.handoveredDate);

        return (
          itemDate.getFullYear() === filterDate.getFullYear() &&
          itemDate.getMonth() === filterDate.getMonth() &&
          itemDate.getDate() === filterDate.getDate()
        );
      });
    }
    if (filters.transactionDate) {
      filtered = filtered.filter((item) => {
        if (!item.SenderDate) return false;
        const itemDate = new Date(item.SenderDate);
        const filterDate = new Date(filters.transactionDate);

        return (
          itemDate.getFullYear() === filterDate.getFullYear() &&
          itemDate.getMonth() === filterDate.getMonth() &&
          itemDate.getDate() === filterDate.getDate()
        );
      });
    }

    if (filters.distributionType) {
      filtered = filtered.filter((item) => {
        switch (filters.distributionType) {
          case "firstDistribution":
            return item.IsFirstDistribution;
          case "store":
            return item.IsStore;
          case "bgs":
            return item.IsBBgs;
          default:
            return true;
        }
      });
    }

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
      const selectableIds = filteredData
        .filter(
          (item) => item.TransactionStatus?.toLowerCase() !== "handovered"
        )
        .map((item) => item.Id);
      setSelectedRows(selectableIds);
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
        } action completed successfully`,
        "success"
      );
    } catch (error) {
      console.error(`Error performing ${actionType} action:`, error);
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
        user={isActionAllowed}
        isTrackAllowed={isTrackAllowed}
      />
      <div>
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          uniqueStatuses={uniqueStatuses}
          projects={projects}
          transactionDates={transactionDates}
          handoveredDates={handoveredDates}
          user={isProjectFilterAllowed}
        />

        <FilterActionsContainer>
          <ClearFilterButton onClick={handleClearFilters}>
            Clear Filters
          </ClearFilterButton>
        </FilterActionsContainer>
      </div>

      <ActionButtons
        selectedTransactions={filteredData.filter((item) =>
          selectedRows.includes(item.Id)
        )}
        onAction={handleAction}
        user={isActionAllowed}
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

      <ToastContainer />
    </StockContainer>
  );
};

export default TransactionPage;

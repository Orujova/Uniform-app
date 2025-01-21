import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaPlus,
  FaEdit,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaUpload,
  FaAlignLeft,
} from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toast";
import { API_BASE_URL } from "../config";
import Table from "../components/Table";
import EditUniformModal from "../components/EditRequest";
import CreateRequest from "../components/CreateRequest";
import EmployeeModal from "../components/EmployeeModal";
import RequestUploadModal from "../components/RequestUploadModal";
import StatusFilter from "../components/StatusFilter";
import SummarizeModal from "../components/BGSStockSummary";

const StockContainer = styled.div`
  padding: 16px;
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
  padding: 10px 14px;
  font-size: 14px;
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

const statusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Intransit", value: "Intransit" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const RequestsPage = () => {
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [isRequestUploadModalOpen, setRequestUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [isSummarizeModalOpen, setSummarizeModalOpen] = useState(false);

  useEffect(() => {
    fetchStockData();
  }, [token]);

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL + "/api/BGSStockRequest", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      const stockRequests = data[0]?.BGSStockRequests || [];

      const sortedRequests = [...stockRequests].sort((a, b) => b.Id - a.Id);

      // Fetch uniform details
      const uniformIds = sortedRequests.map((item) => item.UniformId);
      const uniformDetailsResponses = await Promise.all(
        uniformIds.map(async (id) => {
          const uniformResponse = await fetch(
            `${API_BASE_URL}/api/Uniform/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (uniformResponse.ok) {
            return uniformResponse.json();
          }

          throw new Error("Error fetching uniform details");
        })
      );

      const uniformData = sortedRequests.map((item, index) => ({
        ...item,
        UniformDetails: uniformDetailsResponses[index],
      }));

      setStockData(uniformData);
    } catch (err) {
      console.error("Error fetching uniforms:", err);
      setError("Failed to fetch uniform data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      const response = await fetch(
        API_BASE_URL + `/api/BGSStockRequest/accept?id=${id}`,
        {
          method: "PUT",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to accept the request. Status: ${response.status}`
        );
      }

      await fetchStockData();
      showToast("Request accepted successfully");
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const totalPages = Math.ceil(filteredStockData.length / itemsPerPage);

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

  const handleCreateUniform = () => setCreateModalOpen(true);
  const handleEmployeeModal = () => setEmployeeModalOpen(true);
  const handleRequestUploadModal = () => setRequestUploadModalOpen(true);

  const handleSaveUniform = async () => {
    await fetchStockData();
  };

  const handleEdit = (row) => {
    setEditData(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    await fetchStockData();
    setEditModalOpen(false);
    showToast("Request updated successfully");
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

  const columns = [
    { Header: "Uniform Code", accessor: "UniformCode" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Type", accessor: "UniformDetails.UniType" },
    { Header: "Size", accessor: "UniformDetails.Size" },
    { Header: "Gender", accessor: "UniformDetails.Gender" },
    { Header: "Imported Count", accessor: "ImportedCount" },
    { Header: "Count", accessor: "Count" },
    { Header: "Request Count", accessor: "RequestCount" },
    { Header: "Project", accessor: "ProjectName" },
    {
      Header: "Status",
      accessor: "Status",
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
        const status = row.original.Status;

        switch (status) {
          case "Pending":
            return (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaEdit
                  style={{ cursor: "pointer", color: "#2980b9" }}
                  onClick={() => handleEdit(row.original)}
                />
              </div>
            );

          case "Rejected":
            return (
              <FaTimes
                style={{
                  cursor: "default",
                  fontSize: "20px",
                  color: "#dc3545",
                  textAlign: "center",
                }}
              />
            );

          case "Accepted":
            return (
              <FaCheck
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#28a745",
                  textAlign: "center",
                }}
              />
            );
          case "Intransit":
            return (
              <ActionButton
                onClick={() => handleAccept(row.original.Id)}
                bgColor="#28a745"
                hoverColor="#218838"
              >
                Accept
              </ActionButton>
            );

          default:
            return null;
        }
      },
    },
  ];

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const filteredStockData = statusFilter
    ? stockData.filter((item) => item.Status === statusFilter)
    : stockData;

  // Calculate current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStockData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStockData.length / itemsPerPage);

  return (
    <StockContainer>
      <Header>
        <Title>BGS Requests</Title>
        <ButtonGroup>
          <StyledButton onClick={handleCreateUniform}>
            <FaPlus style={{ marginRight: "8px" }} />
            Create Request
          </StyledButton>
          <StyledButton onClick={handleEmployeeModal}>
            <FaPlus style={{ marginRight: "8px" }} />
            Uniform For Employee
          </StyledButton>
          <StyledButton onClick={() => setSummarizeModalOpen(true)}>
            <FaAlignLeft style={{ marginRight: "8px" }} />
            Summarize
          </StyledButton>
          <StyledButton onClick={handleRequestUploadModal}>
            <FaUpload style={{ marginRight: "8px" }} />
            Upload
          </StyledButton>
        </ButtonGroup>
      </Header>

      <StatusFilter
        statusOptions={statusOptions}
        handleStatusFilterChange={handleStatusFilterChange}
        statusFilter={statusFilter}
      />

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
      <CreateRequest
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        apiData={stockData}
        onSave={handleSaveUniform}
      />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
      />
      <RequestUploadModal
        isOpen={isRequestUploadModalOpen}
        onClose={() => setRequestUploadModalOpen(false)}
      />

      <EditUniformModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={editData}
        apiData={stockData}
      />

      <SummarizeModal
        isOpen={isSummarizeModalOpen}
        onClose={() => setSummarizeModalOpen(false)}
      />
    </StockContainer>
  );
};

export default RequestsPage;

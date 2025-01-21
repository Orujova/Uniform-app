import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaShippingFast,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";
import StatusFilter from "../components/StatusFilter";
import LoadingSpinner from "../components/LoadingSpinner";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
`;

const ModalInput = styled.input`
  padding: 10px;
  width: 90%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const ModalButton = styled.button`
  padding: 10px 16px;
  font-size: 16px;
  color: #fff;
  background-color: ${(props) => (props.disabled ? "#9CA3AF" : "#0284c7")};
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.6" : "1")};

  &:hover {
    background-color: ${(props) => (props.disabled ? "#9CA3AF" : "#075985")};
  }
`;

const WarningMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 8px;
  background-color: #fee2e2;
  border-radius: 4px;
  text-align: center;
`;

const InfoSection = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
`;

const InfoValue = styled.span`
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
`;

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

const StyledButton = styled.button`
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #dc3545;
  margin-left: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #c82333;
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
  background-color: ${(props) =>
    props.variant === "accept" ? "#28a745" : "#dc3545"};
  color: #fff;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) =>
      props.variant === "accept" ? "#218838" : "#c82333"};
  }
`;

const IconWrapper = styled.div`
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InfoWarningMessage = styled.div`
  color: #0369a1;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 8px;
  background-color: #e0f2fe;
  border-radius: 4px;
  text-align: center;
`;

const statusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Intransit", value: "Intransit" },
  { label: "Accepted", value: "Accepted" },
  { label: "Rejected", value: "Rejected" },
];

const StockResponse = () => {
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [count, setCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [availableStock, setAvailableStock] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStockData();
  }, [token]);

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/BGSStockRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const stockRequests = data[0]?.BGSStockRequests || [];

      // Sort by Id in descending order
      const sortedRequests = [...stockRequests].sort((a, b) => b.Id - a.Id);

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
      setError("Failed to fetch stock data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/reject?id=${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: requestId }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject request");

      await fetchStockData();
      showToast("Request rejected successfully");
    } catch (err) {
      setError("Error rejecting the request.");
    }
  };

  const fetchAvailableStock = async (uniformId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/DCStock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stock data");

      const data = await response.json();
      const stocks = data[0]?.DCStocks || [];
      console.log(stocks);
      const uniformStock = stocks.find(
        (stock) => stock.UniformId === uniformId
      );
      return uniformStock?.StockCount || 0;
    } catch (error) {
      console.error("Error fetching available stock:", error);
      return 0;
    }
  };

  // const handleAccept = async (requestId) => {
  //   const selectedItem = stockData.find((item) => item.Id === requestId);
  //   setSelectedRequest(selectedItem);
  //   setCount(selectedItem.RequestCount); // Default olaraq requested count'u set edirik

  //   const stockCount = await fetchAvailableStock(selectedItem.UniformId);
  //   setAvailableStock(stockCount);
  //   setSelectedRequestId(requestId);
  //   setModalOpen(true);
  // };

  const handleAccept = async (requestId) => {
    const selectedItem = stockData.find((item) => item.Id === requestId);
    setSelectedRequest(selectedItem);

    const stockCount = await fetchAvailableStock(selectedItem.UniformId);
    setAvailableStock(stockCount);

    // Set initial count based on available stock vs requested count
    const initialCount = Math.min(selectedItem.RequestCount, stockCount);
    setCount(initialCount);

    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  const handleCountChange = (e) => {
    const newCount = parseInt(e.target.value) || 0;
    const requestedCount = selectedRequest?.RequestCount || 0;

    if (newCount > requestedCount) {
      showToast(`Cannot exceed requested count (${requestedCount})`);
      return;
    }

    if (newCount < 0) {
      showToast("Count cannot be negative");
      return;
    }

    setCount(newCount);
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const countResponse = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/update-count-status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Id: selectedRequestId, count }),
        }
      );
      console.log(selectedRequestId, count);

      if (!countResponse.ok) throw new Error("Failed to update count");

      setModalOpen(false);
      setCount(0);
      await fetchStockData();
      showToast("Request accepted successfully");
    } catch (err) {
      setError("Error processing the request.");
    } finally {
      setIsSaving(false); // Loading bitir
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

  const columns = [
    { Header: "Uniform Code", accessor: "UniformCode" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Type", accessor: "UniformDetails.UniType" },
    { Header: "Size", accessor: "UniformDetails.Size" },
    { Header: "Gender", accessor: "UniformDetails.Gender" },
    { Header: "Request Count", accessor: "RequestCount" },
    { Header: "Project", accessor: "ProjectName" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => {
        const { Status, Id } = row.original;

        return (
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            {Status === "Intransit" && (
              <IconWrapper>
                <FaShippingFast style={{ color: "#6b7280" }} />
              </IconWrapper>
            )}
            {Status === "Pending" && (
              <>
                <ActionButton variant="accept" onClick={() => handleAccept(Id)}>
                  Accept
                </ActionButton>
                <ActionButton variant="reject" onClick={() => handleReject(Id)}>
                  Reject
                </ActionButton>
              </>
            )}
            {Status === "Accepted" && (
              <IconWrapper>
                <FaCheck style={{ color: "#28a745" }} />
              </IconWrapper>
            )}
            {Status === "Rejected" && (
              <IconWrapper>
                <FaTimes style={{ color: "#dc3545" }} />
              </IconWrapper>
            )}
          </div>
        );
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
  const renderModal = () => {
    if (!modalOpen || !selectedRequest) return null;

    const isStockAvailable = availableStock > 0;
    const isRequestedMoreThanAvailable =
      selectedRequest.RequestCount > availableStock;

    return (
      <Modal>
        <ModalContent>
          {isSaving && <LoadingSpinner />}
          <h3 style={{ marginTop: 0 }}>Accept Uniform</h3>
          <InfoSection>
            <InfoItem>
              <InfoLabel>Uniform name:</InfoLabel>
              <InfoValue>{selectedRequest.UniformName}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Requested count:</InfoLabel>
              <InfoValue>{selectedRequest.RequestCount}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Available stock:</InfoLabel>
              <InfoValue>{availableStock}</InfoValue>
            </InfoItem>
          </InfoSection>

          {!isStockAvailable && (
            <WarningMessage>No stock available for this uniform</WarningMessage>
          )}

          {isStockAvailable && isRequestedMoreThanAvailable && (
            <InfoWarningMessage>
              The requested count exceeds available stock. Maximum{" "}
              {availableStock} items can be accepted.
            </InfoWarningMessage>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="acceptCount"
              style={{ display: "block", marginBottom: "5px" }}
            >
              Accept Count:
            </label>
            <ModalInput
              id="acceptCount"
              type="number"
              min="0"
              max={Math.min(selectedRequest.RequestCount, availableStock)}
              value={count}
              onChange={handleCountChange}
              disabled={!isStockAvailable}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <ModalButton
              onClick={handleSubmit}
              disabled={!isStockAvailable || count === 0}
            >
              Submit
            </ModalButton>
            <StyledButton
              onClick={() => {
                setModalOpen(false);
                setSelectedRequest(null);
                setCount(0);
              }}
            >
              Cancel
            </StyledButton>
          </div>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <StockContainer>
      <Header>
        <Title>BGS Requests Response</Title>
        <StatusFilter
          statusOptions={statusOptions}
          handleStatusFilterChange={handleStatusFilterChange}
          statusFilter={statusFilter}
        />
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
      {renderModal()}
      <ToastContainer />
    </StockContainer>
  );
};

export default StockResponse;

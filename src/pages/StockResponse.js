import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaShippingFast,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import * as ContextMenu from "@radix-ui/react-context-menu";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";
import StatusFilter from "../components/StatusFilter";

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
  background-color: #0284c7;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: #075985;
  }
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

const ContextMenuContent = styled(ContextMenu.Content)`
  min-width: 220px;
  background-color: white;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  z-index: 1000;
`;

const ContextMenuItem = styled(ContextMenu.Item)`
  font-size: 13px;
  line-height: 1;
  color: #11181c;
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0 5px;
  position: relative;
  padding-left: 25px;
  user-select: none;
  outline: none;

  &[data-highlighted] {
    background-color: #0284c7;
    color: white;
  }

  &[data-disabled] {
    color: #98a1b2;
    pointer-events: none;
  }
`;

const ContextMenuSeparator = styled(ContextMenu.Separator)`
  height: 1px;
  background-color: #e5e7eb;
  margin: 5px;
`;

const IconWrapper = styled.div`
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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
    } catch (err) {
      setError("Error rejecting the request.");
    }
  };

  const handleAccept = (requestId) => {
    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
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

      if (!countResponse.ok) throw new Error("Failed to update count");

      setModalOpen(false);
      setCount(0);
      await fetchStockData();
    } catch (err) {
      setError("Error processing the request.");
    }
  };

  const handleContextMenuAction = (action, rowData) => {
    switch (action) {
      case "accept":
        handleAccept(rowData.Id);
        break;
      case "reject":
        handleReject(rowData.Id);
        break;
      case "view":
        // Implement view details functionality
        console.log("View details for:", rowData);
        break;
      default:
        break;
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
          <ContextMenu.Root>
            <ContextMenu.Trigger asChild>
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
                    <ActionButton
                      variant="accept"
                      onClick={() => handleAccept(Id)}
                    >
                      Accept
                    </ActionButton>
                    <ActionButton
                      variant="reject"
                      onClick={() => handleReject(Id)}
                    >
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
            </ContextMenu.Trigger>
            <ContextMenuContent>
              <ContextMenuItem
                disabled={Status !== "Pending"}
                onSelect={() => handleContextMenuAction("accept", row.original)}
              >
                Accept Request
              </ContextMenuItem>
              <ContextMenuItem
                disabled={Status !== "Pending"}
                onSelect={() => handleContextMenuAction("reject", row.original)}
              >
                Reject Request
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() => handleContextMenuAction("view", row.original)}
              >
                View Details
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu.Root>
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

      {modalOpen && (
        <Modal>
          <ModalContent>
            <h3 style={{ marginTop: 0 }}>Accept Uniform</h3>
            <p>
              <strong>Uniform name: </strong>
              {
                stockData.find((item) => item.Id === selectedRequestId)
                  ?.UniformName
              }
            </p>
            <ModalInput
              type="number"
              placeholder="Enter count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
            <ModalButton onClick={handleSubmit}>Submit</ModalButton>
            <StyledButton onClick={() => setModalOpen(false)}>
              Close
            </StyledButton>
          </ModalContent>
        </Modal>
      )}
    </StockContainer>
  );
};

export default StockResponse;

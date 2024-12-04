import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaCheck } from "react-icons/fa";
import Table from "../components/Table";
import config from "../config.json";

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
  width: 100%;
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

// Styled components for the page
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

const StockResponse = () => {
  const token = `Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIwIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoibi5tYW1tYWRvdkBhemVyYmFpamFuc3VwZXJtYXJrZXQuY29tIiwiRnVsbE5hbWUiOiJOYXNpbWkgTWFtbWFkb3YiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOlsiUmVjcnVpdGVyIiwiU3RvcmUgTWFuYWdlbWVudCIsIkhSIFN0YWZmIiwiQWRtaW4iXSwiZXhwIjoxNzY0Njc0OTE4fQ.EW_2UHYjfjGcG4AjNvwDmhPOJ_T_a5xBWXwgZ-pZTFc`;
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [count, setCount] = useState(0);

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${config.serverUrl}/api/BGSStockRequest`,
          {
            headers: { Authorization: token },
          }
        );
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        const stockRequests = data[0]?.BGSStockRequests || [];
        setStockData(stockRequests);

        // Now fetch uniform details for each stock request based on UniformId
        const uniformIds = stockRequests.map((item) => item.UniformId);
        const uniformDetailsResponses = await Promise.all(
          uniformIds.map(async (id) => {
            const uniformResponse = await fetch(
              `${config.serverUrl}/api/Uniform/${id}`,
              {
                headers: {
                  Authorization: token,
                },
              }
            );

            if (uniformResponse.ok) {
              return uniformResponse.json();
            }

            throw new Error("Error fetching uniform details");
          })
        );

        // Map the uniform details back to stock data
        const uniformData = stockRequests.map((item, index) => ({
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

    fetchStockData();
  }, []);

  // Handle Reject request
  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `${config.serverUrl}/api/BGSStockRequest/reject?id=${requestId}`,
        {
          method: "PUT",
          headers: { Authorization: token, "Content-Type": "application/json" },
          body: JSON.stringify({ id: requestId }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject request");

      // Remove rejected request from the stockData state
      setStockData((prevData) =>
        prevData.filter((request) => request.Id !== requestId)
      );
      console.log(stockData);
    } catch (err) {
      setError("Error rejecting the request.");
    }
  };

  // Handle Accept request
  const handleAccept = (requestId) => {
    setSelectedRequestId(requestId);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const countResponse = await fetch(
        config.serverUrl + `/api/BGSStockRequest/update-count-status`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Id: selectedRequestId, count }),
        }
      );

      if (!countResponse.ok) throw new Error("Failed to update count");

      setModalOpen(false);
      setCount(0);

      setStockData((prevData) =>
        prevData.map((item) =>
          item.Id === selectedRequestId ? { ...item, status: "Accepted" } : item
        )
      );
    } catch (err) {
      setError("Error processing the request.");
    }
  };

  // Columns for the stock table
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
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            {Status === "Intransit" ? (
              <FaCheck
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#28a745",
                }}
              />
            ) : (
              <>
                <button
                  onClick={() => handleAccept(Id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s, transform 0.2s",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#218838")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#28a745")
                  }
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(Id)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    transition: "background-color 0.3s, transform 0.2s",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#c82333")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#dc3545")
                  }
                >
                  Reject
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <StockContainer>
      <Header>
        <Title>BGS Requests Response</Title>
      </Header>

      {isLoading ? (
        <p>Loading uniforms...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Table columns={columns} data={stockData} />
      )}

      {/* Modal for accepting request */}
      {modalOpen && (
        <Modal>
          <ModalContent>
            <h3>Accept Uniform</h3>
            <p>Request ID: {selectedRequestId}</p>
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

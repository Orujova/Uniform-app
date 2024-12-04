import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Table from "../components/Table";
import { FaCheck } from "react-icons/fa";
import EditUniformModal from "../components/EditUniCondition";
import CreateRequest from "../components/CreateRequest";
import config from "../config.json";

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

const RequestsPage = () => {
  const token = `Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIwIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoibi5tYW1tYWRvdkBhemVyYmFpamFuc3VwZXJtYXJrZXQuY29tIiwiRnVsbE5hbWUiOiJOYXNpbWkgTWFtbWFkb3YiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOlsiUmVjcnVpdGVyIiwiU3RvcmUgTWFuYWdlbWVudCIsIkhSIFN0YWZmIiwiQWRtaW4iXSwiZXhwIjoxNzY0Njc0OTE4fQ.EW_2UHYjfjGcG4AjNvwDmhPOJ_T_a5xBWXwgZ-pZTFc`;
  const [stockData, setStockData] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          config.serverUrl + "/api/BGSStockRequest",
          {
            headers: {
              Authorization: token, // Token başlıqda düzgün formatda
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
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
        console.log(uniformData);
      } catch (err) {
        console.error("Error fetching uniforms:", err);
        setError("Failed to fetch uniform data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b"; // Sarı
      case "Accepted":
        return "#10b981"; // Yaşıl
      case "Rejected":
        return "#ef4444"; // Qırmızı
      default:
        return "#6b7280"; // Boz
    }
  };

  // Columns for the stock table
  const columns = [
    { Header: "Uniform Code", accessor: "UniformCode" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Type", accessor: "UniformDetails.UniType" },
    { Header: "Size", accessor: "UniformDetails.Size" },
    { Header: "Gender", accessor: "UniformDetails.Gender" },
    { Header: "Count", accessor: "Count" },
    { Header: "Request Count", accessor: "RequestCount" },
    { Header: "Project", accessor: "ProjectName" },
    {
      Header: "Status",
      accessor: "Status",
      Cell: ({ value }) => (
        <span
          style={{
            backgroundColor: getStatusColor(value),
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "8px",
          }}
        >
          {value}
        </span>
      ),
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => {
        const isCountIncreased = row.original.Count > 0;

        return (
          <div style={{ display: "flex", gap: "10px" }}>
            {isCountIncreased ? (
              <FaCheck
                style={{
                  cursor: "pointer",
                  fontSize: "20px",
                  color: "#28a745",
                  // onClick={() => handleAccept(row.original.Id)}
                }}
              />
            ) : (
              <>
                <FaEdit
                  style={{ cursor: "pointer", color: "#2980b9" }}
                  onClick={() => handleEdit(row.original)}
                />
                <FaTrash
                  style={{ cursor: "pointer", color: "#e74c3c" }}
                  onClick={() => handleDelete(row.original.Id)}
                />
              </>
            )}
          </div>
        );
      },
    },
  ];

  // Handlers
  const handleCreateUniform = () => setCreateModalOpen(true);
  const handleSaveUniform = async () => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          config.serverUrl + "/api/BGSStockRequest",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
        const uniforms = data[0]?.BGSStockRequests || [];

        setStockData(uniforms);
      } catch (err) {
        console.error("Error fetching uniforms:", err);
        setError("Failed to fetch uniform data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  };

  const handleEdit = (row) => {
    setEditData(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (updatedData) => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          config.serverUrl + "/api/BGSStockRequest",
          {
            headers: {
              Authorization: token, // Token başlıqda düzgün formatda
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
        const uniforms = data[0]?.BGSStockRequests || [];

        setStockData(uniforms);
      } catch (err) {
        console.error("Error fetching uniforms:", err);
        setError("Failed to fetch uniform data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
    setEditModalOpen(false);
  };

  const handleDelete = async (Id) => {
    if (window.confirm("Are you sure you want to delete this uniform?")) {
      try {
        const response = await fetch(
          config.serverUrl + `/api/BGSStockRequest`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
            body: JSON.stringify({ Id }),
          }
        );

        if (!response.ok) {
          const errorDetails = await response.json();
          console.error("Error details:", errorDetails);
          throw new Error(errorDetails.Message || "Failed to delete uniform.");
        }

        setStockData((prev) => prev.filter((item) => item.Id !== Id));
        console.log("Uniform deleted successfully!");
      } catch (error) {
        console.error("Error deleting uniform:", error.message);
      }
    }
  };

  return (
    <StockContainer>
      <Header>
        <Title>BGS Requests</Title>
        <ButtonGroup>
          <StyledButton>
            <FaPlus
              style={{ marginRight: "8px" }}
              onClick={handleCreateUniform}
            />{" "}
            Create Request
          </StyledButton>
        </ButtonGroup>
      </Header>

      {/* Loading, Error, or Table Component */}
      {isLoading ? (
        <p>Loading uniforms...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Table
          columns={columns}
          data={stockData}
          selectable={false}
          editable={false}
        />
      )}

      {/* Modal Component */}
      <CreateRequest
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        apiData={stockData}
        onSave={handleSaveUniform} // Pass the save handler
      />

      <EditUniformModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={editData}
        apiData={stockData}
      />
    </StockContainer>
  );
};

export default RequestsPage;

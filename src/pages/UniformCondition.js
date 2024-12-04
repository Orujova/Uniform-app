import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Table from "../components/Table";
import EditUniformModal from "../components/EditUniCondition";
import CreateUniModal from "../components/CreateUniConModal";
import config from "../config.json";

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

const StockPage = () => {
  const [stockData, setStockData] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const token = `Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIwIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoibi5tYW1tYWRvdkBhemVyYmFpamFuc3VwZXJtYXJrZXQuY29tIiwiRnVsbE5hbWUiOiJOYXNpbWkgTWFtbWFkb3YiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOlsiUmVjcnVpdGVyIiwiU3RvcmUgTWFuYWdlbWVudCIsIkhSIFN0YWZmIiwiQWRtaW4iXSwiZXhwIjoxNzY0Njc0OTE4fQ.EW_2UHYjfjGcG4AjNvwDmhPOJ_T_a5xBWXwgZ-pZTFc`;

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          config.serverUrl + "/api/UniformCondition",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
        const uniforms = data[0]?.UniformConditions || [];
        console.log(uniforms);

        setStockData(uniforms);
      } catch (err) {
        console.error("Error fetching uniforms:", err);
        setError("Failed to fetch uniform data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, []);

  // Columns for the stock table
  const columns = [
    { Header: "Uniform Name", accessor: "UniName" },
    { Header: "Position Name", accessor: "PositionName" },
    { Header: "Functional Area", accessor: "FunctionalArea" },
    { Header: "Type", accessor: "UniType" },
    { Header: "Gender", accessor: "Gender" },
    { Header: "Count", accessor: "CountUniform" },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2980b9" }}
            onClick={() => handleEdit(row.original)}
          />

          <FaTrash
            style={{ cursor: "pointer", color: "#e74c3c" }}
            onClick={() => handleDelete(row.original.Id)}
          />
        </div>
      ),
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
          config.serverUrl + "/api/UniformCondition",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
        const uniforms = data[0]?.UniformConditions || [];
        console.log(uniforms);

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
    setEditData(row); // Set selected uniform for editing
    setEditModalOpen(true); // Open modal
  };

  const handleSaveEdit = (updatedData) => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          config.serverUrl + "/api/UniformCondition",
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
        const uniforms = data[0]?.UniformConditions || [];
        console.log(uniforms);

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
          config.serverUrl + `/api/UniformCondition`,
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
        <Title>Uniforms Condition</Title>
        <ButtonGroup>
          <StyledButton onClick={handleCreateUniform}>
            <FaPlus style={{ marginRight: "8px" }} /> Create Uniform
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
      <CreateUniModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        apiData={stockData}
        onSave={handleSaveUniform}
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

export default StockPage;

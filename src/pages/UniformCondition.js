import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/Table";
import EditUniformModal from "../components/EditUniCondition";
import CreateUniModal from "../components/CreateUniConModal";
import DeleteModal from "../components/DeleteModal";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const StockPage = () => {
  const [stockData, setStockData] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = stockData.slice(indexOfFirstItem, indexOfLastItem);

  const token = localStorage.getItem("token");

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(API_BASE_URL + "/api/UniformCondition", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        const uniforms = data[0]?.UniformConditions || [];

        const sortedUniforms = [...uniforms].sort((a, b) => a.Id - b.Id);

        setStockData(sortedUniforms);
        setTotalPages(Math.ceil(uniforms.length / itemsPerPage));
      } catch (err) {
        console.error("Error fetching uniforms:", err);
        setError("Failed to fetch uniform data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [itemsPerPage]);

  // Columns for the stock table
  const columns = [
    { Header: "Position Name", accessor: "PositionName" },
    { Header: "Uniform Name", accessor: "UniName" },
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

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
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

  // Handlers
  const handleCreateUniform = () => setCreateModalOpen(true);
  const handleSaveUniform = async () => {
    const fetchStockData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(API_BASE_URL + "/api/UniformCondition", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        const uniforms = data[0]?.UniformConditions || [];

        const sortedUniforms = [...uniforms].sort((a, b) => a.Id - b.Id);
        setStockData(sortedUniforms);
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
        const response = await fetch(API_BASE_URL + "/api/UniformCondition", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        // Extract Uniforms array from the response
        const uniforms = data[0]?.UniformConditions || [];
        // Sort new data by Id
        const sortedUniforms = [...uniforms].sort((a, b) => a.Id - b.Id);
        setStockData(sortedUniforms);
        showToast("Uniform condition updated successfully!");
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
  const handleDelete = (Id) => {
    setDeleteId(Id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(API_BASE_URL + `/api/UniformCondition`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Id: deleteId }),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.Message || "Failed to delete uniform.");
      }

      setStockData((prev) =>
        [...prev.filter((item) => item.Id !== deleteId)].sort(
          (a, b) => a.Id - b.Id
        )
      );
      showToast("Uniform condition deleted successfully!");
    } catch (error) {
      console.error("Error deleting uniform:", error.message);
    }
  };
  // const handleDelete = async (Id) => {
  //   if (window.confirm("Are you sure you want to delete this uniform?")) {
  //     try {
  //       const response = await fetch(API_BASE_URL + `/api/UniformCondition`, {
  //         method: "DELETE",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //         body: JSON.stringify({ Id }),
  //       });

  //       if (!response.ok) {
  //         const errorDetails = await response.json();
  //         console.error("Error details:", errorDetails);
  //         throw new Error(errorDetails.Message || "Failed to delete uniform.");
  //       }

  //       setStockData((prev) =>
  //         [...prev.filter((item) => item.Id !== Id)].sort((a, b) => a.Id - b.Id)
  //       );
  //       showToast("Uniform condition deleted successfully!");
  //       console.log("Uniform deleted successfully!");
  //     } catch (error) {
  //       console.error("Error deleting uniform:", error.message);
  //     }
  //   }
  // };
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
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          confirmDelete();
          setDeleteModalOpen(false);
        }}
      />
      <ToastContainer />
    </StockContainer>
  );
};

export default StockPage;

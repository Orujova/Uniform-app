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
import EditUniformModal from "../components/EditStockModal";
import AddStockModal from "../components/AddStockModal";
import DeleteModal from "../components/DeleteModal";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

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
  align-items: flex-start;
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

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  position: relative;
`;

const FilterActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const FilterInput = styled.input`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const FilterSelect = styled.select`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: ${(props) => (props.active ? "#0284c7" : "white")};
  color: ${(props) => (props.active ? "white" : "#4a5568")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? "#0284c7" : "#f7fafc")};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: #4a5568;
`;

const StockPage = () => {
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    uniformCode: "",
    uniformType: "",
    size: "",
    gender: "",
    receptionStartDate: "",
    receptionEndDate: "",
  });
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const token = localStorage.getItem("token");
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const columns = [
    { Header: "Uni Code", accessor: "UniformCode" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Size", accessor: "UniformSize" },
    { Header: "Type", accessor: "UniformType" },
    { Header: "Gender", accessor: "Gender" },
    { Header: "Stock Count", accessor: "StockCount" },
    { Header: "Imported Stock", accessor: "ImportedStockCount" },
    { Header: "Unit Price", accessor: "UnitPrice" },
    { Header: "Total Price", accessor: "TotalPrice" },
    { Header: "Option", accessor: "StoreOrEmployee" },

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

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleClearFilters = () => {
    setFilters({
      uniformCode: "",
      uniformType: "",
      size: "",
      gender: "",
      receptionStartDate: "",
      receptionEndDate: "",
    });
  };

  useEffect(() => {
    applyFilters();
    setCurrentPage(1);
  }, [filters, stockData]);

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL + "/api/DCStock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const uniforms = data[0]?.DCStocks || [];
      // Sort by Id in descending order
      const sortedUniforms = uniforms.sort((a, b) => b.Id - a.Id);
      setStockData(sortedUniforms);
      setFilteredData(sortedUniforms);
    } catch (err) {
      console.error("Error fetching uniforms:", err);
      setError("Failed to fetch uniform data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...stockData];

    if (filters.uniformCode) {
      filtered = filtered.filter((item) =>
        item.UniformCode?.toLowerCase().includes(
          filters.uniformCode.toLowerCase()
        )
      );
    }

    if (filters.uniformType) {
      filtered = filtered.filter((item) =>
        item.UniformType?.toLowerCase().includes(
          filters.uniformType.toLowerCase()
        )
      );
    }

    if (filters.size) {
      filtered = filtered.filter(
        (item) =>
          String(item.UniformSize)?.toLowerCase() === filters.size.toLowerCase()
      );
    }

    if (filters.gender) {
      filtered = filtered.filter(
        (item) =>
          String(item.Gender)?.toLowerCase() === filters.gender.toLowerCase()
      );
    }

    if (filters.receptionStartDate && filters.receptionEndDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.ReceptionDate);
        const startDate = new Date(filters.receptionStartDate);
        const endDate = new Date(filters.receptionEndDate);
        endDate.setHours(23, 59, 59, 999);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const getUniqueSizes = () => {
    const sizes = new Set(
      stockData.map((item) => String(item.UniformSize)).filter(Boolean)
    );
    return Array.from(sizes).sort();
  };

  const getUniqueGenders = () => {
    const genders = new Set(
      stockData.map((item) => String(item.Gender)).filter(Boolean)
    );
    return Array.from(genders).sort();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUniform = () => setAddModalOpen(true);

  const handleSaveUniform = async () => {
    await fetchStockData();
    showToast("Stock added successfully!", "success");
  };

  const handleEdit = (row) => {
    setEditData(row);
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    fetchStockData();
    setEditModalOpen(false);
    showToast("Stock updated successfully!", "success");
  };
  const handleDelete = (Id) => {
    setDeleteId(Id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/DCStock`, {
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

      await fetchStockData();

      showToast("Stock deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting uniform:", error.message);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const getUniqueTypes = () => {
    const types = new Set(
      stockData.map((item) => String(item.UniformType)).filter(Boolean)
    );
    return Array.from(types).sort();
  };

  return (
    <StockContainer>
      <Header>
        <Title>DC Stock Management</Title>
        <ButtonGroup>
          <StyledButton onClick={handleCreateUniform}>
            <FaPlus style={{ marginRight: "8px" }} /> Add Stock
          </StyledButton>
        </ButtonGroup>
      </Header>

      <div>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Uniform Code</FilterLabel>
            <FilterInput
              type="text"
              name="uniformCode"
              value={filters.uniformCode}
              onChange={handleFilterChange}
              placeholder="Enter uniform code"
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Uniform Type</FilterLabel>
            <FilterSelect
              name="uniformType"
              value={filters.uniformType}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {getUniqueTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Size</FilterLabel>
            <FilterSelect
              name="size"
              value={filters.size}
              onChange={handleFilterChange}
            >
              <option value="">All Sizes</option>
              {getUniqueSizes().map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Gender</FilterLabel>
            <FilterSelect
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
            >
              <option value="">All Genders</option>
              {getUniqueGenders().map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Reception Start Date</FilterLabel>
            <FilterInput
              type="date"
              name="receptionStartDate"
              value={filters.receptionStartDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Reception End Date</FilterLabel>
            <FilterInput
              type="date"
              name="receptionEndDate"
              value={filters.receptionEndDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
        </FilterContainer>
        <FilterActionsContainer>
          <ClearFilterButton onClick={handleClearFilters}>
            Clear Filters
          </ClearFilterButton>
        </FilterActionsContainer>
      </div>

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
            <PageButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </PageButton>

            {getPageNumbers().map((number, index) =>
              number === "..." ? (
                <PageInfo key={`ellipsis-${index}`}>...</PageInfo>
              ) : (
                <PageButton
                  key={number}
                  active={currentPage === number}
                  onClick={() => handlePageChange(number)}
                >
                  {number}
                </PageButton>
              )
            )}

            <PageButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </PageButton>
          </PaginationContainer>
        </>
      )}

      <AddStockModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveUniform}
        apiData={stockData}
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

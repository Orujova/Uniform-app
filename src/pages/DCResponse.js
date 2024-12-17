import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";

const StockContainer = styled.div`
  padding: 12px;
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

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-radius: 8px;
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
  padding: 6px;
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

const FilterSelect = styled.select`
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const ManagerResponse = () => {
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
    projectId: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const columns = [
    { Header: "Employee Name", accessor: "EmployeeName" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Request Count", accessor: "RequestCount" },
    { Header: "Created By", accessor: "CreatedBy" },
    { Header: "Created Date", accessor: "CreatedDate" },
    { Header: "Manager Approved By", accessor: "ManagerApprovedBy" },
    { Header: "Approved Date", accessor: "ManagerApprovedDate" },
    {
      Header: "Store Status",
      accessor: "StoreRequestStatus",
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
      Header: "DC Status",
      accessor: "DCOrderStatus",
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
        const { StoreRequestStatus, DCOrderStatus, Id } = row.original;
        const isPending = StoreRequestStatus === "Pending";
        const isApproved =
          StoreRequestStatus === "Intransit" ||
          StoreRequestStatus === "Approved";
        const isRejected = DCOrderStatus === "Rejected";

        return (
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "center" }}
          >
            {isPending && !isRejected && !isApproved ? (
              <>
                <ActionButton
                  onClick={() => handleAccept(Id)}
                  bgColor="#28a745"
                  hoverColor="#218838"
                >
                  Accept
                </ActionButton>
                <ActionButton
                  onClick={() => handleReject(Id)}
                  bgColor="#dc3545"
                  hoverColor="#c82333"
                >
                  Reject
                </ActionButton>
              </>
            ) : isApproved ? (
              <FaCheck style={{ fontSize: "20px", color: "#28a745" }} />
            ) : isRejected ? (
              <FaTimes style={{ fontSize: "20px", color: "#dc3545" }} />
            ) : null}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    fetchStockData();
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, stockData]);

  const fetchStockData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/GetApprovedManagerOrders`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      const stockRequests = data[0]?.UniformForEmployees || [];
      const sortedUniforms = [...stockRequests].sort((a, b) => a.Id - b.Id);
      setStockData(sortedUniforms);
      setFilteredData(sortedUniforms);
      setTotalPages(Math.ceil(stockRequests.length / itemsPerPage));
    } catch (err) {
      setError("Failed to fetch stock data.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      // Extract employees
      const employeeList = data[0]?.Employees || [];
      setEmployees(employeeList);

      // Get unique projects with their IDs
      const uniqueProjects = employeeList
        .filter((emp) => emp.Project?.Id)
        .map((emp) => ({
          id: emp.Project.Id,
          code: emp.Project.ProjectCode,
        }));

      // Remove duplicates by ProjectId
      const uniqueProjectsById = Object.values(
        uniqueProjects.reduce((acc, curr) => {
          if (!acc[curr.id]) {
            acc[curr.id] = curr;
          }
          return acc;
        }, {})
      ).sort((a, b) => a.code.localeCompare(b.code));

      setProjects(uniqueProjectsById);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/ApproveRejectDCOrder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UniformForEmployeeIds: [requestId],
            IsApproved: true,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to approve request");

      setFilteredData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.Id === requestId
            ? { ...item, StoreRequestStatus: "Intransit" }
            : item
        );
        return updatedData.sort((a, b) => a.Id - b.Id);
      });
    } catch (err) {
      setError("Error approving the request.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/ApproveRejectDCOrder`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            UniformForEmployeeIds: [requestId],
            IsApproved: false,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to reject request");

      setFilteredData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.Id === requestId
            ? { ...item, StoreRequestStatus: "Rejected" }
            : item
        );
        return updatedData.sort((a, b) => a.Id - b.Id);
      });
    } catch (err) {
      setError("Error rejecting the request.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Intransit":
        return "#6b7280";
      case "Rejected":
        return "#ef4444";
      case "Approved":
        return "#10b981";
      default:
        return "";
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "projectId" && { employeeId: "" }),
    }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  // Update the filtering logic
  const applyFilters = () => {
    let filtered = [...stockData];

    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((item) => {
        const createdDate = new Date(item.CreatedDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        return createdDate >= startDate && createdDate <= endDate;
      });
    }

    if (filters.projectId) {
      filtered = filtered.filter((item) => {
        const employee = employees.find(
          (emp) => emp.Id?.toString() === item.EmployeeId?.toString()
        );
        return employee?.Project?.Id?.toString() === filters.projectId;
      });
    }

    if (filters.employeeId) {
      filtered = filtered.filter(
        (item) => item.EmployeeId?.toString() === filters.employeeId
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  // Calculate current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <StockContainer>
      <Header>
        <Title>DC Response</Title>
        <FilterContainer>
          <FilterGroup>
            <FilterLabel>Project</FilterLabel>
            <FilterSelect
              name="projectId"
              value={filters.projectId}
              onChange={handleFilterChange}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {`${project.code}`}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Start Date</FilterLabel>
            <FilterInput
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>End Date</FilterLabel>
            <FilterInput
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </FilterGroup>
        </FilterContainer>
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
    </StockContainer>
  );
};

export default ManagerResponse;

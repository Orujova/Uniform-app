import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Filters from "../components/DCResponseComp/Filters";
import Pagination from "../components/DCResponseComp/Pagination";
import StatusBadge from "../components/DCResponseComp/StatusBadge";
import ActionButtons from "../components/DCResponseComp/ActionButtons";
import Table from "../components/Table";
import ProjectSelectModal from "../components/ProjectSelectModal";
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
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #2d3a45;
`;

const ManagerResponse = () => {
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    employeeId: "",
    projectId: "",
  });

  const columns = [
    { Header: "Employee Name", accessor: "EmployeeName" },
    { Header: "Employee Project", accessor: "EmployeeProject" },
    { Header: "Uniform Name", accessor: "UniformName" },
    { Header: "Request Count", accessor: "RequestCount" },
    { Header: "Created By", accessor: "CreatedBy" },
    { Header: "Created Date", accessor: "CreatedDate" },
    { Header: "Operation Approved By", accessor: "OperationApprovedBy" },
    { Header: "Approved Date", accessor: "OperationApprovedDate" },
    {
      Header: "Store Request Status",
      accessor: "StoreRequestStatus",
      Cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      Header: "DC Response Status",
      accessor: "DCOrderStatus",
      Cell: ({ value }) => <StatusBadge status={value} />,
    },
    {
      Header: "Actions",
      accessor: "actions",
      Cell: ({ row }) => (
        <ActionButtons
          status={row.original.StoreRequestStatus}
          dcStatus={row.original.DCOrderStatus}
          id={row.original.Id}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ),
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
        `${API_BASE_URL}/api/UniformForEmployee/GetApprovedOperationOrdersForDC`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      const employeeList = data[0]?.Employees || [];
      setEmployees(employeeList);

      const uniqueProjects = employeeList
        .filter((emp) => emp.Project?.Id)
        .map((emp) => ({
          id: emp.Project.Id,
          code: emp.Project.ProjectCode,
        }));

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
          item.Id === requestId ? { ...item } : item
        );
        return updatedData.sort((a, b) => a.Id - b.Id);
      });
      await fetchStockData();
      showToast("Request approved successfully", "success");
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
          item.Id === requestId ? { ...item } : item
        );
        return updatedData.sort((a, b) => a.Id - b.Id);
      });
      await fetchStockData();
      showToast("Request rejected successfully", "success");
    } catch (err) {
      setError("Error rejecting the request.");
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

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      employeeId: "",
      projectId: "",
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <StockContainer>
      <Header>
        <Title>DC Response</Title>
        <Filters
          filters={filters}
          projects={projects}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onOpenModal={() => setIsModalOpen(true)}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <ProjectSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        apiBaseUrl={API_BASE_URL}
      />
      <ToastContainer />
    </StockContainer>
  );
};

export default ManagerResponse;

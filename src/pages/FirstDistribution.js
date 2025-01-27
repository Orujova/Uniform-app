import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Select from "react-select";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Table from "../components/Table";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

// Container for First Distribution Page
const FirstDistributionContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #ffffff;
`;

// Top Bar with dropdown
const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #ffffff;
  padding: 14px 18px;
  border-radius: 12px;
`;

// Custom Dropdown using react-select
const ProjectDropdown = styled(Select)`
  width: 260px;
  font-size: 14px;
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

const FirstDistribution = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  // Common headers for API requests
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Employee`, {
          headers: headers,
        });

        if (!response.ok) throw new Error("Failed to fetch projects");
        const data = await response.json();
        const projectEmployees = data[0]?.Employees || [];
        // Create a Map to store unique projects
        const uniqueProjects = new Map();
        projectEmployees.forEach((employee) => {
          const project = employee.Project;

          // Ensure the project exists before accessing its properties
          if (project) {
            const projectCode = project.ProjectCode;

            // Only add if this project code hasn't been added yet
            if (!uniqueProjects.has(projectCode)) {
              uniqueProjects.set(projectCode, {
                value: project.Id,
                label: `Project ${projectCode}`,
              });
            }
          } else {
            console.warn(
              `Employee with ID ${employee.Id} has no associated project.`
            );
          }
        });

        // Convert Map values to array and sort
        const projectOptions = Array.from(uniqueProjects.values()).sort(
          (a, b) => a.label.localeCompare(b.label)
        );

        setProjects(projectOptions);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    if (token) fetchProjects();
  }, [token]);

  // Handle project selection change and load data
  const handleProjectChange = async (selectedOption) => {
    setSelectedProject(selectedOption);
    if (selectedOption) {
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Project/GetEmployeesByProjectId?projectId=${selectedOption.value}`,
          { headers: headers }
        );
        if (!response.ok) throw new Error("Failed to fetch employees");

        const data = await response.json();
        const projectEmployees = data[0]?.ProjectEmployees || [];
        setTableData(projectEmployees);

        setTotalPages(Math.ceil(projectEmployees.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setTableData([]);
    }
  };

  const handleOrderSubmit = async () => {
    if (!selectedProject) {
      showToast("Please select a project first", "warning");
      return;
    }

    setIsOrderLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/assign-uniforms`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            ProjectId: selectedProject.value,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      showToast("Order submitted successfully", "success");
      handleProjectChange(selectedProject);
    } catch (error) {
      console.error("Error submitting order:", error);
      showToast("Failed to submit order. Please try again.", "error");
    } finally {
      setIsOrderLoading(false);
    }
  };

  // Columns configuration for the table
  const columns = [
    { Header: "Full Name", accessor: "FullName" },
    { Header: "Badge", accessor: "Badge" },
    { Header: "Phone Number", accessor: "PhoneNumber" },
    { Header: "Shirt Size", accessor: "ShirtSize" },
    { Header: "Pant Size", accessor: "PantSize" },
    { Header: "Gender", accessor: "Gender" },
  ];

  if (!token) {
    return (
      <FirstDistributionContainer>
        <div style={{ textAlign: "center", color: "#F76C6C" }}>
          Please log in to access this page
        </div>
      </FirstDistributionContainer>
    );
  }

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

  return (
    <FirstDistributionContainer>
      <TopBar>
        <ProjectDropdown
          options={projects}
          placeholder="Select a project..."
          value={selectedProject}
          onChange={handleProjectChange}
          styles={{
            control: (provided) => ({
              ...provided,
              borderRadius: "10px",
              borderColor: "#E0E0E0",
              boxShadow: "none",
              minHeight: "45px",
            }),
            placeholder: (provided) => ({
              ...provided,
              color: "#9099A0",
            }),
          }}
          isSearchable={true}
          isClearable={true}
        />

        <StyledButton onClick={handleOrderSubmit} disabled={isOrderLoading}>
          {isOrderLoading ? "Ordering..." : "Order for Employee"}
        </StyledButton>
      </TopBar>

      <Table
        columns={columns}
        data={currentItems}
        selectable={true}
        editable={true}
        loading={loading}
      />

      {tableData.length > 0 && totalPages > 1 && (
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
      )}

      <ToastContainer />
    </FirstDistributionContainer>
  );
};

export default FirstDistribution;

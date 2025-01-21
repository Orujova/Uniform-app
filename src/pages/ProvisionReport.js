import React, { useState, useEffect, useRef, memo } from "react";
import styled from "styled-components";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaAlignLeft,
  FaDownload,
} from "react-icons/fa";
import Table from "../components/Table";
import SummaryModal from "../components/ReportSummary";
import { API_BASE_URL } from "../config";

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0284c7;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ReportContainer = styled.div`
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #1e293b;
  font-weight: 600;
`;

const TableContainer = styled.div.attrs({ className: "table-responsive" })`
  position: relative;
  overflow-x: auto;
  width: 100%;
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
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.isActive ? "#16a34a" : "#dc2626")};
`;

const UniformListContainer = styled.div`
  position: relative;
  z-index: ${(props) => (props.isExpanded ? 1000 : 1)};
`;

const UniformCounter = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: ${(props) =>
    props.isExpanded
      ? props.variant === "assigned"
        ? "#e0f2fe"
        : "#ffe4e6"
      : props.variant === "assigned"
      ? "#f0f9ff"
      : "#fff1f2"};
  border: 1px solid
    ${(props) => (props.variant === "assigned" ? "#bae6fd" : "#fecdd3")};
  border-radius: 6px;
  font-size: 13px;
  color: ${(props) => (props.variant === "assigned" ? "#0369a1" : "#be123c")};
  cursor: pointer;
  user-select: none;
  gap: 6px;
  min-width: 100px;
  transition: all 0.2s;
  font-weight: ${(props) => (props.isExpanded ? "600" : "normal")};

  &:hover {
    background: ${(props) =>
      props.variant === "assigned" ? "#e0f2fe" : "#ffe4e6"};
  }
`;

// Update the ExpandedSection styled component
const ExpandedSection = styled.div`
  position: absolute;
  min-width: 350px;
  max-width: 450px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  overflow-y: auto;
  opacity: ${(props) => (props.isVisible ? "1" : "0")};
  transition: all 0.2s ease-in-out;
  visibility: ${(props) => (props.isVisible ? "visible" : "hidden")};
  pointer-events: ${(props) => (props.isVisible ? "auto" : "none")};

  /* Hover state for better scroll indication */
  &:hover::-webkit-scrollbar-thumb {
    background: #94a3b8;
  }

  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    transition: background 0.2s;
  }

  /* Optimize for performance */
  will-change: transform, opacity;
  transform: translateZ(0);
`;

// Update UniformCard for better content display
const UniformCard = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }
`;

// Optimize grid layout for MetaItems
const UniformMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
  color: #64748b;
  font-size: 13px;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const UniformTitle = styled.div`
  font-weight: 500;
  color: #334155;
  margin-bottom: 6px;
`;

const MetaLabel = styled.span`
  font-weight: 500;
  color: #475569;
`;

const StyledButton = styled.button`
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #0284c7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #075985;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  background: white;
  color: #334155;
  font-size: 14px;
  width: 100%;

  &:hover {
    border-color: #cbd5e1;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
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

const ButtonSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #0284c7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 120px;
  justify-content: center;

  &:hover {
    background-color: #0369a1;
  }

  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
`;

const UniformList = memo(
  ({ uniforms, variant, rowIndex, isExpanded, onToggle }) => {
    const dropdownRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
      if (dropdownRef.current && containerRef.current && isExpanded) {
        const dropdown = dropdownRef.current;
        const container = containerRef.current;
        const tableContainer = document.querySelector(".table-responsive");

        if (tableContainer) {
          const dropdownRect = dropdown.getBoundingClientRect();
          const tableRect = tableContainer.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // Calculate available space
          const spaceBelow = tableRect.bottom - containerRect.bottom;
          const spaceAbove = containerRect.top - tableRect.top;
          const maxAvailableHeight = Math.max(spaceBelow, spaceAbove) - 20;

          // Set max height based on available space
          dropdown.style.maxHeight = `${Math.min(300, maxAvailableHeight)}px`;

          // Handle horizontal overflow
          if (dropdownRect.right > tableRect.right - 10) {
            dropdown.style.left = "auto";
            dropdown.style.right = "0";
          } else {
            dropdown.style.left = "0";
            dropdown.style.right = "auto";
          }

          // Handle vertical overflow
          if (spaceBelow < maxAvailableHeight && spaceAbove > spaceBelow) {
            dropdown.style.top = "auto";
            dropdown.style.bottom = "100%";
            dropdown.style.marginTop = "0";
            dropdown.style.marginBottom = "8px";
          } else {
            dropdown.style.top = "100%";
            dropdown.style.bottom = "auto";
            dropdown.style.marginTop = "8px";
            dropdown.style.marginBottom = "0";
          }
        }
      }
    }, [isExpanded]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          onToggle(rowIndex, variant);
        }
      };

      if (isExpanded) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isExpanded, onToggle, rowIndex, variant]);

    if (!Array.isArray(uniforms) || uniforms.length === 0) {
      return (
        <span style={{ color: "#64748b", fontStyle: "italic" }}>
          No uniforms
        </span>
      );
    }

    return (
      <UniformListContainer ref={containerRef} isExpanded={isExpanded}>
        <UniformCounter
          variant={variant}
          isExpanded={isExpanded}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(rowIndex, variant);
          }}
        >
          <span>{uniforms.length} items</span>
          {isExpanded ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </UniformCounter>

        <ExpandedSection
          ref={dropdownRef}
          isVisible={isExpanded}
          variant={variant}
        >
          {uniforms.map((uniform, idx) => (
            <UniformCard key={idx}>
              <UniformTitle>{uniform.UniName}</UniformTitle>
              <UniformMeta>
                <MetaItem>
                  <MetaLabel>Code:</MetaLabel>
                  {uniform.UniCode}
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Size:</MetaLabel>
                  {uniform.Size}
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Type:</MetaLabel>
                  {uniform.UniType}
                </MetaItem>
                <MetaItem>
                  <MetaLabel>Gender:</MetaLabel>
                  {uniform.Gender}
                </MetaItem>
              </UniformMeta>
            </UniformCard>
          ))}
        </ExpandedSection>
      </UniformListContainer>
    );
  }
);

const UniformProvisionReport = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [expandedRows, setExpandedRows] = useState({});
  const token = localStorage.getItem("token");
  const [filters, setFilters] = useState({
    storeFormat: "",
    projectId: "",
  });

  const [projects, setProjects] = useState([]);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [projectsMap, setProjectsMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const handleClearFilters = () => {
    setFilters({
      storeFormat: "",
      projectId: "",
    });
  };

  const fetchProjects = async (storeFormat) => {
    setIsProjectsLoading(true);
    try {
      let url = `${API_BASE_URL}/api/Project?`;
      if (storeFormat) {
        url += `StoreFormat=${storeFormat}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const result = await response.json();

      const projectsList = result[0]?.Projects || [];
      let newMapping = {};
      for (let project of projectsList) {
        if (project.Id && project.ProjectCode) {
          newMapping[project.ProjectCode] = project.Id;
        }
      }

      setProjects(projectsList);
      setProjectsMap(newMapping);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setProjects([]);
      setProjectsMap({});
    } finally {
      setIsProjectsLoading(false);
    }
  };

  const handleFilterChange = async (field, value) => {
    if (field === "storeFormat") {
      setFilters({
        storeFormat: value,
        projectId: "",
      });
      await fetchProjects(value);
    } else if (field === "projectId") {
      // Find the project directly from projects array
      const selectedProject = projects.find((p) => p.ProjectCode === value);
      const actualProjectId = selectedProject?.Id || "";

      setFilters((prev) => ({
        ...prev,
        projectId: actualProjectId,
      }));
    }
  };

  useEffect(() => {
    fetchProjects(filters.storeFormat);
  }, []);

  const fetchProvisionData = async () => {
    setError("");
    setIsLoading(true);
    try {
      let url = `${API_BASE_URL}/api/UniformForEmployee/GetUniformProvisionDetails`;
      const queryParams = [];

      if (filters.storeFormat) {
        queryParams.push(`storeFormat=${filters.storeFormat}`);
      }
      if (filters.projectId) {
        queryParams.push(`projectId=${filters.projectId}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result = await response.json();
      setData(result[0]?.UniformProvisionDetails || []);
    } catch (err) {
      setError("Failed to fetch provision details");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProvisionData();
  }, [filters]);

  const toggleRow = (rowIndex, type) => {
    setExpandedRows((prev) => {
      const newState = {};
      const currentKey = `${rowIndex}-${type}`;

      // If current dropdown is already open, just close it
      if (prev[currentKey]) {
        return newState;
      }

      // Open new dropdown
      newState[currentKey] = true;
      return newState;
    });
  };

  const columns = [
    {
      Header: "Employee Name",
      accessor: "EmployeeFullName",
    },
    {
      Header: "Badge Number",
      accessor: "EmployeeBadge",
    },
    {
      Header: "Partial Provision",
      accessor: "PartialProvisionCount",
      Cell: ({ value }) => (
        <StatusIcon isActive={value === 1}>
          {value === 1 ? <FaCheck size={16} /> : <FaTimes size={16} />}
        </StatusIcon>
      ),
    },
    {
      Header: "Full Provision",
      accessor: "FullProvisionCount",
      Cell: ({ value }) => (
        <StatusIcon isActive={value === 1}>
          {value === 1 ? <FaCheck size={16} /> : <FaTimes size={16} />}
        </StatusIcon>
      ),
    },
    {
      Header: "Assigned Uniforms",
      accessor: "AssignedUniforms",
      Cell: ({ value, row }) => (
        <UniformList
          uniforms={value}
          variant="assigned"
          rowIndex={row.index}
          isExpanded={expandedRows[row.index + "-assigned"]}
          onToggle={toggleRow}
        />
      ),
    },
    {
      Header: "Required Uniforms",
      accessor: "UnassignedUniforms",
      Cell: ({ value, row }) => (
        <UniformList
          uniforms={value}
          variant="unassigned"
          rowIndex={row.index}
          isExpanded={expandedRows[row.index + "-unassigned"]}
          onToggle={toggleRow}
        />
      ),
    },
  ];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

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

  if (error) {
    return (
      <ReportContainer>
        <div style={{ color: "#dc2626", textAlign: "center" }}>{error}</div>
      </ReportContainer>
    );
  }

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/export-uniform-stock-requirements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "uniform-stock-requirements.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError("Failed to export data");
      console.error("Export Error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ReportContainer>
      <Header>
        <Title>Uniform Provision Details</Title>

        <StyledButton onClick={() => setIsSummaryModalOpen(true)}>
          <FaAlignLeft size={14} />
          <span>Summarize</span>
        </StyledButton>
        <ExportButton onClick={handleExport} disabled={isLoading || exporting}>
          {exporting ? (
            <>
              <ButtonSpinner />
              Exporting...
            </>
          ) : (
            <>
              <FaDownload size={14} />
              Export
            </>
          )}
        </ExportButton>
      </Header>

      <FilterSection>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>Store Format</FilterLabel>
            <Select
              value={filters.storeFormat}
              onChange={(e) =>
                handleFilterChange("storeFormat", e.target.value)
              }
              disabled={isProjectsLoading}
            >
              <option value="">All Formats</option>
              <option value="HYPER">HYPER</option>
              <option value="SUPER">SUPER</option>
              <option value="MARKET">MARKET</option>
              <option value="BRAVO">BRAVO</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Project</FilterLabel>
            <Select
              value={
                projects.find((p) => p.Id === Number(filters.projectId))
                  ?.ProjectCode || ""
              }
              onChange={(e) => handleFilterChange("projectId", e.target.value)}
              disabled={isProjectsLoading}
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.Id} value={project.ProjectCode}>
                  {project.ProjectCode}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <ClearFilterButton onClick={handleClearFilters}>
            Clear Filters
          </ClearFilterButton>
        </FilterRow>
      </FilterSection>

      <TableContainer>
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        ) : (
          <Table columns={columns} data={currentItems} selectable={false} />
        )}
      </TableContainer>

      {data.length > 0 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaChevronLeft size={12} />
          </PaginationButton>

          {getPageNumbers().map((number) => (
            <PaginationButton
              key={number}
              active={currentPage === number}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </PaginationButton>
          ))}

          <PaginationButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            <FaChevronRight size={12} />
          </PaginationButton>
        </PaginationContainer>
      )}

      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        token={token}
        filters={filters}
      />
    </ReportContainer>
  );
};

export default UniformProvisionReport;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";
import Table from "../components/Table";
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
`;

// Pagination Styles
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

const StockRequirementsReport = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  useEffect(() => {
    fetchStockRequirements();
  }, []);

  const fetchStockRequirements = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/GetUniformStockRequirements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const result = await response.json();
      setData(result[0]?.UniformStockRequirements || []);
    } catch (err) {
      setError("Failed to fetch stock requirements data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      Header: "Uniform Code",
      accessor: "UniformCode",
    },
    {
      Header: "Uniform Name",
      accessor: "UniformName",
    },
    {
      Header: "DC Stock Count",
      accessor: "DCStockCount",
    },
    {
      Header: "Required Stock Count",
      accessor: "RequiredStockCount",
    },
    {
      Header: "Out Of Stock Count",
      accessor: "OutOfStockCount",
      Cell: ({ value }) => (
        <span
          style={{
            color: value > 0 ? "#dc2626" : "#16a34a",
            fontWeight: 500,
          }}
        >
          {value}
        </span>
      ),
    },
  ];

  const calculateStats = () => {
    return {
      totalUniforms: data.length,
      totalStock: data.reduce((sum, item) => sum + item.DCStockCount, 0),
      totalRequired: data.reduce(
        (sum, item) => sum + item.RequiredStockCount,
        0
      ),
      totalMissing: data.reduce((sum, item) => sum + item.OutOfStockCount, 0),
    };
  };

  // Pagination calculations
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

  const stats = calculateStats();

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
        <Title>Stock Requirements Report</Title>
        <ExportButton onClick={handleExport} disabled={loading || exporting}>
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

      <StatsContainer>
        <StatCard>
          <StatLabel>Total Uniforms</StatLabel>
          <StatValue>{stats.totalUniforms}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Stock</StatLabel>
          <StatValue>{stats.totalStock}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Total Required Stock</StatLabel>
          <StatValue>{stats.totalRequired}</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Out of stock</StatLabel>
          <StatValue
            style={{ color: stats.totalMissing > 0 ? "#dc2626" : "#16a34a" }}
          >
            {stats.totalMissing}
          </StatValue>
        </StatCard>
      </StatsContainer>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        <>
          <Table columns={columns} data={currentItems} selectable={false} />

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
        </>
      )}
    </ReportContainer>
  );
};

export default StockRequirementsReport;

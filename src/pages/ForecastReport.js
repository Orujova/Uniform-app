import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
import Table from "../components/Table";
import { FaChevronLeft, FaChevronRight, FaDownload } from "react-icons/fa";
import _ from "lodash";

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

const InputSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 400px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #1e293b;
  width: 100px;
  outline: none;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  padding: 24px;
  background: ${(props) => (props.highlight ? "#f0f9ff" : "#ffffff")};
  border: 1px solid ${(props) => (props.highlight ? "#bae6fd" : "#e2e8f0")};
  border-radius: 12px;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const StatValue = styled.div`
  color: #1e293b;
  font-size: 28px;
  font-weight: 600;
`;

const GenderStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const GenderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
`;

const GenderLabel = styled.span`
  color: #64748b;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GenderValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GenderCount = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const GenderPercentage = styled.span`
  color: #64748b;
  font-size: 13px;
`;

const StockIndicator = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  background: ${(props) => (props.missing ? "#fee2e2" : "#dcfce7")};
  color: ${(props) => (props.missing ? "#dc2626" : "#16a34a")};
`;

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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
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

const ForecastReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employeeCount, setEmployeeCount] = useState("0");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const token = localStorage.getItem("token");
  const [exporting, setExporting] = useState(false);
  const abortControllerRef = React.useRef(null);

  const fetchData = useCallback(
    async (count) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/UniformForEmployee/GetUniformOrder?EmployeeCount=${count}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const result = await response.json();
        setData(result[0]);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error:", err);
        }
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const debouncedFetchData = useCallback(
    _.debounce((count) => fetchData(count), 100),
    [fetchData]
  );

  useEffect(() => {
    if (employeeCount) {
      debouncedFetchData(employeeCount);
    }

    return () => {
      debouncedFetchData.cancel();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [employeeCount, debouncedFetchData]);

  const columns = [
    {
      Header: "Uniform Code",
      accessor: "UniformCode",
    },
    {
      Header: "Uniform Name",
      accessor: "UniformName",
      width: 250,
    },
    {
      Header: "Gender",
      accessor: "Gender",
    },
    {
      Header: "Size",
      accessor: "Size",
    },
    {
      Header: "Type",
      accessor: "UniType",
    },
    {
      Header: "DC Stock",
      accessor: "DCStockCount",
    },
    {
      Header: "Required",
      accessor: "RequiredCount",
    },
    {
      Header: "Missing",
      accessor: "MissingCount",
      Cell: ({ value }) => (
        <StockIndicator missing={value > 0}>{value}</StockIndicator>
      ),
    },
  ];

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data?.UniformOrders
    ? data.UniformOrders.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = data?.UniformOrders
    ? Math.ceil(data.UniformOrders.length / itemsPerPage)
    : 0;

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

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/export-uniform-orders`,
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
      link.download = "uniform-orders.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ReportContainer>
      <Header>
        <Title>Uniform Forecast Report</Title>
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

      <InputSection>
        <InputGroup>
          <InputLabel>Employee Count:</InputLabel>
          <Input
            type="number"
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            min="1"
          />
        </InputGroup>
      </InputSection>
      {loading && (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      )}

      {data && (
        <>
          <StatsGrid>
            <StatCard highlight>
              <StatHeader>
                <StatLabel>Total Uniform Count</StatLabel>
                <StatValue>{data.TotalUniformOrderCount}</StatValue>
              </StatHeader>
              <GenderStats>
                <GenderRow>
                  <GenderLabel>♂️ Male Distribution</GenderLabel>
                  <GenderValue>
                    <GenderCount>{data.TotalMaleCount}</GenderCount>
                    <GenderPercentage>
                      ({data.TotalMalePercentage}%)
                    </GenderPercentage>
                  </GenderValue>
                </GenderRow>
                <GenderRow>
                  <GenderLabel>♀️ Female Distribution</GenderLabel>
                  <GenderValue>
                    <GenderCount>{data.TotalFemaleCount}</GenderCount>
                    <GenderPercentage>
                      ({data.TotalFemalePercentage}%)
                    </GenderPercentage>
                  </GenderValue>
                </GenderRow>
              </GenderStats>
            </StatCard>

            <StatCard>
              <StatHeader>
                <StatLabel>Simulated Distribution</StatLabel>
              </StatHeader>
              <GenderStats>
                <GenderRow>
                  <GenderLabel>♂️ Male Simulation</GenderLabel>
                  <GenderValue>
                    <GenderCount>{data.SimulatedMaleCount}</GenderCount>
                  </GenderValue>
                </GenderRow>
                <GenderRow>
                  <GenderLabel>♀️ Female Simulation</GenderLabel>
                  <GenderValue>
                    <GenderCount>{data.SimulatedFemaleCount}</GenderCount>
                  </GenderValue>
                </GenderRow>
              </GenderStats>
            </StatCard>
          </StatsGrid>

          <Table columns={columns} data={currentItems} selectable={false} />

          {data.UniformOrders?.length > 0 && (
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

export default ForecastReport;

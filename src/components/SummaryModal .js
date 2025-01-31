import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #2d3a45;
`;

const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const Th = styled.th`
  background-color: #f3f4f6;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 20px;
  color: #4b5563;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  text-align: center;
  padding: 20px;
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  display: flex;
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

const FilterSelect = styled.select`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const SummaryModal = ({ isOpen, onClose }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    transactionDate: "",
  });
  const [transactionDates, setTransactionDates] = useState([]);

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData")) || {};

  const fetchTransactionDates = async (projectId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/GetAllTransactionDates?ProjectId=${projectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch transaction dates");
      const data = await response.json();

      if (data && data[0]?.Transactions) {
        const transactions = data[0].Transactions;
        if (Array.isArray(transactions)) {
          transactions.forEach((transaction) => {
            if (transaction.SenderDate) {
              setTransactionDates((prev) => [
                ...new Set([...prev, transaction.SenderDate]),
              ]);
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching transaction dates:", error);
    }
  };

  const fetchProjectID = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Project`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();

      const userProjects =
        data[0]?.Projects.filter(
          (project) => project.StoreManagerMail === userData.email
        ) || [];

      setTransactionDates([]); // Clear old dates

      for (const project of userProjects) {
        if (project.Id) {
          await fetchTransactionDates(project.Id);
        }
      }
    } catch (error) {
      console.error("Error in fetchProjectID:", error);
    }
  };

  const fetchSummaryData = async (selectedDate) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = selectedDate
        ? `${API_BASE_URL}/api/TransactionPage/pending?TransactionDate=${selectedDate}`
        : `${API_BASE_URL}/api/TransactionPage/pending`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSummaryData(data);
    } catch (err) {
      setError("Failed to fetch summary data. Please try again later.");
      console.error("Error fetching summary data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Fetch data with new date value
    await fetchSummaryData(value);
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjectID();
      // Initial fetch without date filter
      fetchSummaryData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Pending Transactions Summary</ModalTitle>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </ModalHeader>

        <FilterSection>
          <FilterGroup>
            <FilterLabel>Transaction Date</FilterLabel>
            <FilterSelect
              name="transactionDate"
              value={filters.transactionDate}
              onChange={handleFilterChange}
            >
              <option value="">All Dates</option>
              {transactionDates.sort().map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString()}
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </FilterSection>

        {isLoading ? (
          <LoadingSpinner>Loading summary data...</LoadingSpinner>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <SummaryTable>
            <thead>
              <tr>
                <Th>Uniform Code</Th>
                <Th>Uniform Name</Th>
                <Th>Type</Th>
                <Th>Size</Th>
                <Th>Total Count</Th>
              </tr>
            </thead>
            <tbody>
              {summaryData.map((item, index) => (
                <tr key={index}>
                  <Td>{item.UniformCode}</Td>
                  <Td>{item.UniName}</Td>
                  <Td>{item.UniType}</Td>
                  <Td>{item.Size}</Td>
                  <Td>{item.TotalCount}</Td>
                </tr>
              ))}
            </tbody>
          </SummaryTable>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SummaryModal;

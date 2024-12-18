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

const SummaryModal = ({ isOpen, onClose }) => {
  const [summaryData, setSummaryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSummaryData();
    }
  }, [isOpen]);

  const fetchSummaryData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

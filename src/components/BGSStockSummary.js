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
  max-width: 1000px;
  max-height: 80vh;
  position: relative;
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
`;

const TableWrapper = styled.div`
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  color: #1e293b;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${(props) => {
    switch (props.status) {
      case "Accepted":
        return "#dcfce7";
      case "Pending":
        return "#fef3c7";
      case "Rejected":
        return "#fee2e2";
      default:
        return "";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "Accepted":
        return "#166534";
      case "Pending":
        return "#92400e";
      case "Rejected":
        return "#991b1b";
      default:
        return "";
    }
  }};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #0284c7;
`;

const SummarizeModal = ({ isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/getsummarizebgsstock`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const result = await response.json();
      const summary = result[0]?.BGSStockRequests || [];
      setData(summary);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <Title>BGS Stock Summary</Title>

        {loading ? (
          <LoadingSpinner>Loading...</LoadingSpinner>
        ) : error ? (
          <p style={{ color: "#ef4444", textAlign: "center", padding: "20px" }}>
            Error: {error}
          </p>
        ) : (
          data && (
            <TableWrapper>
              <StyledTable>
                <thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>Name</Th>
                    <Th>Project</Th>
                    <Th>Size</Th>
                    <Th style={{ textAlign: "right" }}>Count</Th>
                    <Th style={{ textAlign: "right" }}>Imported</Th>
                    <Th style={{ textAlign: "center" }}>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.UniformId || index}>
                      <Td>{item.UniformCode}</Td>
                      <Td>{item.UniformName}</Td>
                      <Td>{item.ProjectName}</Td>
                      <Td>{item.UniformSize}</Td>
                      <Td style={{ textAlign: "right" }}>{item.Count}</Td>
                      <Td style={{ textAlign: "right" }}>
                        {item.ImportedCount}
                      </Td>
                      <Td style={{ textAlign: "center" }}>
                        <StatusBadge status={item.Status}>
                          {item.Status}
                        </StatusBadge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>
          )
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SummarizeModal;

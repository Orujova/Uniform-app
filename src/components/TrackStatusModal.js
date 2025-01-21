import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaArrowRight } from "react-icons/fa";
import { API_BASE_URL } from "../config";

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  border-radius: 16px 16px 0 0;
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #1e293b;
  font-weight: 600;
`;

const ModalContent = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const TableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  position: relative;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 16px;
  background-color: white;
  border-radius: 8px;
`;

const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: white;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
  text-align: center;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 2;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
  color: #1e293b;
  font-size: 14px;
  background-color: white;
  transition: background-color 0.2s;

  tr:hover & {
    background-color: #f8fafc;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  gap: 8px;
`;

const ArrowContainer = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 1;
  padding: 0 4px;
`;

const ArrowLine = styled.div`
  height: 2px;
  width: 24px;
  background-color: #065f46;
  margin: 0 -2px;
`;

const StatusArrow = styled(FaArrowRight)`
  color: #065f46;
  font-size: 14px;
`;

const WaitingStatus = styled.span`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  background-color: #f1f5f9;
  color: #64748b;
  font-style: italic;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;

  ${({ status }) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "background-color: #FEF3C7; color: #92400E;";
      case "approved":
        return "background-color: #D1FAE5; color: #065F46;";
      case "rejected":
        return "background-color: #FEE2E2; color: #991B1B;";
      case "intransit":
        return "background-color: #DBEAFE; color: #1E40AF;";
      case "accepted":
        return "background-color: #D1FAE5; color: #065F46;";
      case "handovered":
        return "background-color: #F3F4F6; color: #374151;";
      default:
        return "background-color: ; color: ;";
    }
  }}
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #dc2626;
`;

const TrackStatusModal = ({ isOpen, onClose }) => {
  const [statusData, setStatusData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  useEffect(() => {
    const fetchStatusData = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/UniformForEmployee`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        const track = data[0]?.UniformForEmployees || [];

        const filteredData = track.filter(
          (item) => item.CreatedBy === userData.fullName
        );
        console.log("Filtered Data:", filteredData);

        setStatusData(filteredData);
      } catch (err) {
        console.error("Error fetching status:", err);
        setError("Failed to fetch status data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusData();
  }, [isOpen, token, userData.fullName]);

  const getStatusLowerCase = (status) => {
    return (status || "").toLowerCase();
  };

  const renderDCStatus = (operationStatus, dcStatus) => {
    const operationStatusLower = getStatusLowerCase(operationStatus);

    if (operationStatusLower === "pending" || !operationStatus) {
      return <WaitingStatus> Operation Approval</WaitingStatus>;
    }
    if (operationStatusLower === "approved") {
      return (
        <StatusBadge status={dcStatus || ""}>{dcStatus || ""}</StatusBadge>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  const renderArrow = () => (
    <ArrowContainer>
      <ArrowLine />
      <StatusArrow />
    </ArrowContainer>
  );

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Track Status</ModalTitle>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </ModalHeader>
        <ModalContent>
          {isLoading ? (
            <LoadingMessage>Loading status data...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <TableWrapper>
              <StyledTable>
                <TableHeader>
                  <tr>
                    <Th>Employee Name</Th>
                    <Th>Uniform Name</Th>
                    <Th>Request Count</Th>
                    <Th>Store Request Status</Th>
                    <Th>Operation Response Status</Th>
                    <Th>DC Response Status</Th>
                    <Th>Transaction Status</Th>
                  </tr>
                </TableHeader>
                <tbody>
                  {statusData.map((item, index) => (
                    <tr key={index}>
                      <Td>{item.EmployeeName}</Td>
                      <Td>{item.UniformName}</Td>
                      <Td>{item.RequestCount}</Td>
                      <Td style={{ position: "relative" }}>
                        <StatusContainer>
                          <StatusBadge status={item.StoreRequestStatus || ""}>
                            {item.StoreRequestStatus || ""}
                          </StatusBadge>
                          {getStatusLowerCase(item.StoreRequestStatus) ===
                            "approved" && renderArrow()}
                        </StatusContainer>
                      </Td>
                      <Td style={{ position: "relative" }}>
                        <StatusContainer>
                          <StatusBadge status={item.OperationOrderStatus || ""}>
                            {item.OperationOrderStatus || ""}
                          </StatusBadge>
                          {getStatusLowerCase(item.OperationOrderStatus) ===
                            "approved" && renderArrow()}
                        </StatusContainer>
                      </Td>
                      <Td style={{ position: "relative" }}>
                        <StatusContainer>
                          {renderDCStatus(
                            item.OperationOrderStatus,
                            item.DCOrderStatus
                          )}
                          {getStatusLowerCase(item.DCOrderStatus) ===
                            "approved" && renderArrow()}
                        </StatusContainer>
                      </Td>
                      <Td>
                        <StatusContainer>
                          <StatusBadge status={item.TransactionStatus || ""}>
                            {item.TransactionStatus || ""}
                          </StatusBadge>
                        </StatusContainer>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </TableWrapper>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TrackStatusModal;

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaTimes, FaArrowRight } from "react-icons/fa";
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
  border-radius: 12px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #2d3a45;
`;

const CloseButton = styled.button`
  background: none;

  cursor: pointer;

  &:hover {
    color: #374151;
  }

  color: #005ea6;

  padding: 4px 8px;
  border: 1px solid #005ea6;
  border-radius: 50%;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  text-align: center;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.withArrow ? "space-between" : "center")};
  position: relative;
  width: 100%;
`;

const ArrowContainer = styled.div`
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  z-index: 1;
`;

const ArrowLine = styled.div`
  height: 2px;
  width: 24px;
  background-color: #065f46;
  margin: 0 -2px;
`;

const StatusArrow = styled(FaArrowRight)`
  color: #065f46;
  font-size: 16px;
`;

const WaitingStatus = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: #e5e7eb;
  color: #6b7280;
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
      default:
        return "background-color: ; color: ;";
      // return "background-color: #F3F4F6; color: #374151;";
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

  const renderDCStatus = (managerStatus, dcStatus) => {
    const managerStatusLower = getStatusLowerCase(managerStatus);

    if (managerStatusLower === "pending" || !managerStatus) {
      return <WaitingStatus> Manager Approval</WaitingStatus>;
    }
    if (managerStatusLower === "approved") {
      return (
        <StatusBadge status={dcStatus || "pending"}>
          {dcStatus || "Pending"}
        </StatusBadge>
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
          <CloseButton onClick={onClose}>
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          {isLoading ? (
            <LoadingMessage>Loading status data...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <StyledTable>
              <thead>
                <tr>
                  <Th>Employee Name</Th>
                  <Th>Uniform Name</Th>
                  <Th>Request Count</Th>
                  <Th>Store Request Status</Th>
                  <Th>Manager Order Status</Th>
                  <Th>DC Order Status</Th>
                </tr>
              </thead>
              <tbody>
                {statusData.map((item, index) => (
                  <tr key={index}>
                    <Td>{item.EmployeeName}</Td>
                    <Td>{item.UniformName}</Td>
                    <Td>{item.RequestCount}</Td>
                    <Td style={{ position: "relative" }}>
                      <StatusContainer>
                        <StatusBadge
                          status={item.StoreRequestStatus || "pending"}
                        >
                          {item.StoreRequestStatus || "Pending"}
                        </StatusBadge>
                        {getStatusLowerCase(item.StoreRequestStatus) ===
                          "approved" && renderArrow()}
                      </StatusContainer>
                    </Td>
                    <Td style={{ position: "relative" }}>
                      <StatusContainer>
                        <StatusBadge
                          status={item.ManagerOrderStatus || "pending"}
                        >
                          {item.ManagerOrderStatus || "Pending"}
                        </StatusBadge>
                        {getStatusLowerCase(item.ManagerOrderStatus) ===
                          "approved" && renderArrow()}
                      </StatusContainer>
                    </Td>
                    <Td>
                      {renderDCStatus(
                        item.ManagerOrderStatus,
                        item.DCOrderStatus
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </StyledTable>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TrackStatusModal;

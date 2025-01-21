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
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin: 0 16px;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 12px 12px 0 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const ModalContent = styled.div`
  padding: 24px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
`;

const StatCard = styled.div`
  padding: 20px;
  background: ${(props) => (props.highlight ? "#f0f9ff" : "#ffffff")};
  border: 1px solid ${(props) => (props.highlight ? "#bae6fd" : "#e2e8f0")};
  border-radius: 8px;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
`;

const StatValue = styled.div`
  color: #1e293b;
  font-size: 24px;
  font-weight: 600;
`;

const StatPercentage = styled.span`
  color: #64748b;
  font-size: 16px;
  margin-left: 8px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #dc2626;
  font-size: 16px;
`;

const SummaryModal = ({ isOpen, onClose, token }) => {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!isOpen) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/UniformForEmployee/GetUniformProvisionSummarize`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();
        setSummary(data);
        console.log(data);
      } catch (err) {
        setError("Failed to fetch summary data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [isOpen, token]);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <HeaderContent>
            <Title>Uniform Provision Report</Title>
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </HeaderContent>
        </ModalHeader>

        <ModalContent>
          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : loading ? (
            <LoadingMessage>Loading summary data...</LoadingMessage>
          ) : summary ? (
            <SummaryGrid>
              <StatCard highlight>
                <StatLabel>Total Employees</StatLabel>
                <StatValue>{summary.EmployeeCount}</StatValue>
              </StatCard>

              <StatCard>
                <StatLabel>Full Provision</StatLabel>
                <StatValue>
                  {summary.FullProvisionCount}
                  <StatPercentage>
                    ({summary.FullProvisionPercentage}%)
                  </StatPercentage>
                </StatValue>
              </StatCard>

              <StatCard>
                <StatLabel>Partial Provision</StatLabel>
                <StatValue>
                  {summary.PartialProvisionCount}
                  <StatPercentage>
                    ({summary.PartialProvisionPercentage}%)
                  </StatPercentage>
                </StatValue>
              </StatCard>

              <StatCard>
                <StatLabel>No Provision</StatLabel>
                <StatValue>
                  {summary.UnProvisionCount}
                  <StatPercentage>
                    ({summary.UnProvisionPercentage}%)
                  </StatPercentage>
                </StatValue>
              </StatCard>
            </SummaryGrid>
          ) : null}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default SummaryModal;

import React from "react";
import styled from "styled-components";
import { FaPlus, FaHistory, FaAlignLeft } from "react-icons/fa";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #2d3a45;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const StyledButton = styled.button`
  padding: 10px 16px;
  font-size: 14px;
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

export const Header = ({
  onOpenEmployeeModal,
  onOpenTrackStatusModal,
  onOpenSummaryModal,
  user,
  isTrackAllowed,
}) => (
  <HeaderContainer>
    <Title>Transaction Page</Title>
    <ButtonGroup>
      <StyledButton onClick={onOpenEmployeeModal}>
        <FaPlus style={{ marginRight: "6px" }} />
        Order For Employee
      </StyledButton>
      <StyledButton onClick={onOpenTrackStatusModal} disabled={!isTrackAllowed}>
        <FaHistory style={{ marginRight: "6px" }} />
        Track Status
      </StyledButton>
      <StyledButton onClick={onOpenSummaryModal} disabled={!user}>
        <FaAlignLeft style={{ marginRight: "6px" }} />
        Summarize
      </StyledButton>
    </ButtonGroup>
  </HeaderContainer>
);

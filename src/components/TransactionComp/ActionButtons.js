import React from "react";
import styled from "styled-components";

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: ${(props) =>
    props.variant === "accept" ? "#16a34a" : "#0369a1"};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.variant === "accept" ? "#149343" : "#035f91"};
  }
`;

export const ActionButtons = ({ selectedTransactions, onAction }) => {
  if (selectedTransactions.length === 0) return null;

  const allPending = selectedTransactions.every(
    (item) => item.TransactionStatus?.toLowerCase() === "pending"
  );
  const allAccepted = selectedTransactions.every(
    (item) => item.TransactionStatus?.toLowerCase() === "accepted"
  );

  return (
    <ActionButtonGroup>
      {allPending && (
        <>
          <ActionButton variant="accept" onClick={() => onAction("accept")}>
            Accept
          </ActionButton>
          <ActionButton
            variant="accept"
            onClick={() => onAction("acceptAndHandover")}
          >
            Accept & Handover
          </ActionButton>
        </>
      )}
      {(allAccepted || allPending) && (
        <ActionButton
          variant="handover"
          onClick={() => onAction("handover")}
          disabled={allPending}
        >
          Handover
        </ActionButton>
      )}
    </ActionButtonGroup>
  );
};

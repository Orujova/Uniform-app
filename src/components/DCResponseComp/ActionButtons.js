import React from "react";
import styled from "styled-components";
import { FaCheck, FaTimes } from "react-icons/fa";

const ActionButton = styled.button`
  cursor: pointer;
  background-color: ${(props) => props.bgColor};
  color: #fff;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: ${(props) => props.hoverColor};
  }
`;

const ActionButtons = ({ status, dcStatus, id, onAccept, onReject }) => {
  const isPending = status === "Pending";
  const isApproved = status === "Intransit" || status === "Approved";
  const isRejected = dcStatus === "Rejected";

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {isPending && !isRejected && !isApproved ? (
        <>
          <ActionButton
            onClick={() => onAccept(id)}
            bgColor="#28a745"
            hoverColor="#218838"
          >
            Accept
          </ActionButton>
          <ActionButton
            onClick={() => onReject(id)}
            bgColor="#dc3545"
            hoverColor="#c82333"
          >
            Reject
          </ActionButton>
        </>
      ) : isApproved ? (
        <FaCheck style={{ fontSize: "20px", color: "#28a745" }} />
      ) : isRejected ? (
        <FaTimes style={{ fontSize: "20px", color: "#dc3545" }} />
      ) : null}
    </div>
  );
};

export default ActionButtons;

import React from "react";
import styled from "styled-components";

const StyledStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: capitalize;
  background-color: ${(props) => props.bgColor};
  color: ${(props) => props.textColor};
  border: 1px solid ${(props) => props.borderColor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;

  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
    background-color: ${(props) => props.dotColor};
  }
`;

const StatusBadge = ({ status }) => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Pending":
        return {
          bg: "#FFF7ED",
          text: "#9A3412",
          border: "#FDBA74",
          dot: "#F97316",
        };
      case "Accepted":
        return {
          bg: "#F0FDF4",
          text: "#166534",
          border: "#86EFAC",
          dot: "#22C55E",
        };
      case "Rejected":
        return {
          bg: "#FEF2F2",
          text: "#991B1B",
          border: "#FECACA",
          dot: "#EF4444",
        };
      case "Intransit":
        return {
          bg: "#F0F9FF",
          text: "#075985",
          border: "#BAE6FD",
          dot: "#0EA5E9",
        };
      default:
        return {
          bg: "#F9FAFB",
          text: "#374151",
          border: "#D1D5DB",
          dot: "#6B7280",
        };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <StyledStatusBadge
      bgColor={styles.bg}
      textColor={styles.text}
      borderColor={styles.border}
      dotColor={styles.dot}
    >
      {status}
    </StyledStatusBadge>
  );
};

export default StatusBadge;

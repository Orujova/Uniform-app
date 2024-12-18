// components/Pagination.js
import React from "react";
import styled from "styled-components";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
`;

const PaginationButton = styled.button`
  padding: 4px 8px;
  min-width: 32px;
  height: 32px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
  background-color: ${(props) => (props.active ? "#0284c7" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#212529")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  border-radius: 6px;

  &:hover {
    background-color: ${(props) => (props.active ? "#0284c7" : "#f8f9fa")};
    z-index: 2;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  getPageNumbers,
}) => (
  <PaginationContainer>
    <PaginationButton
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      <FaChevronLeft size={12} />
    </PaginationButton>

    {getPageNumbers().map((number) => (
      <PaginationButton
        key={number}
        active={currentPage === number}
        onClick={() => onPageChange(number)}
      >
        {number}
      </PaginationButton>
    ))}

    <PaginationButton
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      <FaChevronRight size={12} />
    </PaginationButton>
  </PaginationContainer>
);

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FilterGroup, Label } from "./ModalStyles";
const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const Input = styled.input`
  padding: 0.5rem 0.5rem;
  width: 150px;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #1f2937;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover:not(:disabled) {
    border-color: #9ca3af;
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const DateFilter = ({ filters, loading, onYearChange, onWeekChange }) => {
  const [yearInput, setYearInput] = useState(filters.year?.toString() || "");
  const [weekInput, setWeekInput] = useState(filters.week?.toString() || "");

  useEffect(() => {
    setYearInput(filters.year?.toString() || "");
    setWeekInput(filters.week?.toString() || "");
  }, [filters.year, filters.week]);

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setYearInput(value);

    if (value.length === 4) {
      const year = parseInt(value);
      if (!isNaN(year)) {
        onYearChange({ target: { value: year } });
      }
    }
  };

  const handleWeekChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2);
    setWeekInput(value);

    if (value) {
      const week = parseInt(value);
      if (!isNaN(week) && week >= 1 && week <= 52) {
        onWeekChange({ target: { value: week } });
      }
    }
  };

  return (
    <FilterWrapper>
      <FilterGroup>
        <Label>Year</Label>
        <Input
          type="text"
          value={yearInput}
          onChange={handleYearChange}
          disabled={loading}
          placeholder="YYYY"
          autoComplete="off"
        />
      </FilterGroup>

      <FilterGroup>
        <Label>Week</Label>
        <Input
          type="text"
          value={weekInput}
          onChange={handleWeekChange}
          disabled={loading}
          placeholder="1-52"
          autoComplete="off"
        />
      </FilterGroup>
    </FilterWrapper>
  );
};

export default DateFilter;

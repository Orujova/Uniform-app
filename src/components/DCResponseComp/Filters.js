import React from "react";
import styled from "styled-components";
import { FaAlignLeft } from "react-icons/fa";

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  padding-top: 20px;
  border-radius: 8px;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const FilterInput = styled.input`
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const FilterSelect = styled.select`
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const StyledButton = styled.button`
  padding: 8px;
  font-size: 16px;
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

const ClearFilterButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  color: #4a5568;
  background-color: #ebf4ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #4299e1;
  color: white;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #4a5568;
    background-color: #ebf4ff;
  }
`;

const Filters = ({
  filters,
  projects,
  onFilterChange,
  onClearFilters,
  onOpenModal,
}) => {
  return (
    <FilterContainer>
      <FilterGroup>
        <FilterLabel>Project</FilterLabel>
        <FilterSelect
          name="projectId"
          value={filters.projectId}
          onChange={onFilterChange}
        >
          <option value="">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code}
            </option>
          ))}
        </FilterSelect>
      </FilterGroup>
      <FilterGroup>
        <FilterLabel>Start Date</FilterLabel>
        <FilterInput
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={onFilterChange}
        />
      </FilterGroup>
      <FilterGroup>
        <FilterLabel>End Date</FilterLabel>
        <FilterInput
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={onFilterChange}
        />
      </FilterGroup>
      <ClearFilterButton onClick={onClearFilters}>
        Clear Filters
      </ClearFilterButton>
      <FilterGroup>
        <StyledButton onClick={onOpenModal}>
          <FaAlignLeft style={{ marginRight: "8px" }} />
          Summarize
        </StyledButton>
      </FilterGroup>
    </FilterContainer>
  );
};

export default Filters;

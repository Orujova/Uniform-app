import React from "react";
import styled from "styled-components";

const FilterContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
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
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const FilterSelect = styled.select`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

export const Filters = ({
  filters,
  onFilterChange,
  uniqueStatuses,
  projects,
}) => (
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
          <option key={project.Id} value={project.Id}>
            {project.ProjectCode}
          </option>
        ))}
      </FilterSelect>
    </FilterGroup>

    <FilterGroup>
      <FilterLabel>Transaction Date</FilterLabel>
      <FilterInput
        type="date"
        name="transactionDate"
        value={filters.transactionDate}
        onChange={onFilterChange}
      />
    </FilterGroup>

    <FilterGroup>
      <FilterLabel>Distribution Type</FilterLabel>
      <FilterSelect
        name="distributionType"
        value={filters.distributionType}
        onChange={onFilterChange}
      >
        <option value="">All Types</option>
        <option value="firstDistribution">First Distribution</option>
        <option value="store">Store</option>
        <option value="bgs">BGS</option>
      </FilterSelect>
    </FilterGroup>

    {/* Existing filters */}
    <FilterGroup>
      <FilterLabel>Status</FilterLabel>
      <FilterSelect
        name="status"
        value={filters.status}
        onChange={onFilterChange}
      >
        <option value="">All Status</option>
        {uniqueStatuses.map((status) => (
          <option key={status} value={status.toLowerCase()}>
            {status}
          </option>
        ))}
      </FilterSelect>
    </FilterGroup>

    <FilterGroup>
      <FilterLabel>Badge</FilterLabel>
      <FilterInput
        type="text"
        name="badge"
        value={filters.badge}
        onChange={onFilterChange}
        placeholder="Enter badge number"
      />
    </FilterGroup>

    <FilterGroup>
      <FilterLabel>Order Filter</FilterLabel>
      <FilterSelect
        name="order"
        value={filters.order}
        onChange={onFilterChange}
      >
        <option value="">Select Order Type</option>
        <option value="expired">Expired</option>
        <option value="timeexpires">Time Expires</option>
        <option value="suitableforuse">Suitable For Use</option>
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
  </FilterContainer>
);

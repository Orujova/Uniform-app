import styled from "styled-components";

// Styled component for the container
const FilterContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Align content to the bottom */
  padding: 10px;
`;

const StyledSelect = styled.select`
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #0284c7; /* Add a blue border on focus */
    outline: none;
  }
`;

const StatusFilter = ({
  statusOptions,
  handleStatusFilterChange,
  statusFilter,
}) => {
  return (
    <FilterContainer>
      <StyledSelect onChange={handleStatusFilterChange} value={statusFilter}>
        <option value="">All Statuses</option>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
    </FilterContainer>
  );
};

export default StatusFilter;

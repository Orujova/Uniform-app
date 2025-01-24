// styles/ModalStyles.js
import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  backdrop-filter: blur(2px);
`;

export const ModalContainer = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.025em;
`;

export const FilterSection = styled.div`
  padding: 1.25rem;
  background-color: #f9fafb;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  color: #111827;
  cursor: pointer;
  min-height: 42px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #3b82f6;
    background-color: #f8fafc;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

export const ComboboxContainer = styled.div`
  position: relative;
`;
export const ClearButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
`;

export const ComboboxTrigger = styled.button`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
  font-size: 0.875rem;
  color: #111827;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  min-height: 42px;
  text-align: left;

  &:hover:not(:disabled) {
    border-color: #3b82f6;
    background-color: #f8fafc;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    margin-right: 0.5rem;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  background-color: #f9fafb;
  transition: all 0.2s;

  &:focus {
    outline: none;
    background-color: white;
    border-bottom-color: #3b82f6;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

export const ComboboxPopover = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.375rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  max-height: 16rem;
  overflow-y: auto;
  z-index: 50;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

export const ComboboxOption = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #f3f4f6;
  }

  ${(props) =>
    props.selected &&
    `
    background-color: #eff6ff;
    color: #1d4ed8;
    font-weight: 500;
  `}

  span {
    &:first-child {
      font-weight: 500;
      color: #111827;
    }

    &:last-child {
      color: #6b7280;
      flex: 1;
    }
  }
`;

export const TableContainer = styled.div`
  flex: 1;
  overflow: auto;
  padding: 1.25rem;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;

    &:hover {
      background: #94a3b8;
    }
  }
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
`;

export const Thead = styled.thead`
  background-color: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const Th = styled.th`
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #4b5563;
  letter-spacing: 0.05em;
  background-color: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;

  &:first-child {
    padding-left: 1.5rem;
  }

  &:last-child {
    padding-right: 1.5rem;
  }
`;

export const Tbody = styled.tbody`
  background-color: white;
`;

export const Tr = styled.tr`
  transition: all 0.2s;

  &:hover {
    background-color: #f8fafc;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
`;

export const Td = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  white-space: nowrap;
  border-bottom: 1px solid #e5e7eb;

  &:first-child {
    padding-left: 1.5rem;
    font-weight: 500;
  }

  &:last-child {
    padding-right: 1.5rem;
  }
`;

export const LoadingSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const EmptyMessage = styled.div`
  text-align: center;
  color: #6b7280;
  padding: 2rem 1rem;
  font-size: 0.875rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  margin: 0.5rem;
`;

export const ErrorMessage = styled.div`
  text-align: center;
  color: #dc2626;
  padding: 1rem;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

export const ModalContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 24rem;
  max-width: 90vw;
`;

export const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1f2937;
`;

export const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #075985;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

export const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  outline: none;
  border: none;

  ${(props) =>
    props.variant === "primary" &&
    `
    background-color: #0284c7;
    color: white;
    
    &:hover {
      background-color: #075985;
    }
  `}

  ${(props) =>
    props.variant === "secondary" &&
    `
    background-color: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background-color: #f3f4f6;
    }
  `}
`;

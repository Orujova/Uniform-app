// components/ConfirmationModal.js
import React from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #1e293b;
  font-size: 20px;
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
  text-align: center;
  color: #64748b;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  &:hover {
    transform: translateY(-1px);
  }
`;

const ConfirmButton = styled(Button)`
  background-color: ${(props) => props.confirmButtonColor || "#ef4444"};
  color: white;

  &:hover {
    background-color: ${(props) => props.confirmButtonHoverColor || "#dc2626"};
  }
`;

const CancelButton = styled(Button)`
  background-color: #f3f4f6;
  color: #4b5563;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Are you sure?",
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonColor,
  confirmButtonHoverColor,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>{message}</ModalBody>
        <ButtonGroup>
          <CancelButton onClick={onClose}>{cancelButtonText}</CancelButton>
          <ConfirmButton
            onClick={onConfirm}
            confirmButtonColor={confirmButtonColor}
            confirmButtonHoverColor={confirmButtonHoverColor}
          >
            {confirmButtonText}
          </ConfirmButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationModal;

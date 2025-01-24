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
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
`;

const Title = styled.h3`
  margin: 0 0 16px;
  color: #dc2626;
  font-size: 20px;
`;

const Message = styled.p`
  margin: 0 0 24px;
  color: #4b5563;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;

  &.cancel {
    background: #e5e7eb;
    color: #4b5563;
    &:hover {
      background: #d1d5db;
    }
  }

  &.delete {
    background: #dc2626;
    color: white;
    &:hover {
      background: #b91c1c;
    }
  }
`;

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Title>Delete item</Title>
        <Message>
          Are you sure you want to delete this uniform? This action cannot be
          undone.
        </Message>
        <ButtonGroup>
          <Button className="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="delete" onClick={onConfirm}>
            Delete
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeleteConfirmModal;

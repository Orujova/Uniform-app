import React, { useState } from "react";
import styled from "styled-components";
import { API_BASE_URL_HeadCount } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: #2d3748;
`;

const Input = styled.input`
  width: 90%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
`;

const Button = styled.button`
  background-color: #0284c7;
  color: white;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #075985;
  }

  &:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
  }
`;

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [badge, setBadge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!badge.trim()) {
      showToast("Please enter a badge number", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL_HeadCount}/api/Employee/add-new-employee`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ Badge: badge }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add employee");
      }

      showToast("Employee added successfully", "success");
      onClose();
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Add New Employee</ModalTitle>

          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="Enter badge number"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            disabled={isLoading}
          />

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Employee"}
          </Button>
        </form>

        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddEmployeeModal;

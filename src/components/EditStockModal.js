import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.h3`
  margin: 0;
  color: #333;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: bold;
  }

  input,
  select {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  button {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
  }

  .save {
    background: #2980b9;
    color: #fff;

    &:hover {
      background: #0c4a6e;
    }
  }

  .cancel {
    background: #e74c3c;
    color: #fff;

    &:hover {
      background: #c0392b;
    }
  }
`;

const EditUniformModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  apiData,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const token = localStorage.getItem("token");
  useEffect(() => {
    console.log("Initial Data in Modal:", initialData);
    setFormData(initialData || {}); // Update form data when initialData changes
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        API_BASE_URL + `/api/DCStock`, // Ensure this matches the correct endpoint
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.Message || "Failed to update uniform.");
      }

      const updatedData = await response.json();
      console.log(updatedData);
      onSave(updatedData); // Call the onSave function to update the parent component
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error updating uniform:", error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <Header>Edit Uniform</Header>
        <FormGroup>
          <label>Uni Code</label>
          <input
            name="UniCode"
            value={formData.UniCode || ""}
            onChange={handleChange}
            placeholder="Enter uniform code"
          />
        </FormGroup>

        <ButtonGroup>
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="save" onClick={handleSave}>
            Save
          </button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditUniformModal;

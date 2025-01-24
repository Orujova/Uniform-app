import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState(initialData || {});
  const [sizes, setSizes] = useState([]);
  const [types, setTypes] = useState([]);
  const [genders, setGenders] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log("Initial Data in Modal:", initialData);
    setFormData(initialData || {});
  }, [initialData]);

  useEffect(() => {
    if (isOpen && apiData) {
      const uniqueSizes = [...new Set(apiData.map((item) => item.Size))];
      const uniqueTypes = [...new Set(apiData.map((item) => item.UniType))];
      const uniqueGenders = [...new Set(apiData.map((item) => item.Gender))];

      setSizes(uniqueSizes);
      setTypes(uniqueTypes);
      setGenders(uniqueGenders);
    }
  }, [isOpen, apiData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL + `/api/Uniform`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.Message || "Failed to update uniform.");
      }

      const updatedData = await response.json();
      showToast("Uniform updated successfully");
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating uniform:", error.message);
      showToast(error.message || "Failed to update uniform", "error");
    } finally {
      setLoading(false);
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
        <FormGroup>
          <label>Uniform Name</label>
          <input
            name="UniName"
            value={formData.UniName || ""}
            onChange={handleChange}
            placeholder="Enter uniform name"
          />
        </FormGroup>
        <FormGroup>
          <label>Size</label>
          <select
            name="Size"
            value={formData.Size || ""}
            onChange={handleChange}
          >
            <option value="">Select size</option>
            {sizes.map((size, index) => (
              <option key={index} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FormGroup>
        <FormGroup>
          <label>Type</label>
          <select
            name="UniType"
            value={formData.UniType || ""}
            onChange={handleChange}
          >
            <option value="">Select type</option>
            {types.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormGroup>
        <FormGroup>
          <label>Gender</label>
          <select
            name="Gender"
            value={formData.Gender || ""}
            onChange={handleChange}
          >
            <option value="">Select gender</option>
            {genders.map((gender, index) => (
              <option key={index} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </FormGroup>
        <ButtonGroup>
          <button className="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="save" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </ButtonGroup>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditUniformModal;

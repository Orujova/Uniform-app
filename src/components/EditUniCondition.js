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

const EditUniformModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    Id: 0,
    PositionId: 0,
    FunctionalArea: "",
    UniName: "",
    Gender: 1,
    CountUniform: 0,
    UniType: 1,
    UsageDuration: 0,
  });

  const token = localStorage.getItem("token");
  const [positions, setPositions] = useState([]);
  const [uniforms, setUniforms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      fetchPositions();
      fetchUniforms();
    }
  }, [isOpen]);

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Position`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch positions");
      const data = await response.json();
      setPositions(data[0]?.Positions || []);
    } catch (error) {
      showToast("Error fetching positions", "error");
    }
  };

  const fetchUniforms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Uniform`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch uniforms");
      const data = await response.json();
      setUniforms(data[0]?.Uniforms || []);
    } catch (error) {
      showToast("Error fetching uniforms", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "CountUniform"
          ? parseInt(value)
          : ["PositionId", "Gender", "UniType"].includes(name)
          ? parseInt(value)
          : value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/UniformCondition`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      showToast("Uniform updated successfully", "success");
      const updatedData = await response.json();
      onSave(updatedData);
      onClose();
    } catch (error) {
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
          <label>Position</label>
          <select
            name="PositionId"
            value={formData.PositionId}
            onChange={handleChange}
          >
            <option value={0}>Select Position</option>
            {positions.map((pos) => (
              <option key={pos.Id} value={pos.Id}>
                {pos.Name}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>Uniform Name</label>
          <select
            name="UniName"
            value={formData.UniName}
            onChange={handleChange}
          >
            <option value="">Select Uniform</option>
            {uniforms.map((uni) => (
              <option key={uni.Id} value={uni.UniName}>
                {uni.UniName}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>Functional Area</label>
          <input
            name="FunctionalArea"
            value={formData.FunctionalArea}
            onChange={handleChange}
            placeholder="Enter functional area"
          />
        </FormGroup>

        <FormGroup>
          <label>Count</label>
          <input
            type="number"
            name="CountUniform"
            value={formData.CountUniform}
            onChange={handleChange}
            min="0"
          />
        </FormGroup>

        <FormGroup>
          <label>Type</label>
          <select
            name="UniType"
            value={formData.UniType}
            onChange={handleChange}
          >
            <option value={1}>Pants</option>
            <option value={2}>Shirt</option>
            <option value={3}>Shoe</option>
            <option value={4}>Unknown</option>
          </select>
        </FormGroup>

        <FormGroup>
          <label>Gender</label>
          <select name="Gender" value={formData.Gender} onChange={handleChange}>
            <option value={1}>Unisex</option>
            <option value={2}>Male</option>
            <option value={3}>Female</option>
            <option value={4}>Unknown</option>
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
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditUniformModal;

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
  max-height: 90vh;
  overflow-y: auto;
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
    font-weight: 600;
    color: #374151;
  }

  input,
  select {
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;

    &:focus {
      outline: none;
      border-color: #2980b9;
      box-shadow: 0 0 0 2px rgba(41, 128, 185, 0.1);
    }

    &:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;

  button {
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .save {
    background: #2980b9;
    color: #fff;

    &:hover {
      background: #0c4a6e;
    }

    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
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
  const [formData, setFormData] = useState(initialData || {});
  const [uniforms, setUniforms] = useState([]);
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (initialData) {
      const formattedData = {
        Id: Number(initialData.Id) || 0,
        UniformId: Number(initialData.UniformId) || 0,
        StockCount: Number(initialData.StockCount) || 0,
        ImportedStockCount: Number(initialData.ImportedStockCount) || 0,
        StoreOrEmployee: initialData.StoreOrEmployee || "",
        UnitPrice: Number(initialData.UnitPrice) || 0,
        TotalPrice: Number(initialData.TotalPrice) || 0,
      };
      console.log("Initial Form Data:", formattedData);
      setFormData(formattedData);
    }
  }, [initialData]);

  useEffect(() => {
    fetchUniforms();
  }, []);

  const fetchUniforms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Uniform`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch uniforms");
      const data = await response.json();
      const uniforms = data[0]?.Uniforms || [];
      setUniforms(uniforms);
    } catch (error) {
      console.error("Error fetching uniforms:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "UniformCode") {
      const selectedUniform = uniforms.find((u) => u.UniCode === value);
      setFormData((prev) => ({
        ...prev,
        UniformId: selectedUniform?.Id || prev.UniformId,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Automatically calculate TotalPrice when StockCount or UnitPrice changes
        ...(name === "StockCount" || name === "UnitPrice"
          ? {
              TotalPrice:
                name === "StockCount"
                  ? Number(value) * Number(prev.UnitPrice)
                  : Number(prev.StockCount) * Number(value),
            }
          : {}),
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const totalPrice =
        Number(formData.StockCount) * Number(formData.UnitPrice);
      const storeOrEmployeeValue = formData.StoreOrEmployee === "Store" ? 1 : 2;

      const requestBody = {
        Id: parseInt(formData.Id, 10),
        UniformId: parseInt(formData.UniformId, 10),
        StockCount: parseInt(formData.StockCount, 10),
        ImportedStockCount: parseInt(formData.ImportedStockCount, 10),
        StoreOrEmployee: parseInt(storeOrEmployeeValue, 10),
        UnitPrice: parseFloat(formData.UnitPrice),
        TotalPrice: parseFloat(totalPrice),
      };

      const response = await fetch(`${API_BASE_URL}/api/DCStock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || "Failed to update uniform");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating uniform:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedUniform = uniforms.find((u) => u.Id === formData.UniformId);

  return (
    <ModalOverlay>
      <ModalContent>
        <Header>Edit Uniform</Header>

        <FormGroup>
          <label>Uniform Code</label>
          <select
            name="UniformCode"
            value={selectedUniform?.UniCode || ""}
            onChange={handleChange}
          >
            <option value="">Select Uniform Code</option>
            {uniforms.map((uniform) => (
              <option key={uniform.Id} value={uniform.UniCode}>
                {uniform.UniCode}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label>Option</label>
          <select
            name="StoreOrEmployee"
            value={formData.StoreOrEmployee || ""}
            onChange={handleChange}
          >
            <option value="">Select Option</option>
            <option value="Store">Store</option>
            <option value="Employee">Employee</option>
          </select>
        </FormGroup>

        <FormGroup>
          <label>Stock Count</label>
          <input
            type="number"
            name="StockCount"
            value={formData.StockCount || ""}
            onChange={handleChange}
            min="0"
          />
        </FormGroup>

        <FormGroup>
          <label>Unit Price</label>
          <input
            type="number"
            name="UnitPrice"
            value={formData.UnitPrice || ""}
            onChange={handleChange}
            min="0"
            step="0.01"
          />
        </FormGroup>
        <ButtonGroup>
          <button className="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="save"
            onClick={handleSave}
            disabled={
              loading ||
              !formData.UniformId ||
              !formData.StoreOrEmployee ||
              !formData.StockCount ||
              !formData.UnitPrice
            }
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditUniformModal;

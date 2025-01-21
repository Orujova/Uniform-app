import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toast";

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
      showToast("Failed to fetch uniforms", "error");
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
      // Calculate TotalPrice based on StockCount and UnitPrice
      const totalPrice =
        Number(formData.StockCount) * Number(formData.UnitPrice);

      // Convert StoreOrEmployee string to number (1 for Store, 2 for Employee)
      const storeOrEmployeeValue = formData.StoreOrEmployee === "Store" ? 1 : 2;

      // Create request body with precise number conversions
      const requestBody = {
        Id: parseInt(formData.Id, 10),
        UniformId: parseInt(formData.UniformId, 10),
        StockCount: parseInt(formData.StockCount, 10),
        ImportedStockCount: parseInt(formData.ImportedStockCount, 10),
        StoreOrEmployee: parseInt(storeOrEmployeeValue, 10),
        UnitPrice: parseFloat(formData.UnitPrice),
        TotalPrice: parseFloat(totalPrice),
      };

      // Log detailed request information
      console.log("Sending request with data:", {
        originalFormData: formData,
        convertedRequestBody: requestBody,
        uniformInfo: uniforms.find((u) => u.Id === formData.UniformId),
      });

      console.log("Request Body:", requestBody);

      // Make the API request
      const response = await fetch(`${API_BASE_URL}/api/DCStock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      // Log the complete response
      const responseText = await response.text();
      console.log("API Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(responseText || "Failed to update uniform");
      }

      try {
        if (responseText) {
          const responseData = JSON.parse(responseText);
          console.log("Parsed Response Data:", responseData);
        }
      } catch (e) {
        console.log("Response was not JSON:", responseText);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error Response:", errorText);
        throw new Error(errorText || "Failed to update uniform");
      }

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.Message || "Failed to update uniform.");
      }

      showToast("Stock updated successfully");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error updating uniform:", error);
      showToast(error.message, "error");
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
          <button className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save"
            onClick={handleSave}
            disabled={
              !formData.UniformId ||
              !formData.StoreOrEmployee ||
              !formData.StockCount ||
              !formData.UnitPrice
            }
          >
            Save
          </button>
        </ButtonGroup>
      </ModalContent>
      <ToastContainer />
    </ModalOverlay>
  );
};

export default EditUniformModal;

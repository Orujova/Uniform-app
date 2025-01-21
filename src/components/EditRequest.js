import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";

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
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;

  &:hover {
    color: #333;
  }
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #2d3a45;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  ${(props) =>
    props.variant === "primary"
      ? `
    background-color: #0284c7;
    color: white;
    border: none;
    
    &:hover {
      background-color: #0369a1;
    }
  `
      : `
    background-color: white;
    color: #4b5563;
    border: 1px solid #d1d5db;
    
    &:hover {
      background-color: #f3f4f6;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditUniformModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    Id: 0,
    UniformId: 0,
    RequestCount: 0,
    ProjectId: 0,
    UniCode: "", // Əlavə edildi
  });
  const [uniforms, setUniforms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      fetchUniforms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData && uniforms.length > 0) {
      // Uyğun uniformu tap
      const selectedUniform = uniforms.find(
        (u) => u.Id === initialData.UniformId
      );

      setFormData({
        Id: initialData.Id,
        UniformId: initialData.UniformId,
        RequestCount: initialData.RequestCount || "",
        ProjectId: initialData.ProjectId,
        UniCode: selectedUniform ? selectedUniform.UniCode : "", // UniCode-u əlavə et
      });
    }
  }, [initialData, uniforms]);

  const fetchUniforms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Uniform`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const uniforms = data[0]?.Uniforms || [];
      setUniforms(uniforms);
    } catch (error) {
      console.error("Error fetching uniforms:", error);
      showToast("Failed to load uniforms", "error");
    }
  };

  const handleUniformChange = (e) => {
    const selectedUniformId = e.target.value;
    const selectedUniform = uniforms.find(
      (u) => u.Id === parseInt(selectedUniformId)
    );

    setFormData((prev) => ({
      ...prev,
      UniformId: selectedUniformId,
      UniCode: selectedUniform ? selectedUniform.UniCode : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/BGSStockRequest`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Id: parseInt(formData.Id),
          UniformId: parseInt(formData.UniformId),
          RequestCount: parseInt(formData.RequestCount),
          ProjectId: parseInt(formData.ProjectId),
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      showToast("Request updated successfully", "success");
      await onSave();
      onClose();
    } catch (error) {
      console.error("Error updating request:", error);
      showToast("Failed to update request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Title>Edit Request</Title>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Select Uniform</Label>
            <Select
              value={formData.UniformId}
              onChange={handleUniformChange}
              required
            >
              <option value="">Select Uniform</option>
              {uniforms.map((uniform) => (
                <option key={uniform.Id} value={uniform.Id}>
                  {uniform.UniCode}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Request Count</Label>
            <Input
              type="number"
              value={formData.RequestCount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  RequestCount: e.target.value,
                }))
              }
              min="1"
              required
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <button className="cancel" onClick={onClose}>
              Cancel
            </button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditUniformModal;

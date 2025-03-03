import React, { useState, useEffect } from "react";
import { API_BASE_URL_HeadCount } from "../config";
import {
  ModalOverlay,
  ModalContainer,
  ModalTitle,
  FormGroup,
  Label,
  Input,
  ButtonGroup,
  Button,
} from "./StyledModalComponents";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

const ChangeSizeModal = ({
  isOpen,
  onClose,
  badge,
  employeeData,
  onSizeUpdate,
}) => {
  const [sizes, setSizes] = useState({
    PantSize: "",
    ShirtSize: "",
    ShoeSize: "",
  });

  // Define available sizes
  const pantSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"]; // Added pants sizes
  const shirtSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];
  const shoeSizes = Array.from({ length: 10 }, (_, i) => (i + 36).toString()); // Creates ["36", "37", ..., "45"]

  useEffect(() => {
    if (employeeData) {
      setSizes({
        PantSize: employeeData.PantSize || "",
        ShirtSize: employeeData.ShirtSize || "",
        ShoeSize: employeeData.ShoeSize || "",
      });
    }
  }, [employeeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSizes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL_HeadCount}/api/Employee/update-employee-size`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            Badge: badge,
            PantSize: sizes.PantSize,
            ShirtSize: sizes.ShirtSize,
            ShoeSize: sizes.ShoeSize,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update sizes");
      }

      if (onSizeUpdate) {
        onSizeUpdate();
      }

      onClose(true);
      showToast("Sizes updated successfully", "success");
    } catch (error) {
      console.error("Error updating sizes:", error);
      showToast("Failed to update sizes", "error");
    }
  };

  if (!isOpen) return null;

  // Common select styles
  const selectStyles = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontSize: "14px",
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>Change Uniform Sizes</ModalTitle>

        <FormGroup>
          <Label>Pants Size</Label>
          <select
            name="PantSize"
            value={sizes.PantSize}
            onChange={handleChange}
            style={selectStyles}
          >
            <option value="">Select Size</option>
            {pantSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>Shirt Size</Label>
          <select
            name="ShirtSize"
            value={sizes.ShirtSize}
            onChange={handleChange}
            style={selectStyles}
          >
            <option value="">Select Size</option>
            {shirtSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <Label>Shoe Size</Label>
          <select
            name="ShoeSize"
            value={sizes.ShoeSize}
            onChange={handleChange}
            style={selectStyles}
          >
            <option value="">Select Size</option>
            {shoeSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </FormGroup>

        <ButtonGroup>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save Changes
          </Button>
        </ButtonGroup>

        <ToastContainer />
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ChangeSizeModal;

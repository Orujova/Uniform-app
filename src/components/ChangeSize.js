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

  const [errors, setErrors] = useState({
    ShoeSize: "",
  });

  useEffect(() => {
    if (employeeData) {
      setSizes({
        PantSize: employeeData.PantSize || "",
        ShirtSize: employeeData.ShirtSize || "",
        ShoeSize: employeeData.ShoeSize || "",
      });
      setErrors({ ShoeSize: "" }); // Reset errors when modal opens
    }
  }, [employeeData]);

  const validateShoeSize = (size) => {
    const numSize = Number(size);
    if (size === "") return ""; // Allow empty value
    if (isNaN(numSize)) return "Please enter a valid number";
    if (numSize < 36) return "Shoe size cannot be less than 36";
    if (numSize > 45) return "Shoe size cannot be greater than 45";
    return ""; // No error
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ShoeSize") {
      const error = validateShoeSize(value);
      setErrors((prev) => ({
        ...prev,
        ShoeSize: error,
      }));
    }

    setSizes((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate shoe size before submission
    const shoeSizeError = validateShoeSize(sizes.ShoeSize);
    if (shoeSizeError) {
      setErrors((prev) => ({
        ...prev,
        ShoeSize: shoeSizeError,
      }));
      showToast(shoeSizeError, "error");
      return;
    }

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

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalTitle>Change Uniform Sizes</ModalTitle>

        <FormGroup>
          <Label>Pants Size</Label>
          <Input
            type="text"
            name="PantSize"
            value={sizes.PantSize}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Shirt Size</Label>
          <Input
            type="text"
            name="ShirtSize"
            value={sizes.ShirtSize}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <Label>Shoe Size (36-45)</Label>
          <Input
            type="text"
            name="ShoeSize"
            value={sizes.ShoeSize}
            onChange={handleChange}
            error={errors.ShoeSize}
          />
          {errors.ShoeSize && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {errors.ShoeSize}
            </div>
          )}
        </FormGroup>

        <ButtonGroup>
          <Button variant="secondary" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={errors.ShoeSize !== ""}
          >
            Save Changes
          </Button>
        </ButtonGroup>

        <ToastContainer />
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ChangeSizeModal;

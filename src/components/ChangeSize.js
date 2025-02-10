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

      // Close modal with update flag
      onClose(true);

      // Show success message
      showToast("Sizes updated successfully", "success");
    } catch (error) {
      console.error("Error updating sizes:", error);
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
          <Label>Shoe Size</Label>
          <Input
            type="text"
            name="ShoeSize"
            value={sizes.ShoeSize}
            onChange={handleChange}
          />
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

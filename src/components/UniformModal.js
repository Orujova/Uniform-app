import React, { useState } from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

// Styled Components
const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background-color: #FFFFFF;
  padding: 20px;
  width: 80%;
  max-width: 800px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
`;

const FormSection = styled.div`
  width: 45%;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4A90E2;
  color: #FFF;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background-color: #357ABD;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  position: absolute;
  top: 15px;
  right: 15px;
`;

const UniformModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    uniCode: '',
    uniName: '',
    uniType: '',
    size: '',
    gender: '',
    imageUrl: '',
  });

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle Form Submission
  const handleSubmit = () => {
    console.log('Form Data:', formData);
    onClose(); // Close the modal after submission
  };

  return (
    <ModalBackground>
      <ModalContainer>
        {/* Form Section */}
        <FormSection>
          <Input
            type="text"
            name="uniCode"
            placeholder="UniCode"
            value={formData.uniCode}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="uniName"
            placeholder="UniName"
            value={formData.uniName}
            onChange={handleChange}
          />
          <Select
            name="uniType"
            value={formData.uniType}
            onChange={handleChange}
          >
            <option value="">Select UniType</option>
            <option value="Shirt">Shirt</option>
            <option value="Pants">Pants</option>
            <option value="NA">NA</option>
          </Select>
          <Select
            name="size"
            value={formData.size}
            onChange={handleChange}
          >
            <option value="">Select Size</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="XXXL">XXXL</option>
          </Select>
          <Select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="Man">Man</option>
            <option value="Woman">Woman</option>
            <option value="Unisex">Unisex</option>
            <option value="NA">NA</option>
          </Select>
          <Button onClick={handleSubmit}>Save</Button>
        </FormSection>

        {/* Right Section for Image Upload or Other Data */}
        <FormSection>
          <Input
            type="text"
            name="imageUrl"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
          />
        </FormSection>

        {/* Close Button */}
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
      </ModalContainer>
    </ModalBackground>
  );
};

export default UniformModal;

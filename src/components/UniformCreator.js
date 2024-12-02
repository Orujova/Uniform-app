import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaTimes, FaPlus, FaUpload } from 'react-icons/fa';

// Styled components for the modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #FFFFFF;
  width: 600px;
  max-width: 90%;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #2D3A45;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #7D8996;

  &:hover {
    color: #4A90E2;
  }
`;

// Styled form and input elements
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #7D8996;
  margin-bottom: 6px;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #E6E9EC;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: #4A90E2;
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #E6E9EC;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: #4A90E2;
    outline: none;
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px dashed #E6E9EC;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;

  &:hover {
    border-color: #4A90E2;
  }
`;

const FileInputLabel = styled.label`
  color: #7D8996;
  font-size: 14px;
  margin-top: 10px;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 120px;
  margin-top: 12px;
  border-radius: 8px;
  object-fit: cover;
`;

const AddButton = styled.button`
  background-color: #4A90E2;
  color: #FFFFFF;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;

  &:hover {
    background-color: #357ABD;
  }
`;

// UniformCreator Component
const UniformCreator = ({ isOpen, onClose, onSave, editingUniform }) => {
  const [uniformData, setUniformData] = useState({
    uniCode: '',
    uniName: '',
    uniType: '',
    size: '',
    gender: '',
    imageUrl: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editingUniform) {
      setUniformData(editingUniform);
      setImagePreview(editingUniform.imageUrl || null);
    } else {
      setUniformData({
        uniCode: '',
        uniName: '',
        uniType: '',
        size: '',
        gender: '',
        imageUrl: '',
      });
      setImagePreview(null);
    }
  }, [editingUniform]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUniformData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setUniformData((prevData) => ({
          ...prevData,
          imageUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(uniformData);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <Header>
          <Title>{editingUniform ? 'Edit Uniform' : 'Create Uniform'}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        <Form onSubmit={handleSubmit}>
          {/* Input Fields in a compact grid layout */}
          <InputGroup>
            <div>
              <Label>Uniform Code</Label>
              <Input
                type="text"
                name="uniCode"
                value={uniformData.uniCode}
                onChange={handleChange}
                placeholder="Enter code"
                required
              />
            </div>
            <div>
              <Label>Uniform Name</Label>
              <Input
                type="text"
                name="uniName"
                value={uniformData.uniName}
                onChange={handleChange}
                placeholder="Enter name"
                required
              />
            </div>
          </InputGroup>
          <InputGroup>
            <div>
              <Label>Uniform Type</Label>
              <Select
                name="uniType"
                value={uniformData.uniType}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="Shirt">Shirt</option>
                <option value="Pants">Pants</option>
                <option value="NA">NA</option>
              </Select>
            </div>
            <div>
              <Label>Size</Label>
              <Select
                name="size"
                value={uniformData.size}
                onChange={handleChange}
                required
              >
                <option value="">Select size</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
                <option value="XXXXL">XXXXL</option>
                <option value="NA">NA</option>
              </Select>
            </div>
          </InputGroup>
          <InputGroup>
            <div>
              <Label>Gender</Label>
              <Select
                name="gender"
                value={uniformData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select gender</option>
                <option value="Man">Man</option>
                <option value="Woman">Woman</option>
                <option value="Unisex">Unisex</option>
                <option value="NA">NA</option>
              </Select>
            </div>
            <div>
              <Label>Image Upload</Label>
              <FileInputWrapper>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="fileUpload"
                />
                <FileInputLabel htmlFor="fileUpload">
                  <FaUpload style={{ marginRight: '6px' }} />
                  {imagePreview ? 'Change Image' : 'Upload or Drop Image'}
                </FileInputLabel>
                {imagePreview && <PreviewImage src={imagePreview} alt="Preview" />}
              </FileInputWrapper>
            </div>
          </InputGroup>
          <AddButton type="submit">
            <FaPlus style={{ marginRight: '6px' }} />
            {editingUniform ? 'Update Uniform' : 'Add Uniform'}
          </AddButton>
        </Form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default UniformCreator;

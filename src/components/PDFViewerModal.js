import React from 'react';
import styled from 'styled-components';
import { FaTimes } from 'react-icons/fa';

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
  width: 80%;
  max-width: 800px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
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

const PDFViewer = styled.iframe`
  width: 100%;
  height: 600px;
  border: none;
  margin-top: 16px;
`;

const PDFViewerModal = ({ isOpen, pdf, onClose }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <Header>
          <Title>{pdf.name}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>
        {/* Replace with actual PDF source */}
        <PDFViewer src={`path-to-your-pdf-directory/${pdf.name}.pdf`} />
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PDFViewerModal;

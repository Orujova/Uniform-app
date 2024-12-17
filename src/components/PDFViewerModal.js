import React from "react";
import styled from "styled-components";
import { FaTimes } from "react-icons/fa";

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
  background-color: #ffffff;
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
  color: #2d3a45;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #7d8996;

  &:hover {
    color: #4a90e2;
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

  let correctedPdfPath = pdf.File;

  // Modify the URL if it contains 'pdffile'
  if (correctedPdfPath.includes("pdffile")) {
    correctedPdfPath = correctedPdfPath.replace("/pdffile", "/uploads/pdffile");
    console.log("Modified PDF URL:", correctedPdfPath);
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <Header>
          <Title>{pdf.FileName}</Title>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </Header>

        <PDFViewer
          src={correctedPdfPath}
          title={pdf.FileName}
          onError={() => alert("Error loading the PDF.")}
        />
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PDFViewerModal;

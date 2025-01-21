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
  padding: 10px;
`;

const ModalContainer = styled.div`
  background-color: #ffffff;
  width: 95%;
  max-width: 1000px;
  height: 80vh; /* Increased height */
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #2d3a45;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  color: #7d8996;
  padding: 4px;
  margin-left: 8px;
  flex-shrink: 0;

  &:hover {
    color: #4a90e2;
  }
`;

const ViewerContainer = styled.div`
  flex: 1;
  min-height: 0;
  position: relative;
  border: 1px solid #e6e9ec;
  border-radius: 8px;
  overflow: hidden;
`;

const PDFViewer = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: white;
`;

const PDFViewerModal = ({ isOpen, pdf, onClose }) => {
  if (!isOpen) return null;

  let correctedPdfPath = pdf.File;

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
        <ViewerContainer>
          <PDFViewer
            src={correctedPdfPath}
            title={pdf.FileName}
            onError={() => alert("Error loading the PDF.")}
          />
        </ViewerContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PDFViewerModal;

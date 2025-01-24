// components/UploadModal.js
import React, { useState } from "react";
import styled from "styled-components";
import { FaUpload, FaFile } from "react-icons/fa";
import { API_BASE_URL } from "../../config";
import { showToast } from "../../utils/toast";
import { ToastContainer } from "../../utils/ToastContainer";

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
  max-width: 500px;
  position: relative;
  position: relative;
`;

const UploadArea = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  margin: 20px 0;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #3b82f6;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 4px;
  margin-top: 12px;
`;

const UploadButton = styled.button`
  padding: 8px 16px;
  background: #0284c7;
  color: white;
  border: 1px solid #0369a1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 16px;
  width: 100%;
  min-width: 120px;
  transition: all 0.2s ease;

  &:hover {
    background: #0369a1;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  &:disabled {
    background: #cbd5e1;
    border-color: #94a3b8;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FileName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UploadModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const token = localStorage.getItem("token");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      showToast("Please select a PDF file", "warning");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showToast("Please select a file", "warning");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/UploadStorePdf`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast("File uploaded successfully", "success");
      onClose();
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <h2 style={{ margin: "8px 0" }}>Upload PDF File</h2>

        <FileInput
          type="file"
          id="fileInput"
          accept=".pdf"
          onChange={handleFileSelect}
        />

        <UploadArea
          onClick={() => document.getElementById("fileInput").click()}
        >
          <FaUpload size={24} color="#3b82f6" />
          <p>Click to select or drag and drop a PDF file</p>
        </UploadArea>

        {selectedFile && (
          <SelectedFile>
            <FaFile color="#3b82f6" />
            <FileName>{selectedFile.name}</FileName>
          </SelectedFile>
        )}

        <UploadButton
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </UploadButton>
      </ModalContent>
      <ToastContainer />
    </ModalOverlay>
  );
};

export default UploadModal;

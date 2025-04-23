import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { API_BASE_URL } from "../config"; // API URL'niz
import { showToast } from "../utils/toast"; // Toast bildirimleri
import { ToastContainer } from "../utils/ToastContainer"; // Toast konteyneri
import {
  FaTimes,
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaUpload,
} from "react-icons/fa"; // Gerekli ikonlar

// --- Animasyonlar (Aynı kalır)---
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

// --- Ana Modal Bileşenleri ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 1rem;
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-out forwards;
`;
const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  animation: ${scaleUp} 0.35s 0.1s ease-out forwards;
`;
const ModalHeader = styled.header`
  padding: 1.25rem 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
`;
const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
  font-weight: 600;
`;
const CloseButton = styled.button`
  /* Stil aynı kalır */
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
const ModalBody = styled.div`
  padding: 1.25rem 1.75rem;
  overflow-y: auto;
  flex-grow: 1;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;
const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.85rem;
`;
const Input = styled.input`
  /* Stil aynı kalır */
  padding: 0.7rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1f2937;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  max-width: ${(props) => props.maxWidth || "100%"};
  &::placeholder {
    color: #9ca3af;
  }
  &:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
`;
// Dosya Yükleme Alanı
const FileUploadDropzone = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 1rem; /* İçeriğe göre ayarlanacak padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  background-color: #f9fafb;
  position: relative;
  min-height: 120px; /* Hâlâ bir minimum yükseklik bırakalım */
  &:hover {
    border-color: #6b7280;
    background-color: #f3f4f6;
  }
  ${({ hasFile }) =>
    hasFile &&
    css`
      border-color: #10b981;
      border-style: solid;
      padding: 0.8rem; /* Dosya varken padding biraz farklı olabilir */
    `}
`;
// --- Yükleme durumundaki İkon/Metin stilleri (Eski) ---
const FileUploadIcon = styled.div`
  /* Bu sadece yükleme yokken kullanılacak */
  color: #6b7280;
  margin-bottom: 0.4rem;
  transition: color 0.2s ease;
  ${FileUploadDropzone}:hover & {
    color: #3b82f6;
  }
`;
const FileUploadText = styled.p`
  /* Bu sadece yükleme yokken kullanılacak */
  margin: 0.1rem 0;
  font-size: 0.8rem;
  color: #4b5563;
  line-height: 1.3;
  strong {
    color: #3b82f6;
    font-weight: 500;
  }
`;
const FileUploadHint = styled.p`
  /* Bu sadece yükleme yokken kullanılacak */
  margin: 0.1rem 0;
  font-size: 0.7rem;
  color: #9ca3af;
`;
// --- Dosya SEÇİLİYKEN gösterilecek wrapper ve stiller ---
const ImagePreviewWrapper = styled.div`
  display: flex; /* Önizleme ve dosya adını yan yana koy */
  align-items: center;
  gap: 0.8rem;
  /* Artık Dropzone içinde olduğu için margin-top'a gerek yok */
  width: 100%; /* Dropzone içinde tam genişliği kaplasın */
  justify-content: center; /* İçeriği ortala */
  padding: 0.5rem 0; /* Dikey padding */
`;
const SmallImagePreviewContainer = styled.div`
  width: 50px;
  height: 50px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f3f4f6;
  flex-shrink: 0;
`;
const SmallImagePreview = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const PreviewFileName = styled.p`
  font-size: 0.8rem;
  color: #374151; /* Normal yazı rengi */
  font-weight: 500;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-align: left; /* Metni sola yasla */
  flex-grow: 1; /* Alanı doldur */
  min-width: 0; /* ellipsis için */
`;
const ErrorMessage = styled.div`
  /* Stil aynı kalır */
  color: #ef4444;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
`;
const ModalFooter = styled.footer`
  /* Stil aynı kalır */
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  flex-shrink: 0;
`;
const Button = styled.button`
  /* Stil aynı kalır */
  padding: 0.7rem 1.4rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease,
    box-shadow 0.2s ease, border-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 110px;
  line-height: 1.3;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }
`;
const PrimaryButton = styled(Button)`
  /* Stil aynı kalır */
  background-color: #10b981;
  color: white;
  &:hover:not(:disabled) {
    background-color: #059669;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
  }
`;
const SecondaryButton = styled(Button)`
  /* Stil aynı kalır */
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  &:hover:not(:disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.6);
  }
`;
const StyledSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

// --- Component Logic ---
const CreateTrolleyTypeModal = ({
  isOpen,
  onClose,
  onSave,
  apiBaseUrl,
  token,
}) => {
  // State'ler ve useEffect'ler aynı kalır...
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setName("");
        setImage(null);
        setPreviewUrl("");
        setError("");
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  useEffect(() => {
    let objectUrl = null;
    if (image) {
      objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl("");
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  if (!isOpen) return null;

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setError("");
    }
  };
  const triggerFileInput = () => fileInputRef.current?.click();
  const handleSubmit = async (event) => {
    /* API gönderme mantığı (Name query'de) aynı kalır */
    event.preventDefault();
    if (!name.trim()) {
      const msg = "Trolley Type name is required.";
      showToast(msg, "error");
      setError(msg);
      return;
    }
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    if (image) {
      formData.append("Image", image);
    }
    const urlNameParam = encodeURIComponent(name.trim());
    const fetchUrl = `${
      apiBaseUrl || API_BASE_URL
    }/api/TrolleyType?Name=${urlNameParam}`;
    try {
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.Message ||
            responseData.title ||
            `HTTP Error ${response.status}`
        );
      }
      showToast(
        responseData.message || "Trolley type created successfully!",
        "success"
      );
      onSave(responseData);
      onClose();
    } catch (err) {
      console.error("Create Trolley Type error:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>Add New Trolley Type</Title>
          <CloseButton
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <FaTimes size={18} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Form onSubmit={handleSubmit}>
            {/* Name Input (Aynı, kısa) */}
            <FormGroup>
              <Label htmlFor="trolleyTypeName">Name</Label>
              <Input
                type="text"
                id="trolleyTypeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Small Basket Trolley"
                required
                disabled={isLoading}
                maxWidth="70%"
              />
            </FormGroup>

            {/* Image Input Bölümü (DÜZELTİLDİ) */}
            <FormGroup>
              <Label htmlFor="trolleyTypeImage">Image (Optional)</Label>
              {/* Dosya Yükleme Alanı */}
              <FileUploadDropzone onClick={triggerFileInput} hasFile={!!image}>
                {/* Gizli dosya inputu */}
                <input
                  ref={fileInputRef}
                  type="file"
                  id="trolleyTypeImage"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={handleImageChange}
                  disabled={isLoading}
                  hidden
                />

                {/* Resim YOKSA Gösterilecek İçerik */}
                {!image && (
                  <>
                    <FileUploadIcon>
                      <FaUpload size={22} />
                    </FileUploadIcon>
                    <FileUploadText>
                      <strong>Click to upload</strong>
                    </FileUploadText>
                    <FileUploadHint>Or drag & drop</FileUploadHint>
                  </>
                )}

                {/* Resim VARSA Gösterilecek İçerik (ÖNİZLEME BURADA) */}
                {image && previewUrl && (
                  <ImagePreviewWrapper>
                    <SmallImagePreviewContainer>
                      <SmallImagePreview src={previewUrl} alt="Preview" />
                    </SmallImagePreviewContainer>
                    <PreviewFileName>
                      <FaImage size={12} /> {image.name}
                    </PreviewFileName>
                  </ImagePreviewWrapper>
                )}
                {/* Resim seçildi ama URL yüklenmediyse (çok kısa an) */}
                {image && !previewUrl && <StyledSpinner size={20} />}
              </FileUploadDropzone>
              {/* Dışarıdaki önizleme kaldırıldı */}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <StyledSpinner size={16} /> : "Create Type"}
          </PrimaryButton>
        </ModalFooter>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateTrolleyTypeModal;

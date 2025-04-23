import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { API_BASE_URL } from "../config"; // Your API base URL config
import { showToast } from "../utils/toast"; // Your toast utility
import { ToastContainer } from "../utils/ToastContainer"; // Your toast container
import {
  FaTimes,
  FaImage,
  FaSpinner,
  FaCheckCircle,
  FaUpload,
  FaExclamationTriangle, // Icon for image load error
} from "react-icons/fa"; // Added ExclamationTriangle

// --- Animations and Base Styles (Keep as provided) ---
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

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
  max-width: 580px; // Max width of the modal itself
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

const Subtitle = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  margin-left: 0.5rem;
  font-weight: 400;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  margin: -0.5rem; /* Enlarge clickable area */
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
  gap: 1.25rem; /* Spacing between form groups */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* Space between label and input */
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.85rem; /* Slightly smaller label */
`;

// *** STYLE ADJUSTMENT FOR INPUT ***
const Input = styled.input`
  padding: 0.7rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1f2937;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%; // Take full width of its container (FormGroup)
  /* maxWidth is now applied inline on the element directly for better control */
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
    color: #6b7280;
  }
`;
// *** END STYLE ADJUSTMENT FOR INPUT ***


const FileUploadDropzone = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  background-color: #f9fafb;
  position: relative;
  min-height: 100px;

  &:hover {
    border-color: #6b7280; /* Darker gray border on hover */
    background-color: #f3f4f6; /* Lighter background on hover */
  }

  ${({ hasNewFile }) =>
    hasNewFile &&
    css`
      border-color: #10b981; /* Green border when new file */
      border-style: solid;
      padding: 0.8rem;
      background-color: #ecfdf5; /* Light green background */
    `}
`;

const FileUploadIcon = styled.div`
  color: #6b7280;
  margin-bottom: 0.4rem;
  transition: color 0.2s ease;
  ${FileUploadDropzone}:hover & {
    color: #3b82f6; /* Blue icon on hover */
  }
  ${({ hasNewFile }) =>
    hasNewFile &&
    css`
      color: #10b981; /* Green check icon */
      margin-bottom: 0;
    `}
`;

const FileUploadText = styled.p`
  margin: 0.1rem 0;
  font-size: 0.8rem;
  color: #4b5563;
  line-height: 1.3;
  strong {
    color: #3b82f6; /* Blue for emphasis */
    font-weight: 500;
  }
  ${FileUploadDropzone}${({ hasNewFile }) => hasNewFile} & {
    color: #047857; /* Darker green for selected text */
  }
`;

const FileUploadHint = styled.p`
  margin: 0.1rem 0;
  font-size: 0.7rem;
  color: #9ca3af; /* Light gray for hint */
`;

const ImagePreviewWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.5rem; /* Space above the preview */
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
  background-color: #f3f4f6; /* Light background for placeholder */
  flex-shrink: 0;
  color: #9ca3af; /* Placeholder icon color */
  font-size: 1.2rem; /* Make placeholder icons larger */

  ${({ hasError }) =>
    hasError &&
    css`
        border-color: #fca5a5; /* Red border on error */
        color: #ef4444; /* Red icon on error */
        background-color: #fee2e2; /* Light red background */
    `}
`;

const SmallImagePreview = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the container */
`;

const PreviewFileName = styled.p`
  font-size: 0.8rem;
  color: #374151;
  font-weight: 500;
  word-break: break-all; /* Prevent long names overflowing */
  display: flex;
  align-items: center;
  gap: 0.3rem;
  text-align: left;
  flex-grow: 1;
  min-width: 0; /* Necessary for flex children text truncation */
  ${({ isNew }) =>
    isNew &&
    css`
      color: #059669; /* Darker green for new file name */
    `}
  ${({ hasError }) =>
    hasError &&
    css`
        color: #b91c1c; /* Dark red for error text */
    `}
`;

const ErrorMessage = styled.div`
  color: #ef4444; /* Red text */
  background-color: #fee2e2; /* Light red background */
  border: 1px solid #fca5a5; /* Red border */
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem; /* Space below error message */
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
`;

const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb; /* Light background for footer */
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  flex-shrink: 0;
`;

const Button = styled.button`
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
  gap: 0.5rem; /* Space between icon and text */
  min-width: 110px;
  line-height: 1.3;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px); /* Subtle lift effect */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #3b82f6; /* Blue */
  color: white;
  &:hover:not(:disabled) {
    background-color: #2563eb; /* Darker blue */
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db; /* Light gray border */
  &:hover:not(:disabled) {
    background-color: #f9fafb; /* Very light gray */
    border-color: #9ca3af; /* Slightly darker border */
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.6); /* Gray focus ring */
  }
`;

const StyledSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

// --- Helper Function for Image URL Transformation (Keep as is) ---
const generateDisplayImageUrl = (backendUrl) => {
  if (!backendUrl || typeof backendUrl !== "string" || !backendUrl.startsWith("http")) {
    return null;
  }
  try {
    const url = new URL(backendUrl);
    if (url.pathname.startsWith("/uploads/")) {
      return backendUrl;
    }
    const newPathname = `/uploads${url.pathname}`;
    return `${url.origin}${newPathname}`;
  } catch (e) {
    console.error("Error constructing image display URL:", backendUrl, e);
    return null;
  }
};

// --- Component Logic ---
const EditTrolleyTypeModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  apiBaseUrl,
  token,
}) => {
  const [name, setName] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImageError, setCurrentImageError] = useState(false);
  const fileInputRef = useRef(null);

  // Effect to Populate Modal Fields on Open (Keep as is)
  useEffect(() => {
    setCurrentImageError(false);
    if (isOpen && initialData) {
      setName(initialData.Name || "");
      const backendImageUrl = initialData.ImageUrl || "";
      const displayUrl = generateDisplayImageUrl(backendImageUrl);
      setCurrentImageUrl(displayUrl);
      setNewImage(null);
      setPreviewUrl("");
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (!isOpen) {
      const timer = setTimeout(() => {
        setName("");
        setCurrentImageUrl("");
        setNewImage(null);
        setPreviewUrl("");
        setError("");
        setIsLoading(false);
        setCurrentImageError(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData]);

  // Effect for New Image Blob Preview URL (Keep as is)
  useEffect(() => {
    let objectUrl = null;
    if (newImage) {
      objectUrl = URL.createObjectURL(newImage);
      setPreviewUrl(objectUrl);
      setCurrentImageError(false);
    } else {
      setPreviewUrl("");
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [newImage]);

  if (!isOpen) return null;
  if (!initialData) {
    console.error("EditTrolleyTypeModal opened without initialData!");
    return null;
  }

  // Handle File Input Change (Keep as is)
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload PNG, JPG, GIF, or WEBP.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setNewImage(file);
      setError("");
    }
  };

  // Trigger Hidden File Input (Keep as is)
  const triggerFileInput = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  // Handle Form Submission (Keep as is)
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!initialData || !initialData.Id) {
      setError("Critical error: Trolley Type ID is missing. Cannot update.");
      return;
    }
    if (!name.trim()) {
      setError("Trolley Type name cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError("");
    const formData = new FormData();
    if (newImage) {
      formData.append("NewImage", newImage);
    }
    const urlIdParam = encodeURIComponent(initialData.Id);
    const urlNameParam = encodeURIComponent(name.trim());
    const effectiveApiBaseUrl = apiBaseUrl || API_BASE_URL;
    const fetchUrl = `${effectiveApiBaseUrl}/api/TrolleyType?Id=${urlIdParam}&Name=${urlNameParam}`;
    try {
      const response = await fetch(fetchUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });
      if (response.ok) {
        let successMsg = "Trolley type updated successfully!";
        try {
          const responseData = await response.json();
          successMsg = responseData?.message || responseData?.Message || successMsg;
        } catch (e) {/* Ignore */ }
        showToast(successMsg, "success");
        onSave();
        onClose();
      } else {
        let errorData;
        try { errorData = await response.json(); }
        catch (e) { errorData = { Message: `Request failed with status: ${response.status} ${response.statusText}` }; }
        throw new Error(errorData?.Message || errorData?.title || `HTTP Error ${response.status}`);
      }
    } catch (err) {
      console.error("Update Trolley Type error:", err);
      const errorMessage = err.message || "An unexpected error occurred during update.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            Edit Trolley Type <Subtitle>(ID: {initialData.Id})</Subtitle>
          </Title>
          <CloseButton onClick={onClose} disabled={isLoading} aria-label="Close">
            <FaTimes size={18} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Form onSubmit={handleSubmit} noValidate>
            <FormGroup>
              <Label htmlFor="editTrolleyTypeName">Name</Label>
              {/* *** INPUT WIDTH ADJUSTMENT APPLIED HERE *** */}
              <Input
                type="text"
                id="editTrolleyTypeName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Update trolley type name"
                required
                disabled={isLoading}
                maxLength={100}
                // Apply max-width directly using inline style for specificity
                style={{ maxWidth: "350px" }} // <-- ADJUSTED MAX WIDTH
              />
              {/* *** END INPUT WIDTH ADJUSTMENT *** */}
            </FormGroup>
            <FormGroup>
              <Label htmlFor="editTrolleyTypeImage">Change Image (Optional)</Label>
              <FileUploadDropzone onClick={triggerFileInput} hasNewFile={!!newImage} aria-disabled={isLoading}>
                <input ref={fileInputRef} type="file" id="editTrolleyTypeImage" accept="image/png, image/jpeg, image/gif, image/webp" onChange={handleImageChange} disabled={isLoading} hidden aria-hidden="true" />
                {!newImage && (<> <FileUploadIcon hasNewFile={false}> <FaUpload size={22} /> </FileUploadIcon> <FileUploadText> <strong>Click to upload</strong> or drag & drop new image </FileUploadText> <FileUploadHint>PNG, JPG, GIF, WEBP (Max 5MB)</FileUploadHint> </>)}
                {newImage && (<> <FileUploadIcon hasNewFile={true}> <FaCheckCircle size={24} /> </FileUploadIcon> <FileUploadText> New image selected and ready for upload! </FileUploadText> </>)}
              </FileUploadDropzone>
              {(previewUrl || currentImageUrl) && (
                  <ImagePreviewWrapper>
                    <SmallImagePreviewContainer hasError={currentImageError && !previewUrl}>
                        {previewUrl ? ( <SmallImagePreview src={previewUrl} alt="New Preview" /> )
                        : currentImageUrl && !currentImageError ? ( <SmallImagePreview src={currentImageUrl} alt="Current Image" onError={() => setCurrentImageError(true)} /> )
                        : ( currentImageError ? <FaExclamationTriangle title="Current image failed to load"/> : <FaImage title="No image assigned"/> )}
                    </SmallImagePreviewContainer>
                    <PreviewFileName isNew={!!newImage} hasError={currentImageError && !previewUrl} title={newImage ? newImage.name : (currentImageError ? "Current image error" : (currentImageUrl ? "Current Image" : "No Image"))}>
                       <FaImage size={12} style={{ marginRight: '4px', flexShrink: 0 }}/>
                        {newImage ? newImage.name : currentImageUrl && !currentImageError ? "Current Image" : currentImageError ? "Load Error" : "No Image"}
                    </PreviewFileName>
                  </ImagePreviewWrapper>
              )}
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading}> Cancel </SecondaryButton>
          <PrimaryButton type="submit" onClick={handleSubmit} disabled={isLoading || !name.trim()}> {isLoading ? <StyledSpinner size={16} /> : "Update Type"} </PrimaryButton>
        </ModalFooter>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditTrolleyTypeModal;
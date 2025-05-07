import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import Select from "react-select";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import {
  FaTimes,
  FaSave,
  FaSpinner,
  FaShoppingCart,
  FaProjectDiagram,
  FaExclamationTriangle,
  FaImage,
  FaInfoCircle,
} from "react-icons/fa";

// --- Animasyonlar ---
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const scaleUp = keyframes`
  from { transform: scale(0.95); opacity: 0.8; }
  to { transform: scale(1); opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// --- Stiller ---
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: linear-gradient(to bottom, rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.9));
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 1rem;
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-out forwards;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 720px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.95);
  animation: ${scaleUp} 0.3s 0.1s ease-out forwards;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

const ModalHeader = styled.header`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(to bottom, #f8fafc, #ffffff);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: #1e293b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
    transform: scale(1.1);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(80vh - 100px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: #f8fafc;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #1e293b;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const sharedInputStyles = css`
  padding: 0.6rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #1e293b;
  background: #ffffff;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    border-color: #4f46e5;
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  }
  &:disabled {
    background: #f1f5f9;
    cursor: not-allowed;
    color: #6b7280;
  }
  &::placeholder {
    color: #9ca3af;
    font-style: italic;
  }
`;

const Input = styled.input`
  ${sharedInputStyles}
`;

const reactSelectStyles = {
  control: (p, s) => ({
    ...p,
    minHeight: "38px",
    height: "38px",
    fontSize: "0.85rem",
    borderColor: s.isFocused ? "#4f46e5" : "#d1d5db",
    boxShadow: s.isFocused ? "0 0 0 2px rgba(79, 70, 229, 0.2)" : "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: s.isDisabled ? "#f1f5f9" : "#ffffff",
    "&:hover": { borderColor: s.isFocused ? "#4f46e5" : "#a5b4fc" },
  }),
  valueContainer: (p) => ({ ...p, height: "38px", padding: "0 10px" }),
  input: (p) => ({ ...p, margin: "0", padding: "0" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (p) => ({ ...p, height: "38px" }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected ? "#4f46e5" : s.isFocused ? "#eef2ff" : "#ffffff",
    color: s.isSelected ? "#ffffff" : "#1e293b",
    padding: "0.5rem 0.8rem",
    fontSize: "0.85rem",
    cursor: "pointer",
    "&:active": { backgroundColor: "#c7d2fe" },
  }),
  menu: (p) => ({
    ...p,
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    zIndex: 1250,
  }),
  menuList: (p) => ({ ...p, maxHeight: "160px", overflowY: "auto" }),
  placeholder: (p) => ({ ...p, color: "#9ca3af", fontSize: "0.85rem", fontStyle: "italic" }),
  singleValue: (p) => ({ ...p, color: "#1e293b" }),
};

const TrolleyListContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const ListHeader = styled.div`
  padding: 0.75rem 1rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const TrolleyItem = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 120px 120px;
  grid-column-gap: 1rem;
  align-items: center;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  transition: all 0.2s ease;
  animation: ${slideIn} 0.25s ease-out forwards;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background: #f8fafc;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
`;

const TrolleyImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #cbd5e1;
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  svg {
    font-size: 1.5rem;
  }
  &.error {
    border-color: #f87171;
    color: #ef4444;
    background: #fef2f2;
  }
  &.loading {
    border-color: #9ca3af;
    background: #e5e7eb;
    color: #6b7280;
  }
`;

const PreviewSpinnerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.8);
`;

const TrolleyName = styled.span`
  color: #1e293b;
  font-weight: 500;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoTrolleysMessage = styled.div`
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 1rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 80px;
  background: #f8fafc;
  border-radius: 6px;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background: #fef2f2;
  border: 1px solid #f87171;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
`;

const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.8rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(to top, #f8fafc, #ffffff);
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 90px;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    transform: scale(1.02);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(to right, #4f46e5, #7c3aed);
  color: white;
  &:hover:not(:disabled) {
    background: linear-gradient(to right, #4338ca, #6d28d9);
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #ffffff;
  color: #1e293b;
  border: 1px solid #d1d5db;
  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #9ca3af;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(209, 213, 219, 0.4);
  }
`;

const StyledSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

// --- Helper Function ---
const generateDisplayImageUrl = (backendUrl) => {
  if (
    !backendUrl ||
    typeof backendUrl !== "string" ||
    !backendUrl.startsWith("http")
  ) {
    return null;
  }
  try {
    const url = new URL(backendUrl);
    if (url.pathname.startsWith("/Uploads/")) {
      return backendUrl;
    }
    const newPathname = `/Uploads${url.pathname}`;
    return `${url.origin}${newPathname}`;
  } catch (e) {
    console.error("Err URL:", backendUrl, e);
    return null;
  }
};

// --- Component Logic ---
const CreateTrolleyModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  projects,
  trolleyTypes,
  apiBaseUrl = API_BASE_URL,
  token,
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [trolleyCounts, setTrolleyCounts] = useState({});
  const [trolleyImages, setTrolleyImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Store Management için otomatik proje seçimi
  const isStoreManagement = projects?.length === 1;

  // Trolley tipleri için görüntüleri yükle
  const fetchTrolleyTypeImage = useCallback(
    async (typeId) => {
      if (!typeId || !token) return null;
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/TrolleyType/${typeId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!response.ok) {
          console.error(`Failed fetch ${typeId}. Status: ${response.status}`);
          throw new Error(`HTTP ${response.status}`);
        }
        const typeData = await response.json();
        const rawImageUrl = typeData.ImageUrl;
        const displayUrl = generateDisplayImageUrl(rawImageUrl);
        return displayUrl;
      } catch (err) {
        console.error("Err fetch img:", err);
        return null;
      }
    },
    [apiBaseUrl, token]
  );

  // Modal açıldığında trolley tipleri için görüntüleri yükle
  useEffect(() => {
    if (isOpen && trolleyTypes?.length > 0) {
      const loadImages = async () => {
        const imagePromises = trolleyTypes.map(async (type) => {
          const imageUrl = await fetchTrolleyTypeImage(type.value);
          return { typeId: type.value, imageUrl, error: !imageUrl };
        });
        const results = await Promise.all(imagePromises);
        const newImages = results.reduce((acc, { typeId, imageUrl, error }) => {
          acc[typeId] = { url: imageUrl, loading: false, error };
          return acc;
        }, {});
        setTrolleyImages(newImages);
      };
      loadImages();
    }
  }, [isOpen, trolleyTypes, fetchTrolleyTypeImage]);

  // Modal açıldığında/kapandığında state’leri sıfırla ve Store Management için proje seç
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSelectedProject(null);
        setTrolleyCounts({});
        setTrolleyImages({});
        setError("");
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setTrolleyCounts({});
      setTrolleyImages({});
      setError("");
      if (isStoreManagement && projects?.length === 1) {
        setSelectedProject(projects[0]);
      }
    }
  }, [isOpen, isStoreManagement, projects]);

  // Proje seçimi değiştiğinde
  const handleProjectChange = useCallback(
    (selectedOption) => {
      if (!isStoreManagement) {
        setSelectedProject(selectedOption);
      }
    },
    [isStoreManagement]
  );

  // Trolley sayıları değiştiğinde
  const handleCountChange = useCallback((trolleyTypeId, field, value) => {
    const numValue = value.trim() === "" ? "" : parseInt(value, 10);
    if (numValue < 0 || isNaN(numValue)) return;
    setTrolleyCounts((prev) => ({
      ...prev,
      [trolleyTypeId]: {
        ...prev[trolleyTypeId],
        [field]: value.trim() === "" ? "" : numValue,
      },
    }));
  }, []);

  // Form gönderimi
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!selectedProject) {
      const msg = "Please select a project.";
      showToast(msg, "error");
      setError(msg);
      return;
    }
    const trolleyEntries = Object.entries(trolleyCounts)
      .filter(([_, counts]) => {
        const working = counts.workingCount || 0;
        const broken = counts.brokenCount || 0;
        return working > 0 || broken > 0;
      })
      .map(([trolleyTypeId, counts]) => {
        const trolleyType = trolleyTypes.find(
          (type) => type.value === trolleyTypeId
        );
        return {
          projectId: selectedProject.value,
          projectLabel: selectedProject.label,
          trolleyTypeId,
          typeLabel: trolleyType?.label || "Unknown",
          workingCount: counts.workingCount || 0,
          brokenCount: counts.brokenCount || 0,
        };
      });
    if (trolleyEntries.length === 0) {
      const msg = "Add at least one trolley record with counts.";
      showToast(msg, "warning");
      setError(msg);
      return;
    }
    setIsLoading(true);
    const formattedPayload = {
      Trolleys: trolleyEntries.map((entry) => ({
        ProjectId: entry.projectId,
        TrolleyTypeId: entry.trolleyTypeId,
        WorkingTrolleysCount: entry.workingCount,
        BrokenTrolleysCount: entry.brokenCount,
      })),
    };
    try {
      const response = await fetch(`${apiBaseUrl}/api/Trolley`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedPayload),
      });
      const responseData = await response.json();
      if (!response.ok)
        throw new Error(
          responseData.Message ||
            responseData.title ||
            `HTTP Error: ${response.status}`
        );
      showToast(responseData.Message || "Success!", "success");
      if (onSaveSuccess) onSaveSuccess(responseData);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err.message || "Unexpected save error.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Render
  if (!isOpen) return null;
  const isDataLoading = !projects || !trolleyTypes;
  const isActionDisabled = isLoading || isDataLoading;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <FaShoppingCart size={18} /> Add New Trolley Records
          </Title>
          <CloseButton
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorMessage>
              <FaExclamationTriangle size={12} /> {error}
            </ErrorMessage>
          )}
          {isDataLoading && (
            <ErrorMessage>
              <StyledSpinner size={12} /> Loading selection options...
            </ErrorMessage>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="trolleyProjectInput">
                <FaProjectDiagram size={14} /> Project
              </Label>
              <Select
                id="trolleyProjectSelect"
                inputId="trolleyProjectInput"
                options={projects || []}
                value={selectedProject}
                onChange={handleProjectChange}
                placeholder="Select a project..."
                styles={reactSelectStyles}
                isLoading={!projects}
                isDisabled={isActionDisabled || isStoreManagement}
                isClearable={!isStoreManagement}
                isSearchable={!isStoreManagement}
                aria-label="Select Project"
              />
            </FormGroup>

            <ListHeader>
              <FaShoppingCart size={14} /> Trolley Types
            </ListHeader>
            <TrolleyListContainer>
              {trolleyTypes?.length === 0 ? (
                <NoTrolleysMessage>
                  <FaInfoCircle size={14} /> No trolley types available.
                </NoTrolleysMessage>
              ) : (
                trolleyTypes.map((type, index) => (
                  <TrolleyItem
                    key={type.value}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <TrolleyImage
                      className={`
                        ${trolleyImages[type.value]?.error ? "error" : ""}
                        ${trolleyImages[type.value]?.loading ? "loading" : ""}
                      `}
                      title={
                        trolleyImages[type.value]?.loading
                          ? "Loading image..."
                          : trolleyImages[type.value]?.error
                          ? "Image load error"
                          : type.label
                      }
                    >
                      {trolleyImages[type.value]?.loading ? (
                        <PreviewSpinnerWrapper>
                          <StyledSpinner size={20} />
                        </PreviewSpinnerWrapper>
                      ) : trolleyImages[type.value]?.url && !trolleyImages[type.value]?.error ? (
                        <img
                          src={trolleyImages[type.value].url}
                          alt={type.label}
                          onError={() =>
                            setTrolleyImages((prev) => ({
                              ...prev,
                              [type.value]: { ...prev[type.value], error: true },
                            }))
                          }
                        />
                      ) : (
                        <FaImage size={20} />
                      )}
                    </TrolleyImage>
                    <TrolleyName title={type.label}>{type.label}</TrolleyName>
                    <Input
                      type="number"
                      placeholder="Yararlı"
                      value={trolleyCounts[type.value]?.workingCount || ""}
                      onChange={(e) =>
                        handleCountChange(type.value, "workingCount", e.target.value)
                      }
                      min="0"
                      disabled={isActionDisabled}
                      aria-label={`Working count for ${type.label}`}
                    />
                    <Input
                      type="number"
                      placeholder="Yararsız"
                      value={trolleyCounts[type.value]?.brokenCount || ""}
                      onChange={(e) =>
                        handleCountChange(type.value, "brokenCount", e.target.value)
                      }
                      min="0"
                      disabled={isActionDisabled}
                      aria-label={`Broken count for ${type.label}`}
                    />
                  </TrolleyItem>
                ))
              )}
            </TrolleyListContainer>
          </Form>
        </ModalBody>

        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={handleSubmit}
            disabled={isActionDisabled}
          >
            {isLoading ? <StyledSpinner size={14} /> : <FaSave size={14} />}
            {isLoading ? "Creating..." : "Create Record(s)"}
          </PrimaryButton>
        </ModalFooter>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateTrolleyModal;
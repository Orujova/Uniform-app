import React, { useState, useEffect, useMemo } from "react"; // useMemo eklendi (potansiyel optimizasyon için)
import styled, { keyframes } from "styled-components";
import Select from "react-select";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import { FaTimes, FaSpinner, FaPlus, FaExclamationCircle, FaWarehouse } from "react-icons/fa";

// Animations (Değişiklik yok)
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

// Modal Stilleri (ModalOverlay, ModalContent, ModalHeader, Title, CloseButton - Değişiklik yok, önceki stiliniz korunuyor)
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.75);
  backdrop-filter: blur(3px);
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
  border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  /* Height otomatik ayarlanacak, sabit yükseklik kaldırıldı */
  height: 400px; /* İçerik taşarsa scroll eklenmesi için */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  animation: ${scaleUp} 0.3s 0.1s ease-out forwards;
`;

const ModalHeader = styled.header`
  padding: 1rem 1.5rem; /* Önceki değerlere geri döndüm, gerekirse artırılabilir */
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem; /* Önceki değere döndüm */
  color: #111827;
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

// Modal Body and Form Stilleri (Değişiklik yok, önceki stiliniz korunuyor)
const ModalBody = styled.div`
  padding: 1rem 1.5rem; /* Önceki değere döndüm */
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Biraz artırıldı */
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* FormGroup'lar arası boşluk */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem; /* Label ve input arası boşluk */
`;

const LabelWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.85rem; /* Önceki değere döndüm */
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const RequiredStar = styled.span`
  color: #ef4444;
  font-size: 0.85rem; /* Önceki değere döndüm */
`;

const sharedInputStyles = `
  padding: 0.55rem 0.75rem; /* Önceki değerlere döndüm */
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem; /* Önceki değere döndüm */
  color: #1f2937;
  background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  box-sizing: border-box;
  &:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Input = styled.input`
  ${sharedInputStyles}
  &::placeholder {
    color: #9ca3af;
  }
`;

// reactSelectStyles (menü listesi yüksekliği dışında önceki hali)
const reactSelectStyles = {
  control: (p, s) => ({
    ...p,
    minHeight: "36px", /* Standart bir yükseklik */
    height: "36px",
    fontSize: "0.9rem", /* Font boyutu standart */
    borderColor: s.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: s.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.2)" : "none",
    "&:hover": { borderColor: s.isFocused ? "#3b82f6" : "#9ca3af" },
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: s.isDisabled ? "#f3f4f6" : "#ffffff",
    opacity: s.isDisabled ? 0.7 : 1,
  }),
  valueContainer: (p) => ({ ...p, height: "36px", padding: "0 8px" }),
  input: (p) => ({ ...p, margin: "0", padding: "0" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (p) => ({ ...p, height: "36px" }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected ? "#3b82f6" : s.isFocused ? "#e9ecef" : "#fff",
    color: s.isSelected ? "#fff" : s.isFocused ? "#000" : "#495057",
    padding: "7px 10px", /* Biraz dikey padding */
    fontSize: "0.9rem", /* Font boyutu standart */
    cursor: "pointer",
    overflow: "hidden", // Eğer içerik taşıyorsa gizle
    textOverflow: "ellipsis", // Taşan kısmı ... ile göster
    whiteSpace: "nowrap", // Tek satırda kalmasını sağla
  }),
  menu: (p) => ({
    ...p,
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1101,
  }),
  menuList: (p) => ({
    ...p,
    maxHeight: "180px", /* Yükseklik ayarlandı (yaklaşık 5-6 öğe gösterecek şekilde) */
    overflowY: "auto",
    padding: "4px 0",
  }),
  placeholder: (p) => ({ ...p, color: "#9ca3af", fontSize: "0.9rem" }),
  singleValue: (p) => ({ ...p, color: "#1f2937" }),
};

// ErrorMessage, ModalFooter, Button stilleri (Değişiklik yok, önceki hali)
const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.75rem 1.5rem; /* Önceki değerlere döndüm */
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  flex-shrink: 0;
`;

const Button = styled.button`
  padding: 0.55rem 1.2rem; /* Önceki değerlere döndüm */
  font-size: 0.9rem; /* Önceki değerlere döndüm */
  font-weight: 500;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-width: 90px; /* Önceki değerlere döndüm */
  line-height: 1.3;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

// PrimaryButton yeşil yerine mavi yapıldı (isteğe bağlı)
const PrimaryButton = styled(Button)`
  background-color: #3b82f6; /* Yeşil yerine Mavi */
  color: white;
  &:hover:not(:disabled) {
    background-color: #2563eb; /* Daha koyu mavi */
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4); /* Mavi odak rengi */
  }
`;


const SecondaryButton = styled(Button)`
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

// Component Logic
const CreatePalletDepositModal = ({ isOpen, onClose, onSave, apiBaseUrl, token, projects }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal açıldığında/kapandığında state'i sıfırla
  useEffect(() => {
    if (!isOpen) {
      // Kapanırken temizlik için setTimeout kaldırıldı, hemen yapılabilir
      setSelectedProject(null);
      setDepositAmount("");
      setError("");
      setIsLoading(false);
    } else {
      // Açılırken önceki değerleri temizle
      setSelectedProject(null);
      setDepositAmount("");
      setError("");
      // setIsLoading(false); // Zaten başlangıçta false olmalı
    }
  }, [isOpen]);

  // useMemo ile proje opsiyonlarını sadece projects prop'u değiştiğinde hesapla
  const projectOptions = useMemo(() => {
    // Gelen projects prop'unun her zaman { value, label } formatında olduğunu varsayıyoruz
    // Parent component'te (PalletDepositPage) zaten formatlanıyor.
    if (!Array.isArray(projects)) {
        console.warn("CreatePalletDepositModal: 'projects' prop is not an array or undefined.");
        return [];
    }
    return projects;
  }, [projects]); // Sadece projects değiştiğinde yeniden hesapla

  // projects prop'u gelene kadar bekleme durumu (isteğe bağlı, parent hallediyorsa gereksiz)
  const isDataLoading = !projectOptions || projectOptions.length === 0 && !projects; // Henüz projects gelmediyse veya boşsa

  const isActionDisabled = isLoading || isDataLoading;

  // handleSubmit aynı, değişiklik yok
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validation
    if (!selectedProject) {
      const msg = "Please select a project.";
      showToast(msg, "error"); // Kendi toast fonksiyonunuz
      setError(msg);
      return;
    }
    const depositValue = parseInt(depositAmount, 10);
    if (isNaN(depositValue) || depositAmount.trim() === "") { // trim() eklendi
      const msg = "Please enter a valid deposit amount (must be a number).";
      showToast(msg, "error");
      setError(msg);
      return;
    }
    if (depositValue < 0) {
      const msg = "Deposit amount cannot be negative.";
      showToast(msg, "error");
      setError(msg);
      return;
    }

    setIsLoading(true);

    const payload = {
      ProjectId: parseInt(selectedProject.value, 10),
      Deposit: depositValue,
    };

    const effectiveApiBaseUrl = apiBaseUrl || API_BASE_URL;
    const fetchUrl = `${effectiveApiBaseUrl}/api/PalletDeposit`;

    try {
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseData = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          responseData = await response.json();
      } else {
           // JSON olmayan yanıtlar için text'i oku
           const responseText = await response.text();
           if (!response.ok) {
              // Başarısızsa text'i hata mesajı olarak kullan
              throw new Error(responseText || `HTTP Error ${response.status}`);
           }
           // Başarılı ama JSON değilse (nadiren olur)
           responseData = { IsSuccess: true, Message: responseText || "Operation successful (non-JSON)." };
      }

      // Hem HTTP status hem IsSuccess kontrolü
      if (!response.ok || !responseData.IsSuccess) {
        throw new Error(
          responseData?.Message || // API mesajına öncelik ver
            responseData?.message ||
            responseData?.title ||
            `Request failed with status: ${response.status}`
        );
      }

      showToast(responseData.Message || "Pallet deposit created successfully!", "success");
      if(onSave) onSave(responseData); // onSave varsa çağır
      onClose(); // Başarılı olunca kapat
    } catch (err) {
      console.error("Create Pallet Deposit error:", err);
      const errorMessage = err.message || "An unexpected error occurred while creating the deposit.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

   // Modal render edilmiyorsa null dön (isOpen kontrolü)
   if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <FaWarehouse size={16} />
            Create Pallet Deposit
          </Title>
          <CloseButton onClick={onClose} disabled={isLoading} aria-label="Close modal">
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {/* Hata mesajı alanı */}
          {error && (
            <ErrorMessage>
              <FaExclamationCircle size={14} /> {error}
            </ErrorMessage>
          )}
          {/* Proje seçenekleri yükleniyor mesajı (isteğe bağlı) */}
          {isDataLoading && projects === undefined && ( // Eğer projects henüz gelmediyse gösterilebilir
             <ErrorMessage><StyledSpinner size={14}/> Loading project options...</ErrorMessage>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="projectSelect">
                  {/* <FaProjectDiagram size={14} /> // Varsa proje ikonu */}
                  Project
                </Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Select
                inputId="projectSelect"
                // *** DÜZELTME: options prop'una tüm listeyi ver ***
                options={projectOptions}
                // *** DÜZELTME: filterOption prop'unu kaldır (varsayılanı kullan) ***
                // filterOption={...} // Bu satırı kaldır
                value={selectedProject}
                onChange={(option) => setSelectedProject(option)}
                placeholder={
                  projectOptions.length === 0 && !isDataLoading
                    ? "No projects found"
                    : isDataLoading && projects === undefined
                    ? "Loading..." // Yüklenirken gösterilecek yazı
                    : "Select or type to search..." // Genel placeholder
                }
                styles={reactSelectStyles}
                isClearable
                isSearchable
                isLoading={isDataLoading && projects === undefined} // Sadece ilk yükleme sırasında spinner göster
                isDisabled={isActionDisabled} // Yüklenirken veya API işlemi sürerken disable
                aria-required="true"
                aria-label="Select a project"
                noOptionsMessage={() =>
                    projectOptions.length > 0 ? 'No projects match your search' : 'No projects available'
                } // Arama sonucu veya genel olarak seçenek yoksa mesaj
              />
            </FormGroup>
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="depositAmount">Deposit Amount</Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="e.g., 150"
                required
                min="0"
                step="1" // Sadece tam sayı depozito?
                disabled={isActionDisabled}
                aria-required="true"
                aria-label="Deposit amount"
              />
            </FormGroup>
            {/* Formun kendi submit butonu yok, Footer'daki buton submit edecek */}
          </Form>
        </ModalBody>
        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} aria-label="Cancel">
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
             onClick={handleSubmit} // Formu submit eder
            disabled={isActionDisabled || !selectedProject || depositAmount.trim() === ""}
            aria-label="Create deposit"
          >
            {isLoading ? (
              <StyledSpinner size={14} />
            ) : (
              <> <FaPlus size={12} /> Create </>
            )}
          </PrimaryButton>
        </ModalFooter>
        <ToastContainer /> {/* Eğer global değilse */}
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreatePalletDepositModal;
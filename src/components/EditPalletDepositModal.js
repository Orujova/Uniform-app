import React, { useState, useEffect, useCallback } from "react"; // useCallback eklendi (gerçi burada doğrudan kullanılmayacak ama iyi pratik)
import styled, { keyframes } from "styled-components";
// Select import'u kaldırıldı
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer"; // Opsiyonel
import {
  FaTimes,
  FaSpinner,
  FaSave,
  FaWarehouse, // Pallet Deposit için daha uygun
  FaExclamationCircle,
  FaProjectDiagram, // Proje ikonu için
} from "react-icons/fa";

// --- Stiller (Animations, ModalOverlay, ModalContent, ModalHeader, Title, CloseButton) ---
// Önceki kodla aynı, değişiklik yok...
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.75); /* Trolley modal'dan biraz daha az yoğun */
  backdrop-filter: blur(4px); /* Trolley modal'dan biraz daha az blur */
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 450px; /* Trolley'den biraz daha dar olabilir */
  max-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  animation: ${scaleUp} 0.3s 0.1s ease-out forwards; /* Trolley'den biraz daha hızlı animasyon */
`;

const ModalHeader = styled.header`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: #111827;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.6rem; /* İkon ile yazı arası boşluk */
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
  padding: 0.4rem;
  margin: -0.4rem; /* Hizalama için negatif margin */
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
// --- ---

// --- Stiller (ModalBody, Form, FormGroup, Label, RequiredStar, sharedInputStyles, Input) ---
const ModalBody = styled.div`
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem; /* Alanlar arası boşluk */
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.2rem; /* Form elemanları arası boşluk */
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
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem; /* İkon ve yazı arası */
`;

const RequiredStar = styled.span`
  color: #ef4444;
  font-size: 0.85rem;
  margin-left: 2px; /* Yıldız için küçük boşluk */
`;

const sharedInputStyles = ` padding: 0.60rem 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; /* Font boyutu güncellendi */ color: #1f2937; background-color: #ffffff; transition: border-color 0.2s ease, box-shadow 0.2s ease; width: 100%; box-sizing: border-box; &:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); } &:disabled { background-color: #e9ecef; /* Daha belirgin disable */ color: #6c757d; cursor: not-allowed; border-color: #ced4da;} &::placeholder { color: #9ca3af; } `;

const Input = styled.input`
  ${sharedInputStyles}
`;

// ** YENİ: Sadece okunur bilgi göstermek için stil (EditTrolleyModal'dan) **
const ReadOnlyInfo = styled.div`
  ${sharedInputStyles}
  background-color: #f3f4f6; /* Gri arka plan */
  color: #4b5563; /* Biraz daha koyu yazı */
  cursor: default; /* Tıklanamaz */
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500; /* Normal input'tan biraz farklı */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Uzun isimler için */
  border-color: #e5e7eb; /* Biraz daha soluk border */

  &:focus {
    border-color: #e5e7eb; /* Odaklandığında border değişmesin */
    box-shadow: none;
  }
`;

// ErrorMessage, ModalFooter, Button stilleri (önceki kodla aynı, değişiklik yok)
const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  /* text-align: center; */ /* Merkezi hizalamaya gerek yok */
`;

const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.5rem; /* Biraz daha dolgu */
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease,
    box-shadow 0.2s ease, border-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 90px;
  line-height: 1.3;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #3b82f6;
  color: white;
  &:hover:not(:disabled) {
    background-color: #2563eb;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
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
    box-shadow: 0 0 0 2px rgba(209, 213, 219, 0.4);
  }
`;

const StyledSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
`;

// Component Logic
const EditPalletDepositModal = ({
  isOpen,
  onClose,
  onSave, // onSaveSuccess -> onSave olarak düzeltildi (önceki kodla uyumlu)
  apiBaseUrl,
  token,
  initialData,
  // projects prop'u artık gerekli değil
}) => {
  // Artık proje seçimi state'i yok
  const [depositAmount, setDepositAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // initialData değiştiğinde formu doldur
  useEffect(() => {
    if (isOpen && initialData) {
      // Deposit miktarını ayarla (Proje adı initialData'dan gelecek)
      setDepositAmount(
        initialData.Deposit != null ? initialData.Deposit.toString() : ""
      );
      setError("");
      setIsLoading(false);
    } else if (!isOpen) {
       // Kapanırken temizleme (setTimeout kaldırıldı)
       setDepositAmount("");
       setError("");
       setIsLoading(false);
    }
    // Bağımlılıklardan proje ile ilgili olanlar kaldırıldı
  }, [isOpen, initialData]);

  // --- Form Gönderme ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validasyon: Deposit Amount
    const depositValue = parseInt(depositAmount, 10);
    if (isNaN(depositValue) || depositAmount.trim() === "") {
      const msg = "Please enter a valid deposit amount.";
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

    // ** Validasyon: Gerekli ID'ler initialData'da var mı? **
    if (initialData?.Id == null || initialData?.ProjectId == null) {
         const msg = "Cannot update: Missing necessary ID information.";
         showToast(msg, "error");
         setError(msg);
         return;
     }

    // Değişiklik Kontrolü: Sadece depozito miktarı
    const currentDepositStr = initialData.Deposit != null ? initialData.Deposit.toString() : null;
    const isDepositChanged = currentDepositStr !== depositAmount;

    if (!isDepositChanged) {
      showToast("No changes detected in deposit amount.", "info");
      // Değişiklik yoksa modal'ı kapatabiliriz veya sadece bilgi verebiliriz
      // onClose();
      return;
    }

    setIsLoading(true);

    const payload = {
      Id: initialData.Id,
      ProjectId: initialData.ProjectId, // Doğrudan initialData'dan
      Deposit: depositValue,
    };

    const effectiveApiBaseUrl = apiBaseUrl || API_BASE_URL;
    const fetchUrl = `${effectiveApiBaseUrl}/api/PalletDeposit`; // PUT isteği için endpoint

    try {
      const response = await fetch(fetchUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        responseData = await response.json();
      } else {
        const responseText = await response.text();
        if (!response.ok) {
          throw new Error(responseText || `HTTP Error ${response.status}`);
        }
        // Başarılı ama JSON olmayan durum
        responseData = { IsSuccess: true, Message: responseText || "Operation successful (non-JSON response)." };
      }


      if (!response.ok || !responseData?.IsSuccess) {
         // API'den gelen hata mesajını önceliklendir
         throw new Error(
            responseData?.Message ||
            responseData?.message ||
            responseData?.title ||
            `Request failed with status: ${response.status}`
          );
      }

      showToast(responseData.Message || "Pallet deposit updated successfully!", "success");
      if (onSave) {
        // Güncellenmiş veriyi (veya API'den döneni) parent'a ilet
         onSave({ ...initialData, Deposit: depositValue }); // Veya responseData içinden gelen güncel nesneyi
      }
      onClose(); // Başarı durumunda modal'ı kapat
    } catch (err) {
      console.error("Update Pallet Deposit error:", err);
      const errorMessage = err.message && err.message !== "Failed to fetch"
                           ? err.message
                           : "An unexpected error occurred during the update.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // initialData yoksa veya gerekli ID eksikse gösterme
  if (!isOpen || !initialData || initialData.Id == null) {
     // Konsola loglama isteğe bağlı eklenebilir: console.error('Missing initialData or Id for EditPalletDepositModal');
     return null;
  }

  // Helper: Değeri göster veya 'N/A' döndür
  const displayValue = (value, fallback = "N/A") => value ?? fallback;

  // Proje adını belirle (Önce Kodu, yoksa Adı, o da yoksa fallback)
  const projectNameDisplay = displayValue(
       initialData.ProjectCode, // Önce proje kodunu dene
       displayValue(initialData.ProjectName, 'Project Info Unavailable') // Sonra proje adını, o da yoksa hata mesajı
   );

   const isActionDisabled = isLoading; // Butonları sadece yükleme sırasında disable et

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <FaWarehouse size={18} /> {/* İkon güncellendi */}
            Edit Pallet Deposit
            {initialData?.Id != null && <Subtitle>(ID: {initialData.Id})</Subtitle>}
          </Title>
          <CloseButton onClick={onClose} disabled={isLoading} aria-label="Close modal">
            <FaTimes size={18} /> {/* Boyut biraz arttırıldı */}
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorMessage>
              <FaExclamationCircle size={14} />
              {error}
            </ErrorMessage>
          )}

          {/* --- Proje Bilgisi (Okunur Alan) --- */}
          <FormGroup>
            <Label>
              <FaProjectDiagram size={14}/> {/* Proje ikonu */}
              Project
            </Label>
            <ReadOnlyInfo title={projectNameDisplay}> {/* Tooltip için */}
              {projectNameDisplay}
            </ReadOnlyInfo>
          </FormGroup>

          {/* --- Depozito Miktarı (Form İçinde) --- */}
          <Form id="edit-pallet-deposit-form" onSubmit={handleSubmit} noValidate>
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="editDepositAmount">Deposit Amount</Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Input
                type="number"
                id="editDepositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="e.g., 150"
                required
                min="0"
                step="1"
                disabled={isActionDisabled}
                aria-required="true"
                aria-label="Deposit amount"
              />
            </FormGroup>
          </Form>
        </ModalBody>

        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading} aria-label="Cancel">
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit" // Formu submit eder
            form="edit-pallet-deposit-form" // Hangi formu submit edeceğini belirtir
            disabled={isActionDisabled || depositAmount.trim() === ""} // Yükleniyorsa veya input boşsa disable
            aria-label="Update deposit"
          >
            {isLoading ? (
              <StyledSpinner size={14} />
            ) : (
              <FaSave size={12} />
            )}
            {isLoading ? "Saving..." : "Update"}
          </PrimaryButton>
        </ModalFooter>

        <ToastContainer /> {/* Global veya burada olabilir */}
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditPalletDepositModal;
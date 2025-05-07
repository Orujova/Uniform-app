import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer"; // Opsiyonel
import {
  FaTimes,
  FaSave,
  FaSpinner,
  FaEdit,
  FaProjectDiagram,
  FaTags,
  FaShoppingCart,
  FaImage, // Placeholder
  FaExclamationTriangle, // Hata
} from "react-icons/fa";

// --- Stiller ---
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(5px);
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
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 650px; /* Genişlik ayarlanabilir */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  animation: ${scaleUp} 0.35s 0.1s ease-out forwards;
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
  gap: 0.5rem;
`;
const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.4rem;
  margin: -0.4rem;
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
  padding: 1.25rem 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  max-height: calc(80vh - 110px);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// --- İki Sütunlu Yapı ---
const TopSectionContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  width: 100%;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;
const LeftColumn = styled.div`
  flex: 0 0 70%; /* Sol sütun %70 */
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const RightColumn = styled.div`
  flex: 0 0 30%; /* Sağ sütun %30 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 2.2rem; // Yaklaşık hizalama
`;
// --- ---

const Form = styled.form`
  // Sadece sayım ve butonlar
  display: flex;
  flex-direction: column;
  gap: 1.2rem; // Gap biraz artırıldı
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
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 2px;
`;
const sharedInputStyles = ` padding: 0.60rem 0.8rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; color: #1f2937; background-color: #ffffff; transition: border-color 0.2s ease, box-shadow 0.2s ease; width: 100%; box-sizing: border-box; &:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); } &:disabled { background-color: #e9ecef; color: #6c757d; cursor: not-allowed; border-color: #ced4da;} &::placeholder { color: #9ca3af; } `;
const Input = styled.input`
  ${sharedInputStyles}
`;
const ReadOnlyInfo = styled.div`
  // Sabit bilgiyi gösteren stil
  ${sharedInputStyles} background-color: #f3f4f6;
  color: #4b5563;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; // Taşmayı önle
  &:focus {
    border-color: #d1d5db;
    box-shadow: none;
  }
`;
const CountInputGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
`;

const LargeTypeImagePreview = styled.div`
  // CreateModal'daki ile benzer, boyut ayarlanabilir
  width: 100%; // Sağ sütunu doldur
  max-width: 110px; // Edit için biraz daha küçük
  aspect-ratio: 1 / 1;
  height: auto;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #cbd5e1;
  position: relative;
  margin: 0 auto;

  svg {
    font-size: 2.5rem;
  } // İkon boyutu
  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  &.error {
    border-color: #fca5a5;
    color: #ef4444;
    background-color: #fee2e2;
  }
  &.loading {
    border-color: #9ca3af;
    background-color: #e5e7eb;
    color: #6b7280;
  }
`;
const PreviewSpinnerWrapper = styled.div`
  // Spinner ortalama
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(248, 250, 252, 0.7);
`;
const PreviewLabel = styled(Label)`
  // Resim altı etiket
  font-size: 0.75rem;
  justify-content: center;
  margin-top: 0.4rem;
  color: #6b7280;
  text-align: center;
  &.error {
    color: #ef4444;
    font-weight: 600;
  }
`;
const ErrorMessage = styled.div`
  color: #ef4444;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
`;
const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.9rem 1.5rem;
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

// --- Helper Function (Aynı) ---
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
    if (url.pathname.startsWith("/uploads/")) {
      return backendUrl;
    }
    const newPathname = `/uploads${url.pathname}`;
    return `${url.origin}${newPathname}`;
  } catch (e) {
    console.error("Err URL:", backendUrl, e);
    return null;
  }
};

// --- Component Logic ---
const EditTrolleyModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  initialData,
  apiBaseUrl = API_BASE_URL,
  token,
}) => {
  const [workingCount, setWorkingCount] = useState("");
  const [brokenCount, setBrokenCount] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Kaydetme işlemi için
  const [error, setError] = useState("");

  // --- Resim için State'ler ---
  const [imageUrl, setImageUrl] = useState(null); // Görüntülenecek resim URL'si
  const [isImageLoading, setIsImageLoading] = useState(false); // Resim GetById yükleniyor mu?
  const [imageLoadError, setImageLoadError] = useState(false); // img etiketi hatası?
  // --- ---

  // Resmi temizle (Modal kapanırken vs.)
  const clearImageData = useCallback(() => {
    setImageUrl(null);
    setIsImageLoading(false);
    setImageLoadError(false);
  }, []);

  // initialData geldiğinde ve modal açıldığında çalışır
  useEffect(() => {
    clearImageData(); // Önceki resmi temizle
    if (isOpen && initialData) {
      // Sayım alanlarını doldur
      setWorkingCount(initialData.WorkingTrolleysCount?.toString() ?? "");
      setBrokenCount(initialData.BrokenTrolleysCount?.toString() ?? "");
      setError("");
      setIsLoading(false);

      // TrolleyTypeId varsa, resmi getirmeyi tetikle
      if (initialData.TrolleyTypeId != null) {
        fetchTrolleyTypeImage(initialData.TrolleyTypeId);
      }
    } else if (!isOpen) {
      // Kapanırken temizle
      const timer = setTimeout(() => {
        setWorkingCount("");
        setBrokenCount("");
        clearImageData();
        setError("");
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialData, clearImageData]); // initialData değişince de tetiklenmeli

  // Trolley Type ID ile resmi getiren fonksiyon (CreateModal'daki gibi)
  const fetchTrolleyTypeImage = useCallback(
    async (typeId) => {
      if (!typeId || !token) {
        setImageUrl(null);
        return;
      }
      setIsImageLoading(true);
      setImageLoadError(false);
      setImageUrl(null);
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
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const typeData = await response.json();
        const displayUrl = generateDisplayImageUrl(typeData.ImageUrl);
        setImageUrl(displayUrl);
      } catch (err) {
        console.error("Err fetch img:", err);
        setImageUrl(null); /* img onError halledecek */
      } finally {
        setIsImageLoading(false);
      }
    },
    [apiBaseUrl, token]
  );

  // Formu gönderme (Sadece adetler güncellenir, ID'ler initialData'dan alınır)
  const handleSubmit = async (event) => {
    event.preventDefault();
    const working = parseInt(workingCount, 10);
    const broken = parseInt(brokenCount, 10);
    if (isNaN(working) || working < 0 || isNaN(broken) || broken < 0) {
      setError("Counts must be zero or positive numbers.");
      showToast("Counts must be zero or positive numbers.", "error");
      return;
    }
    if (
      initialData.Id == null ||
      initialData.ProjectId == null ||
      initialData.TrolleyTypeId == null
    ) {
      setError("Missing necessary IDs to update.");
      showToast("Missing IDs.", "error");
      return;
    }
    setIsLoading(true);
    setError("");
    const queryParams = new URLSearchParams({
      Id: initialData.Id.toString(),
      ProjectId: initialData.ProjectId.toString(),
      TrolleyTypeId: initialData.TrolleyTypeId.toString(),
      WorkingTrolleysCount: working.toString(),
      BrokenTrolleysCount: broken.toString(),
    });
    const fetchUrl = `${apiBaseUrl}/api/Trolley?${queryParams.toString()}`;
    try {
      const response = await fetch(fetchUrl, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        let errorMsg = `HTTP Error: ${response.status}`;
        try {
          const eData = await response.json();
          errorMsg = eData.Message || eData.title || errorMsg;
        } catch (e) {
          /*ignore*/
        }
        throw new Error(errorMsg);
      }
      showToast("Trolley counts updated!", "success");
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      const errMsg = err.message || "Update error.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Null veya undefined ise 'N/A' dönen helper
  const displayValue = (value) => value ?? "N/A";
  // Sabit bilgiler için null/undefined kontrolü
  if (!isOpen || !initialData || initialData.Id == null) return null;
  const isActionDisabled = isLoading || isImageLoading;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          {" "}
          <Title>
            {" "}
            <FaEdit /> Edit Counts{" "}
          </Title>{" "}
          <CloseButton onClick={onClose} disabled={isLoading}>
            {" "}
            <FaTimes size={16} />{" "}
          </CloseButton>{" "}
        </ModalHeader>

        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <TopSectionContainer>
            {/* Sol Sütun: Sabit Bilgiler */}
            <LeftColumn>
              <FormGroup>
                <Label>
                  {" "}
                  <FaProjectDiagram /> Project{" "}
                </Label>
                <ReadOnlyInfo title={displayValue(initialData.ProjectName)}>
                  {displayValue(initialData.ProjectName)}
                </ReadOnlyInfo>
              </FormGroup>
              <FormGroup>
                <Label>
                  {" "}
                  <FaTags /> Type{" "}
                </Label>
                <ReadOnlyInfo title={displayValue(initialData.TrolleyTypeName)}>
                  {displayValue(initialData.TrolleyTypeName)}
                </ReadOnlyInfo>
              </FormGroup>
            </LeftColumn>

            {/* Sağ Sütun: Resim Önizleme */}
            <RightColumn>
              <LargeTypeImagePreview
                className={`${imageLoadError ? "error" : ""} ${
                  isImageLoading ? "loading" : ""
                }`}
                title={
                  isImageLoading
                    ? "Loading image..."
                    : imageLoadError
                    ? "Image load error"
                    : imageUrl
                    ? initialData.TrolleyTypeName || "Trolley Type"
                    : "No image found"
                }
              >
                {isImageLoading ? (
                  <PreviewSpinnerWrapper>
                    <StyledSpinner size={32} />
                  </PreviewSpinnerWrapper>
                ) : imageUrl && !imageLoadError ? (
                  <img
                    src={imageUrl}
                    alt={initialData.TrolleyTypeName || "Trolley type"}
                    onError={() => setImageLoadError(true)}
                  />
                ) : imageLoadError ? (
                  <FaExclamationTriangle />
                ) : (
                  <FaImage />
                )}
              </LargeTypeImagePreview>
              {/* Opsiyonel etiket */}
              {initialData.TrolleyTypeName && !isImageLoading && (
                <PreviewLabel className={imageLoadError ? "error" : ""}>
                  {imageLoadError ? "Error" : ""}
                </PreviewLabel>
              )}
              {/* Eğer tip adı varsa ve yüklenmiyorsa, hata varsa 'Error' yaz, yoksa boş bırak (isim zaten solda var) */}
            </RightColumn>
          </TopSectionContainer>

          {/* Sayım Alanları (Ayrı Formda) */}
          <Form id="edit-trolley-count-form" onSubmit={handleSubmit} noValidate>
            <CountInputGroup>
              <FormGroup>
                <Label>
                  {" "}
                  <FaShoppingCart color="#16a34a" /> Working{" "}
                </Label>
                <Input
                  type="number"
                  value={workingCount}
                  onChange={(e) => setWorkingCount(e.target.value)}
                  placeholder="Count"
                  min="0"
                  required
                  disabled={isActionDisabled}
                  aria-label="Working Trolley Count"
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  {" "}
                  <FaShoppingCart color="#dc2626" /> Broken{" "}
                </Label>
                <Input
                  type="number"
                  value={brokenCount}
                  onChange={(e) => setBrokenCount(e.target.value)}
                  placeholder="Count"
                  min="0"
                  required
                  disabled={isActionDisabled}
                  aria-label="Broken Trolley Count"
                />
              </FormGroup>
            </CountInputGroup>
          </Form>

          {/* Liste GEREKLİ DEĞİL Edit Modunda */}
        </ModalBody>

        <ModalFooter>
          <SecondaryButton type="button" onClick={onClose} disabled={isLoading}>
            {" "}
            Cancel{" "}
          </SecondaryButton>
          {/* Buton type=submit ve form ID'si ile bağlanır */}
          <PrimaryButton
            type="submit"
            form="edit-trolley-count-form"
            disabled={isActionDisabled}
          >
            {isLoading ? <StyledSpinner size={14} /> : <FaSave />}
            {isLoading ? "Saving..." : "Save Changes"}
          </PrimaryButton>
        </ModalFooter>
        {/* <ToastContainer /> Opsiyonel */}
      </ModalContent>
    </ModalOverlay>
  );
};

export default EditTrolleyModal;

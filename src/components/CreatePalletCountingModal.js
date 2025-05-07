import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import Select from "react-select";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import {
  FaTimes,
  FaSpinner,
  FaPlus,
  FaExclamationCircle,
  FaBoxes,
  FaProjectDiagram,
  FaArrowDown,
  FaArrowUp,
  FaClipboardList,
  FaInfoCircle,
  FaCalculator,
} from "react-icons/fa";

// --- Stiller ---
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

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
  max-width: 500px;
  max-height: 97vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  animation: ${scaleUp} 0.3s 0.1s ease-out forwards;
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
  gap: 0.6rem;
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

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
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
  gap: 0.4rem;
`;

const RequiredStar = styled.span`
  color: #ef4444;
  font-size: 0.85rem;
`;

const sharedInputStyles = `
  padding: 0.6rem 0.8rem; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 0.9rem; color: #1f2937; background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%; box-sizing: border-box;
  &:focus {
    border-color: #3b82f6; outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  }
  &:disabled { background-color: #f3f4f6; cursor: not-allowed; opacity: 0.7; }
`;

const Input = styled.input`
  ${sharedInputStyles}
  &::placeholder {
    color: #9ca3af;
  }
`;

const ReadOnlyInfo = styled.div`
  ${sharedInputStyles}
  background-color: #f8f9fa;
  color: #495057;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-color: #e9ecef;
  height: 38px;
  &:focus {
    border-color: #e9ecef;
    box-shadow: none;
  }
  svg {
    color: #6c757d;
    flex-shrink: 0;
  }
  &.calculated {
    font-weight: 600;
    color: #059669;
    background-color: #f0fdf4;
    border-color: #a7f3d0;
  }
`;

const SmallSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  font-size: 0.8rem;
  margin-right: 0.3rem;
`;

const reactSelectStyles = {
  control: (p, s) => ({
    ...p,
    minHeight: "38px",
    height: "38px",
    fontSize: "0.9rem",
    borderColor: s.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: s.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.25)" : "none",
    "&:hover": { borderColor: s.isFocused ? "#3b82f6" : "#9ca3af" },
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: s.isDisabled ? "#f3f4f6" : "#ffffff",
    opacity: s.isDisabled ? 0.7 : 1,
  }),
  valueContainer: (p) => ({ ...p, height: "38px", padding: "0 10px" }),
  input: (p) => ({ ...p, margin: "0", padding: "0" }),
  indicatorSeparator: () => ({ display: "none" }),
  indicatorsContainer: (p) => ({ ...p, height: "38px" }),
  option: (p, s) => ({
    ...p,
    backgroundColor: s.isSelected ? "#3b82f6" : s.isFocused ? "#e9ecef" : "#fff",
    color: s.isSelected ? "#fff" : s.isFocused ? "#000" : "#495057",
    padding: "8px 12px",
    fontSize: "0.9rem",
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  menu: (p) => ({
    ...p,
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    zIndex: 1101,
  }),
  menuList: (p) => ({
    ...p,
    maxHeight: "180px",
    overflowY: "auto",
    padding: "4px 0",
  }),
  placeholder: (p) => ({ ...p, color: "#9ca3af", fontSize: "0.9rem" }),
  singleValue: (p) => ({ ...p, color: "#1f2937" }),
};

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
`;

const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  gap: 0.7rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  flex-shrink: 0;
`;

const Button = styled.button`
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 100px;
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

const PrimaryButton = styled(Button)`
  background-color: #10b981;
  color: white;
  &:hover:not(:disabled) {
    background-color: #059669;
  }
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
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

// --- Component Logic ---
const CreatePalletCountingModal = ({
  isOpen,
  onClose,
  onSave,
  apiBaseUrl,
  token,
  projects,
}) => {
  // --- State ---
  const [selectedProject, setSelectedProject] = useState(null);
  const [fetchedDepositAmount, setFetchedDepositAmount] = useState(null);
  const [isFetchingDeposit, setIsFetchingDeposit] = useState(false);
  const [dcQebulSayi, setDcQebulSayi] = useState("");
  const [dcTehvilSayi, setDcTehvilSayi] = useState("");
  const [depozitQaligi, setDepozitQaligi] = useState("");
  const [calculatedQaliqAvto, setCalculatedQaliqAvto] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Store Management kontrolü
  const isStoreManagement = projects?.length === 1;

  // Sayı formatlama
  const formatNumber = useCallback((number) => {
    if (number == null || isNaN(number)) return "N/A";
    return number.toLocaleString("az-AZ");
  }, []);

  // Depozito getirme
  const fetchDepositForProject = useCallback(
    async (projectId) => {
      if (!projectId || !token) {
        setFetchedDepositAmount(null);
        return;
      }
      setIsFetchingDeposit(true);
      setFetchedDepositAmount(null);
      setError("");
      const effectiveApiBaseUrl = apiBaseUrl || API_BASE_URL;
      const fetchUrl = `${effectiveApiBaseUrl}/api/PalletDeposit?projectId=${projectId}`;
      try {
        const response = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          if (response.status === 404) {
            setFetchedDepositAmount(0);
            console.warn(`No PalletDeposit for ProjectId ${projectId}.`);
          } else {
            let errorMsg = `Deposit fetch failed: ${response.status}`;
            try {
              const errData = await response.json();
              errorMsg = errData?.Message || errorMsg;
            } catch {}
            throw new Error(errorMsg);
          }
        } else {
          const data = await response.json();
          let depositValue = null;
          if (data && typeof data === "object") {
            if (data.Deposit != null) depositValue = data.Deposit;
            else if (
              Array.isArray(data) &&
              data.length > 0 &&
              data[0]?.PalletDeposits &&
              Array.isArray(data[0].PalletDeposits) &&
              data[0].PalletDeposits.length > 0
            )
              depositValue = data[0].PalletDeposits[0]?.Deposit;
            else if (
              Array.isArray(data) &&
              data.length > 0 &&
              data[0]?.Deposit != null
            )
              depositValue = data[0].Deposit;
          }
          setFetchedDepositAmount(depositValue ?? 0);
        }
      } catch (err) {
        console.error("Fetch deposit error:", err);
        setError(`Deposit fetch err: ${err.message}`);
        setFetchedDepositAmount(null);
      } finally {
        setIsFetchingDeposit(false);
      }
    },
    [token, apiBaseUrl]
  );

  // Proje seçimi değişince depozitoyu getir ve hesaplamayı sıfırla
  const handleProjectChange = useCallback(
    (option) => {
      if (!isStoreManagement) {
        setSelectedProject(option);
        setCalculatedQaliqAvto(null);
        if (option && option.value) {
          fetchDepositForProject(option.value);
        } else {
          setFetchedDepositAmount(null);
          setIsFetchingDeposit(false);
        }
      }
    },
    [fetchDepositForProject, isStoreManagement]
  );

  // Proje opsiyonları
  const projectOptions = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects;
  }, [projects]);

  // Modal kapanınca/açılınca state sıfırla
  useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
      setFetchedDepositAmount(null);
      setIsFetchingDeposit(false);
      setDcQebulSayi("");
      setDcTehvilSayi("");
      setDepozitQaligi("");
      setCalculatedQaliqAvto(null);
      setError("");
      setIsLoading(false);
    } else {
      // Açılırken
      setSelectedProject(null);
      setFetchedDepositAmount(null);
      setIsFetchingDeposit(false);
      setDcQebulSayi("");
      setDcTehvilSayi("");
      setDepozitQaligi("");
      setCalculatedQaliqAvto(null);
      setError("");
      // Store Management için otomatik proje seçimi
      if (isStoreManagement && Array.isArray(projects) && projects.length === 1) {
        setSelectedProject(projects[0]);
        fetchDepositForProject(projects[0].value);
      }
    }
  }, [isOpen, isStoreManagement, projects, fetchDepositForProject]);

  // Qalıq Avto’yu Hesaplama Effect’i
  useEffect(() => {
    const deposit = fetchedDepositAmount;
    const qebulStr = dcQebulSayi;
    const tehvilStr = dcTehvilSayi;

    const qebul = parseInt(qebulStr, 10);
    const tehvil = parseInt(tehvilStr, 10);

    if (
      deposit != null &&
      !isNaN(deposit) &&
      !isNaN(qebul) &&
      qebulStr.trim() !== "" &&
      qebul >= 0 &&
      !isNaN(tehvil) &&
      tehvilStr.trim() !== "" &&
      tehvil >= 0
    ) {
      const qaliqAuto = deposit + qebul - tehvil;
      setCalculatedQaliqAvto(qaliqAuto);
    } else {
      setCalculatedQaliqAvto(null);
    }
  }, [fetchedDepositAmount, dcQebulSayi, dcTehvilSayi]);

  // Buton disable durumu
  const isActionDisabled = isLoading || isFetchingDeposit;
  const isFormComplete =
    selectedProject &&
    dcQebulSayi.trim() !== "" &&
    dcTehvilSayi.trim() !== "" &&
    depozitQaligi.trim() !== "";

  // Form Submit
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!selectedProject) {
      setError("Please select a project.");
      showToast("Select project.", "error");
      return;
    }
    const qebul = parseInt(dcQebulSayi, 10);
    const tehvil = parseInt(dcTehvilSayi, 10);
    const qaliq = parseInt(depozitQaligi, 10);
    if (isNaN(qebul) || dcQebulSayi.trim() === "" || qebul < 0) {
      setError("Invalid DC Qəbul.");
      showToast("Invalid DC Qəbul.", "error");
      return;
    }
    if (isNaN(tehvil) || dcTehvilSayi.trim() === "" || tehvil < 0) {
      setError("Invalid DC Təhvil.");
      showToast("Invalid DC Təhvil.", "error");
      return;
    }
    if (isNaN(qaliq) || depozitQaligi.trim() === "" || qaliq < 0) {
      setError("Invalid Depozit Qalığı.");
      showToast("Invalid Dep. Qalığı.", "error");
      return;
    }
    setIsLoading(true);
    const payload = {
      ProjectId: parseInt(selectedProject.value, 10),
      DCQəbulPaletSayı: qebul,
      DCTəhvilPaletSayı: tehvil,
      DepozitPaletQalığı: qaliq,
    };
    const effectiveApiBaseUrl = apiBaseUrl || API_BASE_URL;
    const fetchUrl = `${effectiveApiBaseUrl}/api/PalletCounting`;
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
      try {
        if (response.headers.get("content-type")?.includes("application/json"))
          responseData = await response.json();
        else if (!response.ok)
          throw new Error(
            (await response.text()) || `HTTP Error ${response.status}`
          );
      } catch (parseError) {
        if (!response.ok) throw new Error(`HTTP Error ${response.status}.`);
        responseData = { IsSuccess: true, Message: "OK (non-JSON)." };
      }
      if (!response.ok || !responseData.IsSuccess)
        throw new Error(responseData?.Message || `Request failed.`);
      showToast(responseData.Message || "Record created!", "success");
      if (onSave) onSave(responseData);
      onClose();
    } catch (err) {
      console.error("Create Pallet Counting error:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Render
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>
            <FaBoxes size={18} /> Create Pallet Counting
          </Title>
          <CloseButton
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <FaTimes size={16} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorMessage>
              <FaExclamationCircle size={14} /> {error}
            </ErrorMessage>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            {/* Project Selection */}
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="projectSelect">
                  <FaProjectDiagram size={13} /> Project
                </Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Select
                inputId="projectSelect"
                options={projectOptions}
                value={selectedProject}
                onChange={handleProjectChange}
                placeholder="Select a project..."
                styles={reactSelectStyles}
                isClearable={!isStoreManagement}
                isSearchable={!isStoreManagement}
                isLoading={
                  !projectOptions ||
                  (projectOptions.length === 0 && projects === undefined)
                }
                isDisabled={
                  isActionDisabled ||
                  !projectOptions ||
                  projectOptions.length === 0 ||
                  isStoreManagement
                }
                aria-required="true"
                aria-label="Select a project"
                noOptionsMessage={() => "No projects available"}
              />
            </FormGroup>

            {/* Fetched Deposit Amount (Read Only) */}
            <FormGroup>
              <LabelWrapper>
                <Label>
                  <FaInfoCircle size={13} /> Depozit Sayı (Auto)
                </Label>
              </LabelWrapper>
              <ReadOnlyInfo
                title={
                  fetchedDepositAmount !== null
                    ? `Fetched: ${formatNumber(fetchedDepositAmount)}`
                    : "Select project first"
                }
              >
                {isFetchingDeposit ? (
                  <>
                    <SmallSpinner /> Loading...
                  </>
                ) : selectedProject ? (
                  fetchedDepositAmount !== null ? (
                    formatNumber(fetchedDepositAmount)
                  ) : (
                    "Not Found / N/A"
                  )
                ) : (
                  "-"
                )}
              </ReadOnlyInfo>
            </FormGroup>

            {/* DC Qəbul Palet Sayı */}
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="dcQebulSayi">
                  <FaArrowDown size={12} color="#34d399" /> DC Qəbul Palet Sayı
                </Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Input
                type="number"
                id="dcQebulSayi"
                value={dcQebulSayi}
                onChange={(e) => setDcQebulSayi(e.target.value)}
                placeholder="e.g., 10"
                required
                min="0"
                step="1"
                disabled={isLoading}
                aria-required="true"
                aria-label="DC Accepted Pallet Count"
              />
            </FormGroup>

            {/* DC Təhvil Palet Sayı */}
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="dcTehvilSayi">
                  <FaArrowUp size={12} color="#f87171" /> DC Təhvil Palet Sayı
                </Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Input
                type="number"
                id="dcTehvilSayi"
                value={dcTehvilSayi}
                onChange={(e) => setDcTehvilSayi(e.target.value)}
                placeholder="e.g., 5"
                required
                min="0"
                step="1"
                disabled={isLoading}
                aria-required="true"
                aria-label="DC Delivered Pallet Count"
              />
            </FormGroup>

            {/* Depozit Palet Qalığı (Manual) */}
            <FormGroup>
              <LabelWrapper>
                <Label htmlFor="depozitQaligi">
                  <FaClipboardList size={13} /> Depozit Palet Qalığı (Manual)
                </Label>
                <RequiredStar>*</RequiredStar>
              </LabelWrapper>
              <Input
                type="number"
                id="depozitQaligi"
                value={depozitQaligi}
                onChange={(e) => setDepozitQaligi(e.target.value)}
                placeholder="e.g., 15"
                required
                min="0"
                step="1"
                disabled={isLoading}
                aria-required="true"
                aria-label="Manual Deposit Pallet Remainder"
              />
            </FormGroup>

            {/* Calculated Qalıq Avto (Read Only) */}
            <FormGroup>
              <LabelWrapper>
                <Label>
                  <FaCalculator size={13} /> Qalıq (Avto) - Calculated
                </Label>
              </LabelWrapper>
              <ReadOnlyInfo
                className={calculatedQaliqAvto != null ? "calculated" : ""}
                title={
                  calculatedQaliqAvto != null
                    ? `Auto Remainder: ${formatNumber(calculatedQaliqAvto)}`
                    : "Enter values above"
                }
              >
                {calculatedQaliqAvto != null
                  ? formatNumber(calculatedQaliqAvto)
                  : "---"}
              </ReadOnlyInfo>
            </FormGroup>
          </Form>
        </ModalBody>

        <ModalFooter>
          <SecondaryButton
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cancel"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            onClick={handleSubmit}
            disabled={isActionDisabled || !isFormComplete}
            aria-label="Create pallet counting record"
          >
            {isLoading ? <StyledSpinner size={14} /> : <FaPlus size={12} />}
            {isLoading ? "Creating..." : "Create"}
          </PrimaryButton>
        </ModalFooter>

        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreatePalletCountingModal;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import Select from "react-select";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import {
    FaTimes, FaSpinner, FaSave, FaExclamationCircle, FaBoxes, FaProjectDiagram,
    FaArrowDown, FaArrowUp, FaClipboardList, FaInfoCircle, FaCalendarAlt, FaUser,
    FaCalculator, FaLock // Kilit ikonu (isteğe bağlı)
} from "react-icons/fa";

// --- Stiller (Önceki Edit Modal ile aynı, değişiklik yok) ---
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background-color: rgba(17, 24, 39, 0.75);
  backdrop-filter: blur(3px); display: flex; align-items: center;
  justify-content: center; z-index: 1100; padding: 1rem;
  opacity: 0; animation: ${fadeIn} 0.3s ease-out forwards;
`;

const ModalContent = styled.div`
  background: #ffffff; border-radius: 12px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  width: 100%; max-width: 550px;
  max-height: 97vh;
  display: flex; flex-direction: column; overflow: hidden;
  opacity: 0; transform: scale(0.98);
  animation: ${scaleUp} 0.3s 0.1s ease-out forwards;
`;

const ModalHeader = styled.header`
  padding: 1rem 1.5rem; display: flex; justify-content: space-between;
  align-items: center; border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0; font-size: 1.15rem; color: #111827; font-weight: 600;
  display: flex; align-items: center; gap: 0.6rem;
`;

const Subtitle = styled.span`
  font-size: 0.8rem; color: #6b7280; margin-left: 0.5rem; font-weight: 400;
`;

const CloseButton = styled.button`
  background: transparent; border: none; color: #6b7280; cursor: pointer;
  padding: 0.4rem; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; transition: background-color 0.2s ease, color 0.2s ease;
  &:hover { background-color: #f3f4f6; color: #1f2937; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ModalBody = styled.div`
  padding: 1.5rem; overflow-y: auto; flex-grow: 1;
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1.3rem 1.2rem; align-items: start;
  @media (max-width: 600px) { grid-template-columns: 1fr; }
`;

const Form = styled.form`
  grid-column: 1 / -1; display: contents;
`;

const FormGroup = styled.div`
  display: flex; flex-direction: column; gap: 0.4rem;
`;

const LabelWrapper = styled.div`
  display: flex; align-items: center; gap: 0.3rem;
`;

const Label = styled.label`
  font-weight: 500; color: #374151; font-size: 0.85rem;
  display: flex; align-items: center; gap: 0.4rem;
`;

const RequiredStar = styled.span`
  color: #ef4444; font-size: 0.85rem;
`;

const sharedInputStyles = `
  padding: 0.6rem 0.8rem; border: 1px solid #d1d5db; border-radius: 6px;
  font-size: 0.9rem; color: #1f2937; background-color: #ffffff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  width: 100%; box-sizing: border-box;
  &:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); }
  &:disabled { background-color: #f3f4f6; cursor: not-allowed; opacity: 0.7; color: #6b7280; } /* Disable rengi belirginleştirildi */
`;

const Input = styled.input`
  ${sharedInputStyles}
  &::placeholder { color: #9ca3af; }
`;

const ReadOnlyInfo = styled.div`
  ${sharedInputStyles}
  background-color: #f8f9fa; color: #495057; cursor: default;
  display: flex; align-items: center; gap: 0.4rem;
  font-weight: 500; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; border-color: #e9ecef;
  height: 38px;

  &:focus { border-color: #e9ecef; box-shadow: none; }
  svg { color: #6c757d; }

  &.calculated { font-weight: 600; color: #059669; background-color: #f0fdf4; border-color: #a7f3d0; }
`;

const reactSelectStyles = { /* Stil aynı */
  control: (p, s) => ({ ...p, minHeight: "38px", height: "38px", fontSize: "0.9rem", borderColor: s.isFocused ? "#3b82f6" : s.isDisabled ? '#e9ecef' : '#d1d5db', boxShadow: s.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.25)" : "none", "&:hover": { borderColor: s.isFocused ? "#3b82f6" : s.isDisabled ? '#e9ecef' : '#9ca3af' }, borderRadius: "6px", cursor: s.isDisabled ? 'not-allowed' : 'pointer', backgroundColor: s.isDisabled ? "#f3f4f6" : "#ffffff", opacity: s.isDisabled ? 0.7 : 1 }),
  valueContainer: (p) => ({ ...p, height: "38px", padding: "0 10px" }),
  input: (p) => ({ ...p, margin: "0", padding: "0" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (p, s) => ({ ...p, color: s.isDisabled ? '#adb5bd' : '#cccccc' }), // Disable ikonu rengi
  indicatorsContainer: (p) => ({ ...p, height: "38px" }),
  option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? "#3b82f6" : s.isFocused ? "#e9ecef" : "#fff", color: s.isSelected ? "#fff" : s.isFocused ? "#000" : "#495057", padding: "8px 12px", fontSize: "0.9rem", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }),
  menu: (p) => ({ ...p, borderRadius: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 1101 }),
  menuList: (p) => ({ ...p, maxHeight: "180px", overflowY: "auto", padding: "4px 0" }),
  placeholder: (p) => ({ ...p, color: "#9ca3af", fontSize: "0.9rem" }),
  singleValue: (p, s) => ({ ...p, color: s.isDisabled ? '#6b7280' : '#1f2937' }), // Disable yazı rengi
};

const ErrorMessage = styled.div`
  grid-column: 1 / -1; display: flex; align-items: center; gap: 0.5rem;
  color: #ef4444; background-color: #fee2e2; border: 1px solid #fca5a5;
  padding: 0.6rem 0.9rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500;
`;

const ModalFooter = styled.footer`
  grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.7rem;
  padding: 1rem 1.5rem; border-top: 1px solid #e5e7eb; background-color: #f9fafb;
  flex-shrink: 0;
`;

const Button = styled.button` /* Stil aynı */
  padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 600;
  border-radius: 6px; border: none; cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
  display: inline-flex; align-items: center; justify-content: center;
  gap: 0.5rem; min-width: 100px; line-height: 1.3;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
`;

const PrimaryButton = styled(Button)` /* Yeşil tonu */
  background-color: #10b981; color: white;
  &:hover:not(:disabled) { background-color: #059669; }
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3); }
`;

const SecondaryButton = styled(Button)` /* Stil aynı */
  background-color: #ffffff; color: #374151; border: 1px solid #d1d5db;
  &:hover:not(:disabled) { background-color: #f9fafb; border-color: #9ca3af; }
  &:focus { outline: none; box-shadow: 0 0 0 3px rgba(209, 213, 219, 0.6); }
`;

const StyledSpinner = styled(FaSpinner)` animation: ${spin} 1s linear infinite; `;

// --- Component Logic ---
const EditPalletCountingModal = ({ isOpen, onClose, onSave, apiBaseUrl, token, initialData, projects }) => {
    // --- State ---
    const [selectedProject, setSelectedProject] = useState(null); // Hala state'te tutuyoruz ama UI'dan değiştirilemeyecek
    const [dcQebulSayi, setDcQebulSayi] = useState("");
    const [dcTehvilSayi, setDcTehvilSayi] = useState("");
    const [depozitQaligi, setDepozitQaligi] = useState("");
    const [calculatedQaliqAvto, setCalculatedQaliqAvto] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // --- Helper Functions ---
    const formatNumber = useCallback((number) => { if (number == null || isNaN(number)) return "N/A"; return number.toLocaleString("az-AZ"); }, []);
    const formatDate = useCallback((dateString) => { if (!dateString) return "N/A"; try { return new Date(dateString).toLocaleString("az-AZ", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return "Invalid Date"; } }, []);

    // --- Effects ---
    // Formu ilk verilerle doldur
    useEffect(() => {
        if (isOpen && initialData) {
            setDcQebulSayi(initialData.DCQəbulPaletSayı?.toString() ?? "");
            setDcTehvilSayi(initialData.DCTəhvilPaletSayı?.toString() ?? "");
            setDepozitQaligi(initialData.DepozitPaletQalığı?.toString() ?? "");
            const currentProjectOption = projects?.find(p => p.value === initialData.ProjectId?.toString());
            setSelectedProject(currentProjectOption || null); // State'i yine de dolduruyoruz
            setCalculatedQaliqAvto(initialData.QalıqAvto ?? null);
            setError(""); setIsLoading(false);
        } else if (!isOpen) {
            setSelectedProject(null); setDcQebulSayi(""); setDcTehvilSayi(""); setDepozitQaligi("");
            setCalculatedQaliqAvto(null); setError(""); setIsLoading(false);
        }
    }, [isOpen, initialData, projects]);

    // Proje opsiyonları
    const projectOptions = useMemo(() => { if (!Array.isArray(projects)) return []; return projects; }, [projects]);

     // Edit için Qalıq Avto Hesaplama
     useEffect(() => {
        const deposit = initialData?.DepositPaletSayı; const qebulStr = dcQebulSayi; const tehvilStr = dcTehvilSayi;
        const qebul = parseInt(qebulStr, 10); const tehvil = parseInt(tehvilStr, 10);
        if (deposit != null && !isNaN(deposit) && !isNaN(qebul) && qebulStr.trim() !== "" && qebul >= 0 && !isNaN(tehvil) && tehvilStr.trim() !== "" && tehvil >= 0) {
            setCalculatedQaliqAvto(deposit + qebul - tehvil);
        } else {
            setCalculatedQaliqAvto(null);
        }
     }, [initialData?.DepositPaletSayı, dcQebulSayi, dcTehvilSayi]);

    // Değişiklik Kontrolü (Project kontrolü kaldırıldı)
    const hasChanges = useMemo(() => {
        if (!initialData) return false;
        const initialQebulStr = initialData.DCQəbulPaletSayı?.toString() ?? "";
        const initialTehvilStr = initialData.DCTəhvilPaletSayı?.toString() ?? "";
        const initialQaliqStr = initialData.DepozitPaletQalığı?.toString() ?? "";
        // Sadece değiştirilebilir alanları kontrol et
        return ( dcQebulSayi !== initialQebulStr || dcTehvilSayi !== initialTehvilStr || depozitQaligi !== initialQaliqStr );
    }, [initialData, dcQebulSayi, dcTehvilSayi, depozitQaligi]);

    // Form Gönderme
    const handleSubmit = async (event) => {
        event.preventDefault(); setError("");
        if (!initialData?.Id) { setError("Missing ID."); return; }
        // Project seçimi kontrolüne gerek yok, zaten disable ve initialData'dan geliyor
        const qebul = parseInt(dcQebulSayi, 10); const tehvil = parseInt(dcTehvilSayi, 10); const qaliq = parseInt(depozitQaligi, 10);
        if (isNaN(qebul) || qebul < 0) { setError("Invalid DC Qəbul."); return; }
        if (isNaN(tehvil) || tehvil < 0) { setError("Invalid DC Təhvil."); return; }
        if (isNaN(qaliq) || qaliq < 0) { setError("Invalid Dep. Qalığı."); return; }
        if (!hasChanges) { showToast("No changes detected.", "info"); return; }
        setIsLoading(true);
        // **Payload'a Proje ID'yi initialData'dan alarak ekle**
        const payload = { Id: initialData.Id, ProjectId: initialData.ProjectId, // Proje ID artık initialData'dan geliyor
            DCQəbulPaletSayı: qebul, DCTəhvilPaletSayı: tehvil, DepozitPaletQalığı: qaliq };
        const effectiveApiBaseUrl = apiBaseUrl || API_BASE_URL;
        const fetchUrl = `${effectiveApiBaseUrl}/api/PalletCounting`;
        try {
            const response = await fetch(fetchUrl, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, Accept: "application/json" }, body: JSON.stringify(payload) });
            let responseData = {};
            try { if (response.headers.get("content-type")?.includes("application/json")) responseData = await response.json(); else if (!response.ok) throw new Error(await response.text() || `HTTP Error ${response.status}`); } catch (parseError) { if (!response.ok) throw new Error(`HTTP Error ${response.status}.`); responseData = { IsSuccess: true, Message: "OK (non-JSON)." }; }
            if (!response.ok || !responseData.IsSuccess) throw new Error(responseData?.Message || `Update failed.`);
            showToast(responseData.Message || "Record updated!", "success");
            if (onSave) {
                 const updatedRecord = { ...initialData, ...payload, QalıqAvto: responseData.QalıqAvto ?? calculatedQaliqAvto, };
                onSave(updatedRecord);
            }
            onClose();
        } catch (err) { console.error("Update Error:", err); setError(err.message || "Update failed."); showToast(err.message || "Update failed.", "error"); }
        finally { setIsLoading(false); }
    };

    // Render
    if (!isOpen || !initialData) return null;
    const displayValue = (value, fallback = "N/A") => value ?? fallback;

    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <Title><FaBoxes size={18} /> Edit Pallet Counting <Subtitle>(ID: {initialData.Id})</Subtitle></Title>
                    <CloseButton onClick={onClose} disabled={isLoading} aria-label="Close modal"><FaTimes size={16} /></CloseButton>
                </ModalHeader>

                <ModalBody>
                    {error && ( <ErrorMessage><FaExclamationCircle size={14} /> {error}</ErrorMessage> )}
                    <Form id="edit-pallet-counting-form" onSubmit={handleSubmit} noValidate>
                        {/* Project Selection (DISABLED) */}
                        <FormGroup style={{ gridColumn: '1 / -1' }}>
                            <LabelWrapper><Label htmlFor="projectSelect"><FaProjectDiagram size={13} /> Project</Label><FaLock size={10} color="#6b7280" title="Cannot be changed"/></LabelWrapper>
                            <Select
                                inputId="projectSelect"
                                value={selectedProject} // Değeri gösterir
                                options={projectOptions} // Liste yine de bulunsun (opsiyonel)
                                styles={reactSelectStyles}
                                isDisabled={true} // <<<--- DEĞİŞİKLİK: Disabled yapıldı
                                aria-label="Project (read-only)"
                                // onChange gerekmiyor
                                // isClearable={false} // Temizleme butonu olmasın
                                // isSearchable={false} // Arama olmasın
                                menuIsOpen={false} // Menü hiç açılmasın
                            />
                        </FormGroup>

                        {/* Input Alanları */}
                        <FormGroup>
                            <LabelWrapper><Label htmlFor="dcQebulSayi"><FaArrowDown size={12} color="#34d399"/> DC Qəbul</Label><RequiredStar>*</RequiredStar></LabelWrapper>
                            <Input type="number" id="dcQebulSayi" value={dcQebulSayi} onChange={(e) => setDcQebulSayi(e.target.value)} placeholder="e.g., 10" required min="0" step="1" disabled={isLoading} aria-required="true" aria-label="DC Accepted Pallet Count"/>
                        </FormGroup>
                        <FormGroup>
                            <LabelWrapper><Label htmlFor="dcTehvilSayi"><FaArrowUp size={12} color="#f87171"/> DC Təhvil</Label><RequiredStar>*</RequiredStar></LabelWrapper>
                            <Input type="number" id="dcTehvilSayi" value={dcTehvilSayi} onChange={(e) => setDcTehvilSayi(e.target.value)} placeholder="e.g., 5" required min="0" step="1" disabled={isLoading} aria-required="true" aria-label="DC Delivered Pallet Count"/>
                        </FormGroup>
                        <FormGroup>
                            <LabelWrapper><Label htmlFor="depozitQaligi"><FaClipboardList size={13} /> Dep. Qalığı (Man)</Label><RequiredStar>*</RequiredStar></LabelWrapper>
                            <Input type="number" id="depozitQaligi" value={depozitQaligi} onChange={(e) => setDepozitQaligi(e.target.value)} placeholder="e.g., 15" required min="0" step="1" disabled={isLoading} aria-required="true" aria-label="Manual Deposit Pallet Remainder"/>
                        </FormGroup>

                         {/* Hesaplanan Alan */}
                        <FormGroup>
                            <LabelWrapper><Label><FaCalculator size={13} /> Qalıq (Avto) - Calculated</Label></LabelWrapper>
                            <ReadOnlyInfo className={calculatedQaliqAvto != null ? 'calculated' : ''} title={calculatedQaliqAvto != null ? `Calculated: ${formatNumber(calculatedQaliqAvto)}` : 'Recalculating...'}>
                                {calculatedQaliqAvto != null ? formatNumber(calculatedQaliqAvto) : '---'}
                            </ReadOnlyInfo>
                        </FormGroup>

                        {/* Diğer Okunur Alanlar */}
                        <FormGroup>
                             <Label><FaInfoCircle size={13} /> Depozit Sayı (Auto)</Label>
                             <ReadOnlyInfo title={displayValue(initialData.DepositPaletSayı)}>{displayValue(formatNumber(initialData.DepositPaletSayı), "N/A")}</ReadOnlyInfo>
                         </FormGroup>
                         <FormGroup>
                             <Label><FaInfoCircle size={13} /> Qalıq Avto (Original)</Label>
                             <ReadOnlyInfo title={displayValue(initialData.QalıqAvto)}>{displayValue(formatNumber(initialData.QalıqAvto), "N/A")}</ReadOnlyInfo>
                         </FormGroup>
                         <FormGroup>
                             <Label><FaCalendarAlt size={13} /> Created</Label>
                             <ReadOnlyInfo title={formatDate(initialData.CreatedDate)}>{formatDate(initialData.CreatedDate)}</ReadOnlyInfo>
                         </FormGroup>
                         <FormGroup>
                             <Label><FaUser size={13} /> Created By</Label>
                             <ReadOnlyInfo title={displayValue(initialData.CreatedBy)}>{displayValue(initialData.CreatedBy)}</ReadOnlyInfo>
                         </FormGroup>
                          {initialData.ModifiedDate && ( <FormGroup><Label><FaCalendarAlt size={13} /> Modified</Label><ReadOnlyInfo title={formatDate(initialData.ModifiedDate)}>{formatDate(initialData.ModifiedDate)}</ReadOnlyInfo></FormGroup> )}
                          {initialData.ModifiedBy && ( <FormGroup><Label><FaUser size={13} /> Modified By</Label><ReadOnlyInfo title={displayValue(initialData.ModifiedBy)}>{displayValue(initialData.ModifiedBy)}</ReadOnlyInfo></FormGroup> )}
                     </Form>

                </ModalBody>

                <ModalFooter>
                    <SecondaryButton type="button" onClick={onClose} disabled={isLoading} aria-label="Cancel">Cancel</SecondaryButton>
                    <PrimaryButton type="submit" form="edit-pallet-counting-form" disabled={isLoading || !hasChanges} aria-label="Update pallet counting record">
                        {isLoading ? (<StyledSpinner size={14} />) : (<FaSave size={12} />)}
                        {isLoading ? "Saving..." : "Save Changes"}
                    </PrimaryButton>
                </ModalFooter>

                <ToastContainer />
            </ModalContent>
        </ModalOverlay>
    );
};

export default EditPalletCountingModal;
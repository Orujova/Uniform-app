import React, { useState, useEffect, useCallback } from "react";
import styled, { keyframes } from "styled-components";
import Select from "react-select";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import {
  FaTimes,
  FaSave,
  FaSpinner, // Spinner ikonunu ekleyelim
  FaPlusCircle,
  FaTrashAlt,
  FaProjectDiagram,
  FaTags,
  FaShoppingCart,
  FaInfoCircle,
  FaImage, // Placeholder
  FaExclamationTriangle, // Hata ikonu
} from "react-icons/fa";

// --- Stiller ---
const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const scaleUp = keyframes`from { transform: scale(0.98); opacity: 0.7; } to { transform: scale(1); opacity: 1; }`;
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;

const ModalOverlay = styled.div`
  position: fixed; inset: 0; background-color: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 1rem; opacity: 0; animation: ${fadeIn} 0.3s ease-out forwards;
`;
const ModalContent = styled.div`
  background: #ffffff; border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  width: 100%; max-width: 720px; /* Biraz daha geniş modal */
  display: flex; flex-direction: column; overflow: hidden; opacity: 0;
  transform: scale(0.98); animation: ${scaleUp} 0.35s 0.1s ease-out forwards;
`;
const ModalHeader = styled.header`
  padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #e5e7eb; flex-shrink: 0;
`;
const Title = styled.h2`
  margin: 0; font-size: 1.15rem; color: #111827; font-weight: 600;
  display: flex; align-items: center; gap: 0.5rem;
`;
const CloseButton = styled.button`
  background: transparent; border: none; color: #6b7280; cursor: pointer; padding: 0.4rem;
  margin: -0.4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  transition: background-color 0.2s ease, color 0.2s ease;
  &:hover { background-color: #f3f4f6; color: #1f2937; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const ModalBody = styled.div`
  padding: 1.25rem 1.5rem; overflow-y: auto; flex-grow: 1; max-height: calc(80vh - 110px); /* Biraz daha fazla dikey alan */
  display: flex; flex-direction: column; gap: 1rem; /* Genel boşluk azaltıldı */
`;

// --- İki Sütunlu Yapı ---
const TopSectionContainer = styled.div`
  display: flex;
  gap: 1.5rem; // Sütunlar arası boşluk
  width: 100%;
  padding-bottom: 1rem; // Altındaki formdan ayırmak için
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb; // Ayırıcı çizgi
`;
const LeftColumn = styled.div`
  flex: 0 0 70%; // Sol sütun %60
  display: flex;
  flex-direction: column;
  gap: 1rem; // Input grupları arası boşluk
`;
const RightColumn = styled.div`
  flex: 0 0 30%; // Sağ sütun %40
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; // Yukarıdan başlasın
  padding-top: 2.2rem; // Etiketle (~ label height + gap) hizalamak için ayarlama gerekebilir
`;
// --- ---

const Form = styled.form` // Sayım, buton ve listeyi kapsar
  display: flex;
  flex-direction: column;
  gap: 1rem; // Elemanlar arası boşluk
`;
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 0.4rem; `;
const Label = styled.label` font-weight: 500; color: #374151; font-size: 0.85rem; display: flex; align-items: center; gap: 0.3rem; margin-bottom: 2px; /* Input ile arasındaki boşluğu azalt */`;
const sharedInputStyles = ` padding: 0.60rem 0.8rem; /* Biraz daha kompakt input */ border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.85rem; color: #1f2937; background-color: #ffffff; transition: border-color 0.2s ease, box-shadow 0.2s ease; width: 100%; box-sizing: border-box; &:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25); } &:disabled { background-color: #f3f4f6; cursor: not-allowed; color: #6b7280; } &::placeholder { color: #9ca3af; } `;
const Input = styled.input`${sharedInputStyles}`;
const CountInputGroup = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; `;
const reactSelectStyles = { /* ... önceki stillemeler ama daha kompakt olabilir ... */
    control: (p, s) => ({ ...p, minHeight: "38px", height: "38px", fontSize: "0.85rem", borderColor: s.isFocused ? "#3b82f6" : "#d1d5db", boxShadow: s.isFocused ? "0 0 0 2px rgba(59, 130, 246, 0.25)" : "none", "&:hover": { borderColor: s.isFocused ? "#3b82f6" : "#a5b4fc" }, borderRadius: "6px", cursor: "pointer", }),
    valueContainer: (p) => ({ ...p, height: "38px", padding: "0 8px" }), input: (p) => ({ ...p, margin: "0px", padding: "0px" }),
    indicatorSeparator: () => ({ display: "none" }), indicatorsContainer: (p) => ({ ...p, height: "38px" }),
    option: (p, s) => ({ ...p, backgroundColor: s.isSelected ? "#3b82f6" : s.isFocused ? "#eff6ff" : "#ffffff", color: s.isSelected ? "#ffffff" : "#1f2937", padding: "0.5rem 0.8rem", fontSize: "0.85rem", cursor: "pointer", "&:active": { backgroundColor: "#dbeafe" } }),
    menu: (p) => ({ ...p, borderRadius: "6px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", zIndex: 1150 }), menuList: (p) => ({ ...p, maxHeight: "150px", overflowY: "auto" }),
    placeholder: (p) => ({ ...p, color: "#9ca3af", fontSize: "0.85rem" }), singleValue: (p) => ({ ...p, color: "#1f2937" })
};

const LargeTypeImagePreview = styled.div`
  width: 100%; // Sağ sütunun tamamını doldur
  max-width: 110px; // Ama çok da büyümesin (isteğe bağlı)
  aspect-ratio: 1 / 1; // Kare oranını koru
  height: auto; // Yüksekliği otomatik ayarla
  border-radius: 10px; border: 1px solid #e5e7eb; background-color: #f8f9fa;
  display: flex; align-items: center; justify-content: center; overflow: hidden; color: #cbd5e1;
  position: relative; // Spinner için
  margin: 0 auto; // Sütun içinde yatay ortala

  svg { font-size: 3rem; }
  img { display: block; width: 100%; height: 100%; object-fit: contain; } // Contain daha iyi

  &.error { border-color: #fca5a5; color: #ef4444; background-color: #fee2e2; }
  &.loading { border-color: #9ca3af; background-color: #e5e7eb; color: #6b7280; }
`;
const PreviewSpinnerWrapper = styled.div` // Spinner ortalama
    position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex;
    align-items: center; justify-content: center; background-color: rgba(248, 250, 252, 0.7);
`;
const PreviewLabel = styled(Label)` // Resim altı etiket için
    font-size: 0.75rem;
    justify-content: center;
    margin-top: 0.4rem;
    color: #6b7280;
    text-align: center;
    &.error { color: #ef4444; font-weight: 600;}
`;

const AddButtonContainer = styled.div` display: flex; justify-content: flex-end; margin-top: 0.5rem; `;
const AddButton = styled.button` padding: 0.55rem 1rem; /* Daha kompakt buton */ font-size: 0.8rem; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; line-height: 1.3; background-color: #10b981; color: white; &:hover:not(:disabled) { background-color: #059669; transform: translateY(-1px); box-shadow: 0 3px 8px rgba(16, 185, 129, 0.1); } &:disabled { opacity: 0.6; cursor: not-allowed; background-color: #a1a1aa; } `;
const EntriesListContainer = styled.div` max-height: 150px; /* Liste yüksekliği azaltıldı */ overflow-y: auto; margin-top: 1rem; border: 1px solid #e5e7eb; border-radius: 6px; `;
const EntryItem = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.7rem; border-bottom: 1px solid #f3f4f6; /* Daha hafif çizgi */ font-size: 0.8rem; background-color: #ffffff; &:last-child { border-bottom: none; } `;
const EntryDetails = styled.div` display: flex; flex-wrap: wrap; gap: 0.3rem 0.8rem; flex-grow: 1; margin-right: 0.8rem; `;
const DetailSpan = styled.span` display: inline-flex; align-items: center; gap: 0.3rem; color: #4b5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; vertical-align: middle; strong { color: #1f2937; font-weight: 500; } &.working { svg { color: #16a34a; } } &.broken { svg { color: #dc2626; } } `;
const RemoveButton = styled.button` background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s ease; flex-shrink: 0; &:hover { background-color: #fee2e2; } `;
const NoEntriesMessage = styled.div` text-align: center; color: #6b7280; font-style: italic; padding: 1rem; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; height: 50px; /* Sabit yükseklik */ `;
const ErrorMessage = styled.div` color: #ef4444; background-color: #fee2e2; border: 1px solid #fca5a5; padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight: 500; text-align: center; `;
const ModalFooter = styled.footer` display: flex; justify-content: flex-end; gap: 0.6rem; padding: 0.9rem 1.5rem; border-top: 1px solid #e5e7eb; background-color: #f9fafb; flex-shrink: 0; `;
const Button = styled.button` padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 600; border-radius: 6px; border: none; cursor: pointer; transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease, border-color 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; min-width: 90px; line-height: 1.3; &:disabled { opacity: 0.6; cursor: not-allowed; } &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06); } `;
const PrimaryButton = styled(Button)` background-color: #3b82f6; color: white; &:hover:not(:disabled) { background-color: #2563eb; } &:focus { outline: none; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3); } `;
const SecondaryButton = styled(Button)` background-color: #ffffff; color: #374151; border: 1px solid #d1d5db; &:hover:not(:disabled) { background-color: #f9fafb; border-color: #9ca3af; } &:focus { outline: none; box-shadow: 0 0 0 2px rgba(209, 213, 219, 0.4); } `;
const StyledSpinner = styled(FaSpinner)` animation: ${spin} 1s linear infinite; `;

// --- Helper Function (Aynı) ---
const generateDisplayImageUrl = (backendUrl) => { if (!backendUrl || typeof backendUrl !== 'string' || !backendUrl.startsWith('http')) { return null; } try { const url = new URL(backendUrl); if (url.pathname.startsWith('/uploads/')) { return backendUrl; } const newPathname = `/uploads${url.pathname}`; return `${url.origin}${newPathname}`; } catch (e) { console.error("Err URL:", backendUrl, e); return null; } };

// --- Component Logic (Aynı) ---
const CreateTrolleyModal = ({ isOpen, onClose, onSaveSuccess, projects, trolleyTypes, apiBaseUrl = API_BASE_URL, token, }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTrolleyType, setSelectedTrolleyType] = useState(null);
  const [selectedTypeImageUrl, setSelectedTypeImageUrl] = useState(null);
  const [isImageTypeLoading, setIsImageTypeLoading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [workingCount, setWorkingCount] = useState("");
  const [brokenCount, setBrokenCount] = useState("");
  const [trolleyEntries, setTrolleyEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const clearTrolleyTypeSelection = useCallback(() => { setSelectedTrolleyType(null); setSelectedTypeImageUrl(null); setIsImageTypeLoading(false); setImageLoadError(false); }, []);
  useEffect(() => { if (!isOpen) { const timer = setTimeout(() => { setSelectedProject(null); clearTrolleyTypeSelection(); setWorkingCount(""); setBrokenCount(""); setTrolleyEntries([]); setError(""); setIsLoading(false); }, 300); return () => clearTimeout(timer); } }, [isOpen, clearTrolleyTypeSelection]);
  const fetchTrolleyTypeImage = useCallback(async (typeId) => { if (!typeId || !token) return; setIsImageTypeLoading(true); setImageLoadError(false); setSelectedTypeImageUrl(null); try { const response = await fetch(`${apiBaseUrl}/api/TrolleyType/${typeId}`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }); if (!response.ok) { console.error(`Failed fetch ${typeId}. Status: ${response.status}`); throw new Error(`HTTP ${response.status}`); } const typeData = await response.json(); const rawImageUrl = typeData.ImageUrl; const displayUrl = generateDisplayImageUrl(rawImageUrl); setSelectedTypeImageUrl(displayUrl); } catch (err) { console.error("Err fetch img:", err); setSelectedTypeImageUrl(null); } finally { setIsImageTypeLoading(false); } }, [apiBaseUrl, token]);
  const handleProjectChange = (selectedOption) => { setSelectedProject(selectedOption); };
  const handleTrolleyTypeChange = (selectedOption) => { setSelectedTrolleyType(selectedOption); if (selectedOption && selectedOption.value) { fetchTrolleyTypeImage(selectedOption.value); } else { setSelectedTypeImageUrl(null); setIsImageTypeLoading(false); setImageLoadError(false); } };
  const handleAddEntry = () => { setError(""); if (!selectedProject?.value || !selectedTrolleyType?.value) { const msg = "Select Project and Trolley Type."; showToast(msg, "warning"); setError(msg); return; } const working = parseInt(workingCount, 10); const broken = parseInt(brokenCount, 10); if (isNaN(working) || working < 0 || isNaN(broken) || broken < 0) { const msg = "Counts must be positive numbers."; showToast(msg, "error"); setError(msg); return; } if (working === 0 && broken === 0) { const msg = "Enter at least one count."; showToast(msg, "warning"); setError(msg); return; } const isDuplicate = trolleyEntries.some((entry) => entry.projectId === selectedProject.value && entry.trolleyTypeId === selectedTrolleyType.value); if (isDuplicate) { const msg = "Already added."; showToast(msg, "warning"); setError(msg); return; } const newEntry = { uniqueId: Date.now(), projectId: selectedProject.value, projectLabel: selectedProject.label, trolleyTypeId: selectedTrolleyType.value, typeLabel: selectedTrolleyType.label, workingCount: working, brokenCount: broken }; setTrolleyEntries((prevEntries) => [newEntry, ...prevEntries]); setSelectedProject(null); clearTrolleyTypeSelection(); setWorkingCount(""); setBrokenCount(""); };
  const handleRemoveEntry = (idToRemove) => { setTrolleyEntries((prevEntries) => prevEntries.filter((entry) => entry.uniqueId !== idToRemove)); setError(""); };
  const handleSubmit = async (event) => { event.preventDefault(); if (trolleyEntries.length === 0) { const msg = "Add records before saving."; showToast(msg, "warning"); setError(msg); return; } setIsLoading(true); setError(""); const formattedPayload = { Trolleys: trolleyEntries.map((entry) => ({ ProjectId: entry.projectId, TrolleyTypeId: entry.trolleyTypeId, WorkingTrolleysCount: entry.workingCount, BrokenTrolleysCount: entry.brokenCount })) }; try { const response = await fetch(`${apiBaseUrl}/api/Trolley`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(formattedPayload) }); const responseData = await response.json(); if (!response.ok) throw new Error(responseData.Message || responseData.title || `HTTP Error: ${response.status}`); showToast(responseData.Message || "Success!", "success"); if(onSaveSuccess) onSaveSuccess(responseData); onClose(); } catch (err) { console.error("Save error:", err); const errorMessage = err.message || "Unexpected save error."; setError(errorMessage); showToast(errorMessage, "error"); } finally { setIsLoading(false); } };

  if (!isOpen) return null;
  const isDataLoading = !projects || !trolleyTypes;
  const isActionDisabled = isLoading || isImageTypeLoading || isDataLoading;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader> <Title> <FaShoppingCart /> Add New Trolley Records </Title> <CloseButton onClick={onClose} disabled={isLoading} aria-label="Close"> <FaTimes size={16} /> </CloseButton> </ModalHeader>

        <ModalBody>
          {error && !error.includes("list before saving") && <ErrorMessage>{error}</ErrorMessage>}
          {isDataLoading && <ErrorMessage>Loading selection options...</ErrorMessage> }

          {/* İki Sütunlu Üst Alan */}
          <TopSectionContainer>
            <LeftColumn>
              <FormGroup>
                <Label htmlFor="trolleyProjectInput"> <FaProjectDiagram /> Project </Label>
                <Select id="trolleyProjectSelect" inputId="trolleyProjectInput" options={projects || []} value={selectedProject} onChange={handleProjectChange} placeholder="Select project..." styles={reactSelectStyles} isLoading={!projects} isDisabled={isActionDisabled} isClearable isSearchable aria-label="Select Project"/>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="trolleyTypeInput"> <FaTags /> Trolley Type </Label>
                <Select id="trolleyTypeSelect" inputId="trolleyTypeInput" options={trolleyTypes || []} value={selectedTrolleyType} onChange={handleTrolleyTypeChange} placeholder="Select type..." styles={reactSelectStyles} isLoading={!trolleyTypes} isDisabled={isActionDisabled} isClearable isSearchable aria-label="Select Trolley Type" />
              </FormGroup>
            </LeftColumn>
            <RightColumn>
              <LargeTypeImagePreview
                className={`${imageLoadError ? 'error' : ''} ${isImageTypeLoading ? 'loading' : ''}`}
                title={isImageTypeLoading ? "Loading image..." : (imageLoadError ? "Image load error" : (selectedTypeImageUrl ? (selectedTrolleyType?.label || 'Trolley Type') : "Select type to view image"))}>
                {isImageTypeLoading ? ( <PreviewSpinnerWrapper><StyledSpinner size={36}/></PreviewSpinnerWrapper> )
                : selectedTypeImageUrl && !imageLoadError ? ( <img src={selectedTypeImageUrl} alt={selectedTrolleyType?.label || 'Trolley type'} onError={() => setImageLoadError(true)}/> )
                : ( imageLoadError ? <FaExclamationTriangle/> : <FaImage/> )}
              </LargeTypeImagePreview>
              {selectedTrolleyType && !isImageTypeLoading && <PreviewLabel className={imageLoadError ? 'error' : ''}>{imageLoadError ? 'Load Error' : selectedTrolleyType.label}</PreviewLabel> }
            </RightColumn>
          </TopSectionContainer>

          {/* Sayım, Buton ve Liste */}
          <Form onSubmit={(e) => e.preventDefault()}>
            <CountInputGroup>
              <FormGroup> <Label htmlFor="workingCountInput">Working</Label> <Input type="number" id="workingCountInput" value={workingCount} onChange={(e) => setWorkingCount(e.target.value)} placeholder="e.g., 50" min="0" required disabled={isActionDisabled} aria-label="Working Trolley Count" /> </FormGroup>
              <FormGroup> <Label htmlFor="brokenCountInput">Broken</Label> <Input type="number" id="brokenCountInput" value={brokenCount} onChange={(e) => setBrokenCount(e.target.value)} placeholder="e.g., 5" min="0" required disabled={isActionDisabled} aria-label="Broken Trolley Count" /> </FormGroup>
            </CountInputGroup>
            <AddButtonContainer> <AddButton type="button" onClick={handleAddEntry} disabled={isActionDisabled || !selectedProject || !selectedTrolleyType}> <FaPlusCircle /> Add to List </AddButton> </AddButtonContainer>

             {/* Liste (Form'un içinde ama stil olarak ayrı görünebilir) */}
            <EntriesListContainer> {trolleyEntries.length === 0 ? <NoEntriesMessage> <FaInfoCircle /> No records added yet. </NoEntriesMessage> : trolleyEntries.map((entry) => ( <EntryItem key={entry.uniqueId}> <EntryDetails> <DetailSpan className="project" title={entry.projectLabel}> <FaProjectDiagram /> <strong>{entry.projectLabel}</strong> </DetailSpan> <DetailSpan className="type" title={entry.typeLabel}> <FaTags /> {entry.typeLabel} </DetailSpan> <DetailSpan className="working"> <FaShoppingCart /> {entry.workingCount} </DetailSpan> <DetailSpan className="broken"> <FaShoppingCart /> {entry.brokenCount} </DetailSpan> </EntryDetails> <RemoveButton type="button" onClick={() => handleRemoveEntry(entry.uniqueId)} title="Remove entry" disabled={isLoading} > <FaTrashAlt size={14} /> </RemoveButton> </EntryItem> )) } </EntriesListContainer>
             {error && error.includes("list before saving") && <ErrorMessage>{error}</ErrorMessage>}
          </Form>


        </ModalBody>

        <ModalFooter> <SecondaryButton type="button" onClick={onClose} disabled={isLoading}> Cancel </SecondaryButton> <PrimaryButton type="button" onClick={handleSubmit} disabled={isActionDisabled || trolleyEntries.length === 0} > {isLoading ? <StyledSpinner size={14} /> : <FaSave />} {isLoading ? "Creating..." : `Create ${trolleyEntries.length} Record(s)`} </PrimaryButton> </ModalFooter>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default CreateTrolleyModal;
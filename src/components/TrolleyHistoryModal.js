import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
// import { ToastContainer } from "../utils/ToastContainer"; // Genelde App seviyesinde
import {
  FaTimes,
  FaHistory,
  FaSpinner,
  FaProjectDiagram,
  FaShoppingCart,
  FaTags,
  FaCalendarAlt,
  FaUser,
  FaInfoCircle,
  FaPencilAlt,
} from "react-icons/fa";

// --- Animasyonlar ve Stiller (Değişiklik yok) ---
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
  max-width: 850px; /* Daha geniş tablo için genişlik arttırıldı */
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.98);
  animation: ${scaleUp} 0.35s 0.1s ease-out forwards;
`;
const ModalHeader = styled.header`
  padding: 1.1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  background-color: #f9fafb;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`;
const Title = styled.h2`
  margin: 0 0 0.2rem 0;
  font-size: 1.2rem;
  color: #1f2937;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const SubtitleInfo = styled.div`
  margin-top: 0.1rem;
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 400;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 0.8rem;
  align-items: center;
  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
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
    background-color: #e5e7eb;
    color: #1f2937;
  }
`;
const ModalBody = styled.div`
  padding: 0;
  overflow-y: auto;
  flex-grow: 1;
  background-color: #ffffff;
`;
const HistoryTableWrapper = styled.div`
  padding: 1rem 1.5rem 1.5rem 1.5rem;
`;
const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
`;
const HistoryThead = styled.thead`
  background-color: #f3f4f6;
  color: #4b5563;
  text-align: left;
`;
const HistoryTh = styled.th`
  padding: 0.7rem 0.9rem;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
  vertical-align: middle;
  &:first-child {
    padding-left: 1.5rem;
  }
  &:last-child {
    padding-right: 1.5rem;
  }
`;
const HistoryTbody = styled.tbody``;
const HistoryTr = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  &:last-child {
    border-bottom: none;
  }
  &:hover {
    background-color: #f9fafb;
  }
`; // Hover efekti
const HistoryTd = styled.td`
  padding: 0.8rem 0.9rem;
  color: #374151;
  vertical-align: middle;
  &.count-cell {
    font-weight: 500;
    text-align: center;
  }
  &.working {
    color: #16a34a;
  }
  &.broken {
    color: #dc2626;
  }
  &.date-cell {
    white-space: nowrap;
    color: #4b5563;
    font-size: 0.8rem;
  } /* Tarih fontu küçültüldü */
  &.user-cell {
    color: #6b7280;
    font-style: italic;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } /* Uzun isimleri kes */
  &:first-child {
    padding-left: 1.5rem;
  }
  &:last-child {
    padding-right: 1.5rem;
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
`;
const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;
const MessageIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #9ca3af;
`;
const ErrorMessageText = styled.p`
  color: #ef4444;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin: 1rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
`;
const ModalFooter = styled.footer`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  flex-shrink: 0;
`;
const CloseFooterButton = styled.button`
  padding: 0.6rem 1.3rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  background-color: #ffffff;
  color: #374151;
  &:hover {
    background-color: #f3f4f6;
    border-color: #adb5bd;
  }
`;
const StyledSpinner = styled(FaSpinner)`
  animation: ${spin} 1s linear infinite;
  color: #3b82f6;
`;

// --- Helper Function (Formatlama aynı) ---
const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (e) {
    return "Invalid";
  }
};

// --- Component Logic ---
const TrolleyHistoryModal = ({
  isOpen,
  onClose,
  trolleyData, // Format: { Id, ProjectName(code), TrolleyTypeName, ... }
  apiBaseUrl = API_BASE_URL,
  token,
}) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // API Fetch (Önceki adımdaki düzeltme geçerli)
  useEffect(() => {
    if (isOpen && trolleyData?.Id) {
      const fetchHistory = async () => {
        setIsLoading(true);
        setError("");
        setHistoryData([]);
        const params = new URLSearchParams({
          TrolleyId: trolleyData.Id.toString(),
        });
        const url = `${apiBaseUrl}/api/Trolley/trolleyhistory?${params.toString()}`;
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.status === 404) {
            setHistoryData([]);
          } else if (!response.ok) {
            let eMsg = `HTTP ${response.status}`;
            try {
              eMsg = (await response.json()).Message || eMsg;
            } catch {}
            throw new Error(eMsg);
          } else {
            const data = await response.json();
            if (
              data &&
              data.length > 0 &&
              data[0] &&
              Array.isArray(data[0].TrolleyHistories)
            ) {
              const actual = data[0].TrolleyHistories;
              const sorted = actual.sort(
                (a, b) =>
                  new Date(b.CreatedDate || 0) - new Date(a.CreatedDate || 0)
              );
              setHistoryData(sorted);
            } else {
              console.warn("Hist fmt err:", data);
              setHistoryData([]);
            }
          }
        } catch (err) {
          console.error("Hist Err:", err);
          setError(err.message || "Load failed");
          setHistoryData([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else if (!isOpen) {
      const t = setTimeout(() => {
        setHistoryData([]);
        setError("");
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, trolleyData, apiBaseUrl, token]);

  // --- Header Bilgileri (Aynı) ---
  const projectCodeDisplay = trolleyData?.ProjectName || "N/A";
  const trolleyTypeNameDisplay = trolleyData?.TrolleyTypeName || "N/A";

  // --- Tablo Render (SÜTUNLAR DTO'YA GÖRE GÜNCELLENDİ) ---
  const renderContent = () => {
    if (isLoading)
      return (
        <LoadingContainer>
          <StyledSpinner size={36} />
        </LoadingContainer>
      );
    if (historyData.length === 0 && !error)
      return (
        <MessageContainer>
          <MessageIcon>
            <FaInfoCircle />
          </MessageIcon>
          <p>No history found.</p>
        </MessageContainer>
      );

    return (
      <HistoryTableWrapper>
        <HistoryTable>
          <HistoryThead>
            <HistoryTr>
              {/* Mevcut DTO alanlarına göre sütunlar */}
              <HistoryTh style={{ textAlign: "center" }}>
                <FaShoppingCart color="#28a745" /> Working
              </HistoryTh>
              <HistoryTh style={{ textAlign: "center" }}>
                <FaShoppingCart color="#dc3545" /> Broken
              </HistoryTh>
              <HistoryTh>
                <FaCalendarAlt /> Created Date
              </HistoryTh>
              <HistoryTh>
                <FaUser /> Created By
              </HistoryTh>
              {/* Opsiyonel: Modified alanları */}
              <HistoryTh>
                <FaCalendarAlt /> Modified Date
              </HistoryTh>
              <HistoryTh>
                <FaPencilAlt /> Modified By
              </HistoryTh>
            </HistoryTr>
          </HistoryThead>
          <HistoryTbody>
            {historyData.map((record) => (
              <HistoryTr key={record.Id}>
                {/* Mevcut DTO alanlarını kullan */}
                <HistoryTd className="count-cell working">
                  {record.WorkingTrolleysCount}
                </HistoryTd>
                <HistoryTd className="count-cell broken">
                  {record.BrokenTrolleysCount}
                </HistoryTd>
                <HistoryTd className="date-cell">
                  {formatDate(record.CreatedDate)}
                </HistoryTd>
                <HistoryTd className="user-cell">
                  {record.CreatedBy || "-"}
                </HistoryTd>
                {/* Opsiyonel: Modified alanları */}
                <HistoryTd className="date-cell">
                  {formatDate(record.ModifiedDate)}
                </HistoryTd>
                <HistoryTd className="user-cell">
                  {record.ModifiedBy || "-"}
                </HistoryTd>
              </HistoryTr>
            ))}
          </HistoryTbody>
        </HistoryTable>
      </HistoryTableWrapper>
    );
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <div>
            <Title>
              <FaHistory /> Trolley History
            </Title>
            <SubtitleInfo>
              <span>
                <FaProjectDiagram /> {projectCodeDisplay}
              </span>
              <span>
                <FaTags /> {trolleyTypeNameDisplay}
              </span>
            </SubtitleInfo>
          </div>
          <CloseButton onClick={onClose} aria-label="Close">
            {" "}
            <FaTimes size={18} />{" "}
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessageText>{error}</ErrorMessageText>}
          {renderContent()}
        </ModalBody>
        <ModalFooter>
          {" "}
          <CloseFooterButton onClick={onClose}> Close </CloseFooterButton>{" "}
        </ModalFooter>
        {/* <ToastContainer /> */}
      </ModalContent>
    </ModalOverlay>
  );
};

export default TrolleyHistoryModal;

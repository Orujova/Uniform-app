import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaFilePdf,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaPaperPlane,
} from "react-icons/fa";
import theme from "../styles/theme";
import PDFViewerModal from "../components/PDFViewerModal";
import { API_BASE_URL } from "../config";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toast";

const PageContainer = styled.div`
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #2d3a45;
`;

const HeaderActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-end;
  padding-top: 20px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 14px;
  color: #2d3a45;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e6e9ec;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const CheckboxCell = styled.td`
  padding: 12px;
  width: 40px;
  text-align: center;
  border-bottom: 1px solid #e6e9ec;
`;

const CheckboxHeader = styled.th`
  background-color: #0c4a6e;
  color: #ffffff;
  padding: 12px;
  width: 40px;
  text-align: center;
`;

const Checkbox = styled.input.attrs({ type: "checkbox" })`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
`;

const TableHeader = styled.th`
  background-color: #0c4a6e;
  color: #ffffff;
  padding: 12px;
  font-weight: 600;
  text-align: left;
`;

const TableRow = styled.tr`
  background-color: ${(props) => (props.selected ? "#e8f4fd" : "transparent")};
  cursor: pointer;
  &:hover {
    background-color: ${(props) =>
      props.selected ? "#e8f4fd" : theme.colors.tableRowHover};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e6e9ec;
  vertical-align: middle;
`;

const ViewButton = styled.button`
  background-color: #4a90e2;
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: #357abd;
  }
`;

const DownloadButton = styled.button`
  background-color: #28a745;
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: #218838;
  }
`;

const SelectionButton = styled(DownloadButton)`
  background-color: ${(props) => (props.disabled ? "#e2e8f0" : "#4a90e2")};
  color: ${(props) => (props.disabled ? "#94a3b8" : "#ffffff")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover {
    background-color: ${(props) => (props.disabled ? "#e2e8f0" : "#357abd")};
  }
`;

const SendButton = styled.button`
  background-color: ${(props) => (props.disabled ? "#e2e8f0" : "#6366f1")};
  color: ${(props) => (props.disabled ? "#94a3b8" : "#ffffff")};
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.disabled ? "#e2e8f0" : "#4f46e5")};
  }
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
`;

const PaginationButton = styled.button`
  padding: 4px 8px;
  min-width: 32px;
  height: 32px;
  margin: 0 2px;
  border: 1px solid #dee2e6;
  background-color: ${(props) => (props.active ? "#0284c7" : "#ffffff")};
  color: ${(props) => (props.active ? "#ffffff" : "#212529")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
  border-radius: 6px;

  &:hover {
    background-color: ${(props) => (props.active ? "#0284c7" : "#f8f9fa")};
    z-index: 2;
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 2px solid #ffffff;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ClearFilterButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  color: #4a5568;
  background-color: #ebf4ff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #4299e1;
  color: white;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.3);

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    color: #4a5568;
    background-color: #ebf4ff;
  }
`;

const PDFsPage = () => {
  const token = localStorage.getItem("token");
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPdfs, setSelectedPdfs] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPdfs.slice(indexOfFirstItem, indexOfLastItem);

  const [loadingStates, setLoadingStates] = useState({
    send: false,
    bulkDownload: false,
    viewPdf: {},
    downloadPdf: {},
  });

  useEffect(() => {
    fetchPdfs();
  }, []);

  useEffect(() => {
    filterPdfs();
  }, [startDate, endDate, pdfs]);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredPdfs.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredPdfs, itemsPerPage]);

  useEffect(() => {
    setSelectedPdfs([]);
  }, [currentPage, filteredPdfs]);

  const fetchPdfs = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/html-files`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch PDFs");
      const data = await response.json();
      const pdfList = data[0]?.PdfFiles || [];
      setPdfs(pdfList);
      setFilteredPdfs(pdfList);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
    }
  };

  const filterPdfs = () => {
    let filtered = [...pdfs];

    if (startDate && endDate) {
      filtered = filtered.filter((pdf) => {
        const createdDate = new Date(pdf.CreatedDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return createdDate >= start && createdDate <= end;
      });
    }

    setFilteredPdfs(filtered);
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedPdfs(currentItems.map((pdf) => pdf.Id));
    } else {
      setSelectedPdfs([]);
    }
  };

  const handleSelectRow = (pdfId) => {
    setSelectedPdfs((prev) => {
      if (prev.includes(pdfId)) {
        return prev.filter((id) => id !== pdfId);
      } else {
        return [...prev, pdfId];
      }
    });
  };

  const handleSendSelected = async () => {
    if (selectedPdfs.length === 0) {
      showToast("Please select files to send", { type: "warning" });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, send: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/send-html-files`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            Ids: selectedPdfs,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to send files");
      }

      const result = await response.json();
      showToast("Files sent successfully", { type: "success" });
      setSelectedPdfs([]);
      await fetchPdfs();
    } catch (error) {
      console.error("Error sending files:", error);
      showToast("Failed to send files", { type: "error" });
    } finally {
      setLoadingStates((prev) => ({ ...prev, send: false }));
    }
  };

  const handleBulkDownload = async () => {
    setLoadingStates((prev) => ({ ...prev, bulkDownload: true }));
    try {
      for (const pdfId of selectedPdfs) {
        const pdf = pdfs.find((p) => p.Id === pdfId);
        if (pdf) {
          await handleDownloadPdf(pdf);
        }
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, bulkDownload: false }));
    }
  };

  const handleViewPdf = async (pdf) => {
    setLoadingStates((prev) => ({
      ...prev,
      viewPdf: { ...prev.viewPdf, [pdf.Id]: true },
    }));
    try {
      setSelectedPdf(pdf);
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        viewPdf: { ...prev.viewPdf, [pdf.Id]: false },
      }));
    }
  };

  const handleDownloadPdf = async (pdf) => {
    setLoadingStates((prev) => ({
      ...prev,
      downloadPdf: { ...prev.downloadPdf, [pdf.Id]: true },
    }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/download/${pdf.Id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to download PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdf.FileName || "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      showToast("Failed to download PDF", { type: "error" });
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        downloadPdf: { ...prev.downloadPdf, [pdf.Id]: false },
      }));
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };
  const handleClosePdfViewer = () => {
    setSelectedPdf(null);
  };
  return (
    <PageContainer>
      <Header>
        <Title>PDF List</Title>
        <HeaderActions>
          <FilterContainer>
            <FilterGroup>
              <FilterLabel>Start Date</FilterLabel>
              <DateInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>End Date</FilterLabel>
              <DateInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FilterGroup>
            <ClearFilterButton onClick={handleClearFilters}>
              Clear Filters
            </ClearFilterButton>
          </FilterContainer>
          <ActionButtons>
            <SelectionButton
              onClick={handleBulkDownload}
              disabled={selectedPdfs.length === 0 || loadingStates.bulkDownload}
            >
              {loadingStates.bulkDownload ? <LoadingSpinner /> : <FaDownload />}
              Download Selected ({selectedPdfs.length})
            </SelectionButton>
            <SendButton
              onClick={handleSendSelected}
              disabled={selectedPdfs.length === 0 || loadingStates.send}
            >
              {loadingStates.send ? <LoadingSpinner /> : <FaPaperPlane />}
              Send Selected ({selectedPdfs.length})
            </SendButton>
          </ActionButtons>
        </HeaderActions>
      </Header>

      <Table>
        <thead>
          <tr>
            <CheckboxHeader>
              <Checkbox
                checked={
                  currentItems.length > 0 &&
                  selectedPdfs.length === currentItems.length
                }
                onChange={handleSelectAll}
              />
            </CheckboxHeader>
            <TableHeader>File Name</TableHeader>
            <TableHeader>BGS or Store</TableHeader>
            <TableHeader>Created By</TableHeader>
            <TableHeader>Created Date</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((pdf) => (
            <TableRow
              key={pdf.Id}
              selected={selectedPdfs.includes(pdf.Id)}
              onClick={() => handleSelectRow(pdf.Id)}
            >
              <CheckboxCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedPdfs.includes(pdf.Id)}
                  onChange={() => handleSelectRow(pdf.Id)}
                />
              </CheckboxCell>
              <TableCell>
                <FaFilePdf style={{ marginRight: "8px", color: "#E74C3C" }} />
                {pdf.FileName}
              </TableCell>
              <TableCell>{pdf.BGSorStore}</TableCell>
              <TableCell>{pdf.CreatedBy}</TableCell>
              <TableCell>
                {new Date(pdf.CreatedDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <ButtonGroup>
                  <ViewButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPdf(pdf);
                    }}
                    disabled={loadingStates.viewPdf[pdf.Id]}
                  >
                    {loadingStates.viewPdf[pdf.Id] ? (
                      <LoadingSpinner />
                    ) : (
                      <FaEye />
                    )}
                    View
                  </ViewButton>
                  <DownloadButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPdf(pdf);
                    }}
                    disabled={loadingStates.downloadPdf[pdf.Id]}
                  >
                    {loadingStates.downloadPdf[pdf.Id] ? (
                      <LoadingSpinner />
                    ) : (
                      <FaDownload />
                    )}
                    Download
                  </DownloadButton>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
          {currentItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: "center" }}>
                No PDFs found
              </TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>

      {filteredPdfs.length > 0 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft size={12} />
          </PaginationButton>

          {getPageNumbers().map((number) => (
            <PaginationButton
              key={number}
              active={currentPage === number}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </PaginationButton>
          ))}

          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight size={12} />
          </PaginationButton>
        </PaginationContainer>
      )}
      <ToastContainer />

      {selectedPdf && (
        <PDFViewerModal
          isOpen={!!selectedPdf}
          pdf={selectedPdf}
          onClose={handleClosePdfViewer}
        />
      )}
    </PageContainer>
  );
};

export default PDFsPage;

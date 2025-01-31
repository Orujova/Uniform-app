import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  FaFilePdf,
  FaEye,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
  FaUpload,
} from "react-icons/fa";
import theme from "../styles/theme";
import PDFViewerModal from "../components/PDFViewerModal";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import RequestUploadModal from "../components/RequestUploadModal";
import UploadModal from "../components/TransactionComp/UploadModal";

const StyledButton = styled.button`
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background-color: #0284c7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #075985;
  }
`;

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

const FilterContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-end;
  padding-top: 20px;
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
  &:hover {
    background-color: ${theme.colors.tableRowHover};
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

  &:hover {
    background-color: #218838;
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

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
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
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isRequestUploadModalOpen, setRequestUploadModalOpen] = useState(false);
  const userRole = JSON.parse(localStorage.getItem("userData")).roleId || {};
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPdfs.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    fetchPdfs();
  }, []);

  useEffect(() => {
    filterPdfs();
    setCurrentPage(1);
  }, [startDate, endDate, pdfs]);

  // Update total pages when filtered data changes
  useEffect(() => {
    setTotalPages(Math.ceil(filteredPdfs.length / itemsPerPage));

    setCurrentPage(1);
  }, [filteredPdfs, itemsPerPage]);

  const fetchPdfs = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/uploaded-html-files`,
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
      // Sort PDFs by date in descending order (newest first)
      const sortedPdfList = [...pdfList].sort(
        (a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate)
      );
      setPdfs(sortedPdfList);
      setFilteredPdfs(sortedPdfList);
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

  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);
  };

  const handleClosePdfViewer = () => {
    setSelectedPdf(null);
  };

  const handleDownloadPdf = async (pdf) => {
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
      showToast("PDF downloaded successfully", "success");
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleRequestUploadModal = () => setRequestUploadModalOpen(true);
  const handleUploadModal = () => setUploadModalOpen(true);

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

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  return (
    <PageContainer>
      <Header>
        <Title>PDF List</Title>
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

          {/* Show RequestUpload button only for role ID 8 */}
          {userRole.includes(10) && (
            <StyledButton onClick={handleRequestUploadModal}>
              <FaUpload style={{ marginRight: "8px" }} />
              Upload PDF
            </StyledButton>
          )}

          {/* Show Upload button only for role ID 1 */}
          {userRole.includes(1) && (
            <StyledButton onClick={handleUploadModal}>
              <FaUpload style={{ marginRight: "8px" }} />
              Upload PDF
            </StyledButton>
          )}
        </FilterContainer>
      </Header>

      <Table>
        <thead>
          <tr>
            <TableHeader>File Name</TableHeader>
            <TableHeader>BGS or Store</TableHeader>
            <TableHeader>Created By</TableHeader>
            <TableHeader>Created Date</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((pdf) => (
            <TableRow key={pdf.Id}>
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
                  <ViewButton onClick={() => handleViewPdf(pdf)}>
                    <FaEye /> View
                  </ViewButton>
                  <DownloadButton onClick={() => handleDownloadPdf(pdf)}>
                    <FaDownload /> Download
                  </DownloadButton>
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
          {currentItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: "center" }}>
                No PDFs found
              </TableCell>
            </TableRow>
          )}
        </tbody>
      </Table>

      <RequestUploadModal
        isOpen={isRequestUploadModalOpen}
        onClose={() => setRequestUploadModalOpen(false)}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
      />

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

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FaFilePdf, FaEye, FaDownload } from "react-icons/fa";
import theme from "../styles/theme";
import PDFViewerModal from "../components/PDFViewerModal";
import { API_BASE_URL } from "../config";
const PageContainer = styled.div`
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
`;

const Header = styled.div`
  display: flex;
  // flex-direction: column;
  justify-content: space-between;
  // gap: 20px;
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
  justify-content: center;
  margin-top: 20px;
  gap: 4px;
`;

const PaginationButton = styled.button`
  background-color: ${(props) => (props.active ? "#4a90e2" : "#e6e9ec")};
  color: ${(props) => (props.active ? "#ffffff" : "#2d3a45")};
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? "#357abd" : "#dcdcdc")};
  }
`;

const PDFsPage = () => {
  const token = localStorage.getItem("token");
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPdfs();
  }, []);

  useEffect(() => {
    filterPdfs();
  }, [startDate, endDate, pdfs]);

  const fetchPdfs = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/BGSStockRequest/pdf-files`,
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
        return createdDate >= start && createdDate <= end;
      });
    }

    setFilteredPdfs(filtered);
    setCurrentPage(1);
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
      link.download = pdf.File;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPdfs = filteredPdfs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPdfs.length / itemsPerPage);

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
        </FilterContainer>
      </Header>

      <Table>
        <thead>
          <tr>
            <TableHeader>FileName</TableHeader>
            <TableHeader>BGSorStore</TableHeader>
            <TableHeader>CreatedBy</TableHeader>
            <TableHeader>CreatedDate</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {currentPdfs.map((pdf) => (
            <TableRow key={pdf.id}>
              <TableCell>
                <FaFilePdf style={{ marginRight: "8px", color: "#E74C3C" }} />
                {pdf.FileName}
              </TableCell>
              <TableCell>{pdf.BGSorStore}</TableCell>
              <TableCell>{pdf.CreatedBy}</TableCell>
              <TableCell>{pdf.CreatedDate}</TableCell>
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
        </tbody>
      </Table>

      <PaginationContainer>
        {Array.from({ length: totalPages }, (_, index) => (
          <PaginationButton
            key={index + 1}
            active={currentPage === index + 1}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </PaginationButton>
        ))}
      </PaginationContainer>

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

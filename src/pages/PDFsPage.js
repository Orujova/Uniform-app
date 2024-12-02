import React, { useState } from 'react';
import styled from 'styled-components';
import { FaFilePdf, FaEye, FaFilter } from 'react-icons/fa';
import theme from '../styles/theme';
import PDFViewerModal from '../components/PDFViewerModal';

// Styled components
const PageContainer = styled.div`
  padding: 24px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #2D3A45;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
`;

const FilterButton = styled.button`
  background: ${(props) => (props.active ? '#4A90E2' : '#E0E0E0')};
  color: ${(props) => (props.active ? '#FFFFFF' : '#2D3A45')};
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s, color 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const TableHeader = styled.th`
  background-color: ${theme.colors.tableHeader};
  color: #ffffff;
  padding: 12px;
  font-weight: bold;
  text-align: left;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${theme.colors.tableRowHover};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #E6E9EC;
  vertical-align: middle;
`;

const ViewButton = styled.button`
  background-color: #4A90E2;
  color: #FFFFFF;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #357ABD;
  }
`;

const PDFsPage = () => {
  // Sample PDF data
  const [pdfs, setPdfs] = useState([
    { id: 1, name: 'Document 1', type: 'Handovered' },
    { id: 2, name: 'Report 2023', type: 'Uploaded' },
    { id: 3, name: 'Analysis', type: 'Handovered' },
    { id: 4, name: 'Project Plan', type: 'Uploaded' },
  ]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPdf, setSelectedPdf] = useState(null);

  // Handle filter selection
  const handleFilterChange = (type) => {
    setActiveFilter(type);
  };

  // Filtered list based on selected filter
  const filteredPdfs = activeFilter === 'All' ? pdfs : pdfs.filter((pdf) => pdf.type === activeFilter);

  // Open PDF viewer
  const handleViewPdf = (pdf) => {
    setSelectedPdf(pdf);
  };

  // Close PDF viewer
  const handleClosePdfViewer = () => {
    setSelectedPdf(null);
  };

  return (
    <PageContainer>
      {/* Header with filters */}
      <Header>
        <Title>PDF List</Title>
        <FilterContainer>
          <FilterButton active={activeFilter === 'All'} onClick={() => handleFilterChange('All')}>
            All
          </FilterButton>
          <FilterButton active={activeFilter === 'Handovered'} onClick={() => handleFilterChange('Handovered')}>
            Handovered
          </FilterButton>
          <FilterButton active={activeFilter === 'Uploaded'} onClick={() => handleFilterChange('Uploaded')}>
            Uploaded
          </FilterButton>
        </FilterContainer>
      </Header>

      {/* PDF Table */}
      <Table>
        <thead>
          <tr>
            <TableHeader>PDF Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {filteredPdfs.map((pdf) => (
            <TableRow key={pdf.id}>
              <TableCell>
                <FaFilePdf style={{ marginRight: '8px', color: '#E74C3C' }} />
                {pdf.name}
              </TableCell>
              <TableCell>{pdf.type}</TableCell>
              <TableCell>
                <ViewButton onClick={() => handleViewPdf(pdf)}>
                  <FaEye /> View
                </ViewButton>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>

      {/* PDF Viewer Modal */}
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

import React, { useState } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Select from 'react-select';
import Table from '../components/Table';
import CustomButton from '../components/CustomButton';

// Container for First Distribution Page
const FirstDistributionContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
`;

// Top Bar with dropdown (removed generate button)
const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #FFFFFF;
  padding: 14px 18px;
  border-radius: 12px;
`;

// Custom Dropdown using react-select
const ProjectDropdown = styled(Select)`
  width: 260px;
  font-size: 14px;
`;

// Table Title with subtle styling
const TableTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FFFFFF;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #2C2E33;
`;

// Styled Button for actions
const ActionButton = styled.button`
  background: ${(props) => (props.delete ? '#F76C6C' : '#00ADB5')};
  color: #FFFFFF;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: ${(props) => (props.delete ? '#E65858' : '#009CA6')};
  }
`;

const FirstDistribution = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  // Handle project selection change and load data
  const handleProjectChange = (selectedOption) => {
    setSelectedProject(selectedOption);
    // Example: Load data based on project selection
    if (selectedOption) {
      const data = selectedOption.value === '20099OPOVH'
        ? [
            {
              id: 1,
              employeeName: 'Sadıqov Rəşad Elşad oğlu',
              uniform: 'T-shirt - green - long-sleeved',
              size: 'XL',
              count: 5,
              status: 'Pending',
            },
            {
              id: 2,
              employeeName: 'Muradov Elçin Məzahir oğlu',
              uniform: 'Trousers (Fresh & Non-fresh Sections)',
              size: 'M',
              count: 3,
              status: 'Accepted',
            },
          ]
        : [];
      setTableData(data);
    } else {
      setTableData([]);
    }
  };

  // Handle Select All checkbox
  const handleSelectAll = () => {
    const allSelected = !selectAll;
    setSelectAll(allSelected);
    setSelectedRows(allSelected ? tableData.map((row) => row.id) : []);
  };

  // Handle individual row selection
  const handleRowSelect = (id) => {
    const updatedSelectedRows = selectedRows.includes(id)
      ? selectedRows.filter((rowId) => rowId !== id)
      : [...selectedRows, id];

    setSelectedRows(updatedSelectedRows);
  };

  // Columns configuration for the table
  const columns = [
    // Select All Checkbox Column (only once)
    {
      Header: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
        />
      ),
      accessor: 'select',
      Cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedRows.includes(row.original.id)}
          onChange={() => handleRowSelect(row.original.id)}
        />
      ),
    },
    { Header: 'Employee Name', accessor: 'employeeName' },
    { Header: 'Uniform', accessor: 'uniform' },
    { Header: 'Size', accessor: 'size' },
    { Header: 'Count', accessor: 'count' },
    { Header: 'Status', accessor: 'status' },
    // Single "Actions" column definition
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <ActionButton>
            <FaEdit />
          </ActionButton>
          <ActionButton delete>
            <FaTrashAlt />
          </ActionButton>
        </div>
      ),
    },
  ];
  return (
    <FirstDistributionContainer>
      {/* Top bar with project dropdown */}
      <TopBar>
        <ProjectDropdown
          options={[
            { value: '20099OPOVH', label: 'Project 20099OPOVH' },
            { value: '20129OPOVH', label: 'Project 20129OPOVH' },
            { value: '3030', label: 'Project 3030' },
          ]}
          placeholder="Select a project..."
          value={selectedProject}
          onChange={handleProjectChange}
          styles={{
            control: (provided) => ({
              ...provided,
              borderRadius: '10px',
              borderColor: '#E0E0E0',
              boxShadow: 'none',
              minHeight: '45px',
            }),
            placeholder: (provided) => ({
              ...provided,
              color: '#9099A0',
            }),
          }}
        />
      </TopBar>

      {/* Table title */}
      <TableTitle>
        <span>Project Distribution Data</span>
      </TableTitle>

      {/* Table with project data */}
      <Table
        columns={columns}
        data={tableData}
        selectable={true}  // Enable select all, individual row selection
        editable={true}    // Enable edit/delete buttons
      />
    </FirstDistributionContainer>
  );
};

export default FirstDistribution;

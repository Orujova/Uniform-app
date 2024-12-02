import React from 'react';
import Table from '../components/Table';
import CustomButton from '../components/CustomButton';

// Define columns structure
const columns = [
  {
    Header: 'Project',
    accessor: 'project',
  },
  {
    Header: 'Uniform Code',
    accessor: 'uniformcode',
  },
  {
    Header: 'Uniform',
    accessor: 'uniform',
  },
  {
    Header: 'Uni Type',
    accessor: 'unitype',
  },
  {
    Header: 'Size',
    accessor: 'size',
  },
  {
    Header: 'Gender',
    accessor: 'gender',
  },
  {
    Header: 'Count',
    accessor: 'count',
  },
  {
    Header: 'Total Price',
    accessor: 'totalprice',
  },
];

// Sample data
const data = [
  {
    project: '3030',
    uniformcode: 'UNI480',
    uniform: 'T-shirt - green - long-sleeved',
    unitype: 'Shirt',
    size: 'XL',
    gender: 'Woman',
    count: 3,
    totalprice: 25.8,
  },
  {
    project: '3030',
    uniformcode: 'UNI480',
    uniform: 'T-shirt - green - long-sleeved',
    unitype: 'Shirt',
    size: 'XL',
    gender: 'Man',
    count: 1,
    totalprice: 8.6,
  },
];

const DistributionPage = () => {
  return (
    <div className="distribution-page">
      <div className="top-bar">
        <input type="text" placeholder="Project" className="search-input" />
        <CustomButton>Find items</CustomButton>
      </div>
      {/* Pass props to enable select, edit, and collapsible features */}
      <Table columns={columns} data={data} selectable editable collapsible />
      <div className="action-buttons">
        <CustomButton>PDF</CustomButton>
        <CustomButton>Accept</CustomButton>
      </div>
    </div>
  );
};

export default DistributionPage;

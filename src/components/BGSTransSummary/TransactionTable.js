// components/TransactionTable.js
import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  LoadingSpinner,
  ErrorMessage,
  EmptyMessage,
} from "./ModalStyles";

const TransactionTable = ({ transactions, loading, error }) => {
  const renderContent = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
            <LoadingSpinner />
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="7">
            <ErrorMessage>{error}</ErrorMessage>
          </td>
        </tr>
      );
    }

    if (transactions.length === 0) {
      return (
        <tr>
          <td colSpan="7">
            <EmptyMessage>No transactions found</EmptyMessage>
          </td>
        </tr>
      );
    }

    return transactions.map((transaction, index) => (
      <Tr key={index}>
        <Td>{transaction.ProjectCode}</Td>
        <Td>{transaction.UniformName}</Td>
        <Td>{transaction.UniformCode}</Td>
        <Td>{transaction.UniformSize}</Td>
        <Td>{transaction.UniformType}</Td>
        <Td>{transaction.TotalUniCount}</Td>
        <Td>{transaction.TotalUnitPrice}</Td>
      </Tr>
    ));
  };

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Project Code</Th>
          <Th>Uniform Name</Th>
          <Th>Code</Th>
          <Th>Size</Th>
          <Th>Type</Th>
          <Th>Count</Th>
          <Th>Unit Price</Th>
        </tr>
      </Thead>
      <Tbody>{renderContent()}</Tbody>
    </Table>
  );
};

export default TransactionTable;

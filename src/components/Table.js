import React from "react";
import styled from "styled-components";
import { useTable, useSortBy } from "react-table";
import PropTypes from "prop-types";

const colors = {
  primary: "#0c4a6e",
  danger: "#e74c3c",
  lightGray: "#f8f9fa",
  darkGray: "#2d3a45",
  tableRowHover: "#ecf0f1",
  borderColor: "#dfe6e9",
};

const StyledTableContainer = styled.div`
  width: 100%;
  max-height: 80vh; /* Adjust as needed */
  overflow-y: auto; /* Enable vertical scrolling */
  overflow-x: auto; /* Enable horizontal scrolling for wide tables */
  padding-top: 20px;
  border-radius: 10px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledTh = styled.th`
  background-color: ${colors.primary};
  color: white;
  padding: 14px;
  font-size: 16px;
  text-align: left;
  font-weight: 600;

  cursor: ${(props) => (props.$isSortable ? "pointer" : "default")};

  &:hover {
    background-color: ${(props) =>
      props.$isSortable ? "#026aa7" : colors.primary};
  }
`;

const StyledTd = styled.td`
  padding: 14px;
  font-size: 14px;
  color: ${colors.darkGray};
  border-bottom: 1px solid ${colors.borderColor};
  vertical-align: middle;
  font-weight: 500;
`;

const StyledTr = styled.tr`
  &:nth-child(even) {
    background-color: ${colors.lightGray};
  }

  &:hover {
    background-color: ${colors.tableRowHover};
    transition: background-color 0.3s;
  }
`;

const NoDataMessageRow = styled.tr`
  td {
    text-align: center;
    padding: 20px;
    font-size: 16px;
    color: ${colors.darkGray};
  }
`;

const Table = ({ columns = [], data = [], loading = false, error = "" }) => {
  // Use React Table hooks for data and column configuration
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: Array.isArray(data) ? data : [], // Ensure data is always an array
      },
      useSortBy
    );

  return (
    <StyledTableContainer>
      {loading ? (
        <p style={{ textAlign: "center", color: colors.primary }}>
          Loading data...
        </p>
      ) : error ? (
        <p style={{ textAlign: "center", color: colors.danger }}>{error}</p>
      ) : (
        <StyledTable {...getTableProps()} aria-label="Data Table">
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key, ...rest } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...rest}>
                  {headerGroup.headers.map((column) => {
                    const columnProps = column.getHeaderProps(
                      column.getSortByToggleProps
                        ? column.getSortByToggleProps()
                        : undefined
                    );
                    const { key: colKey, ...colRest } = columnProps;
                    return (
                      <StyledTh
                        key={colKey}
                        {...colRest}
                        $isSortable={!!column.getSortByToggleProps}
                      >
                        {column.render("Header")}
                      </StyledTh>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()} className="uniform-data">
            {rows.length > 0 ? (
              rows.map((row) => {
                prepareRow(row);
                const { key: rowKey, ...rowRest } = row.getRowProps();
                return (
                  <StyledTr key={rowKey} {...rowRest}>
                    {row.cells.map((cell) => {
                      const cellProps = cell.getCellProps();
                      const { key: cellKey, ...cellRest } = cellProps;
                      return (
                        <StyledTd key={cellKey} {...cellRest}>
                          {cell.render("Cell")}
                        </StyledTd>
                      );
                    })}
                  </StyledTr>
                );
              })
            ) : (
              <NoDataMessageRow>
                <td colSpan={columns.length}>No data available.</td>
              </NoDataMessageRow>
            )}
          </tbody>
        </StyledTable>
      )}
    </StyledTableContainer>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
};

export default Table;

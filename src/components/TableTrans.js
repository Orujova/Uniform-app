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
  selectedRow: "#e3f2fd",
};

const StyledTableContainer = styled.div`
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: auto;
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
  font-weight: 600;
  text-align: center;
  word-wrap: break-word;
  white-space: nowrap;
  cursor: ${(props) => (props.$isSortable ? "pointer" : "default")};
`;

const StyledTd = styled.td`
  padding: 14px;
  font-size: 14px;
  color: ${colors.darkGray};
  border-bottom: 1px solid ${colors.borderColor};
  vertical-align: middle;
  font-weight: 500;
  text-align: center;
  word-wrap: break-word;
  white-space: nowrap;
`;

const StyledTr = styled.tr`
  background-color: ${(props) =>
    props.$isSelected ? colors.selectedRow : "inherit"};

  &:nth-child(even) {
    background-color: ${(props) =>
      props.$isSelected ? colors.selectedRow : colors.lightGray};
  }

  &:hover {
    background-color: ${colors.tableRowHover};
    transition: background-color 0.3s;
  }
`;
const SelectionCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? "0.5" : "1")};
`;

const Table = ({
  columns = [],
  data = [],
  loading = false,
  error = "",
  selectedRows = [],
  onRowSelect = () => {},
  onSelectAll = () => {},
}) => {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: Array.isArray(data) ? data : [],
      },
      useSortBy
    );

  // Get only selectable rows (non-handovered)
  const selectableRows = data.filter(
    (row) => row.TransactionStatus?.toLowerCase() !== "handovered"
  );

  // Check if all selectable rows are selected
  const isAllSelected =
    selectableRows.length > 0 &&
    selectableRows.every((row) => selectedRows.includes(row.Id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Only select non-handovered rows
      const selectableIds = data
        .filter((row) => row.TransactionStatus?.toLowerCase() !== "handovered")
        .map((row) => row.Id);
      onSelectAll(true, selectableIds);
    } else {
      onSelectAll(false, []);
    }
  };

  const handleRowSelect = (rowId, isHandovered) => {
    if (!isHandovered) {
      onRowSelect(rowId);
    }
  };

  return (
    <StyledTableContainer>
      {loading ? (
        <p style={{ textAlign: "center", color: colors.primary }}>
          Loading data...
        </p>
      ) : error ? (
        <p style={{ textAlign: "center", color: colors.danger }}>{error}</p>
      ) : (
        <>
          <StyledTable {...getTableProps()} aria-label="Data Table">
            <thead>
              {headerGroups.map((headerGroup) => {
                const { key, ...rest } = headerGroup.getHeaderGroupProps();
                return (
                  <tr key={key} {...rest}>
                    <StyledTh>
                      <SelectionCheckbox
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        disabled={selectableRows.length === 0}
                      />
                    </StyledTh>
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
                  const isHandovered =
                    row.original.TransactionStatus?.toLowerCase() ===
                    "handovered";
                  const isSelected = selectedRows.includes(row.original.Id);

                  return (
                    <StyledTr
                      key={rowKey}
                      {...rowRest}
                      $isSelected={isSelected}
                    >
                      <StyledTd>
                        {!isHandovered ? (
                          <SelectionCheckbox
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleRowSelect(row.original.Id, isHandovered)
                            }
                          />
                        ) : null}
                      </StyledTd>
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
                <tr>
                  <td colSpan={columns.length + 1}>No data available.</td>
                </tr>
              )}
            </tbody>
          </StyledTable>
        </>
      )}
    </StyledTableContainer>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  selectedRows: PropTypes.array,
  onRowSelect: PropTypes.func,
  onSelectAll: PropTypes.func,
};

export default Table;

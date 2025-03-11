import React, { useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useTable, useSortBy, useRowSelect } from "react-table";
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

const CheckboxContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
`;

const Checkbox = styled.input`
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  width: 18px;
  height: 18px;
  margin: 0;
  padding: 0;
`;

// Create a memoized event handler for the checkbox to prevent unnecessary re-renders
const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, disabled, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);

    // Create a wrapper for the click event to ensure it's captured correctly
    const handleClick = useCallback(
      (event) => {
        // Prevent event bubbling to avoid row selection conflicts
        event.stopPropagation();

        // If disabled, prevent any action
        if (disabled) {
          event.preventDefault();
          return;
        }

        // Call the original onClick handler from rest props
        if (rest.onClick) {
          rest.onClick(event);
        }
      },
      [rest.onClick, disabled]
    );

    return (
      <CheckboxContainer
        onClick={(e) => e.stopPropagation()}
        $disabled={disabled}
      >
        <Checkbox
          type="checkbox"
          ref={resolvedRef}
          disabled={disabled}
          $disabled={disabled}
          {...rest}
          onClick={handleClick}
        />
      </CheckboxContainer>
    );
  }
);

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
};

const Table = ({
  columns = [],
  data = [],
  loading = false,
  error = "",
  selectable = false,
  onSelectedRowsChange = () => {},
}) => {
  // Refs for tracking selection state
  const selectedRows = useRef([]);

  // Memoize the data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Determine if a row is selectable (Pending status and not already approved/rejected)
  const isRowSelectable = useCallback((row) => {
    return (
      row.original.StoreRequestStatus === "Pending" &&
      row.original.OperationOrderStatus !== "Approved" &&
      row.original.OperationOrderStatus !== "Rejected"
    );
  }, []);

  // Memoize selection hooks to ensure stability
  const selectionHooks = useMemo(() => {
    if (!selectable) return [];

    return [
      (hooks) => {
        hooks.visibleColumns.push((columns) => [
          // Add a selection column
          {
            id: "selection",
            Header: ({ getToggleAllRowsSelectedProps }) => {
              // Get toggle props but only allow selecting selectable rows
              const toggleProps = getToggleAllRowsSelectedProps();

              return <IndeterminateCheckbox {...toggleProps} />;
            },
            Cell: ({ row }) => {
              // Determine if this row is selectable
              const rowSelectable = isRowSelectable(row);

              return (
                <IndeterminateCheckbox
                  {...row.getToggleRowSelectedProps()}
                  disabled={!rowSelectable}
                />
              );
            },
          },
          ...columns,
        ]);
      },
    ];
  }, [selectable, isRowSelectable]);

  // Use React Table hooks for data, column configuration, and row selection
  const tableInstance = useTable(
    {
      columns: memoizedColumns,
      data: memoizedData,
      // Don't auto-reset selected rows when data changes
      autoResetSelectedRows: false,
      // Disable row selection for non-selectable rows
      getRowId: (row) => row.Id?.toString() || Math.random().toString(),
      isRowSelectable: isRowSelectable,
    },
    useSortBy,
    useRowSelect,
    ...selectionHooks
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    state: { selectedRowIds },
  } = tableInstance;

  // Notify parent component when selection changes
  React.useEffect(() => {
    // Convert selectedRowIds to array to avoid dependency on the object reference
    const selectedIds = Object.keys(selectedRowIds).map((id) =>
      parseInt(id, 10)
    );
    // Only trigger the callback if we have selections or had selections before
    if (selectedIds.length > 0 || selectedRows.current?.length > 0) {
      const selectedItems = selectedFlatRows.map((row) => row.original);
      onSelectedRowsChange(selectedItems);
      selectedRows.current = selectedItems;
    }
  }, [JSON.stringify(selectedRowIds), selectedFlatRows, onSelectedRowsChange]);

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
                      column.getSortByToggleProps && column.id !== "selection"
                        ? column.getSortByToggleProps()
                        : undefined
                    );
                    const { key: colKey, ...colRest } = columnProps;
                    return (
                      <StyledTh
                        key={colKey}
                        {...colRest}
                        $isSortable={
                          !!column.getSortByToggleProps &&
                          column.id !== "selection"
                        }
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
                <td colSpan={selectable ? columns.length + 1 : columns.length}>
                  No data available.
                </td>
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
  selectable: PropTypes.bool,
  onSelectedRowsChange: PropTypes.func,
};

export default Table;

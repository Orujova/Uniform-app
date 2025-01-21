import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #2d3a45;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;

  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const SubmitButton = styled.button`
  padding: 10px 16px;
  font-size: 16px;
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

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;
const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }

  ${({ highlighted }) =>
    highlighted &&
    `
    background-color: #e5e7eb;
  `}
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const BadgeText = styled.span`
  font-weight: 500;
`;

const NameText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ReassignModal = ({
  isOpen,
  onClose,
  selectedRow,
  onReassignComplete,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      // Reset state when modal opens
      setSelectedEmployee(null);
      setSearchText("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchText) {
      const filtered = employees.filter((emp) => {
        const badge = emp?.Badge?.toLowerCase() || "";
        const fullName = emp?.FullName?.toLowerCase() || "";
        const search = searchText.toLowerCase();

        return badge.includes(search) || fullName.includes(search);
      });

      setFilteredEmployees(filtered);
      setShowDropdown(true);
      setHighlightedIndex(-1);
    } else {
      setFilteredEmployees([]);
      setShowDropdown(false);
    }
  }, [searchText, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Employee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();

      const validEmployees = data[0]?.Employees || [];
      setEmployees(
        validEmployees.filter((emp) => emp?.Id && emp?.Badge && emp?.FullName)
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
      showToast("Failed to fetch employees", "error");
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      showToast("Please select an employee", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/TransactionPage/reassign`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            TransactionId: selectedRow?.Id,
            NewEmployeeId: selectedEmployee.Id,
          }),
        }
      );

      console.log(selectedRow?.Id, selectedEmployee.Id);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      showToast("Transaction reassigned successfully");
      onReassignComplete();
      onClose();
    } catch (error) {
      console.error("Error reassigning transaction:", error);
      showToast("Failed to reassign transaction", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredEmployees.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredEmployees[highlightedIndex]) {
          handleEmployeeSelect(filteredEmployees[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        break;
    }
  };

  const handleEmployeeSelect = (employee) => {
    if (employee?.Id && employee?.Badge) {
      setSelectedEmployee(employee);
      setSearchText(employee.Badge);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Reassign Transaction</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Current Employee Badge</Label>
            <Input
              type="text"
              value={selectedRow?.EmployeeBadge || ""}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label>Current Employee Name</Label>
            <Input
              type="text"
              value={selectedRow?.EmployeeFullName || ""}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <Label>New Employee Badge</Label>
            <AutocompleteContainer ref={dropdownRef}>
              <Input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by badge or name"
                required
              />
              {showDropdown && filteredEmployees.length > 0 && (
                <DropdownList>
                  {filteredEmployees.map((employee, index) => (
                    <DropdownItem
                      key={employee?.Id || index}
                      onClick={() => handleEmployeeSelect(employee)}
                      highlighted={index === highlightedIndex}
                    >
                      <EmployeeInfo>
                        <BadgeText>{employee?.Badge}</BadgeText>
                        <NameText>{employee?.FullName}</NameText>
                      </EmployeeInfo>
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </AutocompleteContainer>
          </FormGroup>
          <SubmitButton
            type="submit"
            disabled={isSubmitting || !selectedEmployee}
          >
            {isSubmitting ? "Reassigning..." : "Reassign"}
          </SubmitButton>
        </Form>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ReassignModal;

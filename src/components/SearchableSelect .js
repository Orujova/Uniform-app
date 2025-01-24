import styled from "styled-components";
import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.div`
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #cbd5e0;
  }

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;
`;

const SearchInput = styled.input`
  width: 90%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  outline: none;

  &:focus {
    border-color: #4299e1;
  }
`;

const OptionsList = styled.div`
  max-height: 12rem;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f7fafc;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }
`;

const Option = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f7fafc;
  }
`;

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SelectContainer ref={dropdownRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <span>{value || placeholder}</span>
        <FaSearch />
      </SelectTrigger>

      {isOpen && (
        <Dropdown>
          <SearchInput
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <OptionsList>
            {filteredOptions.map((option) => (
              <Option
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch("");
                }}
              >
                {option.label}
              </Option>
            ))}
          </OptionsList>
        </Dropdown>
      )}
    </SelectContainer>
  );
};

export default SearchableSelect;

// components/SearchableCombobox.js
import React, { useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import {
  FilterGroup,
  Label,
  ComboboxContainer,
  ComboboxTrigger,
  ComboboxPopover,
  SearchInput,
  ComboboxOption,
  EmptyMessage,
} from "./ModalStyles";

const SearchableCombobox = ({
  label,
  value,
  options,
  searchValue,
  onSearchChange,
  onSelect,
  onClear,
  loading,
  placeholder,
  isOpen,
  onToggle,
  renderOption,
}) => {
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        onToggle(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onToggle(false);
    }
  };

  return (
    <FilterGroup>
      <Label>{label}</Label>
      <ComboboxContainer ref={containerRef}>
        <ComboboxTrigger
          onClick={() => onToggle(!isOpen)}
          type="button"
          disabled={loading}
        >
          <span>{value ? renderOption(value) : placeholder}</span>
          {value ? (
            <X
              size={16}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={{ opacity: 0.5, cursor: "pointer" }}
            />
          ) : (
            <ChevronDown size={16} style={{ opacity: 0.5 }} />
          )}
        </ComboboxTrigger>
        {isOpen && (
          <ComboboxPopover>
            <div
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
              }}
            >
              <SearchInput
                ref={searchInputRef}
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div>
              {options.length === 0 ? (
                <EmptyMessage>No {label.toLowerCase()} found</EmptyMessage>
              ) : (
                options.map((option) => (
                  <ComboboxOption
                    key={option.Id}
                    onClick={() => onSelect(option)}
                    selected={value?.Id === option.Id}
                  >
                    {renderOption(option)}
                  </ComboboxOption>
                ))
              )}
            </div>
          </ComboboxPopover>
        )}
      </ComboboxContainer>
    </FilterGroup>
  );
};

export default SearchableCombobox;

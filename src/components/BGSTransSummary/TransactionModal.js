import React, { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";
import { API_BASE_URL } from "../../config";
import DateFilter from "./DateFilter";
import SearchableCombobox from "./SearchableCombobox";
import TransactionTable from "./TransactionTable";
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  Title,
  FilterSection,
  TableContainer,
  ClearButton,
  ActionBar,
} from "./ModalStyles";

const TransactionModal = ({ isOpen, onClose }) => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [uniforms, setUniforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openProject, setOpenProject] = useState(false);
  const [openUniform, setOpenUniform] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [uniformSearch, setUniformSearch] = useState("");

  const [filters, setFilters] = useState({
    selectedProject: null,
    selectedUniform: null,
    year: null,
    week: null,
  });

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [transResponse, projResponse, uniResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/TransactionPage/GetAllBGSTransactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/Project`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/Uniform`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [transData, projData, uniData] = await Promise.all([
        transResponse.json(),
        projResponse.json(),
        uniResponse.json(),
      ]);

      setAllTransactions(transData[0]?.Transactions || []);

      setProjects(projData[0]?.Projects || []);
      setUniforms(uniData[0]?.Uniforms || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    let filtered = [...allTransactions];

    if (filters.year) {
      filtered = filtered.filter((trans) => {
        const transDate = new Date(trans.TransactionDate);
        return transDate.getFullYear() === filters.year;
      });
    }

    if (filters.week) {
      filtered = filtered.filter((trans) => {
        const transDate = new Date(trans.TransactionDate);
        const startDate = new Date(transDate.getFullYear(), 0, 1);
        const days = Math.floor(
          (transDate - startDate) / (24 * 60 * 60 * 1000)
        );
        const week = Math.ceil((days + startDate.getDay() + 1) / 7);
        return week === filters.week;
      });
    }

    if (filters.selectedProject) {
      filtered = filtered.filter(
        (trans) => trans.ProjectCode === filters.selectedProject.ProjectCode
      );
    }

    if (filters.selectedUniform) {
      filtered = filtered.filter(
        (trans) => trans.UniCode === filters.selectedUniform.UniCode
      );
    }

    return filtered;
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      setFilters((prev) => ({
        ...prev,
        year,
        week: null, // Reset week when year changes
      }));
    }
  };

  const handleWeekChange = (e) => {
    const week = parseInt(e.target.value);
    if (!isNaN(week) && week >= 1 && week <= 52) {
      setFilters((prev) => ({ ...prev, week }));
    }
  };

  const handleProjectSelect = (project) => {
    setFilters((prev) => ({ ...prev, selectedProject: project }));
    setOpenProject(false);
    setProjectSearch("");
  };

  const handleUniformSelect = (uniform) => {
    setFilters((prev) => ({ ...prev, selectedUniform: uniform }));
    setOpenUniform(false);
    setUniformSearch("");
  };

  const handleClearProject = () => {
    setFilters((prev) => ({ ...prev, selectedProject: null }));
    setProjectSearch("");
  };

  const handleClearUniform = () => {
    setFilters((prev) => ({ ...prev, selectedUniform: null }));
    setUniformSearch("");
  };

  const filteredProjects = projects.filter((project) => {
    if (!project) return false;
    const searchTerm = projectSearch.toLowerCase();
    return (
      project.ProjectCode?.toLowerCase().includes(searchTerm) ||
      project.ProjectName?.toLowerCase().includes(searchTerm)
    );
  });

  const filteredUniforms = uniforms.filter((uniform) => {
    if (!uniform) return false;
    const searchTerm = uniformSearch.toLowerCase();
    return (
      uniform.UniCode?.toLowerCase().includes(searchTerm) ||
      uniform.UniName?.toLowerCase().includes(searchTerm)
    );
  });

  const hasActiveFilters = () => {
    return (
      filters.year ||
      filters.week ||
      filters.selectedProject ||
      filters.selectedUniform
    );
  };

  const clearAllFilters = () => {
    setFilters({
      selectedProject: null,
      selectedUniform: null,
      year: null,
      week: null,
    });
    setProjectSearch("");
    setUniformSearch("");
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <Title>BGS Transactions</Title>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {/* <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton> */}
            <button className="close-button" onClick={onClose}>
              &times;
            </button>
          </div>
        </ModalHeader>

        <FilterSection>
          <DateFilter
            filters={filters}
            loading={loading}
            onYearChange={handleYearChange}
            onWeekChange={handleWeekChange}
          />

          <SearchableCombobox
            label="Project"
            value={filters.selectedProject}
            options={filteredProjects}
            searchValue={projectSearch}
            onSearchChange={setProjectSearch}
            onSelect={handleProjectSelect}
            onClear={handleClearProject}
            loading={loading}
            placeholder="Select project..."
            isOpen={openProject}
            onToggle={setOpenProject}
            renderOption={(project) => `${project.ProjectCode}`}
          />

          <SearchableCombobox
            label="Uniform"
            value={filters.selectedUniform}
            options={filteredUniforms}
            searchValue={uniformSearch}
            onSearchChange={setUniformSearch}
            onSelect={handleUniformSelect}
            onClear={handleClearUniform}
            loading={loading}
            placeholder="Select uniform..."
            isOpen={openUniform}
            onToggle={setOpenUniform}
            renderOption={(uniform) => `${uniform.UniCode}`}
          />
        </FilterSection>

        <ActionBar>
          <ClearButton
            onClick={clearAllFilters}
            disabled={!hasActiveFilters() || loading}
          >
            <RotateCcw size={16} />
            Clear Filters
          </ClearButton>
        </ActionBar>

        <TableContainer>
          <TransactionTable
            transactions={getFilteredTransactions()}
            loading={loading}
            error={error}
          />
        </TableContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default TransactionModal;

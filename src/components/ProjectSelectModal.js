import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { showToast } from "../utils/toast";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ProjectSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.975rem;
  color: #374151;
  background-color: #fff;
  transition: all 0.2s;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #0284c7;
    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1);
  }
`;

const TableContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  color: #4b5563;
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f8fafc;
  }
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: #e5e7eb;
  color: #374151;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
`;

const SubmitButton = styled(Button)`
  background-color: #0284c7;
  border: none;
  color: white;

  &:hover:not(:disabled) {
    background-color: #0369a1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  border: 3px solid #f3f4f6;
  border-radius: 50%;
  border-top: 3px solid #0284c7;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  background-color: #fee2e2;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const ProjectSelectModal = ({ isOpen, onClose, token, apiBaseUrl }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [uniformData, setUniformData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      setUniformData([]);
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/Employee`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch projects");

      const data = await response.json();
      const employeeList = data[0]?.Employees || [];
      const uniqueProjects = employeeList
        .filter((emp) => emp.Project?.Id)
        .map((emp) => ({
          id: emp.Project.Id,
          code: emp.Project.ProjectCode,
        }));

      const uniqueProjectsById = Object.values(
        uniqueProjects.reduce((acc, curr) => {
          if (!acc[curr.id]) {
            acc[curr.id] = curr;
          }
          return acc;
        }, {})
      ).sort((a, b) => a.code.localeCompare(b.code));

      setProjects(uniqueProjectsById);
    } catch (error) {
      setError("Failed to load projects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProject) {
      showToast("Please select a project first", "warning");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/UniformForEmployee/GetSumApprovedOperationOrders?ProjectId=${selectedProject}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();
      setUniformData(data);
    } catch (error) {
      setError("Failed to fetch data for selected project.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Summarize</ModalTitle>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </ModalHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ProjectSelect
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select a project...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code}
            </option>
          ))}
        </ProjectSelect>

        {isLoading ? (
          <LoadingSpinner />
        ) : uniformData.length > 0 ? (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Size</Th>
                  <Th>Type</Th>
                  <Th>Request Count</Th>
                  <Th>Total Count</Th>
                </tr>
              </thead>
              <tbody>
                {uniformData.map((item) => (
                  <Tr key={item.UniformId}>
                    <Td>{item.UniformCode}</Td>
                    <Td>{item.UniformName}</Td>
                    <Td>
                      <Badge>{item.UniSize}</Badge>
                    </Td>
                    <Td>{item.UniType}</Td>
                    <Td>{item.TotalRequestCount}</Td>
                    <Td>{item.TotalCount}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        ) : null}

        <ButtonContainer>
          <SubmitButton onClick={handleSubmit} disabled={!selectedProject}>
            Show Data
          </SubmitButton>
        </ButtonContainer>
        <ToastContainer />
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProjectSelectModal;

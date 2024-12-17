import React from "react";
import styled from "styled-components";

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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;

  &:hover {
    color: #333;
  }
`;

const ProjectSelect = styled.select`
  width: 100%;
  padding: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #0284c7;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #0284c7;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #0369a1;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ProjectSelectModal = ({ isOpen, onClose, projects, onSubmit }) => {
  const [selectedProject, setSelectedProject] = React.useState("");

  const handleSubmit = () => {
    onSubmit(selectedProject);
    setSelectedProject("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Select Project</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ProjectSelect
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.code}
            </option>
          ))}
        </ProjectSelect>
        <SubmitButton onClick={handleSubmit} disabled={!selectedProject}>
          Show Data
        </SubmitButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProjectSelectModal;

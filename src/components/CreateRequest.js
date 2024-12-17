import React, { useState, useEffect } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";

const CreateRequest = ({ isOpen, onClose, onSave }) => {
  const [bgsProjectss, setBgsProject] = useState(null);
  const token = localStorage.getItem("token");
  const [forms, setForms] = useState([
    {
      UniformId: "",
      UniCode: "",
      UniName: "",
      UniType: "",
      Size: "",
      Gender: "",
      Count: "",
      RequestCount: "",
      Project: "",
      Status: "",
    },
  ]);

  const [uniformOptions, setUniformOptions] = useState([]);
  const [projectName, setProjectName] = useState("");

  // API-dən uniform məlumatlarını al
  useEffect(() => {
    const fetchUniforms = async () => {
      try {
        const response = await fetch(API_BASE_URL + "/api/Uniform", {
          headers: {
            Authorization:  `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch uniforms.");

        const data = await response.json();
        const uniforms = data[0]?.Uniforms || [];

        setUniformOptions(uniforms); // Uniform listi doldur
      } catch (error) {
        console.error("Error fetching uniforms:", error);
      }
    };

    const fetchProject = async () => {
      try {
        const response = await fetch(API_BASE_URL + "/api/Project", {
          headers: {
            Authorization:  `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch uniforms.");

        const data = await response.json();
        const projects = data[0]?.Projects || [];

        const bgsProject = projects.find((project) => project.Id == "506");

        setBgsProject(bgsProject);
        setProjectName(bgsProject?.ProjectName || "");
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchUniforms();
    fetchProject();
  }, []);

  // UniCode dəyişəndə avtomatik digər sahələri doldur
  const handleUniCodeChange = (e, index) => {
    const selectedUniCode = e.target.value;
    const selectedUniform = uniformOptions.find(
      (uniform) => uniform.UniCode === selectedUniCode
    );

    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              UniCode: selectedUniCode,
              UniName: selectedUniform?.UniName || "",
              UniType: selectedUniform?.UniType || "",
              Size: selectedUniform?.Size || "",
              Gender: selectedUniform?.Gender || "",
              Project: projectName,
            }
          : form
      )
    );
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index ? { ...form, [name]: value } : form
      )
    );
  };

  const addForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        UniCode: "",
        UniName: "",
        UniType: "",
        Size: "",
        Gender: "",
        Count: "",
        RequestCount: "",
        Project: projectName,
        Status: "",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      // API-yə məlumat göndərmək üçün burada saxlanılan məlumatı istifadə edin
      const payload = {
        BGSStockRequestItems: forms.map((form) => {
          const selectedUniform = uniformOptions.find(
            (uniform) => uniform.UniCode === form.UniCode
          );
          return {
            UniformId: selectedUniform?.Id || "",
            RequestCount: parseInt(form.RequestCount, 10),
            ProjectId: bgsProjectss.Id,
          };
        }),
      };

      const response = await fetch(API_BASE_URL + "/api/BGSStockRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Validation Errors:", errorDetails.errors);
        const errorMessages = Object.values(errorDetails.errors)
          .flat()
          .join("\n");
        alert(`Validation Errors:\n${errorMessages}`);
        return;
      }

      const savedData = await response.json();
      onSave(savedData);
      resetForms();
    } catch (error) {
      console.error("Error saving uniforms:", error);
    }
  };

  const resetForms = () => {
    setForms([
      {
        UniCode: "",
        UniName: "",
        UniType: "",
        Size: "",
        Gender: "",
        Count: "",
        Project: projectName,
      },
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        {forms.map((formData, index) => (
          <div key={index} className="form-wrapper">
            <div className="form-grid three-column">
              <div className="form-group">
                <label className="label" htmlFor={`UniCode_${index}`}>
                  Uniform Code
                </label>
                <select
                  className="input"
                  id={`UniCode_${index}`}
                  value={formData.UniCode}
                  onChange={(e) => handleUniCodeChange(e, index)}
                >
                  <option value="">Select Uniform Code</option>
                  {uniformOptions.map((option, index) => (
                    <option
                      key={`${option.UniCode}-${index}`}
                      value={option.UniCode}
                    >
                      {option.UniCode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`UniName_${index}`}>
                  Uniform Name
                </label>
                <input
                  className="input"
                  type="text"
                  id={`UniName_${index}`}
                  value={formData.UniName}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`Type_${index}`}>
                  Type
                </label>
                <input
                  type="text"
                  id={`Type_${index}`}
                  value={formData.UniType}
                  readOnly
                  className="input"
                />
              </div>
            </div>

            <div className="form-grid three-column">
              <div className="form-group">
                <label className="label" htmlFor={`Project_${index}`}>
                  Project
                </label>
                <input
                  type="text"
                  id={`Project_${index}`}
                  value={formData.Project}
                  readOnly
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`Size_${index}`}>
                  Size
                </label>
                <input
                  type="text"
                  id={`Size_${index}`}
                  value={formData.Size}
                  readOnly
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`Gender_${index}`}>
                  Gender
                </label>
                <input
                  type="text"
                  id={`Gender_${index}`}
                  value={formData.Gender}
                  readOnly
                  className="input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="label" htmlFor={`RequestCount_${index}`}>
                    RequestCount
                  </label>
                  <input
                    className="input"
                    type="text"
                    id={`RequestCount_${index}`}
                    name="RequestCount"
                    value={formData.RequestCount}
                    onChange={(e) => handleChange(e, index)}
                    placeholder="Enter RequestCount"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "right" }}>
          <button className="button" onClick={addForm}>
            Add More
          </button>
          <button className="button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;

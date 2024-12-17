import React, { useState } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";

const CreateUniModal = ({ isOpen, onClose, onSave, apiData }) => {
  const token = localStorage.getItem("token");
  const [forms, setForms] = useState([
    {
      UniName: "",
      PositionName: "",
      FunctionalArea: "",
      UniType: "",
      Gender: "",
      CountUniform: "",
    },
  ]);

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
        UniName: "",
        PositionName: "",
        FunctionalArea: "",
        UniType: "",
        Gender: "",
        CountUniform: "",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      // Validate inputs
      const invalidForms = forms.filter((form) => {
        return (
          !form.UniName.trim() ||
          !form.PositionName.trim() ||
          !form.FunctionalArea.trim() ||
          !form.UniType.trim() ||
          !form.Gender.trim() ||
          !form.CountUniform.trim()
        );
      });

      if (invalidForms.length > 0) {
        alert("Please fill all fields with valid values before saving.");
        return;
      }

      const payload = {
        UniformItems: forms.map((form, index) => ({
          Id: index + 1, // Assign a temporary ID or use a value from `apiData`
          UniName: form.UniName.trim(),
          PositionName: form.PositionName.trim(),
          FunctionalArea: form.FunctionalArea.trim(),
          UniType: form.UniType.trim(),
          Gender: form.Gender.trim(),
          CountUniform: form.CountUniform.trim(),
        })),
      };

      const response = await fetch(API_BASE_URL + `/api/UniformCondition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      console.log(savedData);
      onSave(savedData); // Notify parent with saved uniforms
      resetForms();
    } catch (error) {
      console.error("Error creating uniforms:", error.message);
      alert("An error occurred while creating uniforms. Please try again.");
    }
  };

  const resetForms = () => {
    setForms([
      {
        UniName: "",
        PositionName: "",
        FunctionalArea: "",
        UniType: "",
        Gender: "",
        CountUniform: "",
      },
    ]);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={resetForms}>
          &times;
        </button>
        {forms.map((formData, index) => (
          <div key={index} className="form-wrapper">
            <div className="form-grid three-column">
              <div className="form-group">
                <label className="label" htmlFor={`UniName_${index}`}>
                  Uniform Name
                </label>
                <input
                  className="input"
                  type="text"
                  id={`UniName_${index}`}
                  name="UniName"
                  value={formData.UniName}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter uniform name"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`PositionName_${index}`}>
                  Position Name
                </label>
                <input
                  className="input"
                  type="text"
                  id={`PositionName_${index}`}
                  name="PositionName"
                  value={formData.PositionName}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter position name"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`FunctionalArea_${index}`}>
                  Functional Area
                </label>
                <input
                  className="input"
                  type="text"
                  id={`FunctionalArea_${index}`}
                  name="FunctionalArea"
                  value={formData.FunctionalArea}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter functional area"
                />
              </div>
            </div>

            <div className="form-grid three-column">
              <div className="form-group">
                <label className="label" htmlFor={`CountUniform_${index}`}>
                  Count
                </label>
                <input
                  className="input"
                  type="text"
                  id={`CountUniform_${index}`}
                  name="CountUniform"
                  value={formData.CountUniform}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter count"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`UniType_${index}`}>
                  Uniform Type
                </label>
                <input
                  className="input"
                  type="text"
                  id={`UniType_${index}`}
                  name="UniType"
                  value={formData.UniType}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Uniform Type"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`Gender_${index}`}>
                  Gender
                </label>
                <input
                  className="input"
                  type="text"
                  id={`Gender_${index}`}
                  name="Gender"
                  value={formData.Gender}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Uniform Gender"
                />
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

export default CreateUniModal;

import React, { useState } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";

const CreateUniModal = ({ isOpen, onClose, onSave, apiData }) => {
  const token = localStorage.getItem("token");
  const [forms, setForms] = useState([
    {
      uni_code: "",
      uniName: "",
      uniType: "",
      size: "",
      gender: "",
    },
  ]);
  // const [sizes, setSizes] = useState([]);
  // const [types, setTypes] = useState([]);
  // const [genders, setGenders] = useState([]);

  // useEffect(() => {
  //   if (isOpen && apiData) {
  //     const uniqueSizes = [...new Set(apiData.map((item) => item.Size))];
  //     const uniqueTypes = [...new Set(apiData.map((item) => item.UniType))];
  //     const uniqueGenders = [...new Set(apiData.map((item) => item.Gender))];

  //     setSizes(uniqueSizes);
  //     setTypes(uniqueTypes);
  //     setGenders(uniqueGenders);
  //   }
  // }, [isOpen, apiData]);

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
        uni_code: "",
        uniName: "",
        uniType: "",
        size: "",
        gender: "",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      // Validate inputs
      const invalidForms = forms.filter((form) => {
        return (
          !form.uni_code.trim() ||
          !form.uniName.trim() ||
          !form.uniType.trim() ||
          !form.size.trim() ||
          !form.gender.trim()
        );
      });

      if (invalidForms.length > 0) {
        alert("Please fill all fields with valid values before saving.");
        return;
      }

      const payload = {
        UniformItems: forms.map((form, index) => ({
          Id: index + 1,
          UniCode: form.uni_code.trim(),
          UniName: form.uniName.trim(),
          UniType: form.uniType.trim(),
          Size: form.size.trim(),
          Gender: form.gender.trim(),
        })),
      };

      const response = await fetch(API_BASE_URL + `/api/Uniform`, {
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
        uni_code: "",
        uniName: "",
        uniType: "",
        size: "",
        gender: "",
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
            <div className="form-grid">
              <div className="form-group">
                <label className="label" htmlFor={`uni_code_${index}`}>
                  UniCode
                </label>
                <input
                  className="input"
                  type="text"
                  id={`uni_code_${index}`}
                  name="uni_code"
                  value={formData.uni_code}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Uniform Code"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`uniName_${index}`}>
                  Uniform Name
                </label>
                <input
                  className="input"
                  type="text"
                  id={`uniName_${index}`}
                  name="uniName"
                  value={formData.uniName}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Uniform Name"
                />
              </div>
            </div>

            <div className="form-grid three-column">
              <div className="form-group">
                <label className="label" htmlFor={`uniType_${index}`}>
                  Uniform Type
                </label>
                <input
                  className="input"
                  type="text"
                  id={`uniType_${index}`}
                  name="uniType"
                  value={formData.uniType}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Uniform Type"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`size_${index}`}>
                  Size
                </label>
                <input
                  className="input"
                  type="text"
                  id={`size_${index}`}
                  name="size"
                  value={formData.size}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Uniform Size"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`gender_${index}`}>
                  Gender
                </label>
                <input
                  className="input"
                  type="text"
                  id={`gender_${index}`}
                  name="gender"
                  value={formData.gender}
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

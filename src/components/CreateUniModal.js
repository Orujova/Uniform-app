import React, { useState } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import { FaTimes } from "react-icons/fa";

const CreateUniModal = ({ isOpen, onClose, onSave, apiData }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState([
    {
      uni_code: "",
      uniName: "",
      uniType: "",
      size: "",
      gender: "",
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
        uni_code: "",
        uniName: "",
        uniType: "",
        size: "",
        gender: "",
      },
    ]);
    showToast("New uniform form added", "info");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
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
        showToast("Please fill all fields in all forms", "error");
        setLoading(false);
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
        const errorMessages = Object.values(errorDetails.errors)
          .flat()
          .join("\n");
        showToast(`Validation Errors:\n${errorMessages}`);
        return;
      }

      const savedData = await response.json();
      showToast(`Successfully created ${forms.length} uniform(s)`, "success");
      onSave(savedData);
      resetForms();
    } catch (error) {
      console.error("Error creating uniforms:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = (index) => {
    setForms((prevForms) => prevForms.filter((_, i) => i !== index));
    showToast("Form deleted", "info");
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
            {index > 0 && (
              <div style={{ textAlign: "right", marginBottom: "10px" }}>
                <FaTimes
                  style={{
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#dc3545",
                  }}
                  onClick={() => deleteForm(index)}
                />
              </div>
            )}
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
          <button className="button" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button className="button" onClick={addForm} disabled={loading}>
            Add More
          </button>
          <button className="cancel" onClick={resetForms} disabled={loading}>
            Cancel
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default CreateUniModal;

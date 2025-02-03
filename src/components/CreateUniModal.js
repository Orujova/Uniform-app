import React, { useState } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import { FaTimes } from "react-icons/fa";

const CreateUniModal = ({ isOpen, onClose, onSave }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [forms, setForms] = useState([
    {
      uniCode: "",
      uniName: "",
      uniType: "",
      size: "",
      gender: "",
      usageDuration: 0,
      imageFile: null,
    },
  ]);

  const handleChange = (e, index) => {
    const { name, value, files } = e.target;

    if (name === "imageFile") {
      setForms((prevForms) =>
        prevForms.map((form, i) =>
          i === index ? { ...form, [name]: files[0] } : form
        )
      );
    } else if (name === "usageDuration") {
      const numValue = parseInt(value) || 0;
      setForms((prevForms) =>
        prevForms.map((form, i) =>
          i === index ? { ...form, [name]: numValue } : form
        )
      );
    } else {
      setForms((prevForms) =>
        prevForms.map((form, i) =>
          i === index ? { ...form, [name]: value } : form
        )
      );
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const invalidForms = forms.filter((form) => {
        return (
          !form.uniCode?.trim() ||
          !form.uniName?.trim() ||
          !form.uniType?.trim() ||
          !form.size?.trim() ||
          !form.gender?.trim()
        );
      });

      if (invalidForms.length > 0) {
        showToast("Please fill all required fields", "error");
        setLoading(false);
        return;
      }

      // Create FormData
      const formData = new FormData();

      // Log request data for debugging
      console.log("Forms data:", forms);

      forms.forEach((form, index) => {
        // Main form fields
        formData.append(`uniformItems[${index}].uniCode`, form.uniCode.trim());
        formData.append(`uniformItems[${index}].uniName`, form.uniName.trim());
        formData.append(`uniformItems[${index}].uniType`, form.uniType.trim());
        formData.append(`uniformItems[${index}].size`, form.size.trim());
        formData.append(`uniformItems[${index}].gender`, form.gender.trim());
        formData.append(
          `uniformItems[${index}].usageDuration`,
          form.usageDuration.toString()
        );

        // Handle image file if exists
        if (form.imageFile) {
          formData.append(`uniformItems[${index}].imageFile`, form.imageFile);
        }
      });

      // Log FormData entries for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const response = await fetch(`${API_BASE_URL}/api/Uniform`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      showToast(data.message || "Uniforms created successfully", "success");
      onSave(data);
      resetForms();
    } catch (error) {
      console.error("Error details:", error);
      showToast(error.message || "Failed to create uniforms", "error");
    } finally {
      setLoading(false);
    }
  };

  const addForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        uniCode: "",
        uniName: "",
        uniType: "",
        size: "",
        gender: "",
        usageDuration: 0,
        imageFile: null,
      },
    ]);
    showToast("New uniform form added", "info");
  };

  const deleteForm = (index) => {
    setForms((prevForms) => prevForms.filter((_, i) => i !== index));
    showToast("Form deleted", "info");
  };

  const resetForms = () => {
    setForms([
      {
        uniCode: "",
        uniName: "",
        uniType: "",
        size: "",
        gender: "",
        usageDuration: 0,
        imageFile: null,
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
                <label className="label" htmlFor={`uniCode_${index}`}>
                  Uniform Code
                </label>
                <input
                  className="input"
                  type="text"
                  id={`uniCode_${index}`}
                  name="uniCode" // Changed from uni_code
                  value={formData.uniCode}
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

            <div className="form-grid two-column">
              <div className="form-group">
                <label className="label" htmlFor={`usageDuration_${index}`}>
                  Usage Duration (months)
                </label>
                <input
                  className="input"
                  type="number"
                  id={`usageDuration_${index}`}
                  name="usageDuration"
                  value={formData.usageDuration}
                  onChange={(e) => handleChange(e, index)}
                  min="1"
                  placeholder="Enter Usage Duration"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`imageFile_${index}`}>
                  Image
                </label>
                <input
                  className="input"
                  type="file"
                  id={`imageFile_${index}`}
                  name="imageFile"
                  accept="image/*"
                  onChange={(e) => handleChange(e, index)}
                />
                {formData.imageFile && (
                  <p className="file-name">
                    Selected: {formData.imageFile.name}
                  </p>
                )}
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

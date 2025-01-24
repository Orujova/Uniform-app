import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { FaTimes } from "react-icons/fa";
import SearchableSelect from "./SearchableSelect ";

const UNIFORM_TYPES = {
  1: "Pants",
  2: "Shirt",
  3: "Shoe",
  4: "Unknown",
};

const GENDER_TYPES = {
  1: "Unisex",
  2: "Male",
  3: "Female",
  4: "Unknown",
};

const CreateUniModal = ({ isOpen, onClose, onSave }) => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [uniforms, setUniforms] = useState([]);

  const [forms, setForms] = useState([
    {
      PositionId: 0,
      FunctionalArea: "",
      UniName: "",
      Gender: 1,
      CountUniform: 0,
      UniType: 1,
      UsageDuration: 0,
    },
  ]);

  useEffect(() => {
    fetchPositions();
    fetchUniforms();
  }, []);

  const fetchPositions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Position`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch positions");
      const data = await response.json();
      setPositions(data[0]?.Positions || []);
    } catch (error) {
      showToast("Error fetching positions", "error");
    }
  };

  const fetchUniforms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Uniform`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch uniforms");
      const data = await response.json();
      setUniforms(data[0]?.Uniforms || []);
    } catch (error) {
      showToast("Error fetching uniforms", "error");
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              [name]: name === "CountUniform" ? parseInt(value) || 0 : value,
            }
          : form
      )
    );
  };
  const positionOptions = positions.map((pos) => ({
    value: pos.Id,
    label: pos.Name,
  }));

  const uniformOptions = uniforms.map((uni) => ({
    value: uni.UniName,
    label: uni.UniName,
  }));
  const handleSave = async () => {
    try {
      setLoading(true);
      const invalidForms = forms.filter(
        (form) =>
          !form.PositionId ||
          !form.FunctionalArea.trim() ||
          !form.UniName.trim()
      );

      if (invalidForms.length > 0) {
        showToast("Please fill all required fields", "error");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/UniformCondition`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(forms[0]),
      });

      console.log(forms);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const savedData = await response.json();

      showToast("Uniforms created successfully");
      onSave(savedData);
      resetForms();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setForms([
      {
        PositionId: 0,
        FunctionalArea: "",
        UniName: "",
        Gender: 1,
        CountUniform: 0,
        UniType: 1,
      },
    ]);
    onClose();
  };

  const addForm = () => {
    setForms((prev) => [
      ...prev,
      {
        PositionId: 0,
        FunctionalArea: "",
        UniName: "",
        Gender: 1,
        CountUniform: 0,
        UniType: 1,
      },
    ]);
  };

  const deleteForm = (index) => {
    setForms((prev) => prev.filter((_, i) => i !== index));
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

            <div className="form-grid ">
              <div className="form-group">
                <label className="label" htmlFor={`PositionName_${index}`}>
                  Position Name
                </label>
                <SearchableSelect
                  options={positionOptions}
                  value={
                    positions.find((p) => p.Id === formData.PositionId)?.Name
                  }
                  onChange={(value) =>
                    handleChange(
                      {
                        target: { name: "PositionId", value: parseInt(value) },
                      },
                      index
                    )
                  }
                  placeholder="Select Position"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`UniName_${index}`}>
                  Uniform Name
                </label>
                <SearchableSelect
                  options={uniformOptions}
                  value={formData.UniName}
                  onChange={(value) =>
                    handleChange(
                      {
                        target: { name: "UniName", value },
                      },
                      index
                    )
                  }
                  placeholder="Select Uniform"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`FunctionalArea_${index}`}>
                  Functional Area
                </label>
                <input
                  className="input"
                  type="text"
                  name="FunctionalArea"
                  value={formData.FunctionalArea}
                  onChange={(e) => handleChange(e, index)}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`CountUniform_${index}`}>
                  Count
                </label>
                <input
                  className="input"
                  type="number"
                  name="CountUniform"
                  value={formData.CountUniform}
                  onChange={(e) => handleChange(e, index)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`UniType_${index}`}>
                  Uniform Type
                </label>
                <select
                  className="input"
                  name="UniType"
                  value={formData.UniType}
                  onChange={(e) => handleChange(e, index)}
                >
                  {Object.entries(UNIFORM_TYPES).map(([value, label]) => (
                    <option key={value} value={parseInt(value)}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`Gender_${index}`}>
                  Gender
                </label>
                <select
                  className="input"
                  name="Gender"
                  value={formData.Gender}
                  onChange={(e) => handleChange(e, index)}
                >
                  {Object.entries(GENDER_TYPES).map(([value, label]) => (
                    <option key={value} value={parseInt(value)}>
                      {label}
                    </option>
                  ))}
                </select>
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
      </div>
    </div>
  );
};

export default CreateUniModal;

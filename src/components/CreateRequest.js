import React, { useState, useEffect } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTimes } from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";

const CreateRequest = ({ isOpen, onClose, onSave }) => {
  const [bgsProjectss, setBgsProject] = useState(null);
  const token = localStorage.getItem("token");
  const [stockData, setStockData] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [forms, setForms] = useState([
    {
      UniformId: "",
      UniCode: "",
      UniName: "",
      UniType: "",
      Size: "",
      Gender: "",
      RequestCount: "",
      Project: "",
      StockCount: 0,
    },
  ]);

  const [uniformOptions, setUniformOptions] = useState([]);
  const [projectName, setProjectName] = useState("");

  const fetchInitialData = async () => {
    try {
      setInitialLoading(true);

      const [uniformsResponse, projectsResponse, stockResponse] =
        await Promise.all([
          fetch(API_BASE_URL + "/api/Uniform", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_BASE_URL + "/api/Project", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(API_BASE_URL + "/api/DCStock", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (!uniformsResponse.ok || !projectsResponse.ok || !stockResponse.ok) {
        throw new Error("One or more requests failed");
      }

      const [uniformsData, projectsData, stockData] = await Promise.all([
        uniformsResponse.json(),
        projectsResponse.json(),
        stockResponse.json(),
      ]);

      // Process uniforms
      const uniforms = uniformsData[0]?.Uniforms || [];
      setUniformOptions(uniforms);

      // Process projects
      const projects = projectsData[0]?.Projects || [];
      const bgsProject = projects.find((project) => project.Id == "506");
      setBgsProject(bgsProject);
      setProjectName(bgsProject?.ProjectName || "");

      // Process stock data
      const stocks = stockData[0]?.DCStocks || [];
      const stockMap = {};
      stocks.forEach((item) => {
        stockMap[item.Id] = item.StockCount;
      });
      setStockData(stockMap);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      showToast("Error loading data. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const handleUniCodeChange = (e, index) => {
    const selectedUniCode = e.target.value;
    const selectedUniform = uniformOptions.find(
      (uniform) => uniform.UniCode === selectedUniCode
    );
    const stockCount = stockData[selectedUniform?.Id] || 0;

    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              UniformId: selectedUniform?.Id || "",
              UniCode: selectedUniCode,
              UniName: selectedUniform?.UniName || "",
              UniType: selectedUniform?.UniType || "",
              Size: selectedUniform?.Size || "",
              Gender: selectedUniform?.Gender || "",
              Project: projectName,
              StockCount: stockCount,
            }
          : form
      )
    );
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    if (name === "RequestCount") {
      const numValue = parseInt(value) || 0;
      const stockCount = forms[index].StockCount;

      if (numValue > stockCount) {
        showToast(`Cannot request more than available stock (${stockCount})`);
        return;
      }

      if (numValue < 0) {
        showToast("Request count cannot be negative");
        return;
      }
    }

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
        UniformId: "",
        UniCode: "",
        UniName: "",
        UniType: "",
        Size: "",
        Gender: "",
        RequestCount: "",
        Project: projectName,
        StockCount: 0,
      },
    ]);
    showToast("New uniform form added");
  };

  const handleSave = async () => {
    // Validate all forms before saving
    const isValid = forms.every((form) => {
      if (!form.UniCode || !form.RequestCount) {
        showToast("Please fill in all required fields");
        return false;
      }
      const requestCount = parseInt(form.RequestCount);
      if (requestCount > form.StockCount) {
        showToast(
          `Cannot request more than available stock for ${form.UniCode}`
        );
        return false;
      }
      return true;
    });

    if (!isValid) return;

    try {
      setLoading(true);

      const payload = {
        BGSStockRequestItems: forms.map((form) => ({
          UniformId: form.UniformId,
          RequestCount: parseInt(form.RequestCount, 10),
          ProjectId: bgsProjectss.Id,
        })),
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(API_BASE_URL + "/api/BGSStockRequest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorDetails = await response.json();
        const errorMessages = Object.values(errorDetails.errors)
          .flat()
          .join("\n");
        showToast(`Validation Errors:\n${errorMessages}`);
        return;
      }

      const savedData = await response.json();
      onSave(savedData);
      resetForms();
    } catch (error) {
      if (error.name === "AbortError") {
        showToast("Request timeout. Please try again.");
      } else {
        console.error("Error saving request:", error);
        showToast("Error saving request");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = (index) => {
    setForms((prevForms) => prevForms.filter((_, i) => i !== index));
    showToast("Form deleted");
  };

  const resetForms = () => {
    setForms([
      {
        UniformId: "",
        UniCode: "",
        UniName: "",
        UniType: "",
        Size: "",
        Gender: "",
        RequestCount: "",
        Project: projectName,
        StockCount: 0,
      },
    ]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      {(loading || initialLoading) && <LoadingSpinner />}
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
                  {uniformOptions.map((option, idx) => (
                    <option
                      key={`${option.UniCode}-${idx}`}
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
            </div>

            <div className="form-grid two-column">
              <div className="form-group">
                <label className="label" htmlFor={`StockCount_${index}`}>
                  Available Stock
                </label>
                <input
                  className="input"
                  type="text"
                  id={`StockCount_${index}`}
                  value={formData.StockCount}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`RequestCount_${index}`}>
                  Request Count
                </label>
                <input
                  className="input"
                  type="number"
                  id={`RequestCount_${index}`}
                  name="RequestCount"
                  value={formData.RequestCount}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter Request Count"
                  min="0"
                  max={formData.StockCount}
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "right" }}>
          <button className="button" onClick={handleSave}>
            Save
          </button>
          <button className="button" onClick={addForm}>
            Add More
          </button>
          <button className="cancel" onClick={resetForms}>
            Cancel
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default CreateRequest;

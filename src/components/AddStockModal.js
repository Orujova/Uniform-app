import React, { useState, useEffect } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";
import { FaTimes } from "react-icons/fa";
import SearchableSelect from "./SearchableSelect ";

const Modal = ({ isOpen, onClose, onSave, apiData }) => {
  const token = localStorage.getItem("token");
  const [isLoading, setIsLoading] = useState(false);
  const [forms, setForms] = useState([
    {
      stockCount: 1,
      impstockCount: 1,
      unitPrice: 1,
      totalPrice: 1,
      employee: 1,
    },
  ]);
  const [uniformOptions, setUniformOptions] = useState([]);

  const calculateTotalPrice = (stockCount, unitPrice) => {
    return stockCount * unitPrice;
  };

  useEffect(() => {
    const fetchUniforms = async () => {
      try {
        const response = await fetch(API_BASE_URL + "/api/Uniform", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch uniforms.");

        const data = await response.json();
        const uniforms = data[0]?.Uniforms || [];
        setUniformOptions(uniforms);
      } catch (error) {
        console.error("Error fetching uniforms:", error);
      }
    };

    fetchUniforms();
  }, [token]);
  const uniformOption = uniformOptions.map((uni) => ({
    value: uni.UniCode,
    label: uni.UniCode,
  }));
  const handleUniCodeChange = (e, index) => {
    const selectedUniCode = e.target.value;

    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              UniCode: selectedUniCode,
            }
          : form
      )
    );
  };

  const handleStockCountChange = (e, index) => {
    const { value } = e.target;
    const stockCount = Math.max(1, Number(value));
    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              stockCount,
              totalPrice: calculateTotalPrice(stockCount, form.unitPrice),
            }
          : form
      )
    );
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedValue = name === "employee" ? Number(value) : value;
    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index ? { ...form, [name]: updatedValue } : form
      )
    );
  };

  const handleUnitPriceChange = (e, index) => {
    const { value } = e.target;
    const unitPrice = Math.max(1, Number(value)); // Ensure unit price is at least 1
    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index
          ? {
              ...form,
              unitPrice,
              totalPrice: calculateTotalPrice(form.stockCount, unitPrice),
            }
          : form
      )
    );
  };

  const addForm = () => {
    setForms((prevForms) => [
      ...prevForms,
      {
        stockCount: 1,
        impstockCount: 1,
        unitPrice: 1,
        totalPrice: 1,
        employee: 1,
      },
    ]);
    showToast("New uniform form added", "info");
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (forms.some((form) => !form.UniCode || !form.employee)) {
        showToast("Please fill all the fields before saving.", "warning");
        return;
      }

      const payload = {
        DCStockItems: forms.map((form) => {
          const selectedUniform = uniformOptions.find(
            (uniform) => uniform.UniCode === form.UniCode
          );
          return {
            UniformId: selectedUniform?.Id || "",
            ImportedStockCount: form.stockCount,
            UnitPrice: form.unitPrice,
            TotalPrice: form.totalPrice,
            StoreOrEmployee: form.employee,
          };
        }),
      };

      const response = await fetch(API_BASE_URL + `/api/DCStock`, {
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
        showToast(`Validation Errors:\n${errorMessages}`);
        return;
      }

      const savedData = await response.json();
      onSave(savedData);
      resetForms();
    } catch (error) {
      console.error("Error creating uniforms:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteForm = (index) => {
    setForms((prevForms) => prevForms.filter((_, i) => i !== index));
    showToast("Form deleted", "info");
  };

  const resetForms = () => {
    setForms([
      {
        stockCount: 1,
        impstockCount: 1,
        unitPrice: 1,
        totalPrice: 1,
        employee: 1,
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
                <label className="label" htmlFor={`UniCode_${index}`}>
                  Uniform Code
                </label>
                {/* <select
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
                </select> */}
                <SearchableSelect
                  options={uniformOption}
                  value={formData.UniCode}
                  onChange={(value) =>
                    handleUniCodeChange(
                      {
                        target: { name: "UniCode", value },
                      },
                      index
                    )
                  }
                  placeholder="Select Uniform"
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor={`employee_${index}`}>
                  Option
                </label>
                <select
                  className="select"
                  id={`employee_${index}`}
                  name="employee"
                  value={formData.employee}
                  onChange={(e) => handleChange(e, index)}
                >
                  <option value={1}>Employee</option>
                  <option value={2}>Store</option>
                </select>
              </div>
            </div>

            <div className="form-grid three-column">
              <div className="form-group">
                <label className="label" htmlFor={`stockCount_${index}`}>
                  Stock Count
                </label>
                <input
                  className="input"
                  type="number"
                  id={`stockCount_${index}`}
                  name="stockCount"
                  value={formData.stockCount}
                  onChange={(e) => handleStockCountChange(e, index)}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`unitPrice_${index}`}>
                  Unit Price
                </label>
                <input
                  className="input"
                  type="number"
                  id={`unitPrice_${index}`}
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={(e) => handleUnitPriceChange(e, index)}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor={`totalPrice_${index}`}>
                  Total Price
                </label>
                <input
                  className="input"
                  type="number"
                  id={`totalPrice_${index}`}
                  name="totalPrice"
                  value={formData.totalPrice}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "right" }}>
          <button className="button" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </button>
          <button className="button" onClick={addForm} disabled={isLoading}>
            Add More
          </button>
          <button className="cancel" onClick={resetForms} disabled={isLoading}>
            Cancel
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Modal;

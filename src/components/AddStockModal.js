import React, { useState, useEffect } from "react";
import "../styles/CreateUniModal.css";
import { API_BASE_URL } from "../config";

const Modal = ({ isOpen, onClose, onSave, apiData }) => {
  const token = localStorage.getItem("token");

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
            Authorization:   `Bearer ${token}`,
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
  }, []);

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
    const stockCount = Math.max(1, Number(value)); // Ensure stock count is at least 1
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
        employee: 1, // Default set to 1 (Employee)
      },
    ]);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (forms.some((form) => !form.UniCode || !form.employee)) {
        alert("Please fill all the fields before saving.");
        return;
      }

      const payload = {
        DCStockItems: forms.map((form) => {
          const selectedUniform = uniformOptions.find(
            (uniform) => uniform.UniCode === form.UniCode
          );
          return {
            UniformId: selectedUniform?.Id || "", // Ensure UniCode matches UniformId in your backend
            ImportedStockCount: form.stockCount,
            UnitPrice: form.unitPrice,
            TotalPrice: form.totalPrice,
            StoreOrEmployee: form.employee, // Send as either 1 (Store) or 2 (Employee)
          };
        }),
      };

      console.log(payload);

      const response = await fetch(API_BASE_URL + `/api/DCStock`, {
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
      onSave(savedData); // Notify parent with saved uniforms
      resetForms();
    } catch (error) {
      console.error("Error creating uniforms:", error.message);
    }
  };

  const resetForms = () => {
    setForms([
      {
        stockCount: 1,
        impstockCount: 1,
        unitPrice: 1,
        totalPrice: 1,
        employee: 1, // Reset to default value (Employee)
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

export default Modal;

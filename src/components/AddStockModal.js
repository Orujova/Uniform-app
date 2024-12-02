import React, { useState } from "react";
import "../styles/CreateUniModal.css";

const Modal = ({ isOpen, onClose, onSave, apiData }) => {
  const [forms, setForms] = useState([
    {
      stockCount: 1,
      impstockCount: 1,
      unitPrice: 1,
      totalPrice: 1,
      employee: "",
    },
  ]);

  // Update the total price when stockCount or unitPrice changes
  const calculateTotalPrice = (stockCount, unitPrice) => {
    return stockCount * unitPrice;
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    setForms((prevForms) =>
      prevForms.map((form, i) =>
        i === index ? { ...form, [name]: value } : form
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
        employee: "",
      },
    ]);
  };

  const handleSave = async () => {
    try {
      // Validate inputs
      const invalidForms = forms.filter((form) => {
        return (
          !form.stockCount.trim() ||
          !form.impstockCount.trim() ||
          !form.unitPrice.trim() ||
          !form.totalPrice.trim() ||
          !form.employee.trim()
        );
      });

      if (invalidForms.length > 0) {
        alert("Please fill all fields with valid values before saving.");
        return;
      }

      const token = `Bearer eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoic20xMDAxQGJyYXZvc3VwZXJtYXJrZXQuYXoiLCJGdWxsTmFtZSI6Ill1c2lmIEh1c2V5bnphZGUiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImV4cCI6MTc2MjI1MDc4MH0.OrC5akf-tfIJLyXBghGRaF6fjfXHqh-wao2Dyvj4Njo`;
      const payload = {
        UniformItems: forms.map((form, index) => ({
          UniformId: index + 1, // Assign a temporary ID or use a value from `apiData`

          StockCount: form.stockCount.trim(),
          ImportedStockCount: form.impstockCount.trim(),
          UnitPrice: form.unitPrice.trim(),
          TotalPrice: form.totalPrice.trim(),
          StoreOrEmployee: form.employee.trim(),
        })),
      };

      const response = await fetch(`https://192.168.190.89:7039/api/DCStock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
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
    }
  };

  const resetForms = () => {
    setForms([
      {
        stockCount: 1,
        impstockCount: 1,
        unitPrice: 1,
        totalPrice: 1,
        employee: "",
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
                  Uni Code
                </label>
                <select
                  className="select"
                  id={`uni_code_${index}`}
                  name="uni_code"
                  value={formData.uni_code}
                  onChange={(e) => handleChange(e, index)}
                >
                  {/* <option value="">Select </option> */}
                  {/* Check if employeeData exists and is not empty */}
                  {/* {length > 0 ? (
                    map((employee, idx) => (
                      <option key={idx} value={employee.uni_code}>
                        {employee.uni_name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No available
                    </option>
                  )} */}
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
                  <option value="">Select Employee</option>
                  {/* Check if employeeData exists and is not empty */}
                  {/* {.length > 0 ? (
                    .map((employee, idx) => (
                      <option key={idx} value={employee.id}>
                        
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No employees available
                    </option>
                  )} */}
                </select>
              </div>
            </div>

            {/* Stock Count, Unit Price, Total Price in the next row */}
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
                  min="1"
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
                  min="1"
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
                  type="text"
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

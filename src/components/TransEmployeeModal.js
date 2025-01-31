import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { FaTimes } from "react-icons/fa";
import "../styles/EmployeeModal.css";
import { showToast } from "../utils/toast";
import { ToastContainer } from "../utils/ToastContainer";

const TransEmployeeModal = ({ isOpen, onClose }) => {
  const token = localStorage.getItem("token");
  const [isActiveDay, setIsActiveDay] = useState(false);
  const [employeeRequests, setEmployeeRequests] = useState([
    {
      id: 0,
      searchTerm: "",
      suggestions: [],
      selectedBadge: null,
      employeeData: null,
      uniformData: [],
      requiredCounts: {},
      warnings: {},
    },
  ]);
  const [badges, setBadges] = useState([]);

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      position: "relative",
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "20px",
      maxWidth: "900px",
      width: "100%",
      maxHeight: "80vh",
      overflowY: "auto",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      animation: "fadeIn 0.3s ease-in-out",
    },
    header: {
      fontSize: "22px",
      marginBottom: "10px",
      fontWeight: "bold",
      color: "#333",
    },
    input: {
      width: "95%",
      padding: "10px",
      margin: "10px 0",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontSize: "16px",
      outline: "none",
    },
  };

  const buttonStyles = {
    save: {
      backgroundColor: isActiveDay ? "#0284c7" : "#9CA3AF",
      color: "white",
      padding: "10px 20px",
      borderRadius: "6px",
      border: "none",
      cursor: isActiveDay ? "pointer" : "not-allowed",
      marginRight: "10px",
      transition: "background-color 0.3s ease",
      "&:hover": {
        backgroundColor: isActiveDay ? "#075985" : "#9CA3AF",
      },
    },
  };

  useEffect(() => {
    const checkActiveDay = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/UniformForEmployee/sys-week-days`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch active days: ${response.status}`);
        }

        const data = await response.json();
        const today = new Date().getDay();

        const apiDayId = today === 0 ? 1 : today + 1;

        console.log(apiDayId);

        const currentDay = data[0].WeekDays.find((day) => day.Id === apiDayId);
        console.log(currentDay);
        setIsActiveDay(currentDay?.IsActive);

        if (!currentDay?.IsActive) {
          showToast("Uniform creation is not allowed on this day.", "info");
        }
      } catch (error) {
        console.error("Error checking active day:", error);
      }
    };

    if (isOpen) {
      checkActiveDay();
    }
  }, [isOpen, token]);
  console.log(isActiveDay);
  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/Employee/GetAllStoreEmployee`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch badges: ${response.status}`);
        }

        const data = await response.json();
        const BadgesData = data[0]?.Employees || [];
        setBadges(BadgesData);
      } catch (error) {
        console.error("Error fetching badges:", error.message);
      }
    };

    fetchBadges();
  }, []);

  // Update useEffect for suggestions
  useEffect(() => {
    const updateSuggestions = () => {
      const newRequests = employeeRequests.map((request) => {
        if (request.searchTerm) {
          const filtered = badges.filter((b) =>
            b.Badge.toLowerCase().includes(request.searchTerm.toLowerCase())
          );
          return {
            ...request,
            suggestions: filtered,
            // Only reset these if no badge is selected
            ...(!request.selectedBadge && !request.employeeData
              ? {
                  selectedBadge: null,
                  employeeData: null,
                  uniformData: [],
                }
              : {}),
          };
        }
        return request;
      });

      setEmployeeRequests(newRequests);
    };

    updateSuggestions();
  }, [employeeRequests.map((req) => req.searchTerm).join(","), badges]);

  const fetchEmployeeData = async (badgeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Employee/${badgeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch employee data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching employee data:", error.message);
      return null;
    }
  };

  const fetchUniformData = async (employeeId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/GetUniformByEmployeeId/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch uniform data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching uniform data:", error.message);
      return [];
    }
  };

  const updateEmployeeRequest = (index, updates) => {
    setEmployeeRequests((prev) => {
      const newRequests = [...prev];
      newRequests[index] = { ...newRequests[index], ...updates };
      return newRequests;
    });
  };

  const handleSelectBadge = async (badge, index) => {
    const employee = await fetchEmployeeData(badge.Id);
    const uniforms = await fetchUniformData(badge.Id);

    const counts = {};
    const warnings = {};
    uniforms.forEach((uniform) => {
      counts[uniform.UniformId] = 0;
      warnings[uniform.UniformId] = "";
    });

    updateEmployeeRequest(index, {
      selectedBadge: badge,
      searchTerm: badge.Badge,
      suggestions: [],
      employeeData: employee,
      uniformData: uniforms,
      requiredCounts: counts,
      warnings: warnings,
    });
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    updateEmployeeRequest(index, {
      searchTerm: value,

      selectedBadge: null,
      employeeData: null,
      uniformData: [],
      suggestions: badges.filter((b) =>
        b.Badge.toLowerCase().includes(value.toLowerCase())
      ),
    });
  };

  const handleRequiredCountChange = (e, uniformId, availableStock, index) => {
    const uniform = employeeRequests[index].uniformData.find(
      (u) => u.UniformId === uniformId
    );
    const maxAllowed = uniform.RequiredCount;
    let value = parseInt(e.target.value, 10) || 0;

    // Cap the value at maxAllowed and set warnings accordingly
    if (value > maxAllowed) {
      value = maxAllowed + 1;
      updateEmployeeRequest(index, {
        requiredCounts: {
          ...employeeRequests[index].requiredCounts,
          [uniformId]: value,
        },
        warnings: {
          ...employeeRequests[index].warnings,
          [uniformId]: `Maximum required count is ${maxAllowed}!`,
        },
      });
      return;
    }

    // Check if value is negative
    if (value < 0) {
      value = 0;
      updateEmployeeRequest(index, {
        requiredCounts: {
          ...employeeRequests[index].requiredCounts,
          [uniformId]: value,
        },
        warnings: {
          ...employeeRequests[index].warnings,
          [uniformId]: "Count cannot be negative!",
        },
      });
      return;
    }

    // Update state and check for available stock warning
    updateEmployeeRequest(index, {
      requiredCounts: {
        ...employeeRequests[index].requiredCounts,
        [uniformId]: value,
      },
      warnings: {
        ...employeeRequests[index].warnings,
        [uniformId]:
          value > availableStock
            ? `Required count exceeds available stock (${availableStock})!`
            : "",
      },
    });
  };

  const hasWarnings = () => {
    return employeeRequests.some((request) =>
      Object.values(request.warnings).some((warning) => warning !== "")
    );
  };

  const allCountsEmpty = () => {
    return employeeRequests.every((request) =>
      Object.values(request.requiredCounts).every(
        (count) => !count || count === 0
      )
    );
  };

  const handleAddMore = () => {
    setEmployeeRequests((prev) => [
      ...prev,
      {
        id: prev.length,
        searchTerm: "",
        suggestions: [],
        selectedBadge: null,
        employeeData: null,
        uniformData: [],
        requiredCounts: {},
        warnings: {},
      },
    ]);
  };

  const handleRemoveRequest = (index) => {
    setEmployeeRequests((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const allUniformDetails = employeeRequests.flatMap((request) => {
      return request.uniformData
        .filter((uniform) => request.requiredCounts[uniform.UniformId] > 0)
        .map((uniform) => ({
          EmployeeId: request.selectedBadge?.Id,
          UniformId: uniform.UniformId,
          RequestCount: request.requiredCounts[uniform.UniformId],
        }));
    });

    if (allUniformDetails.length === 0) {
      showToast("Please add at least one uniform request", "info");
      return;
    }

    const invalidRequests = employeeRequests.filter(
      (req) =>
        req.selectedBadge &&
        !req.uniformData.some((u) => req.requiredCounts[u.UniformId] > 0)
    );

    if (invalidRequests.length > 0) {
      showToast(
        "All selected employees must have at least one uniform request",
        "warning"
      );
      return;
    }

    const payload = {
      EmployeeUniformDetails: allUniformDetails,
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/UniformForEmployee/CreateStoreUniformForEmployee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`);
      }

      console.log(payload);

      showToast("Uniform requests saved successfully", "success");
      resetModalState();
      onClose();
    } catch (error) {
      console.error("Error saving data:", error.message);
    }
  };

  const resetModalState = () => {
    setEmployeeRequests([
      {
        id: 0,
        searchTerm: "",
        suggestions: [],
        selectedBadge: null,
        employeeData: null,
        uniformData: [],
        requiredCounts: {},
        warnings: {},
      },
    ]);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <button className="close-button" onClick={handleClose}>
          &times;
        </button>
        <h2 style={modalStyles.header}>Select Employees by Badge</h2>

        {employeeRequests.map((request, index) => (
          <div key={request.id} className="employee-request-section">
            <div className="section-header">
              <h3>Employee Request #{index + 1}</h3>
              {index > 0 && (
                <FaTimes
                  style={{
                    cursor: "default",
                    fontSize: "20px",
                    color: "#dc3545",
                    textAlign: "right",
                  }}
                  onClick={() => handleRemoveRequest(index)}
                />
              )}
            </div>

            <input
              type="text"
              value={request.searchTerm}
              onChange={(e) => handleInputChange(e, index)}
              placeholder="Enter or select badge number..."
              style={modalStyles.input}
              aria-label="Search by badge number"
            />

            {request.suggestions.length > 0 &&
              !request.selectedBadge &&
              !request.employeeData && (
                <ul className="suggestionsList">
                  {request.suggestions.map((badge) => (
                    <li
                      key={badge.Id}
                      onClick={() => handleSelectBadge(badge, index)}
                      className="suggestionsItem"
                    >
                      {badge.Badge}
                    </li>
                  ))}
                </ul>
              )}

            {request.employeeData && (
              <div className="employeeInfo">
                <div className="detailContainer">
                  <p className="employeeInfoText">
                    <strong className="label">Full Name:</strong>
                    <br />
                    {request.employeeData.FullName}
                  </p>
                  <p className="employeeInfoText">
                    <strong className="label">Position:</strong>
                    <br />
                    {request.employeeData.Position.Name}
                  </p>
                  <p className="employeeInfoText">
                    <strong className="label">Section:</strong>
                    <br />
                    {request.employeeData.Section.Name}
                  </p>
                  <p className="employeeInfoText">
                    <strong className="label">Project:</strong>
                    <br />
                    {request.employeeData.Project.ProjectCode}
                  </p>
                </div>
              </div>
            )}

            {request.uniformData && request.uniformData.length > 0 && (
              <div className="employeeInfo">
                <h3 className="employeeInfoHeader">Uniform Details:</h3>
                <div className="detailsContainer">
                  {request.uniformData.map((uniform) => (
                    <div key={uniform.UniformId} className="uniformItem">
                      <p className="employeeInfoText">
                        <strong className="label">Uniform Code:</strong>
                        {uniform.UniCode}
                      </p>
                      <p className="employeeInfoText">
                        <strong className="label">Uniform Name:</strong>
                        {uniform.UniName}
                      </p>
                      <p className="employeeInfoText">
                        <strong className="label">Uniform Size:</strong>
                        {uniform.Size}
                      </p>
                      <p className="employeeInfoText">
                        <strong className="label">Uniform Gender:</strong>
                        {uniform.Gender}
                      </p>
                      <p className="employeeInfoText">
                        <strong className="label">Available Stock:</strong>{" "}
                        {uniform.AvailableDCStockCount}
                      </p>

                      <label className="label">Required Count:</label>
                      <input
                        type="text"
                        value={request.requiredCounts[uniform.UniformId] || 0}
                        onChange={(e) =>
                          handleRequiredCountChange(
                            e,
                            uniform.UniformId,
                            uniform.AvailableDCStockCount,
                            index
                          )
                        }
                        max={uniform.RequiredCount}
                        min="0"
                        style={modalStyles.input}
                      />
                      {request.warnings[uniform.UniformId] && (
                        <p
                          style={{
                            color: "red",
                            margin: "5px 0",
                            fontSize: "14px",
                          }}
                        >
                          {request.warnings[uniform.UniformId]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button
            className="button"
            onClick={handleSave}
            disabled={!isActiveDay || hasWarnings() || allCountsEmpty()}
            style={{
              ...buttonStyles.save,
              ...modalStyles.button,
              opacity:
                !isActiveDay || hasWarnings() || allCountsEmpty() ? 0.5 : 1,
              cursor:
                !isActiveDay || hasWarnings() || allCountsEmpty()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Save
          </button>
          <button className="button" onClick={handleAddMore}>
            Add More
          </button>
          <button className="cancel" onClick={handleClose}>
            Cancel
          </button>
        </div>

        {!isActiveDay && (
          <div
            style={{
              color: "#EF4444",
              fontSize: "14px",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            Uniform creation is not allowed on this day!
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default TransEmployeeModal;

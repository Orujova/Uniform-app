import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FaTimes, FaCheck, FaMinus } from "react-icons/fa";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  backdrop-filter: blur(5px);
`;

const ModalContent = styled.div`
  background: white;
  padding: 28px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  position: relative;
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #1a1a1a;
  }
`;

const WeekDayContainer = styled.div`
  display: grid;
  gap: 12px;
  margin: 20px 0;
`;

const WeekDayButton = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${(props) => (props.isActive ? "#EBF7EE" : "#FFF1F0")};
  color: ${(props) => (props.isActive ? "#166534" : "#991B1B")};
  border: 2px solid ${(props) => (props.isActive ? "#86EFAC" : "#FECACA")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  ${(props) =>
    props.$isSelected &&
    `
   
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-color: #60A5FA;
  `}

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  ${(props) =>
    props.primary
      ? `
    background-color: #60A5FA;
    color: white;
    border: none;
    
    &:hover:not(:disabled) {
     
     
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }
    
    
  `
      : `
    background-color: #F3F4F6;
    color: #4B5563;
    border: none;
    
    &:hover {
      background-color: #E5E7EB;
     
    }
    
   
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const WeekDayText = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WorkDaysModal = ({ isOpen, onClose }) => {
  const [weekDays, setWeekDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWeekDays();
    }
  }, [isOpen]);

  const fetchWeekDays = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://192.168.197.89:7039/api/UniformForEmployee/sys-week-days",
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setWeekDays(data[0].WeekDays);
    } catch (error) {
      console.error("Error fetching weekdays:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateWeekDay = async (id) => {
    try {
      setLoading(true);
      await fetch(
        "https://192.168.197.89:7039/api/UniformForEmployee/update-week-day",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ Id: id }),
        }
      );
      await fetchWeekDays();
      setSelectedDay(null);
      onClose();
    } catch (error) {
      console.error("Error updating weekday:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Work Days Management</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes size={20} />
          </CloseButton>
        </ModalHeader>

        <WeekDayContainer>
          {weekDays.map((day) => (
            <WeekDayButton
              key={day.Id}
              isActive={day.IsActive}
              $isSelected={selectedDay === day.Id}
              onClick={() => setSelectedDay(day.Id)}
              disabled={loading}
            >
              <WeekDayText>{day.Day}</WeekDayText>
              <StatusIcon>
                {day.IsActive ? (
                  <>
                    <FaCheck size={16} />
                    Active
                  </>
                ) : (
                  <>
                    <FaMinus size={16} />
                    Inactive
                  </>
                )}
              </StatusIcon>
            </WeekDayButton>
          ))}
        </WeekDayContainer>

        <ModalFooter>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            primary
            onClick={() => selectedDay && updateWeekDay(selectedDay)}
            disabled={!selectedDay || loading}
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default WorkDaysModal;

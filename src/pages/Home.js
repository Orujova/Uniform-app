import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Building2, User } from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const WelcomeContainer = styled.div`
  height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  text-align: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  animation: ${fadeIn} 1s ease-out;
  z-index: 2;
`;

const IconContainer = styled.div`
  margin-bottom: 24px;
  animation: ${float} 3s ease-in-out infinite;

  svg {
    width: 80px;
    height: 80px;
    color: #0369a1;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  font-weight: 700;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #475569;
  max-width: 600px;
  line-height: 1.6;
`;

const BackgroundIcon = styled(Building2)`
  position: absolute;
  opacity: 0.05;
  width: 400px;
  height: 400px;
  color: #0369a1;
  z-index: 1;

  &.top-right {
    top: -50px;
    right: -50px;
    transform: rotate(15deg);
  }

  &.bottom-left {
    bottom: -50px;
    left: -50px;
    transform: rotate(-15deg);
  }
`;

const Time = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 1.1rem;
  color: #64748b;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: ${fadeIn} 1s ease-out;
`;

const UserIcon = styled(User)`
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
`;

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  const userName = JSON.parse(localStorage.getItem("userData")) || "User";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <WelcomeContainer>
      <BackgroundIcon className="top-right" />
      <BackgroundIcon className="bottom-left" />

      <Time>{currentTime.toLocaleTimeString()}</Time>

      <ContentWrapper>
        <IconContainer>
          <User />
        </IconContainer>

        <Title>Welcome, {userName.fullName}</Title>
        <Subtitle>
          Manage your uniform distribution, stock levels, and employee requests
          efficiently
        </Subtitle>
      </ContentWrapper>
    </WelcomeContainer>
  );
};

export default Dashboard;

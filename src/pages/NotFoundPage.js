import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { AlertCircle, Home } from "lucide-react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const scaleIn = keyframes`
  from { transform: scale(0); }
  to { transform: scale(1); }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 1rem;
`;

const IconWrapper = styled.div`
  color: #ef4444;
  margin-bottom: 1.5rem;
  animation: ${scaleIn} 0.5s ease-out;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  animation: ${fadeIn} 0.5s ease-out 0.2s backwards;
`;

const ErrorText = styled.h2`
  font-size: 1.5rem;
  font-weight: 500;
  color: #475569;
  margin: 0 0 1rem 0;
  animation: ${fadeIn} 0.5s ease-out 0.4s backwards;
`;

const ErrorDescription = styled.p`
  font-size: 1rem;
  color: #64748b;
  text-align: center;
  max-width: 28rem;
  margin: 0 0 2rem 0;
  animation: ${fadeIn} 0.5s ease-out 0.6s backwards;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: #0369a1;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  animation: ${fadeIn} 0.5s ease-out 0.8s backwards;

  &:hover {
    background-color: #0369a1;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <IconWrapper>
        <AlertCircle size={120} />
      </IconWrapper>
      <ErrorCode>404</ErrorCode>
      <ErrorText>Page Not Found</ErrorText>
      <ErrorDescription>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </ErrorDescription>
      <Button onClick={() => navigate("/")}>
        <Home size={20} />
        <span>Return to Home</span>
      </Button>
    </Container>
  );
};

export default NotFoundPage;

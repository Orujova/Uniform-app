// pages/NotFoundPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 20px;
`;

const ErrorCode = styled.h1`
  font-size: 120px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1;
`;

const ErrorText = styled.h2`
  font-size: 24px;
  font-weight: 500;
  color: #64748b;
  margin: 20px 0;
`;

const ErrorDescription = styled.p`
  font-size: 16px;
  color: #94a3b8;
  margin-bottom: 30px;
  text-align: center;
`;

const BackButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background-color: #0284c7;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #0369a1;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <NotFoundContainer>
      <ErrorCode>404</ErrorCode>
      <ErrorText>Page Not Found</ErrorText>
      <ErrorDescription>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </ErrorDescription>
      <BackButton onClick={() => navigate("/first-distribution")}>
        Return to Home page
      </BackButton>
    </NotFoundContainer>
  );
};

export default NotFoundPage;

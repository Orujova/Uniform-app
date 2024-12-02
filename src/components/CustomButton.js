import React from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: ${theme.colors.primary};
  color: #ffffff;
  border: none;
  border-radius: ${theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
  font-size: 16px;
  font-weight: 500;
  box-shadow: ${theme.boxShadow};

  &:hover {
    background-color: ${theme.colors.buttonHover};
    box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const CustomButton = ({ children, style, ...props }) => {
  return (
    <StyledButton style={style} {...props}>
      {children}
    </StyledButton>
  );
};

export default CustomButton;

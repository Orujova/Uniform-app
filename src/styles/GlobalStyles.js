import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;
    font-family: 'Roboto', sans-serif;
    background-color: #F7F8FA;
    color: #34495E;
  }

  h2, span {
    margin: 0;
    color: #212529;
  }

  * {
    box-sizing: border-box;
  }

  .icon-button {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #34495E;
    font-size: 1.1rem;
    transition: color 0.3s;

    &:hover {
      color: #00ADB5;
    }
  }
`;

export default GlobalStyles;

// import React from 'react';
// import ReactDOM from 'react-dom';
// import './styles/styles.css';
// import App from './App';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

// import React from "react";
// import ReactDOM from "react-dom/client";
// import "./styles/styles.css";
// import App from "./App";

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// import React from "react";
// import ReactDOM from "react-dom";
// import { Provider } from "react-redux";
// import { store } from "./redux/store"; // Redux store-unuzun olduğu fayl
// import App from "./App";
// import "./styles/styles.css";

// ReactDOM.render(
//   <Provider store={store}>
//     <App />
//   </Provider>,
//   document.getElementById("root")
// );

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./styles/styles.css";
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

/**
 * main.jsx
 * --------
 * The starting point of the React app. It loads the global styles and puts
 * the <App /> component on the page inside the <div id="root"> in index.html.
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./styles/global.css";
import "./styles/admin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* BrowserRouter lets us have real page addresses like /properties */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

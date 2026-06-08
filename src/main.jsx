import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { CoinProvider } from "./context/CoinContext.jsx";
import "../css/styles.css";
import "./react.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CoinProvider>
      <App />
    </CoinProvider>
  </React.StrictMode>
);

import "./polyfills.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./index.css";
import App from "./App.jsx";

const appUr =
  "https://chimpxtg.netlify.app";
const manifestUrl = `${appUr}/tonconnect-manifest.json`;
console.log("manifestUrl", manifestUrl);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <TonConnectUIProvider
        manifestUrl={manifestUrl}
        actionsConfiguration={{
          twaReturnUrl: window.location.origin,
        }}
      >
        <App />
      </TonConnectUIProvider>
    </BrowserRouter>
  </StrictMode>
);

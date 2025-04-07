import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./index.css";
import App from "./App.jsx";

const appUr =
  "https://5650-2405-201-1014-3120-39c9-7ac7-6097-eb6e.ngrok-free.app";
const manifestUrl = `${appUr}/tonconnect-manifest.json`;
console.log("manifestUrl", manifestUrl);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: `https://t.me/@chimpxprasenjittestbot`,
      }}
    >
      <App />
    </TonConnectUIProvider>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import "./index.css";
import App from "./App.jsx";

const appUr =
  "https://chimpxtg.netlify.app";
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

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import "./index.css";
import AppRouter from "./router/AppRouter.jsx";
import { msalInstance } from "./auth/msalInstance";

// Process redirect from Microsoft before rendering (required for loginRedirect flow).
msalInstance
  .initialize()
  .then(() => msalInstance.handleRedirectPromise())
  .then(() => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <MsalProvider instance={msalInstance}>
          <AppRouter />
        </MsalProvider>
      </StrictMode>,
    );
  });

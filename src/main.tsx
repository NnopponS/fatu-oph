import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { MotionConfig } from "framer-motion";
import { InteractionEffects } from "./components/InteractionEffects";
import { GuardianAssistant } from "./components/GuardianAssistant";
import "./styles/global.css";
import "./styles/mythology.css";
import "./styles/experience.css";
import "./styles/realms.css";
import "./styles/cinematic.css";
import "./styles/imperial.css";
import "./styles/assistant.css";
import "./styles/spectacle.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
        <InteractionEffects />
        <App />
        <GuardianAssistant />
        </MotionConfig>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

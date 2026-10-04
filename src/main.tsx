import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { MotionConfig } from "framer-motion";
import { InteractionEffects } from "./components/InteractionEffects";
import "./styles/global.css";
import "./styles/mythology.css";
import "./styles/experience.css";
import "./styles/realms.css";
import "./styles/cinematic.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MotionConfig reducedMotion="user">
        <InteractionEffects />
        <App />
        </MotionConfig>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

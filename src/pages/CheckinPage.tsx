import { Navigate } from "react-router-dom";

/** All QR entry points use the same camera and authenticated check-in flow. */
export function CheckinPage() {
  return <Navigate to="/scan" replace />;
}

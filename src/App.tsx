import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ThemedLoading } from "@/components/ThemedLoading";
import { ExplorePage } from "@/pages/ExplorePage";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

function lazyNamed<P = Record<string, never>>(
  loader: () => Promise<Record<string, unknown>>,
  name: string,
) {
  return lazy(async () => ({
    default: (await loader())[name] as ComponentType<P>,
  }));
}

// User-facing pages
const AboutPage = lazyNamed(() => import("@/pages/AboutPage"), "AboutPage");
const ActivityPage = lazyNamed(() => import("@/pages/ActivityPage"), "ActivityPage");
const AssistantPage = lazyNamed(() => import("@/pages/AssistantPage"), "AssistantPage");
const CheckinPage = lazyNamed(() => import("@/pages/CheckinPage"), "CheckinPage");
const FaqPage = lazyNamed(() => import("@/pages/FaqPage"), "FaqPage");
const MapPage = lazyNamed(() => import("@/pages/MapPage"), "MapPage");
const PassPage = lazyNamed(() => import("@/pages/PassPage"), "PassPage");
const PrizesPage = lazyNamed(() => import("@/pages/PrizesPage"), "PrizesPage");
const SchedulePage = lazyNamed(() => import("@/pages/SchedulePage"), "SchedulePage");
const VenuePage = lazyNamed(() => import("@/pages/VenuePage"), "VenuePage");
const ScanPage = lazyNamed(() => import("@/pages/ScanPage"), "ScanPage");
const LuckyDrawPage = lazyNamed(() => import("@/pages/LuckyDrawPage"), "LuckyDrawPage");
const SurveyPage = lazyNamed(() => import("@/pages/SurveyPage"), "SurveyPage");

// Auth pages
const LoginPage = lazyNamed(() => import("@/pages/LoginPage"), "LoginPage");
const RegisterPage = lazyNamed(() => import("@/pages/RegisterPage"), "RegisterPage");
const ForgotPasswordPage = lazyNamed(() => import("@/pages/ForgotPasswordPage"), "ForgotPasswordPage");

// Staff pages
const StaffRegisterPage = lazyNamed(() => import("@/pages/StaffRegisterPage"), "StaffRegisterPage");
const StaffPendingPage = lazyNamed(() => import("@/pages/StaffPendingPage"), "StaffPendingPage");
const StaffDashboardPage = lazyNamed(() => import("@/pages/StaffDashboardPage"), "StaffDashboardPage");

// Admin pages
const AdminLoginPage = lazyNamed(() => import("@/pages/AdminLoginPage"), "AdminLoginPage");
const AdminPageModule = () => import("@/pages/AdminPage");
const AdminLayout = lazyNamed(AdminPageModule, "AdminLayout");
const AdminDashboardPage = lazyNamed(AdminPageModule, "AdminDashboardPage");
const AdminContentPage = lazyNamed<{
  kind: "activities" | "venues" | "prizes" | "faq" | "announcements";
}>(() => import("@/pages/AdminContentPage"), "AdminContentPage");
const AdminOperationsPage = lazyNamed(() => import("@/pages/AdminOperationsPage"), "AdminOperationsPage");
const AdminMediaPage = lazyNamed(() => import("@/pages/AdminMediaPage"), "AdminMediaPage");
const AdminAuditPage = lazyNamed(() => import("@/pages/AdminAuditPage"), "AdminAuditPage");
const AdminSettingsPage = lazyNamed(() => import("@/pages/AdminSettingsPage"), "AdminSettingsPage");

export default function App() {
  return (
    <Suspense fallback={<ThemedLoading fullscreen message="กำลังเปิดตำนานแดนมังกร..." />}>
      <Routes>
        {/* Main User Experience under AppShell */}
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="venue/:id" element={<VenuePage />} />
          <Route path="activity/:id" element={<ActivityPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="prizes" element={<PrizesPage />} />
          <Route path="rewards" element={<PrizesPage />} />
          <Route path="lucky-draw" element={<LuckyDrawPage />} />
          <Route path="survey" element={<SurveyPage />} />
          <Route path="pass" element={<PassPage />} />
          <Route path="profile" element={<PassPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="checkin" element={<CheckinPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        {/* Dedicated Standalone Auth Flows */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />

        {/* Staff Portal Flows */}
        <Route path="staff" element={<Navigate to="/admin" replace />} />
        <Route path="staff/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="staff/register" element={<Navigate to="/admin/register" replace />} />
        <Route path="staff/pending" element={<Navigate to="/admin/pending" replace />} />
        <Route path="staff/dashboard" element={<Navigate to="/admin/field" replace />} />

        {/* Admin CMS */}
        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin/register" element={<StaffRegisterPage />} />
        <Route path="admin/pending" element={<StaffPendingPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="field" element={<StaffDashboardPage />} />
          <Route path="activities" element={<AdminContentPage kind="activities" />} />
          <Route path="venues" element={<AdminContentPage kind="venues" />} />
          <Route path="prizes" element={<AdminContentPage kind="prizes" />} />
          <Route path="content" element={<Navigate to="/admin/faq" replace />} />
          <Route path="faq" element={<AdminContentPage kind="faq" />} />
          <Route path="announcements" element={<AdminContentPage kind="announcements" />} />
          <Route path="operations" element={<AdminOperationsPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* 404 & Redirects */}
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

import { lazy, Suspense, type ComponentType } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
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

function Loading() {
  return <div className="route-loading">กำลังโหลด...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="venue/:id" element={<VenuePage />} />
          <Route path="activity/:id" element={<ActivityPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="prizes" element={<PrizesPage />} />
          <Route path="pass" element={<PassPage />} />
          <Route path="checkin" element={<CheckinPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>

        <Route path="admin/login" element={<AdminLoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
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

        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

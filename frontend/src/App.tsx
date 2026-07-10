import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, Spinner } from "./components/ui";
import { AppShell } from "./components/layout/AppShell";
import {
  LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage,
  VerifyEmailPage, SessionExpiredPage,
} from "./pages/AuthPages";
import { DashboardPage } from "./pages/DashboardPage";
import { FilesPage } from "./pages/FilesPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { ReactNode } from "react";

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-ink-muted"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center text-ink-muted"><Spinner /></div>;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
            <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
            <Route path="/app" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/app/files" element={<Protected><FilesPage /></Protected>} />
            <Route path="/app/settings" element={<Protected><SettingsPage /></Protected>} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

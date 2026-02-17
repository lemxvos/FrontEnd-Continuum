import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import JournalPage from "@/pages/Journal";
import JournalEditorPage from "@/pages/JournalEditor";
import EntitiesOverview from "@/pages/Entities";
import EntityListPage from "@/pages/EntityList";
import EntityCreatePage from "@/pages/EntityCreate";
import EntityDetailPage from "@/pages/EntityDetail";
import ConnectionsPage from "@/pages/Connections";
import SearchPage from "@/pages/Search";
import SettingsPage from "@/pages/Settings";
import UpgradePage from "@/pages/Upgrade";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/journal" replace />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/journal/new" element={<JournalEditorPage />} />
                <Route path="/journal/:id" element={<JournalEditorPage />} />
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route path="/entities" element={<EntitiesOverview />} />
                <Route path="/entities/people" element={<EntityListPage />} />
                <Route path="/entities/habits" element={<EntityListPage />} />
                <Route path="/entities/projects" element={<EntityListPage />} />
                <Route path="/entities/new" element={<EntityCreatePage />} />
                <Route path="/entities/:id" element={<EntityDetailPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/upgrade" element={<UpgradePage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

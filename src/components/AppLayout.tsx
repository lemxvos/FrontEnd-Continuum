import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/contexts/ThemeContext";
import {
  BarChart3,
  BookOpen,
  Globe,
  Users,
  Settings,
  LogOut,
  Sparkles,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import PlanBadge from "@/components/PlanBadge";
import { useNavigate } from "react-router-dom";

const sidebarNav = [
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/entities", icon: Globe, label: "Entidades" },
  { to: "/connections", icon: Users, label: "Conexões" },
];

const mobileNav = [
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/connections", icon: Globe, label: "Conexões" },
  { to: "/entities", icon: Users, label: "Entidades" },
  { to: "/settings", icon: Settings, label: "Config" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md">
          <h1 className="text-lg font-bold text-primary tracking-tight">Continuum</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
              title={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <PlanBadge />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 pb-24">{children}</main>
        {/* FAB */}
        <button
          onClick={() => navigate("/journal/new")}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around py-2 px-2 border-t border-border bg-background/80 backdrop-blur-md">
          {mobileNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs transition-all",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-40 flex flex-col border-r border-border bg-background px-3 py-4">
        <div className="mb-8 px-3">
          <h1 className="text-lg font-bold text-primary tracking-tight">⬡ Continuum</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">Life OS · Journal-first</p>
        </div>

        <nav className="flex-1 space-y-0.5">
          {sidebarNav.map((item, i) =>
            "divider" in item ? (
              <div key={i} className="my-2 border-t border-border" />
            ) : (
              <NavLink
                key={item.to}
                to={item.to!}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="space-y-1 pt-4 border-t border-border">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.username || "User"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <PlanBadge />
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors w-full"
            title={`Mudar para tema ${theme === "dark" ? "claro" : "escuro"}`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Claro" : "Escuro"}
          </button>

          {user?.plan !== "VISION" && (
            <NavLink
              to="/upgrade"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade
            </NavLink>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-[260px] p-6 overflow-auto">{children}</main>
    </div>
  );
}

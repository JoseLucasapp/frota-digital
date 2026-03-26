import { ReactNode, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Car, Users, MapPin, Fuel, Wrench, Bell, LogOut, Menu, X,
  FileText, ArrowLeftRight, User, HardHat
} from "lucide-react";
import { cn } from "@/lib/utils";
import NotificationModal from "@/components/NotificationModal";
import { clearAuthSession, getAuthUser } from "@/lib/auth";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Car, label: "Veículos", path: "/admin/vehicles" },
  { icon: Users, label: "Motoristas", path: "/admin/drivers" },
  { icon: HardHat, label: "Mecânicos", path: "/admin/mechanics" },
  { icon: MapPin, label: "Rastreamento", path: "/admin/tracking" },
  { icon: Fuel, label: "Abastecimentos", path: "/admin/fuel" },
  { icon: Wrench, label: "Manutenções", path: "/admin/maintenance" },
  { icon: ArrowLeftRight, label: "Empréstimos", path: "/admin/loans" },
  { icon: FileText, label: "Relatórios", path: "/admin/reports" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const user = useMemo(() => getAuthUser(), []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const initials = ((user?.name || user?.institution || 'AD').trim().slice(0, 2)).toUpperCase();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border fixed h-full z-30">
        <div className="p-3 border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-foreground">Frota Digital</h1>
          <p className="text-xs text-muted-foreground">Painel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all",
                  isActive ? "gradient-primary text-primary-foreground shadow-lg" : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-sidebar-foreground hover:bg-sidebar-accent transition-all">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn("lg:hidden fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border z-50 transition-transform duration-300", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-foreground">Frota Digital</h1>
          <button onClick={() => setSidebarOpen(false)} className="text-sidebar-foreground"><X className="w-6 h-6" /></button>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all", isActive ? "gradient-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent")}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border absolute bottom-0 w-full">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base text-sidebar-foreground hover:bg-sidebar-accent">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground"><Menu className="w-6 h-6" /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button onClick={() => setNotifOpen(true)} className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity">
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-4 w-64 bg-background border rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-semibold text-foreground">{user?.name || 'Administrador'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    {user?.institution ? <p className="text-xs text-muted-foreground mt-1">{user.institution}</p> : null}
                  </div>
                  <button onClick={() => { navigate("/admin/profile"); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors">
                    <User className="w-4 h-4" /> Meu Perfil
                  </button>
                  <div className="border-t border-border mt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-secondary transition-colors">
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8">{children}</div>
      </main>

      <NotificationModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default AdminLayout;
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVehicles from "./pages/admin/Vehicles";
import AdminDrivers from "./pages/admin/Drivers";
import AdminTracking from "./pages/admin/Tracking";
import AdminFuel from "./pages/admin/Fuel";
import AdminMaintenance from "./pages/admin/Maintenance";
import AdminLoans from "./pages/admin/Loans";
import AdminReports from "./pages/admin/Reports";
import AdminProfile from "./pages/admin/Profile";
import AdminMechanics from "./pages/admin/Mechanics";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverFuelPage from "./pages/driver/Fuel";
import DriverMaintenancePage from "./pages/driver/Maintenance";
import DriverDocuments from "./pages/driver/Documents";
import DriverHistory from "./pages/driver/History";
import MechanicDashboard from "./pages/mechanic/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/vehicles" element={<AdminLayout><AdminVehicles /></AdminLayout>} />
          <Route path="/admin/drivers" element={<AdminLayout><AdminDrivers /></AdminLayout>} />
          <Route path="/admin/mechanics" element={<AdminLayout><AdminMechanics /></AdminLayout>} />
          <Route path="/admin/tracking" element={<AdminLayout><AdminTracking /></AdminLayout>} />
          <Route path="/admin/fuel" element={<AdminLayout><AdminFuel /></AdminLayout>} />
          <Route path="/admin/maintenance" element={<AdminLayout><AdminMaintenance /></AdminLayout>} />
          <Route path="/admin/loans" element={<AdminLayout><AdminLoans /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><AdminReports /></AdminLayout>} />
          <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
          {/* Driver routes */}
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/fuel" element={<DriverFuelPage />} />
          <Route path="/driver/maintenance" element={<DriverMaintenancePage />} />
          <Route path="/driver/documents" element={<DriverDocuments />} />
          <Route path="/driver/history" element={<DriverHistory />} />
          {/* Mechanic routes */}
          <Route path="/mechanic" element={<MechanicDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

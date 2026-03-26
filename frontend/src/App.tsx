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
import ForgotPassword from "./pages/ForgotPassword";
import FirstLogin from "./pages/FirstLogin";
import ProtectedRoute from "./components/ProtectedRoute";

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
          <Route path="/first-login" element={<FirstLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/vehicles" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminVehicles /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/drivers" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminDrivers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/mechanics" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminMechanics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tracking" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminTracking /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/fuel" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminFuel /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/maintenance" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminMaintenance /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/loans" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminLoans /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminReports /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute roles={["ADMIN"]}><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />

          <Route path="/driver" element={<ProtectedRoute roles={["DRIVER"]}><DriverDashboard /></ProtectedRoute>} />
          <Route path="/driver/fuel" element={<ProtectedRoute roles={["DRIVER"]}><DriverFuelPage /></ProtectedRoute>} />
          <Route path="/driver/maintenance" element={<ProtectedRoute roles={["DRIVER"]}><DriverMaintenancePage /></ProtectedRoute>} />
          <Route path="/driver/documents" element={<ProtectedRoute roles={["DRIVER"]}><DriverDocuments /></ProtectedRoute>} />
          <Route path="/driver/history" element={<ProtectedRoute roles={["DRIVER"]}><DriverHistory /></ProtectedRoute>} />

          <Route path="/mechanic" element={<ProtectedRoute roles={["MECHANIC"]}><MechanicDashboard /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
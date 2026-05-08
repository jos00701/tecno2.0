import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { MyBookings } from "./pages/MyBookings";
import { Favorites } from "./pages/Favorites";
import { Settings } from "./pages/Settings";
import { Chat } from "./pages/Chat";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard";
import TechnicianSchedule from "./pages/technician/TechnicianSchedule";
import TechnicianEarnings from "./pages/technician/TechnicianEarnings";
import TechnicianHistory from "./pages/technician/TechnicianHistory";
import TechnicianProfile from "./pages/technician/TechnicianProfile";
import { useAuth } from "./context/AuthContext";
import { ReactNode } from "react";

// ─── Componente de ruta protegida ──────────────────────────────────────────
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// ─── Wrapper que redirige al origen después del login ─────────────────────
function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/';

  if (isAuthenticated) {
    if (user?.userType === 'Técnico') {
      return <Navigate to="/technician/dashboard" replace />;
    }
    return <Navigate to={from} replace />;
  }

  return <Login />;
}

export const router = createBrowserRouter([
  // ── Públicas ──
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: Register,
  },

  // ── Privadas (cliente) ──
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/my-bookings",
    element: <ProtectedRoute><MyBookings /></ProtectedRoute>,
  },
  {
    path: "/favorites",
    element: <ProtectedRoute><Favorites /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: "/chat",
    element: <ProtectedRoute><Chat /></ProtectedRoute>,
  },

  // ── Privadas (técnico) ──
  {
    path: "/technician/dashboard",
    element: <ProtectedRoute><TechnicianDashboard /></ProtectedRoute>,
  },
  {
    path: "/technician/schedule",
    element: <ProtectedRoute><TechnicianSchedule /></ProtectedRoute>,
  },
  {
    path: "/technician/earnings",
    element: <ProtectedRoute><TechnicianEarnings /></ProtectedRoute>,
  },
  {
    path: "/technician/history",
    element: <ProtectedRoute><TechnicianHistory /></ProtectedRoute>,
  },
  {
    path: "/technician/profile",
    element: <ProtectedRoute><TechnicianProfile /></ProtectedRoute>,
  },

  // ── Fallback ──
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

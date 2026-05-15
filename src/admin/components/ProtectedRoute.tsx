/**
 * ProtectedRoute.tsx
 * Redirige a /admin (login) si no hay sesión activa.
 */
import { useAdmin } from "@/admin/context/AdminContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAdmin();
  if (!currentUser) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

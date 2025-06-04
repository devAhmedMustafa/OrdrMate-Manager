import { Navigate } from "react-router-dom";
import useAuth from "./useAuth.hook";
import ManagerRole from "./ManagerRole";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== ManagerRole.Admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 
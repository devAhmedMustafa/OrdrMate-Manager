import { Navigate } from "react-router-dom";
import useAuth from "./useAuth.hook";
import ManagerRole from "./ManagerRole";

interface BranchManagerRouteProps {
  children: React.ReactNode;
}

export default function BranchManagerRoute({ children }: BranchManagerRouteProps) {
  const { isAuthenticated, role, branchId } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== ManagerRole.BranchManager || !branchId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

// Guards admin-only routes on the frontend. Every admin API endpoint
// must independently enforce this with the `authorize("admin")`
// backend middleware — this component only prevents a confusing UI.
const AdminRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

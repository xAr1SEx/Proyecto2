import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "../pages";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/*" element={<Navigate to="/auth/login" />} />
    </Routes>
  );
};

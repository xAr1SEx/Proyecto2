import { Navigate, Route, Routes } from "react-router-dom";
import { JournalPage } from "../pages/JournalPage";
import { useAuth } from "../../auth/context/AuthContext";
import { JournalProvider } from "../context/JournalContext";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  return <JournalProvider>{children}</JournalProvider>;
};

export const JournalRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <JournalPage />
          </PrivateRoute>
        }
      />
      <Route path="/*" element={<Navigate to="/" />} />
    </Routes>
  );
};

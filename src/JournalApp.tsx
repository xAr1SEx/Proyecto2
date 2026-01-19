import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { AppRouter } from "./router/AppRouter";
import { AppTheme } from "./theme";
import { AuthProvider } from "./auth/context/AuthContext";

export const JournalApp = () => {
  return (
    <AuthProvider>
      <AppTheme>
        <AppRouter />
      </AppTheme>
    </AuthProvider>
  );
};

import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { FC, ReactNode } from "react";
import { purpleTheme } from "./purpleTheme";

interface AppThemeProps {
  children: ReactNode;
}

export const AppTheme: FC<AppThemeProps> = ({ children }) => {
  return (
    <ThemeProvider theme={purpleTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

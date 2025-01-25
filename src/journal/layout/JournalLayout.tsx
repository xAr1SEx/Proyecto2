import { Box, Toolbar } from "@mui/material";
import { FC, ReactNode } from "react";
import { NavBar } from "../components";
import { SideBar } from "../components/SideBar";

interface JournalChildren {
  children: ReactNode;
}

const drawerWidth = 240;

export const JournalLayout: FC<JournalChildren> = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <NavBar drawerWidth={drawerWidth} />
      <SideBar drawerWidth={drawerWidth} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

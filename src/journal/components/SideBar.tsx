import { TurnedInNot, DeleteOutline } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import { FC } from "react";
import { useJournal } from "../hooks/useJournal";
import { useAuth } from "../../auth/context/AuthContext";

interface Props {
  drawerWidth: number;
}

export const SideBar: FC<Props> = ({ drawerWidth }) => {
  const { notes, activeNote, setActiveNote, deleteNote, formatDate } = useJournal();
  const { currentUser } = useAuth();

  const onSelectNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNote(note);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      await deleteNote(noteId);
    }
  };

  const getUserName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0];
    }
    return "Usuario";
  };

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            {getUserName()}
          </Typography>
        </Toolbar>
        <Divider />
        <List>
          {notes.length === 0 ? (
            <ListItem>
              <Typography variant="body2" color="text.secondary">
                No hay notas aún
              </Typography>
            </ListItem>
          ) : (
            notes.map((note) => (
              <ListItem
                key={note.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    size="small"
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={activeNote?.id === note.id}
                  onClick={() => onSelectNote(note.id)}
                >
                  <ListItemIcon>
                    <TurnedInNot />
                  </ListItemIcon>
                  <Grid container>
                    <ListItemText
                      primary={note.title || "Sin título"}
                      secondary={formatDate(note.date)}
                    />
                  </Grid>
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Drawer>
    </Box>
  );
};

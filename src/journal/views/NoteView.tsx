import { SaveOutlined } from "@mui/icons-material";
import { Button, Grid, TextField, Typography, Alert } from "@mui/material";
import { ImageGallery } from "../components";
import { useJournal } from "../hooks/useJournal";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export const NoteView = () => {
  const { activeNote, saveNote, formatDate, isSaving, setActiveNote } = useJournal();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(Date.now());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    
    // Limpiar timeout de autoguardado al cambiar de nota
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
    
    if (activeNote) {
      const newTitle = activeNote.title || "";
      const newBody = activeNote.body || "";
      setTitle(newTitle);
      setBody(newBody);
      setDate(activeNote.date);
      setSaved(false);
      
      // Actualizar lastSavedRef con los valores de la nota activa
      lastSavedRef.current = { title: newTitle.trim(), body: newBody.trim() };
      
    } else {
      setTitle("");
      setBody("");
      setDate(Date.now());
      setSaved(false);
      lastSavedRef.current = null;
    }
  }, [activeNote]);

  // Actualizar activeNote cuando cambian title o body para que JournalPage pueda acceder a los valores actuales
  useEffect(() => {
    if (activeNote && (activeNote.title !== title || activeNote.body !== body)) {
      setActiveNote({
        ...activeNote,
        title,
        body,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body]);


  const onSaveNote = useCallback(async () => {
    if (!title.trim() && !body.trim()) {
      return;
    }

    try {
      await saveNote({
        title: title.trim(),
        body: body.trim(),
        date,
        imageUrls: activeNote?.imageUrls || [],
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error("💾 [ERROR] ❌ Error al guardar desde NoteView:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      alert(`Error al guardar la nota: ${errorMessage}`);
    }
  }, [title, body, date, activeNote?.imageUrls, saveNote]);

  // Refs para el guardado automático con debounce
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<{ title: string; body: string } | null>(null);

  // Función para guardar automáticamente
  const autoSave = useCallback(() => {
    if (!title.trim() && !body.trim()) {
      return;
    }

    // Evitar guardar si no ha cambiado desde el último guardado
    if (lastSavedRef.current?.title === title.trim() && lastSavedRef.current?.body === body.trim()) {
      return;
    }

    onSaveNote().then(() => {
      lastSavedRef.current = { title: title.trim(), body: body.trim() };
    }).catch(() => {
      // Error ya es manejado en onSaveNote
    });
  }, [title, body, onSaveNote]);

  const AUTO_SAVE_DELAY = 5000; // 5 segundos

  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    if (title.trim() || body.trim()) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        autoSave();
      }, AUTO_SAVE_DELAY);
    }
  }, [title, body, autoSave]);

  const onTitleChange = useCallback((value: string) => {
    setTitle(value);
    setSaved(false);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const onBodyChange = useCallback((value: string) => {
    setBody(value);
    setSaved(false);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);


  const isDisabled = useMemo(() => 
    isSaving || (!title.trim() && !body.trim()),
    [isSaving, title, body]
  );

  const handleSaveClick = useCallback(() => {
    if (!isDisabled) {
      onSaveNote();
    }
  }, [isDisabled, onSaveNote]);

  if (!activeNote) {
    return null;
  }


  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 1 }}
    >
      <Grid item>
        <Typography fontSize={39} fontWeight="light">
          {formatDate(date)}
        </Typography>
      </Grid>
      <Grid item>
        <Button
          color="primary"
          variant="contained"
          size="large"
          sx={{ 
            padding: 2,
            fontSize: "1.1rem",
            fontWeight: "bold",
            boxShadow: 3,
            "&:hover": {
              boxShadow: 6,
              transform: "scale(1.05)",
              transition: "all 0.2s ease-in-out"
            },
            "&:disabled": {
              opacity: 0.6
            }
          }}
          onClick={handleSaveClick}
          disabled={isDisabled}
        >
          <SaveOutlined sx={{ fontSize: 30, mr: 1 }} />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </Grid>
      {saved && (
        <Grid item xs={12} sx={{ mt: 1 }}>
          <Alert severity="success">Nota guardada correctamente</Alert>
        </Grid>
      )}
      <Grid container>
        <TextField
          type="text"
          variant="filled"
          fullWidth
          placeholder="Ingrese un titulo"
          label="Título"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          sx={{ border: "none", mb: 1 }}
        />
        <TextField
          type="text"
          variant="filled"
          fullWidth
          multiline
          placeholder="¿Que sucedió en el día de hoy?"
          minRows={5}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
        />
      </Grid>
      {activeNote.imageUrls && activeNote.imageUrls.length > 0 && (
        <ImageGallery images={activeNote.imageUrls} />
      )}
    </Grid>
  );
};

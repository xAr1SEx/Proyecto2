import { JournalLayout } from "../layout/JournalLayout";
import { NoteView, NothingSelectedView } from "../views";
import { Calendar } from "../components";
import { AddOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useJournal } from "../hooks/useJournal";
import { useMemo, useCallback } from "react";

export const JournalPage = () => {
  const { activeNote, notes, setActiveNote, startNewNote } = useJournal();

  // Buscar nota por fecha (solo desde Firestore - notas sin id temporal)
  const findNoteByDate = useCallback((date: Date) => {
    return notes.find((note) => {
      // Solo buscar en notas reales de Firestore (no temporales)
      if (note.id.startsWith("temp-")) return false;
      
      const noteDate = new Date(note.date);
      return (
        noteDate.getDate() === date.getDate() &&
        noteDate.getMonth() === date.getMonth() &&
        noteDate.getFullYear() === date.getFullYear()
      );
    });
  }, [notes]);

  const handleDateSelect = useCallback((date: Date) => {
    const noteForDate = findNoteByDate(date);

    if (noteForDate) {
      setActiveNote(noteForDate);
    } else {
      startNewNote(date);
    }
  }, [findNoteByDate, setActiveNote, startNewNote]);

  const handleNewNote = useCallback(() => {
    // Si hay una nota activa, no crear nueva (el botón debería estar deshabilitado)
    if (activeNote) {
      return;
    }
    
    startNewNote(new Date());
  }, [activeNote, startNewNote]);

  // markedDates solo incluye notas REALES de Firestore (sin temporales)
  // Esto asegura que las fechas marcadas se reconstruyan automáticamente después de un refresh
  const markedDates = useMemo(() => {
    return notes
      .filter((note) => !note.id.startsWith("temp-")) // Solo notas reales de Firestore
      .map((note) => new Date(note.date));
  }, [notes]);

  // selectedDate solo usa activeNote si existe (temporal o real)
  const selectedDate = useMemo(() => 
    activeNote ? new Date(activeNote.date) : new Date(),
    [activeNote]
  );

  return (
    <JournalLayout>
      <Calendar
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        markedDates={markedDates}
      />
      {activeNote ? <NoteView /> : <NothingSelectedView />}

      <IconButton
        size="large"
        sx={{
          color: "white",
          backgroundColor: activeNote ? "grey.400" : "primary.main",
          ":hover": activeNote 
            ? { backgroundColor: "grey.400", cursor: "not-allowed" }
            : { backgroundColor: "primary.dark", opacity: 0.9 },
          position: "fixed",
          right: 50,
          bottom: 50,
          width: 64,
          height: 64,
        }}
        onClick={handleNewNote}
        disabled={!!activeNote}
        title={activeNote ? "Termina de editar la nota actual antes de crear una nueva" : "Crear nueva nota"}
      >
        <AddOutlined sx={{ fontSize: 30 }} />
      </IconButton>
    </JournalLayout>
  );
};

import { createContext, useContext, useEffect, useState, useRef, ReactNode, useMemo, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { FirebaseDB } from "../../firebase/config";
import { useAuth } from "../../auth/context/AuthContext";

export interface Note {
  id: string;
  title: string;
  body: string;
  date: number;
  imageUrls?: string[];
}

interface JournalContextType {
  notes: Note[];
  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  saveNote: (note: Omit<Note, "id">) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  startNewNote: (date?: Date) => void;
  formatDate: (timestamp: number) => string;
  notesByMonth: { [key: string]: Note[] };
  isSaving: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
};

interface JournalProviderProps {
  children: ReactNode;
}

export const JournalProvider = ({ children }: JournalProviderProps) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const notesStateRef = useRef<Note[]>([]); // Ref para acceder al valor actualizado de notes
  
  // Actualizar el ref cuando notes cambia
  useEffect(() => {
    notesStateRef.current = notes;
  }, [notes]);

  // Cargar notas del usuario actual
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotes([]);
      setActiveNote(null);
      return;
    }

    // Usar estructura simple: colección 'notes' con filtro por userId
    // Esta estructura es más eficiente y compatible con las reglas de seguridad
    const notesCollection = collection(FirebaseDB, "notes");
    const q = query(
      notesCollection,
      where("userId", "==", currentUser.uid),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData: Note[] = [];
        
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          
          // Convertir Timestamp de Firestore a number (timestamp en milisegundos)
          let dateValue: number;
          if (data.date instanceof Timestamp) {
            dateValue = data.date.toMillis();
          } else if (typeof data.date === 'number') {
            dateValue = data.date;
          } else {
            console.warn("🔥 [WARN] Formato de fecha inesperado:", data.date);
            dateValue = Date.now();
          }

          notesData.push({
            id: docSnapshot.id,
            title: data.title ?? "",
            body: data.body ?? "",
            date: dateValue,
            imageUrls: data.imageUrls ?? [],
          });
        });
        
        setNotes(notesData);
      },
      (error: unknown) => {
        // Si es error de permisos, mostrar mensaje claro
        if (error && typeof error === 'object' && 'code' in error && error.code === "permission-denied") {
          alert("Error de permisos en Firestore. Verifica las reglas en Firebase Console.");
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Efecto para reemplazar notas temporales cuando llegan desde Firestore
  useEffect(() => {
    // Solo procesar si hay una nota temporal activa
    if (!activeNote?.id.startsWith("temp-")) {
      return;
    }

    
    // Buscar nota real que coincida con la temporal
    const matchingRealNote = notes.find((realNote) => {
      // No considerar notas temporales
      if (realNote.id.startsWith("temp-")) return false;
      
      // Comparar por día (ya que puede haber diferencia de milisegundos)
      const tempDate = new Date(activeNote.date);
      const realDate = new Date(realNote.date);
      const sameDay = 
        tempDate.getDate() === realDate.getDate() &&
        tempDate.getMonth() === realDate.getMonth() &&
        tempDate.getFullYear() === realDate.getFullYear();
      
      // Si la nota temporal tiene título y cuerpo, deben coincidir
      // Si está vacía, solo comparar por fecha
      const hasContent = activeNote.title || activeNote.body;
      
      if (hasContent) {
        return sameDay && 
               realNote.title === activeNote.title &&
               realNote.body === activeNote.body;
      } else {
        // Si la temporal está vacía, buscar cualquier nota en ese día
        return sameDay;
      }
    });
    
    if (matchingRealNote) {
      setActiveNote(matchingRealNote);
    }
  }, [notes, activeNote]);

  // Guardar o actualizar nota
  const saveNote = useCallback(async (note: Omit<Note, "id">) => {
    if (!currentUser?.uid) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);
    
    // Timeout de seguridad: siempre poner isSaving en false después de 3 segundos
    const safetyTimeout = setTimeout(() => {
      setIsSaving(false);
    }, 3000);
    
    try {
      const dateTimestamp = Timestamp.fromMillis(note.date);
      const noteData = {
        title: note.title,
        body: note.body,
        date: dateTimestamp,
        userId: currentUser.uid,
        imageUrls: note.imageUrls || [],
      };

      if (activeNote?.id && !activeNote.id.startsWith("temp-")) {
        // Actualizar nota existente
        const noteDocRef = doc(FirebaseDB, "notes", activeNote.id);
        await updateDoc(noteDocRef, noteData);
      } else {
        // Crear nueva nota
        const notesCollection = collection(FirebaseDB, "notes");
        await addDoc(notesCollection, noteData);
      }
      
      clearTimeout(safetyTimeout);
      
      // Limpiar activeNote después de un breve delay
      setTimeout(() => {
        setActiveNote(null);
      }, 500);
      
    } catch (error: any) {
      clearTimeout(safetyTimeout);
      if (error?.code === "permission-denied") {
        alert("❌ Error de permisos. Verifica las reglas de Firestore en Firebase Console.");
      }
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [currentUser?.uid, activeNote]);

  // Eliminar nota
  const deleteNote = useCallback(async (noteId: string) => {
    if (!currentUser?.uid) return;

    try {
      const noteRef = doc(FirebaseDB, "notes", noteId);
      await deleteDoc(noteRef);
      if (activeNote?.id === noteId) {
        setActiveNote(null);
      }
    } catch (error) {
      throw error;
    }
  }, [currentUser?.uid, activeNote?.id]);

  // Crear nueva nota
  const startNewNote = useCallback((date?: Date) => {
    const noteDate = date ? date.getTime() : Date.now();
    const newNote: Note = {
      id: `temp-${Date.now()}`,
      title: "",
      body: "",
      date: noteDate,
      imageUrls: [],
    };
    setActiveNote(newNote);
  }, []);

  // Meses en español
  const MONTHS = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ] as const;

  // Formatear fecha para mostrar
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getDate()} de ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
  }, []);

  // Obtener notas por mes
  const notesByMonth = useMemo(() => {
    const grouped: { [key: string]: Note[] } = {};
    notes.forEach((note) => {
      const date = new Date(note.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(note);
    });
    return grouped;
  }, [notes]);

  const value = useMemo<JournalContextType>(() => ({
    notes,
    activeNote,
    setActiveNote,
    saveNote,
    deleteNote,
    startNewNote,
    formatDate,
    notesByMonth,
    isSaving,
  }), [notes, activeNote, saveNote, deleteNote, startNewNote, formatDate, notesByMonth, isSaving]);

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

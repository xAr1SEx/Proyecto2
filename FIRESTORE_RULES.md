# Reglas de Firestore necesarias

Para que la aplicación funcione correctamente, necesitas configurar las reglas de seguridad de Firestore en Firebase Console.

## Pasos para configurar Firestore:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **journal-app-d38ea**
3. En el menú lateral, ve a **Firestore Database**
4. Haz clic en la pestaña **Rules**
5. Reemplaza las reglas con las siguientes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Colección 'notes' - usuarios solo pueden leer/escribir sus propias notas
    match /notes/{noteId} {
      // Permitir lectura solo si el userId del documento coincide con el usuario autenticado
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      
      // Permitir creación solo si el userId en los datos coincide con el usuario autenticado
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      
      // Permitir actualización solo si el documento pertenece al usuario y el userId no cambia
      allow update: if request.auth != null && 
                     resource.data.userId == request.auth.uid &&
                     request.resource.data.userId == request.auth.uid;
      
      // Permitir eliminación solo si el documento pertenece al usuario
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

6. Haz clic en **Publish**

## Verificar que Firestore esté habilitado:

1. En Firebase Console, ve a **Firestore Database**
2. Si no está habilitado, haz clic en **Create database**
3. Selecciona **Start in test mode** (temporalmente) o **Start in production mode** con las reglas de arriba
4. Elige una ubicación para la base de datos

## Estructura de Datos:

La aplicación usa una estructura simple y eficiente:
- **Colección**: `notes` (colección directa, no subcolección)
- **Campos requeridos en cada documento**:
  - `userId` (string): ID del usuario propietario
  - `title` (string): Título de la nota
  - `body` (string): Contenido de la nota
  - `date` (number): Timestamp de la fecha de la nota
  - `imageUrls` (array, opcional): URLs de imágenes adjuntas

**Ejemplo de documento**:
```javascript
{
  userId: "OAc5GfWObtRAldJh7pIJn1CMWFc2",
  title: "Mi Nota",
  body: "Contenido de la nota",
  date: 1704825600000,
  imageUrls: []
}
```

## Crear Índice Compuesto (si es necesario):

Si Firebase te pide crear un índice compuesto para la query `where("userId", "==", ...) orderBy("date", "desc")`:

1. Haz clic en el enlace de error que aparece en la consola del navegador
2. O ve a Firebase Console > Firestore Database > Indexes
3. Firebase te proporcionará un botón para crear el índice automáticamente
4. Espera a que el índice se cree (puede tardar unos minutos)

## Verificar en la consola del navegador:

Abre la consola del navegador (F12) y busca estos logs:
- `🔥 [DEBUG]` - Para ver el flujo de Firestore
- `📅 [DEBUG]` - Para ver la selección de fechas
- `➕ [DEBUG]` - Para ver el botón de crear nota
- `💾 [DEBUG]` - Para ver el proceso de guardado
- `🔥 [ERROR]` o `💾 [ERROR]` - Para ver errores

## Nota importante:

**IMPORTANTE**: Si tienes datos antiguos con la estructura anterior (`${userId}/journal/notes`), necesitarás:
1. Migrar los datos a la nueva estructura, O
2. Eliminar la base de datos y empezar de nuevo (solo para desarrollo)

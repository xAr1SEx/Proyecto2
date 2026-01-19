import { Google } from "@mui/icons-material";
import {
  Alert,
  Button,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layout/AuthLayout";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Reset error cuando el usuario empieza a escribir
    if (error) setError(null);
    if (!isFormValid) setIsFormValid(true);
  };

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      setIsFormValid(false);
      return;
    }
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loginWithGoogle();
      navigate("/");
    } catch (error: any) {
      console.error("Error completo:", error);
      
      let errorMessage = "Error al iniciar sesión con Google. Intenta nuevamente.";
      
      if (error?.code) {
        const errorCode = error.code;
        
        // Mensajes específicos según el código de error de Firebase
        switch (errorCode) {
          case "auth/popup-blocked":
            errorMessage = "El popup fue bloqueado. Por favor, permite popups para este sitio.";
            break;
          case "auth/popup-closed-by-user":
            errorMessage = "El popup fue cerrado antes de completar el inicio de sesión.";
            break;
          case "auth/cancelled-popup-request":
            errorMessage = "Solo se permite una solicitud de popup a la vez.";
            break;
          case "auth/unauthorized-domain":
            errorMessage = "Este dominio no está autorizado. Verifica la configuración en Firebase Console.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "El método de autenticación Google no está habilitado. Actívalo en Firebase Console.";
            break;
          case "auth/configuration-not-found":
            errorMessage = "Error: El método de autenticación Google no está configurado en Firebase. Ve a Firebase Console > Authentication > Sign-in method y habilita Google.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Error de red. Verifica tu conexión a internet.";
            break;
          default:
            // Mostrar el mensaje de error de Firebase si está disponible
            if (error?.message) {
              errorMessage = `Error: ${error.message}`;
            }
        }
      } else if (error instanceof Error) {
        if (error.message.includes("popup")) {
          errorMessage = "El popup fue bloqueado. Por favor, permite popups para este sitio.";
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Login">
      <form>
        <Grid container>
          {error && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField
              label="Correo"
              type="email"
              placeholder="correo@google.com"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!isFormValid && !formData.email}
              helperText={
                !isFormValid && !formData.email
                  ? "Este campo es obligatorio"
                  : ""
              }
            />
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField
              label="Contraseña"
              type="password"
              placeholder="Contraseña"
              fullWidth
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              error={!isFormValid && !formData.password}
              helperText={
                !isFormValid && !formData.password
                  ? "Este campo es obligatorio"
                  : ""
              }
            />
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleLogin}
                disabled={!formData.email || !formData.password}
              >
                Login
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <Google />
                <Typography sx={{ ml: 1 }}>Google</Typography>
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row" justifyContent="end">
            <Link component={RouterLink} color="inherit" to="/auth/register">
              Crear una cuenta
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

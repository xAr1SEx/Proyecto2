import { Button, Grid, Link, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layout/AuthLayout";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegister = () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setIsFormValid(false);
      return;
    }
    navigate("/auth/login");
  };

  return (
    <AuthLayout title="Crear cuenta">
      <form>
        <Grid container>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField
              label="Nombre Completo"
              type="text"
              placeholder="Christian Casso"
              fullWidth
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              error={!isFormValid && !formData.fullName}
              helperText={
                !isFormValid && !formData.fullName
                  ? "Este campo es obligatorio"
                  : ""
              }
            />
          </Grid>
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
            <Grid item xs={12}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleRegister}
                disabled={
                  !formData.fullName || !formData.email || !formData.password
                }
              >
                Crear cuenta
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="row" justifyContent="end">
            <Typography sx={{ mr: 1 }}>¿Ya tienes cuenta?</Typography>
            <Link component={RouterLink} color="inherit" to="/auth/login">
              ingresar
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};

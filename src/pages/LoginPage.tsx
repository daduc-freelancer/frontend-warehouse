import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { fetchUsers } from "../api";
import { useSnackbar } from "notistack";
// import bcrypt from "bcryptjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleLogin = async () => {
    if (!email.includes("@")) {
      enqueueSnackbar("Vui lòng nhập email hợp lệ", { variant: "warning" });
      return;
    }

    if (!password) {
      enqueueSnackbar("Vui lòng nhập mật khẩu", { variant: "warning" });
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        enqueueSnackbar(data.message || "Đăng nhập thất bại", {
          variant: "error",
        });
        return;
      }

      const user = await res.json();
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);
      enqueueSnackbar("Đăng nhập thành công!", { variant: "success" });

      navigate("/thiet-bi-muon");
    } catch (error) {
      enqueueSnackbar("Lỗi kết nối tới server.", { variant: "error" });
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
      }}
    >
      <Paper elevation={4} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" gutterBottom textAlign="center">
          Đăng nhập
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Mật khẩu"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" color="primary" onClick={handleLogin}>
            Đăng nhập
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

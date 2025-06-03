import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { jwtDecode } from "jwt-decode";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("userEmail");

      if (!token || !email) {
        navigate("/");
        return;
      }

      // Decode token để kiểm tra hạn
      try {
        const decoded: any = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          enqueueSnackbar("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", {
            variant: "warning",
          });
          localStorage.clear();
          navigate("/");
          return;
        }
      } catch {
        localStorage.clear();
        navigate("/");
        return;
      }

      // Nếu token còn hạn thì thử kết nối API
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Server không phản hồi");
      } catch (err) {
        enqueueSnackbar("Mất kết nối server. Đang đăng xuất...", {
          variant: "error",
        });
        localStorage.clear();
        navigate("/");
      }
    };

    // Check ngay và định kỳ 2 phút/lần
    checkAuth();
    const interval = setInterval(checkAuth, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return <>{children}</>;
}

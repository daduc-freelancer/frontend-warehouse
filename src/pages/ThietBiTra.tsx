import { useEffect, useState } from "react";
import { fetchTraData } from "../api"; // Giả sử đây là hàm gọi API để lấy dữ liệu trả về
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  TableContainer,
  TextField,
  CircularProgress,
  Box,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
// Định nghĩa kiểu dữ liệu cho hàng
type RowData = {
  "Ngày trả": string;
  "Tên thiết bị": string;
  "Seri/SĐT": string;
  "Biển số xe": string;
  "Người trả": string;
  "Ghi chú": string;
};

export default function ThietBiTra() {
  const [rows, setRows] = useState<RowData[]>([]); // Đảm bảo kiểu dữ liệu là mảng RowData
  const [filteredRows, setFilteredRows] = useState<RowData[]>([]); // Đảm bảo kiểu dữ liệu là mảng RowData
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    fetchTraData()
      .then((data) => {
        console.log("Dữ liệu API trả về:", data);

        // Kiểm tra nếu API trả về dữ liệu chứa mảng
        const rawData = data.data || data; // Tùy thuộc vào cấu trúc của API trả về
        if (Array.isArray(rawData) && rawData.length > 0) {
          const formattedData: RowData[] = rawData.slice(1).map((row) => ({
            "Ngày trả": row[0] || "",
            "Tên thiết bị": row[1] || "",
            "Seri/SĐT": row[2] || "",
            "Biển số xe": row[3] || "",
            "Người trả": row[4] || "",
            "Ghi chú": row[5] || "",
          }));

          setRows(formattedData);
          setFilteredRows(formattedData);
        } else {
          console.error("Dữ liệu không phải mảng hoặc mảng rỗng:", rawData);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredRows(rows);
      return;
    }

    const lowerSearch = search.toLowerCase();
    const filtered = rows.filter((row) =>
      Object.values(row).some((cell) =>
        cell.toLowerCase().includes(lowerSearch)
      )
    );

    setFilteredRows(filtered);
  }, [search, rows]);

  if (!userEmail) {
    return (
      <Typography variant="h6">Vui lòng đăng nhập để xem dữ liệu.</Typography>
    );
  }

  return (
    <div>
      <Box p={3}>
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          fontSize={"32px"}
          fontWeight={"bold"}
        >
          THIẾT BỊ TRẢ
        </Typography>

        <Box display="flex" justifyContent="center" mt={2}>
          <TextField
            variant="outlined"
            placeholder="Tìm kiếm thiết bị, SĐT, biển số xe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "#fff",
              borderRadius: 1,
              boxShadow: 1,
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày trả</TableCell>
                  <TableCell>Tên thiết bị</TableCell>
                  <TableCell>Seri/SĐT</TableCell>
                  <TableCell>Biển số xe</TableCell>
                  <TableCell>Người trả</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.values(row).map((cell, cid) => (
                        <TableCell key={cid}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </div>
  );
}

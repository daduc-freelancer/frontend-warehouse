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
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
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
  const [sortColumn, setSortColumn] = useState<keyof RowData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const parseDate = (str: string) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day); // JS dùng month 0-based
  };

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

          //  👉 Lọc chỉ lấy thiết bị trả bởi đúng người đang đăng nhập
          const filteredByUser = userName
            ? formattedData.filter(
                (row) => row["Người trả"].trim() === userName.trim()
              )
            : formattedData;

          setRows(filteredByUser);
          setFilteredRows(filteredByUser);
          // setRows(formattedData);
          // setFilteredRows(formattedData);
        } else {
          console.error("Dữ liệu không hợp lệ:", rawData);
        }

        setLoading(false);
      })
      .catch((error) => {
        // console.error("Lỗi khi gọi API:", error);
        if (error.message?.includes("Failed to fetch")) {
          enqueueSnackbar("Không thể kết nối server. Vui lòng đăng nhập lại.", {
            variant: "error",
          });
          localStorage.clear();
          navigate("/");
        }
        setLoading(false);
      });
  }, []);

  const handleSort = (column: keyof RowData) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";

    const sorted = [...filteredRows].sort((a, b) => {
      const aVal = String(a[column]).toLowerCase();
      const bVal = String(b[column]).toLowerCase();
      // Nếu là ngày dạng dd/mm/yyyy
      if (column === "Ngày trả") {
        const dateA = parseDate(String(aVal));
        const dateB = parseDate(String(bVal));
        return newDirection === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      // Nếu là số điện thoại hoặc seri (ưu tiên số)
      if (column === "Seri/SĐT") {
        const aNum = parseFloat(String(aVal));
        const bNum = parseFloat(String(bVal));
        const aIsNum = !isNaN(aNum);
        const bIsNum = !isNaN(bNum);
        if (aIsNum && bIsNum) {
          return newDirection === "asc" ? aNum - bNum : bNum - aNum;
        }
      }

      // So sánh dạng chuỗi cho các cột còn lại
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return newDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    setSortColumn(column);
    setSortDirection(newDirection);
    setFilteredRows(sorted);
  };

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
          <TableContainer
            component={Paper}
            sx={{ marginTop: 2, tableLayout: "fixed", width: "100%" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Ngày trả",
                    "Tên thiết bị",
                    "Seri/SĐT",
                    "Biển số xe",
                    "Người trả",
                    "Ghi chú",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      onClick={() => handleSort(col as keyof RowData)}
                      sx={{ cursor: "pointer", fontWeight: "bold" }}
                    >
                      {col}
                      {sortColumn === col &&
                        (sortDirection === "asc" ? " 🔼" : " 🔽")}
                    </TableCell>
                  ))}
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
                        <TableCell
                          key={cid}
                          sx={{
                            width: 200,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {cell}
                        </TableCell>
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

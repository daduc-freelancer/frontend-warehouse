import { useEffect, useState } from "react";
import { fetchMuonData, fetchTraData } from "../api";
import { useNavigate } from "react-router-dom";
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
import useDebounce from "../hooks/useDebounce";
import { enqueueSnackbar } from "notistack";

type RowData = {
  "Ngày mượn": string;
  "Tên thiết bị": string;
  "Seri/SĐT": string;
  // "Biển số xe": string;
  "Người mượn": string;
  "Ghi chú": string;
  "Đã trả": boolean;
};

export default function ThietBiMuon() {
  const [rows, setRows] = useState<RowData[]>([]);
  const [filteredRows, setFilteredRows] = useState<RowData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");
  const [sortColumn, setSortColumn] = useState<keyof RowData | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  const parseDate = (str: string) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day); // JS dùng month 0-based
  };

  const handleSort = (column: keyof RowData) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    const newDirection = isAsc ? "desc" : "asc";

    const sorted = [...filteredRows].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      // Nếu là ngày dạng dd/mm/yyyy
      if (column === "Ngày mượn") {
        const dateA = parseDate(String(aValue));
        const dateB = parseDate(String(bValue));
        return newDirection === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      // Boolean sort
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return newDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      if (column === "Seri/SĐT") {
        const aNum = parseFloat(String(aValue));
        const bNum = parseFloat(String(bValue));
        const aIsNum = !isNaN(aNum);
        const bIsNum = !isNaN(bNum);

        if (aIsNum && bIsNum) {
          return newDirection === "asc" ? aNum - bNum : bNum - aNum;
        }
      }
      // String sort (ép kiểu an toàn)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      return newDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    setSortColumn(column);
    setSortDirection(newDirection);
    setFilteredRows(sorted);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [muonData, traData] = await Promise.all([
          fetchMuonData(),
          fetchTraData(),
        ]);
        const muonRaw = muonData.data || muonData;
        const traRaw = traData.data || traData;

        const traKeySet = new Set(
          traRaw.map(
            (row: any[]) => `${row[1] || ""}_${row[2] || ""}_${row[4] || ""}`
          )
        );

        const formattedData: RowData[] = muonRaw.map((row: any[]) => ({
          "Ngày mượn": row[0] || "",
          "Tên thiết bị": row[1] || "",
          "Seri/SĐT": row[2] || "",
          // "Biển số xe": row[3] || "",
          "Người mượn": row[3] || "",
          "Đã trả": traKeySet.has(
            `${row[1] || ""}_${row[2] || ""}_${row[3] || ""}`
          ),
          "Ghi chú": row[5] || "",
        }));

        const currentUser = userName?.trim().toLowerCase();
        const userFilteredData = formattedData.filter(
          (row) => row["Người mượn"].trim().toLowerCase() === currentUser
        );

        setRows(userFilteredData);
        setFilteredRows(userFilteredData);
      } catch (error: any) {
        console.error("Lỗi khi tải dữ liệu:", error);
        if (error.message?.includes("Failed to fetch")) {
          enqueueSnackbar("Không thể kết nối server. Vui lòng đăng nhập lại.", {
            variant: "error",
          });
          localStorage.clear();
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredRows(rows);
      return;
    }

    const lowerSearch = debouncedSearch.toLowerCase();
    const filtered = rows.filter((row) =>
      Object.values(row).some(
        (cell) =>
          typeof cell === "string" && cell.toLowerCase().includes(lowerSearch)
      )
    );

    setFilteredRows(filtered);
  }, [debouncedSearch, rows]);

  if (!userEmail) {
    return (
      <Typography variant="h6" align="center" color="error">
        Vui lòng đăng nhập để xem dữ liệu.
      </Typography>
    );
  }

  return (
    <Box p={3}>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        fontSize={"32px"}
        fontWeight={"bold"}
      >
        THIẾT BỊ MƯỢN
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
                {[
                  "Ngày mượn",
                  "Tên thiết bị",
                  "Seri/SĐT",
                  "Người mượn",
                  "Đã trả",
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
                    <TableCell>{row["Ngày mượn"]}</TableCell>
                    <TableCell>{row["Tên thiết bị"]}</TableCell>
                    <TableCell>{row["Seri/SĐT"]}</TableCell>
                    {/* <TableCell>{row["Biển số xe"]}</TableCell> */}
                    <TableCell>{row["Người mượn"]}</TableCell>
                    <TableCell>{row["Đã trả"] ? "✅" : "❌"}</TableCell>
                    <TableCell>{row["Ghi chú"]}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

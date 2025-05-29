import { useEffect, useState } from "react";
import { fetchMuonData, fetchTraData } from "../api";
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

  const debouncedSearch = useDebounce(search, 300);

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
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
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
                <TableCell>Ngày mượn</TableCell>
                <TableCell>Tên thiết bị</TableCell>
                <TableCell>Seri/SĐT</TableCell>
                {/* <TableCell>Biển số xe</TableCell> */}
                <TableCell>Người mượn</TableCell>
                <TableCell>Đã trả</TableCell>
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

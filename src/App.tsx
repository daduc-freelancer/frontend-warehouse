import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ThietBiMuon from "./pages/ThietBiMuon";
import ThietBiTra from "./pages/ThietBiTra";
import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/thiet-bi-muon" element={<ThietBiMuon />} />
          <Route path="/thiet-bi-tra" element={<ThietBiTra />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

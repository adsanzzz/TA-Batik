import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Katalog from "./pages/Katalog";
import Scan from "./pages/Scan";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InputBatik from "./pages/admin/InputBatik";
import ManajemenBatik from "./pages/admin/ManajemenBatik";
import ManajemenFrame from "./pages/admin/ManajemenFrame";
import ManajemenInfoBatik from "./pages/admin/ManajemenInfoBatik";
import ManajemenModel from "./pages/admin/ManajemenModel";
import Photobox from "./pages/Photobox";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Mitra & Admin-Mitra Pages
import RegisterMitra from "./pages/RegisterMitra";
import VerifikasiMitra from "./pages/admin/VerifikasiMitra";
import MitraDashboard from "./pages/mitra/MitraDashboard";
import InputBatikMitra from "./pages/mitra/InputBatikMitra";
import ManajemenBatikMitra from "./pages/mitra/ManajemenBatikMitra";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 70px)" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/photobox" element={<Photobox />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-mitra" element={<RegisterMitra />} />
          
          {/* PROTECTED ROUTES */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/input" 
            element={
              <ProtectedRoute>
                <InputBatik />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manajemen" 
            element={
              <ProtectedRoute>
                <ManajemenBatik />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/frames" 
            element={
              <ProtectedRoute>
                <ManajemenFrame />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/info-scan" 
            element={
              <ProtectedRoute>
                <ManajemenInfoBatik />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/verifikasi-mitra" 
            element={
              <ProtectedRoute>
                <VerifikasiMitra />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/models" 
            element={
              <ProtectedRoute>
                <ManajemenModel />
              </ProtectedRoute>
            } 
          />

          {/* MITRA PROTECTED ROUTES */}
          <Route 
            path="/mitra/dashboard" 
            element={
              <ProtectedRoute>
                <MitraDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mitra/input" 
            element={
              <ProtectedRoute>
                <InputBatikMitra />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mitra/manajemen" 
            element={
              <ProtectedRoute>
                <ManajemenBatikMitra />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
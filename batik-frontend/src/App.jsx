import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import AIGenerative from "./pages/AIGenerative";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingLogo from "./components/LoadingLogo";
import ornamentImage from "./assets/ornament.png";

// Mitra & Admin-Mitra Pages
import RegisterMitra from "./pages/RegisterMitra";
import VerifikasiMitra from "./pages/admin/VerifikasiMitra";
import MitraDashboard from "./pages/mitra/MitraDashboard";
import InputBatikMitra from "./pages/mitra/InputBatikMitra";
import ManajemenBatikMitra from "./pages/mitra/ManajemenBatikMitra";

function PageTransition({ children }) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <>
      {children}
      {isTransitioning && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 17, 125, 0.3)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999
        }}>
          <LoadingLogo text={null} size={250} />
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <PageTransition>
        <div style={{
          position: "fixed", top: "10%", left: "-150px", width: "400px", height: "400px",
          backgroundImage: `url(${ornamentImage})`, backgroundSize: "contain", backgroundRepeat: "no-repeat",
          opacity: 0.1, pointerEvents: "none", zIndex: 0, transform: "rotate(15deg)"
        }} />
        <div style={{
          position: "fixed", bottom: "5%", right: "-150px", width: "450px", height: "450px",
          backgroundImage: `url(${ornamentImage})`, backgroundSize: "contain", backgroundRepeat: "no-repeat",
          opacity: 0.1, pointerEvents: "none", zIndex: 0, transform: "rotate(-25deg)"
        }} />
        <Navbar />
        <div style={{ minHeight: "calc(100vh - 70px)", position: "relative", zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/katalog" element={<Katalog />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/generative" element={<AIGenerative />} />
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
              path="/admin/manajemen-frame" 
              element={
                <ProtectedRoute>
                  <ManajemenFrame />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manajemen-info-batik" 
              element={
                <ProtectedRoute>
                  <ManajemenInfoBatik />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manajemen-model" 
              element={
                <ProtectedRoute>
                  <ManajemenModel />
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
            
            {/* MITRA ROUTES */}
            <Route 
              path="/mitra/dashboard" 
              element={
                <ProtectedRoute requiredRole="mitra">
                  <MitraDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mitra/input-batik" 
              element={
                <ProtectedRoute requiredRole="mitra">
                  <InputBatikMitra />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mitra/manajemen-batik" 
              element={
                <ProtectedRoute requiredRole="mitra">
                  <ManajemenBatikMitra />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </PageTransition>
    </BrowserRouter>
  );
}

export default App;
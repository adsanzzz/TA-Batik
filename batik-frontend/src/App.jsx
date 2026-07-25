import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingLogo from "./components/LoadingLogo";
import ornamentImage from "./assets/ornament.png";

// Halaman di-lazy-load (code-splitting): tiap halaman jadi file JS terpisah,
// hanya diunduh saat halamannya dibuka -> load awal jauh lebih ringan.
const Home = lazy(() => import("./pages/Home"));
const Katalog = lazy(() => import("./pages/Katalog"));
const Scan = lazy(() => import("./pages/Scan"));
const Login = lazy(() => import("./pages/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const InputBatik = lazy(() => import("./pages/admin/InputBatik"));
const ManajemenBatik = lazy(() => import("./pages/admin/ManajemenBatik"));
const ManajemenFrame = lazy(() => import("./pages/admin/ManajemenFrame"));
const ManajemenInfoBatik = lazy(() => import("./pages/admin/ManajemenInfoBatik"));
const ManajemenModel = lazy(() => import("./pages/admin/ManajemenModel"));
const Photobox = lazy(() => import("./pages/Photobox"));
const AIGenerative = lazy(() => import("./pages/AIGenerative"));
const VirtualTryOn = lazy(() => import("./pages/VirtualTryOn"));

// Mitra & Admin-Mitra Pages
const RegisterMitra = lazy(() => import("./pages/RegisterMitra"));
const VerifikasiMitra = lazy(() => import("./pages/admin/VerifikasiMitra"));
const MitraDashboard = lazy(() => import("./pages/mitra/MitraDashboard"));
const InputBatikMitra = lazy(() => import("./pages/mitra/InputBatikMitra"));
const ManajemenBatikMitra = lazy(() => import("./pages/mitra/ManajemenBatikMitra"));

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
          background: "rgba(253, 250, 244, 0.75)",
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
          <Suspense fallback={
            <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LoadingLogo text={null} size={200} />
            </div>
          }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/katalog" element={<Katalog />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/generative" element={<AIGenerative />} />
            <Route path="/virtual-try-on" element={<VirtualTryOn />} />
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
          </Suspense>
        </div>
      </PageTransition>
    </BrowserRouter>
  );
}

export default App;
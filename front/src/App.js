import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/api';
import Login from './pages/Login';
import RegisterSudija from './pages/RegisterSudija';
import RegisterOrganizator from './pages/RegisterOrganizator';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import TakmicenjaManagement from './pages/TakmicenjaManagement';
import IzdanjaManagement from './pages/IzdanjaManagement';
import TakmicarkiKrugManagement from './pages/TakmicarkiKrugManagement';
import DvoraneManagement from './pages/DvoraneManagement';
import DrzaveManagement from './pages/DrzaveManagement';
import UcesniciManagement from './pages/UcesniciManagement';
import PesmeManagement from './pages/PesmeManagement';
import SudijeManagement from './pages/SudijeManagement';
import ZirijiManagement from './pages/ZirijiManagement';
import NagradeManagement from './pages/NagradeManagement';
import DodeljivanjeNagradaManagement from './pages/DodeljivanjeNagradaManagement';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await authService.getMe();
          // Backend vraća { data: serializer_data }
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-2xl">Učitavanje...</div>
      </div>
    );
  }

  return (
    <Router>
      {user && <Navbar user={user} />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register-sudija" element={user ? <Navigate to="/" /> : <RegisterSudija setUser={setUser} />} />
        <Route path="/register-organizator" element={user ? <Navigate to="/" /> : <RegisterOrganizator setUser={setUser} />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute user={user}>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/profil"
          element={
            <PrivateRoute user={user}>
              <Profile user={user} setUser={setUser} />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/takmicenja"
          element={
            <PrivateRoute user={user}>
              <TakmicenjaManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/izdanja"
          element={
            <PrivateRoute user={user}>
              <IzdanjaManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/krugovi"
          element={
            <PrivateRoute user={user}>
              <TakmicarkiKrugManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/dvorane"
          element={
            <PrivateRoute user={user}>
              <DvoraneManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/drzave"
          element={
            <PrivateRoute user={user}>
              <DrzaveManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/ucesnici"
          element={
            <PrivateRoute user={user}>
              <UcesniciManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/pesme"
          element={
            <PrivateRoute user={user}>
              <PesmeManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/sudije"
          element={
            <PrivateRoute user={user}>
              <SudijeManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/ziriji"
          element={
            <PrivateRoute user={user}>
              <ZirijiManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/nagrade"
          element={
            <PrivateRoute user={user}>
              <NagradeManagement />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/organizator/dodeljivanje-nagrada"
          element={
            <PrivateRoute user={user}>
              <DodeljivanjeNagradaManagement />
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

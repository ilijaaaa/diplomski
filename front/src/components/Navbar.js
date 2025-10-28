import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const Navbar = ({ user }) => {
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const getRoleLabel = (tipk) => {
    const roles = {
      'SUDIJA': '🎵 Sudija',
      'ORGANIZATOR': '🎪 Organizator',
      'UCESNIK': '🎤 Učesnik',
    };
    return roles[tipk] || tipk;
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎵</span>
            <span className="text-xl font-bold">Muzičko takmičenje</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">{getRoleLabel(user?.tipk)}</span>
            <span className="text-sm font-semibold">{user?.imek} {user?.przk}</span>
            
            <Link
              to="/profil"
              className="px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition"
            >
              Profil
            </Link>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
            >
              Odjava
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

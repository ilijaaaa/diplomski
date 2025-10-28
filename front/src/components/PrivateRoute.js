import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ user, children }) => {
  // Ako nema user-a, preusmeri na login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Ako user postoji ali nema tipk (još se učitava), prikaži loading
  if (!user.tipk) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="text-white text-2xl">Učitavanje korisničkih podataka...</div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;

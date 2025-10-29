import React from 'react';
import { Link } from 'react-router-dom';
import OrganizatorDashboard from './OrganizatorDashboard';

const Dashboard = ({ user }) => {
  // Ako se user još uvek učitava, prikaži loading
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam...</p>
          </div>
        </div>
      </main>
    );
  }

  const renderDashboard = () => {
    switch (user?.tipk) {
      case 'SUDIJA':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">🎵 Dobrodošli, Sudija!</h2>
              <p className="text-lg opacity-90">
                {user.imek} {user.przk}
              </p>
              {user.sudija?.titula && (
                <p className="text-sm opacity-75 mt-2">Titula: {user.sudija.titula}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">📋 Moji poslovi</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-3">✓</span>
                    Gledanje nastupa
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-3">✓</span>
                    Davanje ocena
                  </li>
                  <li className="flex items-center">
                    <span className="text-yellow-500 mr-3">✓</span>
                    Analiza takmičenja
                  </li>
                </ul>
                <div className="mt-4">
                  <Link
                    to="/sudija-dashboard"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    🎯 Sudijski Dashboard
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
                {/* Statistika section removed */}
              </div>
            </div>
          </div>
        );

      case 'ORGANIZATOR':
        return <OrganizatorDashboard user={user} />;

      case 'UCESNIK':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-2">🎤 Dobrodošli, Učesniku!</h2>
              <p className="text-lg opacity-90">
                {user.imek} {user.przk}
              </p>
            </div>

            {user.ucesnik ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">🎵 Tip učešća</h3>
                  <p className="text-4xl font-bold text-purple-500 mb-2">
                    {user.ucesnik.tip === 'SOLO' && '🎤 Solo'}
                    {user.ucesnik.tip === 'DUO' && '👬 Duo'}
                    {user.ucesnik.tip === 'GRUPA' && '👥 Grupa'}
                  </p>
                  <p className="text-gray-600">Tvoj tip učešća</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 Status</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600">Registrovan: <span className="font-bold text-green-600">✓</span></p>
                    <p className="text-gray-600">Spreman za takmičenje: <span className="font-bold text-yellow-600">⏳</span></p>
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/ucesnik-status"
                      className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    >
                      📈 Status nastupa
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-6 rounded-lg">
                <p className="font-semibold">⚠️ Nisi još dodан kao učesnik</p>
                <p className="text-sm mt-2">Kontaktiraj organizatora takmičenja da te doda</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">🎯 Sledeći koraci</h3>
              <ol className="space-y-2 text-gray-600">
                <li>1. Očekuj registraciju od organizatora</li>
                <li>2. Prati raspored takmičenja</li>
                <li>3. Pripremi se za nastup</li>
                <li>4. Čekaj rezultate</li>
              </ol>
            </div>
          </div>
        );

      default:
        return <div>Nepoznata uloga</div>;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderDashboard()}
      </div>
    </main>
  );
};

export default Dashboard;

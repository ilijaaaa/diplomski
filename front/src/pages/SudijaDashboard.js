import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SudijaDashboard = () => {
  const [currentSudija, setCurrentSudija] = useState(null);
  const [statistics, setStatistics] = useState({
    totalVotes: 0,
    activeRounds: 0,
    totalPerformances: 0,
    pendingVotes: 0
  });
  // recentActivity removed - not used after statistics removal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current user info from /auth/me endpoint
      const authResponse = await api.get('/auth/me/');
      const currentUser = authResponse.data;
      
      console.log('Current user from auth:', currentUser); // Debug log
      
      if (!currentUser.idk || currentUser.tipk !== 'SUDIJA') {
        setError('Korisnik nije prijavljen kao sudija. Molimo prijavite se ponovo.');
        setLoading(false);
        return;
      }

      const [
        sudijaRes,
        oceneRes,
        krugobiRes,
        nastupeRes
      ] = await Promise.all([
        api.get(`/sudije/${currentUser.idk}/`),
        api.get('/ocene/'),
        api.get('/takmickarski-krugovi/'),
        api.get('/nastupi/')
      ]);

      const sudija = sudijaRes.data;
      const ocene = oceneRes.data.results || oceneRes.data;
      const krugovi = krugobiRes.data.results || krugobiRes.data;
      const nastupe = nastupeRes.data.results || nastupeRes.data;

      setCurrentSudija(sudija);

      // Calculate statistics
      const myVotes = ocene.filter(o => o.sudija === sudija.idk);
      const totalVotes = myVotes.length;
      
      // Get active rounds (recent ones)
      const today = new Date();
      const activeRounds = krugovi.filter(k => {
        const roundDate = new Date(k.datodrz);
        const diffDays = Math.abs(today - roundDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30; // Rounds within last 30 days
      }).length;

      const totalPerformances = nastupe.length;
      
      // Calculate pending votes (performances without my vote)
      const votedPerformances = new Set(myVotes.map(v => v.nastup));
      const pendingVotes = nastupe.filter(n => !votedPerformances.has(n.idn)).length;

      setStatistics({
        totalVotes,
        activeRounds,
        totalPerformances,
        pendingVotes
      });

      // Recent voting activity removed - not displayed after statistics removal

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Greška pri učitavanju dashboard podataka: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👨‍⚖️ Sudijski Dashboard</h1>
          {currentSudija && (
            <p className="text-gray-600">
              Dobrodošli, {currentSudija.idk?.first_name} {currentSudija.idk?.last_name}
              {currentSudija.titula && (
                <span className="text-blue-600 font-semibold"> - {currentSudija.titula}</span>
              )}
            </p>
          )}
          <div className="mt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Nazad na glavnu dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Statistics Cards - REMOVED */}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/sudija-voting"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗳️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Ocenjivanje nastupa</h3>
              <p className="text-gray-600">Ocenite nastupe učesnika u takmičarskim krugovima</p>
              {statistics.pendingVotes > 0 && (
                <div className="mt-3 text-sm text-orange-600 font-semibold">
                  {statistics.pendingVotes} nastupa čeka ocenu
                </div>
              )}
            </div>
          </Link>

          <Link
            to="/sudija-participants"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">👥</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pregled učesnika</h3>
              <p className="text-gray-600">Vidite učesnike i njihove osnovne informacije</p>
            </div>
          </Link>

          <Link
            to="/sudija-awards"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="text-center">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🏆</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Dodela nagrada</h3>
              <p className="text-gray-600">Dodelite specijalne nagrade učesnicima</p>
              <div className="mt-3 text-sm text-blue-600 font-semibold">
                Samo za predsednika žirija
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity - REMOVED */}
      </div>
    </div>
  );
};

export default SudijaDashboard;
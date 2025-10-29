import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SudijaVoting = () => {
  const [nastupe, setNastupe] = useState([]);
  const [ocenе, setOcene] = useState([]);
  const [pesme, setPesme] = useState([]);
  const [takmickarski_krugovi, setTakmickarskiKrugovi] = useState([]);
  const [selectedKrug, setSelectedKrug] = useState('');
  const [currentSudija, setCurrentSudija] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [votingScores, setVotingScores] = useState({});
  const [submittedVotes, setSubmittedVotes] = useState(new Set());
  const [drzave, setDrzave] = useState([]);

  useEffect(() => {
    fetchData();
    getCurrentSudija();
  }, []);

  useEffect(() => {
    if (selectedKrug) {
      fetchNastupeForKrug();
    }
  }, [selectedKrug]);

  const getCurrentSudija = async () => {
    try {
      const response = await api.get('/auth/me/');
      const currentUser = response.data;
      
      if (currentUser.tipk === 'SUDIJA') {
        // Fetch sudija details
        const sudijaResponse = await api.get(`/sudije/${currentUser.idk}/`);
        setCurrentSudija(sudijaResponse.data);
      }
    } catch (error) {
      console.error('Error fetching current sudija:', error);
      setError('Greška pri učitavanju podataka o sudiji: ' + error.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [krugovi, oceneRes, pesmeRes, drzaveRes] = await Promise.all([
        api.get('/takmickarski-krugovi/'),
        api.get('/ocene/'),
        api.get('/pesme/'),
        api.get('/drzave/'),
      ]);
      
      setTakmickarskiKrugovi(krugovi.data.results || krugovi.data);
      setOcene(oceneRes.data.results || oceneRes.data);
      setPesme(pesmeRes.data.results || pesmeRes.data);
      setDrzave(drzaveRes.data.results || drzaveRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Greška pri učitavanju podataka: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchNastupeForKrug = async () => {
    try {
      const response = await api.get(`/nastupi/?takmickarski_krug_id=${selectedKrug}`);
      const nastupeData = response.data.results || response.data;
      
      // Sort by rbrn (performance order)
      nastupeData.sort((a, b) => a.rbrn - b.rbrn);
      setNastupe(nastupeData);
      
      // Check which performances already have votes from current judge
      if (currentSudija) {
        const existing = new Set();
        ocenе.forEach(ocena => {
          if (ocena.sudija === currentSudija.idk) {
            const nastup = nastupeData.find(n => n.idn === ocena.nastup);
            if (nastup) {
              existing.add(nastup.idn);
            }
          }
        });
        setSubmittedVotes(existing);
      }
      
    } catch (error) {
      console.error('Error fetching nastupe:', error);
      setError('Greška pri učitavanju nastupa: ' + error.message);
    }
  };

  const handleScoreChange = (nastupId, score) => {
    setVotingScores(prev => ({
      ...prev,
      [nastupId]: parseInt(score)
    }));
  };

  const submitVote = async (nastupId) => {
    try {
      const score = votingScores[nastupId];
      if (!score || score < 1 || score > 10) {
        alert('Molimo unesite ocenu između 1 i 10');
        return;
      }

      await api.post('/ocene/', {
        nastup: nastupId,
        sudija: currentSudija.idk,
        bod: score
      });

      // Add to submitted votes
      setSubmittedVotes(prev => new Set([...prev, nastupId]));
      
      // Clear the score from voting scores
      setVotingScores(prev => {
        const newScores = { ...prev };
        delete newScores[nastupId];
        return newScores;
      });

      // Refresh nastupe data to show updated scores
      await fetchNastupeForKrug();

      alert('Ocena je uspešno zabeležena!');
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Greška pri čuvanju ocene: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getDrzavaInfo = (nastup) => {
    // Use actual country info from backend
    return nastup.drzava_info ? nastup.drzava_info.nazdr : `Država ${nastup.drzava}`;
  };

  const getPesmaInfo = (nastup) => {
    // Use actual song info from backend
    return nastup.pesma_info ? nastup.pesma_info.nazp : `Pesma ${nastup.pesma}`;
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Ocenjivanje nastupa</h1>
          <p className="text-gray-600">Ocenite nastupe učesnika u takмičarskom krugu</p>
          <div className="mt-4">
            <Link
              to="/sudija-dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Nazad na Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Competition Round Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Izbor takmičarskog kruga</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Takmičarski krug
              </label>
              <select
                value={selectedKrug}
                onChange={(e) => setSelectedKrug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Izaberite krug</option>
                {takmickarski_krugovi.map((krug) => (
                  <option key={krug.idtk} value={krug.idtk}>
                    Krug {krug.rbrtk} - {new Date(krug.datodrz).toLocaleDateString('sr-RS')}
                  </option>
                ))}
              </select>
            </div>
            {currentSudija && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trenutni sudija
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  {currentSudija.idk?.first_name} {currentSudija.idk?.last_name} - {currentSudija.titula}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performances List */}
        {selectedKrug && nastupe.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Nastupe za ocenjivanje</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Redni broj
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pesma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Država
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trenutni rezultat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ocena (1-10)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nastupe.map((nastup) => {
                      const isVoted = submittedVotes.has(nastup.idn);
                      const currentScore = votingScores[nastup.idn] || '';
                      
                      return (
                        <tr key={nastup.idn} className={`hover:bg-gray-50 ${isVoted ? 'bg-green-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">#{nastup.rbrn}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getPesmaInfo(nastup)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getDrzavaInfo(nastup)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {nastup.ukbod} bodova (Plasman: {nastup.plasman})
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isVoted ? (
                              <div className="text-sm text-green-600 font-medium">
                                ✅ Ocenjeno
                              </div>
                            ) : (
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={currentScore}
                                onChange={(e) => handleScoreChange(nastup.idn, e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="1-10"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {isVoted ? (
                              <span className="text-green-600">Već ocenjeno</span>
                            ) : (
                              <button
                                onClick={() => submitVote(nastup.idn)}
                                disabled={!currentScore || currentScore < 1 || currentScore > 10}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-1 px-3 rounded-lg transition"
                              >
                                Potvrdi ocenu
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedKrug && nastupe.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema nastupa</h3>
            <p className="text-gray-500">Nema nastupa u izabranom takmičarskom krugu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudijaVoting;
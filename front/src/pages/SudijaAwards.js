import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SudijaAwards = () => {
  const [nastupe, setNastupe] = useState([]);
  const [nagrade, setNagrade] = useState([]);
  const [dodeljivanja, setDodeljivanja] = useState([]);
  const [takmickarski_krugovi, setTakmickarskiKrugovi] = useState([]);
  const [selectedKrug, setSelectedKrug] = useState('');
  const [currentSudija, setCurrentSudija] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAwardForm, setShowAwardForm] = useState(false);
  const [selectedNastup, setSelectedNastup] = useState(null);
  const [selectedNagrada, setSelectedNagrada] = useState('');
  const [drzave, setDrzave] = useState([]);
  const [pesme, setPesme] = useState([]);

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
      
      const [
        krugovi,
        nagradeRes,
        dodeljivanjaRes,
        drzaveRes,
        pesmeRes,
      ] = await Promise.all([
        api.get('/takmickarski-krugovi/'),
        api.get('/nagrade/'),
        api.get('/dodeljivanja-nagrada/'),
        api.get('/drzave/'),
        api.get('/pesme/'),
      ]);
      
      setTakmickarskiKrugovi(krugovi.data.results || krugovi.data);
      setNagrade(nagradeRes.data.results || nagradeRes.data);
      setDodeljivanja(dodeljivanjaRes.data.results || dodeljivanjaRes.data);
      
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
      
      // Sort by ukbod (total score) in descending order
      nastupeData.sort((a, b) => b.ukbod - a.ukbod);
      setNastupe(nastupeData);
      
    } catch (error) {
      console.error('Error fetching nastupe:', error);
      setError('Greška pri učitavanju nastupa: ' + error.message);
    }
  };

  const handleAwardAssignment = async () => {
    try {
      if (!selectedNastup || !selectedNagrada) {
        alert('Molimo izaberite nastup i nagradu');
        return;
      }

      // First create DodeljujanjeNagrade
      const dodeljivanjeRes = await api.post('/dodeljivanja-nagrada/', {
        datdodele: new Date().toISOString().split('T')[0],
        sudija: currentSudija.idk
      });

      const dodeljivanjeId = dodeljivanjeRes.data.iddg;

      // Update Nastup to link with DodeljujanjeNagrade
      await api.patch(`/nastupi/${selectedNastup.idn}/`, {
        dodeljivanje_nagrade: dodeljivanjeId
      });

      // Update Nagrada to link with DodeljujanjeNagrade
      await api.patch(`/nagrade/${selectedNagrada}/`, {
        dodeljivanje_nagrade: dodeljivanjeId
      });

      alert('Nagrada je uspešno dodeljena!');
      
      // Refresh data
      await fetchNastupeForKrug();
      await fetchData();
      
      setShowAwardForm(false);
      setSelectedNastup(null);
      setSelectedNagrada('');

    } catch (error) {
      console.error('Error assigning award:', error);
      setError('Greška pri dodeljivanju nagrade: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getPesmaInfo = (nastup) => {
    return nastup.pesma_info ? nastup.pesma_info.nazp : `Pesma ${nastup.pesma}`;
  };

  const getDrzavaInfo = (nastup) => {
    return nastup.drzava_info ? nastup.drzava_info.nazdr : `Država ${nastup.drzava}`;
  };

  const getNagradaInfo = (nagradeId) => {
    const nagrada = nagrade.find(n => n.idn === nagradeId);
    return nagrada ? nagrada.naziv : `Nagrada ${nagradeId}`;
  };

  const getAssignedAward = (nastup) => {
    if (!nastup.dodeljivanje_nagrade) return null;
    
    const dodeljivanje = dodeljivanja.find(d => d.iddg === nastup.dodeljivanje_nagrade);
    return dodeljivanje;
  };

  // Check if current judge is chairman (can assign awards)
  // For now, assume all judges can assign awards. In real scenario, 
  // this would check if sudija.titula contains "predsednik" or similar
  const canAssignAwards = currentSudija?.titula?.toLowerCase().includes('predsednik') || true;

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🏆 Dodela nagrada</h1>
          <p className="text-gray-600">Dodelite specijalne nagrade učesnicima</p>
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

        {!canAssignAwards && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Samo predsednik žirija može da dodeljuje nagrade.
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

        {/* Award Assignment Modal */}
        {showAwardForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Dodeli nagradu</h3>
              <p className="text-gray-600 mb-4">
                Nastup: <strong>#{selectedNastup?.rbrn} - {getPesmaInfo(selectedNastup)}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Izaberite nagradu
                </label>
                <select
                  value={selectedNagrada}
                  onChange={(e) => setSelectedNagrada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Izaberite nagradu</option>
                  {nagrade.map((nagrada) => (
                    <option key={nagrada.idnag} value={nagrada.idnag}>
                      {nagrada.naznag}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAwardAssignment}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Dodeli
                </button>
                <button
                  onClick={() => {
                    setShowAwardForm(false);
                    setSelectedNastup(null);
                    setSelectedNagrada('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Performances List */}
        {selectedKrug && nastupe.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Rangiranje i nagrade</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pesma
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Država
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bodovi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nagrada
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nastupe.map((nastup) => {
                      const assignedAward = getAssignedAward(nastup);
                      const hasAward = !!assignedAward;
                      
                      return (
                        <tr key={nastup.idn} className={`hover:bg-gray-50 ${hasAward ? 'bg-yellow-50' : ''}`}>
          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getPesmaInfo(nastup)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getDrzavaInfo(nastup)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{nastup.ukbod} bodova</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hasAward ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                🏆 Dodeljeno
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">Nema nagrade</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {canAssignAwards && !hasAward ? (
                              <button
                                onClick={() => {
                                  setSelectedNastup(nastup);
                                  setShowAwardForm(true);
                                }}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-lg transition"
                              >
                                🏆 Dodeli nagradu
                              </button>
                            ) : hasAward ? (
                              <span className="text-green-600">Već dodeljeno</span>
                            ) : (
                              <span className="text-gray-400">Nema ovlašćenja</span>
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
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema nastupa</h3>
            <p className="text-gray-500">Nema nastupa u izabranom takmičarskom krugu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudijaAwards;
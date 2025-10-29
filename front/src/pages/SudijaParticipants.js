import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SudijaParticipants = () => {
  const [nastupe, setNastupe] = useState([]);
  const [ucesnici, setUcesnici] = useState([]);
  const [pesme, setPesme] = useState([]);
  const [drzave, setDrzave] = useState([]);
  const [izvodi, setIzvodi] = useState([]);
  const [takmickarski_krugovi, setTakmickarskiKrugovi] = useState([]);
  const [selectedKrug, setSelectedKrug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedKrug) {
      fetchNastupeForKrug();
    }
  }, [selectedKrug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        krugovi,
        ucesniciRes,
        pesmeRes,
        drzaveRes,
        izvodiRes
      ] = await Promise.all([
        api.get('/takmickarski-krugovi/'),
        api.get('/ucesnici/'),
        api.get('/pesme/'),
        api.get('/drzave/'),
        api.get('/izvedbe/')
      ]);
      
      setTakmickarskiKrugovi(krugovi.data.results || krugovi.data);
      setUcesnici(ucesniciRes.data.results || ucesniciRes.data);
      setPesme(pesmeRes.data.results || pesmeRes.data);
      setDrzave(drzaveRes.data.results || drzaveRes.data);
      setIzvodi(izvodiRes.data.results || izvodiRes.data);
      
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
      
    } catch (error) {
      console.error('Error fetching nastupe:', error);
      setError('Greška pri učitavanju nastupa: ' + error.message);
    }
  };

  const getPesmaInfo = (pesmaId) => {
    const pesma = pesme.find(p => p.idp === pesmaId);
    return pesma ? pesma.nazp : `Pesma ${pesmaId}`;
  };

  const getDrzavaInfo = (drzavaId) => {
    const drzava = drzave.find(d => d.iddr === drzavaId);
    return drzava ? drzava.nazdr : `Država ${drzavaId}`;
  };

  const getUcesnikForPesma = (pesmaId) => {
    const izvodi_item = izvodi.find(i => i.pesma === pesmaId);
    if (!izvodi_item) return null;
    
    const ucesnik = ucesnici.find(u => u.idk === izvodi_item.ucesnik);
    return ucesnik;
  };


  const getPesmaDetails = (pesmaId) => {
    const pesma = pesme.find(p => p.idp === pesmaId);
    if (!pesma) return { trajanje: 'N/A', zanr: 'N/A' };
    
    const trajanje = pesma.trajanje ? `${Math.floor(pesma.trajanje / 60)}:${(pesma.trajanje % 60).toString().padStart(2, '0')}` : 'N/A';
    const zanr = pesma.zanr_naziv || 'N/A';
    
    return { trajanje, zanr };
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 Pregled učesnika</h1>
          <p className="text-gray-600">Osnovne informacije o učesnicima u takmičarskom krugu</p>
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
            {selectedKrug && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ukupno nastupa
                </label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  {nastupe.length} nastupa
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Participants List */}
        {selectedKrug && nastupe.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Redosled nastupa</h2>
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
                        Trajanje
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Žanr
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Država
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trenutni rezultat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {nastupe.map((nastup) => {
                      const ucesnik = getUcesnikForPesma(nastup.pesma);
                      const pesmaDetails = getPesmaDetails(nastup.pesma);
                      
                      return (
                        <tr key={nastup.idn} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {nastup.rbrn}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getPesmaInfo(nastup.pesma)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{pesmaDetails.trajanje}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {pesmaDetails.zanr}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{getDrzavaInfo(nastup.drzava)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {nastup.ukbod} bodova
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">{nastupe.length}</div>
                  <div className="text-sm text-gray-500">Ukupno nastupa</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {nastupe.reduce((sum, n) => {
                      const pesma = pesme.find(p => p.idp === n.pesma);
                      return sum + (pesma?.trajanje || 0);
                    }, 0) / 60} min
                  </div>
                  <div className="text-sm text-gray-500">Ukupno trajanje</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {Math.round(nastupe.reduce((sum, n) => sum + n.ukbod, 0) / nastupe.length) || 0}
                  </div>
                  <div className="text-sm text-gray-500">Prosečan broj bodova</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedKrug && nastupe.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema nastupa</h3>
            <p className="text-gray-500">Nema nastupa u izabranom takmičarskom krugu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SudijaParticipants;
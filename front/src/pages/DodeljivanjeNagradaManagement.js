import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DodeljivanjeNagradaManagement = () => {
  const [dodeljivanja, setDodeljivanja] = useState([]);
  const [nagrade, setNagrade] = useState([]);
  const [nastupe, setNastupe] = useState([]);
  const [ucesnici, setUcesnici] = useState([]);
  const [sudije, setSudije] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        dodeljivanjaRes, 
        nagradeRes, 
        nastupeRes,
        ucesniciRes,
        sudijeRes
      ] = await Promise.all([
        api.get('/dodeljivanja-nagrada/'),
        api.get('/nagrade/'),
        api.get('/nastupi/'),
        api.get('/ucesnici/'),
        api.get('/sudije/')
      ]);
      
      setDodeljivanja(dodeljivanjaRes.data.results || dodeljivanjaRes.data || []);
      setNagrade(nagradeRes.data.results || nagradeRes.data || []);
      setNastupe(nastupeRes.data.results || nastupeRes.data || []);
      setUcesnici(ucesniciRes.data.results || ucesniciRes.data || []);
      setSudije(sudijeRes.data.results || sudijeRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Greška pri učitavanju podataka: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Helper funkcije za formatiranje podataka
  const getUcesnikInfo = (ucesnikId) => {
    const ucesnik = ucesnici.find(u => u.iduc === ucesnikId);
    return ucesnik ? `${ucesnik.ime} ${ucesnik.prezime}` : 'Nepoznat učesnik';
  };

  const getSudijaInfo = (dodeljivanje) => {
    // Use sudija_info from backend serializer
    if (dodeljivanje.sudija_info && dodeljivanje.sudija_info.korisnik_info) {
      const korisnikInfo = dodeljivanje.sudija_info.korisnik_info;
      return `${korisnikInfo.imek} ${korisnikInfo.przk}`;
    }
    return `Sudija ${dodeljivanje.sudija}`;
  };

  const getNastupInfo = (nastupId) => {
    const nastup = nastupe.find(n => n.idn === nastupId);
    if (!nastup) return 'Nepoznat nastup';
    
    return `${getUcesnikInfo(nastup.iduc)} - RB ${nastup.rbrnas}`;
  };

  const getAssignedNastupe = (dodeljivanjeId) => {
    return nastupe.filter(n => n.dodeljivanje_nagrade === dodeljivanjeId);
  };

  const getAssignedNagrade = (dodeljivanjeId) => {
    return nagrade.filter(n => n.dodeljivanje_nagrade === dodeljivanjeId);
  };

  // Filter function removed - showing all dodeljivanja

  const formatDate = (dateString) => {
    if (!dateString) return 'Nije definisano';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam dodeljivanja nagrada...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-blue-500 hover:text-blue-600 mb-2 inline-block">
                ← Nazad na dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">🏆 Pregled dodeljivanja nagrada</h1>
              <p className="text-gray-600">Pregled svih dodeljivanja nagrada učesnicima (samo za čitanje)</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p><strong>Greška:</strong> {error}</p>
          </div>
        )}

        {/* Filter - REMOVED */}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Lista dodeljivanja nagrada</h2>
          
          {dodeljivanja.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Nema pronađenih dodeljivanja nagrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Datum dodeljivanja
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Sudija
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Nagrade
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Dodeljeni nastupi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dodeljivanja.map((item) => (
                    <tr key={item.iddg} className="hover:bg-gray-50">

                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        {formatDate(item.datdodele)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        {getSudijaInfo(item)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        {item.nagrada_info ? (
                          <div className="bg-yellow-50 rounded px-2 py-1 text-xs">
                            {item.nagrada_info.naznag}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Nema dodeljenih nagrada</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                        {item.nastup_info ? (
                          <div className="bg-blue-50 rounded px-2 py-1 text-xs">
                            <div><strong>Pesma:</strong> {item.nastup_info.pesma_naziv || 'N/A'}</div>
                            <div><strong>Država:</strong> {item.nastup_info.drzava_naziv || 'N/A'}</div>
                            <div><strong>Bodovi:</strong> {item.nastup_info.ukbod || 0}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Nema dodeljenih nastupa</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Info - REMOVED */}
      </div>
    </div>
  );
};

export default DodeljivanjeNagradaManagement;
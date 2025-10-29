import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const NagradeManagement = () => {
  const [nagrade, setNagrade] = useState([]);
  const [takmicenja, setTakmicenja] = useState([]);
  const [izdanja, setIzdanja] = useState([]);
  const [dodeljuje, setDodeljuje] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNagrada, setEditingNagrada] = useState(null);
  const [formData, setFormData] = useState({
    naznag: '',
    izdanje: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [nagradeRes, takmicenjaRes, izdanjaRes, dodeljenjeRes] = await Promise.all([
        api.get('/nagrade/'),
        api.get('/muzicka-takmicenja/'),
        api.get('/izdanja/'),
        api.get('/dodeljovanja/')
      ]);
      
      // Handle both array and paginated response formats
      setNagrade(nagradeRes.data.results || nagradeRes.data || []);
      setTakmicenja(takmicenjaRes.data.results || takmicenjaRes.data || []);
      setIzdanja(izdanjaRes.data.results || izdanjaRes.data || []);
      setDodeljuje(dodeljenjeRes.data.results || dodeljenjeRes.data || []);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        naznag: formData.naznag
      };

      let response;
      if (editingNagrada) {
        response = await api.put(`/nagrade/${editingNagrada.idnag}/`, submitData);
        
        // Dodeli nagradu na izdanje ako je izabrano
        if (formData.izdanje) {
          // Proveri da li već postoji dodeljivanje
          const existingDodeljivanje = dodeljuje.find(d => 
            d.nagrada === editingNagrada.idnag && d.izdanje === parseInt(formData.izdanje)
          );
          
          if (!existingDodeljivanje) {
            await api.post('/dodeljovanja/', {
              nagrada: editingNagrada.idnag,
              izdanje: parseInt(formData.izdanje)
            });
          }
        }
        
        setSuccess('Nagrada je uspešno ažurirana');
        setNagrade(nagrade.map(n => n.idnag === editingNagrada.idnag ? response.data : n));
      } else {
        response = await api.post('/nagrade/', submitData);
        
        // Dodeli nagradu na izdanje ako je izabrano
        if (formData.izdanje) {
          await api.post('/dodeljovanja/', {
            nagrada: response.data.idnag,
            izdanje: parseInt(formData.izdanje)
          });
        }
        
        setSuccess('Nagrada je uspešno kreirana');
        setNagrade([...nagrade, response.data]);
      }
      
      fetchData();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.detail || 'Greška pri čuvanju nagrade');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (idnag) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu nagradu?')) {
      try {
        await api.delete(`/nagrade/${idnag}/`);
        setSuccess('Nagrada je uspešno obrisana');
        fetchData();
      } catch (err) {
        setError(err.response?.data?.detail || 'Greška pri brisanju');
        console.error('Error deleting award:', err);
      }
    }
  };

  const openModal = (nagrada = null) => {
    setEditingNagrada(nagrada);
    setFormData({
      naznag: nagrada ? nagrada.naznag : '',
      izdanje: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNagrada(null);
    setFormData({
      naznag: '',
      izdanje: ''
    });
  };

  const getCompetitionsForAward = (nagradaId) => {
    return dodeljuje.filter(d => d.nagrada === nagradaId);
  };

  const getIzdanjeInfo = (izdanjeId) => {
    const izdanje = izdanja.find(i => i.idizd === izdanjeId);
    if (!izdanje) return null;
    
    const takmicenje = takmicenja.find(t => t.idmt === izdanje.muzicko_takmicenje);
    if (!takmicenje) return null;
    
    return `${takmicenje.nazmt} - ${izdanje.idizd}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam nagrade...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">🏅 Upravljanje nagradama</h1>
              <p className="text-gray-600">Kreiraj i upravljaj nagradama za takmičenja</p>
            </div>
            <button
              onClick={() => openModal()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Nova nagrada
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right font-bold text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
            <button 
              onClick={() => setSuccess('')}
              className="float-right font-bold text-green-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {nagrade.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏅</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema nagrada</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvu nagradu da biste počeli</p>
              <button
                onClick={() => openModal()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj nagradu
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Naziv nagrade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Izdanja takmičenja
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nagrade.map((nagrada) => (
                    <tr key={nagrada.idnag} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nagrada.naznag}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getCompetitionsForAward(nagrada.idnag)
                            .filter(assignment => getIzdanjeInfo(assignment.izdanje) !== null)
                            .map((assignment, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-1 rounded mb-1">
                                {getIzdanjeInfo(assignment.izdanje)}
                              </div>
                            ))}
                          {getCompetitionsForAward(nagrada.idnag)
                            .filter(assignment => getIzdanjeInfo(assignment.izdanje) !== null)
                            .length === 0 && (
                            <span className="text-gray-400 text-xs">Nije dodeljena nijednom takmičenju</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal(nagrada)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          ✏️ Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(nagrada.idnag)}
                          className="text-red-600 hover:text-red-900"
                        >
                          🗑️ Obriši
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingNagrada ? 'Uredi nagradu' : 'Nova nagrada'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Naziv nagrade *
                </label>
                <input
                  type="text"
                  value={formData.naznag}
                  onChange={(e) => setFormData({...formData, naznag: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  maxLength={20}
                  placeholder="Unesite naziv nagrade"
                />
                <p className="text-xs text-gray-500 mt-1">Maksimalno 20 karaktera</p>
              </div>

              {(
                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Izdanje takmičenja (opciono)
                  </label>
                  <select
                    value={formData.izdanje}
                    onChange={(e) => setFormData({...formData, izdanje: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Bez dodeljivanja izdanju</option>
                    {izdanja
                      .filter(izdanje => {
                        const takmicenjeInfo = getIzdanjeInfo(izdanje.idizd);
                        return takmicenjeInfo !== null;
                      })
                      .map((izdanje) => (
                        <option key={izdanje.idizd} value={izdanje.idizd}>
                          {getIzdanjeInfo(izdanje.idizd)} ({izdanje.datpoc} - {izdanje.datkraj})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Možete dodeliti nagradu određenom izdanju takmičenja</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {editingNagrada ? 'Ažuriraj' : 'Kreiraj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NagradeManagement;
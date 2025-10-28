import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DrzaveManagement = () => {
  const [drzave, setDrzave] = useState([]);
  const [ucestva, setUcestva] = useState([]);
  const [izdanja, setIzdanja] = useState([]);
  const [takmicenja, setTakmicenja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nazdr: '',
    prvagoduc: '',
    brpob: '',
    izdanje: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [drzaveRes, ucestvaRes, izdanjaRes, takmicenjaRes] = await Promise.all([
        api.get('/drzave/'),
        api.get('/ucestva/'),
        api.get('/izdanja/'),
        api.get('/muzicka-takmicenja/')
      ]);
      setDrzave(drzaveRes.data.results || drzaveRes.data);
      setUcestva(ucestvaRes.data.results || ucestvaRes.data);
      setIzdanja(izdanjaRes.data.results || izdanjaRes.data);
      setTakmicenja(takmicenjaRes.data.results || takmicenjaRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Greška pri učitavanju podataka: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      let response;
      
      const submitData = {
        nazdr: formData.nazdr,
        prvagoduc: parseInt(formData.prvagoduc),
        brpob: parseInt(formData.brpob)
      };
      
      if (editingItem) {
        response = await api.put(`/drzave/${editingItem.iddr}/`, submitData);
        setDrzave(drzave.map(item => 
          item.iddr === editingItem.iddr ? response.data : item
        ));
      } else {
        // Prvo kreiraj državu
        response = await api.post('/drzave/', submitData);
        
        // Zatim dodaj učešće na izdanju
        if (formData.izdanje) {
          await api.post('/ucestva/', {
            drzava: response.data.iddr,
            izdanje: parseInt(formData.izdanje)
          });
        }
        
        setDrzave([...drzave, response.data]);
        await fetchData(); // Osvežavaj podatke da vidiš novo učešće
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ nazdr: '', prvagoduc: '', brpob: '', izdanje: '' });
    } catch (error) {
      console.error('Error saving drzava:', error);
      setError('Greška pri čuvanju države: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nazdr: item.nazdr || '',
      prvagoduc: item.prvagoduc || '',
      brpob: item.brpob || '',
      izdanje: ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu državu?')) {
      try {
        await api.delete(`/drzave/${id}/`);
        setDrzave(drzave.filter(item => item.iddr !== id));
      } catch (error) {
        console.error('Error deleting drzava:', error);
        setError('Greška pri brisanju države: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getParticipationsForCountry = (drzavaId) => {
    return ucestva.filter(u => u.drzava === drzavaId);
  };

  const getIzdanjeInfo = (izdanjeId) => {
    const izdanje = izdanja.find(i => i.idizd === izdanjeId);
    if (!izdanje) return `Izdanje ID: ${izdanjeId} (nepoznato)`;
    
    const takmicenje = takmicenja.find(t => t.idmt === izdanje.muzicko_takmicenje);
    if (!takmicenje) return `${izdanje.idizd} (nepoznato takmičenje)`;
    
    return `${takmicenje.nazmt} - ${izdanje.idizd}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam države...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">🌍 Upravljanje državama</h1>
              <p className="text-gray-600">Kreiraj i upravljaj državama učesnicama</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Nova država
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right font-bold text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">
                {editingItem ? 'Uredi državu' : 'Nova država'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Naziv države *
                  </label>
                  <input
                    type="text"
                    maxLength="20"
                    value={formData.nazdr}
                    onChange={(e) => setFormData({...formData, nazdr: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Prva godina učešća *
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.prvagoduc}
                    onChange={(e) => setFormData({...formData, prvagoduc: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Broj pobeda *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.brpob}
                    onChange={(e) => setFormData({...formData, brpob: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {!editingItem && (
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Izdanje takmičenja (opciono)
                    </label>
                    <select
                      value={formData.izdanje}
                      onChange={(e) => setFormData({...formData, izdanje: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Bez učešća na izdanju</option>
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
                    <p className="text-xs text-gray-500 mt-1">Možete dodati učešće zemlje na određenom izdanju takmičenja</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {editingItem ? 'Ažuriraj' : 'Kreiraj'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({ nazdr: '', prvagoduc: '', brpob: '', izdanje: '' });
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {drzave.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema država</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvu državu da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj državu
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Naziv
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prva godina učešća
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Broj pobeda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Učešća u takmičenjima
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drzave.map((item) => (
                    <tr key={item.iddr} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.iddr}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.nazdr}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.prvagoduc}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.brpob?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getParticipationsForCountry(item.iddr)
                            .map((ucesce, index) => (
                              <div key={ucesce.ucestvuje_id} className="text-xs bg-gray-50 p-1 rounded mb-1">
                                {getIzdanjeInfo(ucesce.izdanje)}
                              </div>
                            ))}
                          {getParticipationsForCountry(item.iddr).length === 0 && (
                            <span className="text-gray-400 text-xs">Nema učešća</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          ✏️ Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(item.iddr)}
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
    </div>
  );
};

export default DrzaveManagement;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const IzdanjaManagement = () => {
  const [izdanja, setIzdanja] = useState([]);
  const [takmicenja, setTakmicenja] = useState([]);
  const [ziriji, setZiriji] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    datpoc: '',
    datkraj: '',
    ziri: '',
    muzicko_takmicenje: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [izdanjaRes, takmicenjaRes, ziroviRes] = await Promise.all([
        api.get('/izdanja/'),
        api.get('/muzicka-takmicenja/'),
        api.get('/ziriji/')
      ]);
      
      setIzdanja(izdanjaRes.data.results || izdanjaRes.data);
      setTakmicenja(takmicenjaRes.data.results || takmicenjaRes.data);
      setZiriji(ziroviRes.data.results || ziroviRes.data);
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
        ...formData,
        ziri: formData.ziri || null,
        muzicko_takmicenje: parseInt(formData.muzicko_takmicenje)
      };
      
      if (editingItem) {
        response = await api.put(`/izdanja/${editingItem.idizd}/`, submitData);
        setIzdanja(izdanja.map(item => 
          item.idizd === editingItem.idizd ? response.data : item
        ));
      } else {
        response = await api.post('/izdanja/', submitData);
        setIzdanja([...izdanja, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ datpoc: '', datkraj: '', ziri: '', muzicko_takmicenje: '' });
    } catch (error) {
      console.error('Error saving izdanje:', error);
      setError('Greška pri čuvanju izdanja: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      datpoc: item.datpoc ? item.datpoc.split('T')[0] : '',
      datkraj: item.datkraj ? item.datkraj.split('T')[0] : '',
      ziri: item.ziri || '',
      muzicko_takmicenje: item.muzicko_takmicenje || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovo izdanje?')) {
      try {
        await api.delete(`/izdanja/${id}/`);
        setIzdanja(izdanja.filter(item => item.idizd !== id));
      } catch (error) {
        console.error('Error deleting izdanje:', error);
        setError('Greška pri brisanju izdanja: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const getTakmicenjeNaziv = (idmt) => {
    const takmicenje = takmicenja.find(t => t.idmt === idmt);
    return takmicenje ? takmicenje.nazmt : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam izdanja...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">📅 Upravljanje izdanjima</h1>
              <p className="text-gray-600">Kreiraj i upravljaj izdanjima takmičenja</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Novo izdanje
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
                {editingItem ? 'Uredi izdanje' : 'Novo izdanje'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Takmičenje *
                  </label>
                  <select
                    value={formData.muzicko_takmicenje}
                    onChange={(e) => setFormData({...formData, muzicko_takmicenje: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite takmičenje</option>
                    {takmicenja.map(t => (
                      <option key={t.idmt} value={t.idmt}>{t.nazmt}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Datum početka *
                  </label>
                  <input
                    type="date"
                    value={formData.datpoc}
                    onChange={(e) => setFormData({...formData, datpoc: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Datum kraja *
                  </label>
                  <input
                    type="date"
                    value={formData.datkraj}
                    onChange={(e) => setFormData({...formData, datkraj: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Žiri
                  </label>
                  <select
                    value={formData.ziri}
                    onChange={(e) => setFormData({...formData, ziri: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Bez žirija</option>
                    {ziriji.map(z => (
                      <option key={z.idz} value={z.idz}>Žiri {z.idz}</option>
                    ))}
                  </select>
                </div>

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
                      setFormData({ datpoc: '', datkraj: '', ziri: '', muzicko_takmicenje: '' });
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
          {izdanja.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema izdanja</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvo izdanje da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj izdanje
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
                      Takmičenje
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum početka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum kraja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Žiri
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {izdanja.map((item) => (
                    <tr key={item.idizd} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.idizd}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getTakmicenjeNaziv(item.muzicko_takmicenje)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(item.datpoc)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(item.datkraj)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.ziri ? `Žiri ${item.ziri}` : 'Bez žirija'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          ✏️ Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(item.idizd)}
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

export default IzdanjaManagement;
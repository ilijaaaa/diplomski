import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const TakmicarkiKrugManagement = () => {
  const [krugovi, setKrugovi] = useState([]);
  const [izdanja, setIzdanja] = useState([]);
  const [takmicenja, setTakmicenja] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    rbrtk: '',
    datodrz: '',
    izdanje: '',
    parent_krug: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [krugoviRes, izdanjaRes, takmicenjaRes] = await Promise.all([
        api.get('/takmickarski-krugovi/'),
        api.get('/izdanja/'),
        api.get('/muzicka-takmicenja/')
      ]);
      
      setKrugovi(krugoviRes.data.results || krugoviRes.data);
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
        ...formData,
        rbrtk: parseInt(formData.rbrtk),
        izdanje: parseInt(formData.izdanje),
        parent_krug: formData.parent_krug ? parseInt(formData.parent_krug) : null
      };
      
      if (editingItem) {
        response = await api.put(`/takmickarski-krugovi/${editingItem.idtk}/`, submitData);
        setKrugovi(krugovi.map(item => 
          item.idtk === editingItem.idtk ? response.data : item
        ));
      } else {
        response = await api.post('/takmickarski-krugovi/', submitData);
        setKrugovi([...krugovi, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ rbrtk: '', datodrz: '', izdanje: '', parent_krug: '' });
    } catch (error) {
      console.error('Error saving krug:', error);
      setError('Greška pri čuvanju kruga: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      rbrtk: item.rbrtk || '',
      datodrz: item.datodrz ? item.datodrz.split('T')[0] : '',
      izdanje: item.izdanje || '',
      parent_krug: item.parent_krug || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj krug?')) {
      try {
        await api.delete(`/takmickarski-krugovi/${id}/`);
        setKrugovi(krugovi.filter(item => item.idtk !== id));
      } catch (error) {
        console.error('Error deleting krug:', error);
        setError('Greška pri brisanju kruga: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getTakmicenjeNaziv = (izdanjeId) => {
    const izdanje = izdanja.find(i => i.idizd === izdanjeId);
    if (!izdanje) return null;
    
    const takmicenje = takmicenja.find(t => t.idmt === izdanje.muzicko_takmicenje);
    return takmicenje ? takmicenje.nazmt : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const getParentKrugNaziv = (idtk) => {
    if (!idtk) return 'Glavni krug';
    const krug = krugovi.find(k => k.idtk === idtk);
    return krug ? `Krug ${krug.rbrtk}` : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam krugove...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">🔄 Upravljanje takmičarskim krugovima</h1>
              <p className="text-gray-600">Kreiraj i upravljaj krugovima takmičenja</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Novi krug
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
                {editingItem ? 'Uredi krug' : 'Novi krug'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Izdanje *
                  </label>
                  <select
                    value={formData.izdanje}
                    onChange={(e) => setFormData({...formData, izdanje: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite izdanje</option>
                    {izdanja.map(i => {
                      const nazivTakmicenja = getTakmicenjeNaziv(i.idizd);
                      return nazivTakmicenja ? (
                        <option key={i.idizd} value={i.idizd}>
                          {nazivTakmicenja} ({formatDate(i.datpoc)} - {formatDate(i.datkraj)})
                        </option>
                      ) : null;
                    })}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Redni broj kruga *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.rbrtk}
                    onChange={(e) => setFormData({...formData, rbrtk: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Datum održavanja *
                  </label>
                  <input
                    type="date"
                    value={formData.datodrz}
                    onChange={(e) => setFormData({...formData, datodrz: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nadređeni krug
                  </label>
                  <select
                    value={formData.parent_krug}
                    onChange={(e) => setFormData({...formData, parent_krug: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Glavni krug (bez nadređenog)</option>
                    {krugovi.filter(k => k.idtk !== editingItem?.idtk).map(k => (
                      <option key={k.idtk} value={k.idtk}>
                        Krug {k.rbrtk} - {formatDate(k.datodrz)}
                      </option>
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
                      setFormData({ rbrtk: '', datodrz: '', izdanje: '', parent_krug: '' });
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
          {krugovi.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema krugova</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvi krug da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj krug
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
                      Redni broj
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum održavanja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nadređeni krug
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {krugovi.map((item) => (
                    <tr key={item.idtk} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.idtk}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getTakmicenjeNaziv(item.izdanje) || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.rbrtk}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(item.datodrz)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getParentKrugNaziv(item.parent_krug)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          ✏️ Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(item.idtk)}
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

export default TakmicarkiKrugManagement;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SudijeManagement = () => {
  const [sudije, setSudije] = useState([]);
  const [korisnici, setKorisnici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    idk: '',
    titula: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sudijeRes, korisniciRes] = await Promise.all([
        api.get('/sudije/'),
        api.get('/korisnici/')
      ]);
      
      setSudije(sudijeRes.data.results || sudijeRes.data);
      setKorisnici(korisniciRes.data.results || korisniciRes.data);
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
        idk: parseInt(formData.idk),
        titula: formData.titula
      };
      
      if (editingItem) {
        response = await api.put(`/sudije/${editingItem.idk}/`, submitData);
        setSudije(sudije.map(item => 
          item.idk === editingItem.idk ? response.data : item
        ));
      } else {
        response = await api.post('/sudije/', submitData);
        setSudije([...sudije, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ idk: '', titula: '' });
    } catch (error) {
      console.error('Error saving sudija:', error);
      setError('Greška pri čuvanju sudije: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      idk: item.idk || '',
      titula: item.titula || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu sudiju?')) {
      try {
        await api.delete(`/sudije/${id}/`);
        setSudije(sudije.filter(item => item.idk !== id));
      } catch (error) {
        console.error('Error deleting sudija:', error);
        setError('Greška pri brisanju sudije: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getKorisnikNaziv = (idk) => {
    const korisnik = korisnici.find(k => k.idk === idk);
    return korisnik ? `${korisnik.imek} ${korisnik.przk}` : 'N/A';
  };

  const getKorisnikEmail = (idk) => {
    const korisnik = korisnici.find(k => k.idk === idk);
    return korisnik ? korisnik.email : 'N/A';
  };

  const getAvailableKorisnici = () => {
    const existingSudijeIds = sudije.map(s => s.idk);
    return korisnici.filter(k => 
      k.tipk === 'SUDIJA' && !existingSudijeIds.includes(k.idk)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam sudije...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">⚖️ Upravljanje sudijama</h1>
              <p className="text-gray-600">Kreiraj i upravljaj sudijama koje ocenjuju nastupe</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Nova sudija
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
                {editingItem ? 'Uredi sudiju' : 'Nova sudija'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Korisnik *
                  </label>
                  <select
                    value={formData.idk}
                    onChange={(e) => setFormData({...formData, idk: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={editingItem} // Cannot change user for existing judge
                  >
                    <option value="">Izaberite korisnika</option>
                    {editingItem ? (
                      // Show current user if editing
                      <option value={editingItem.idk}>
                        {getKorisnikNaziv(editingItem.idk)} ({getKorisnikEmail(editingItem.idk)})
                      </option>
                    ) : (
                      // Show available users if creating new
                      getAvailableKorisnici().map(k => (
                        <option key={k.idk} value={k.idk}>
                          {k.imek} {k.przk} ({k.email})
                        </option>
                      ))
                    )}
                  </select>
                  {!editingItem && getAvailableKorisnici().length === 0 && (
                    <p className="text-sm text-red-500 mt-1">
                      Nema dostupnih korisnika tipa SUDIJA
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Titula *
                  </label>
                  <input
                    type="text"
                    maxLength="20"
                    value={formData.titula}
                    onChange={(e) => setFormData({...formData, titula: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="npr. Доктор, Магистер, Композитор"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    disabled={!editingItem && getAvailableKorisnici().length === 0}
                  >
                    {editingItem ? 'Ažuriraj' : 'Kreiraj'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      setFormData({ idk: '', titula: '' });
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
          {sudije.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">⚖️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema sudija</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvu sudiju da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj sudiju
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ime i prezime
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titula
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sudije.map((item) => (
                    <tr key={item.idk} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getKorisnikNaziv(item.idk)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {item.titula}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          ✏️ Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(item.idk)}
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

export default SudijeManagement;
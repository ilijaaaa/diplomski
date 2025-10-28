import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const DodeljivanjeNagradaManagement = () => {
  const [dodeljivanja, setDodeljivanja] = useState([]);
  const [nagrade, setNagrade] = useState([]);
  const [izdanja, setIzdanja] = useState([]);
  const [takmicenja, setTakmicenja] = useState([]);
  const [nastupe, setNastupe] = useState([]);
  const [ucesnici, setUcesnici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

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
        izdanjaRes, 
        takmicenjaRes,
        nastupeRes,
        ucesniciRes
      ] = await Promise.all([
        api.get('/dodeljivanja-nagrada/'),
        api.get('/nagrade/'),
        api.get('/izdanja/'),
        api.get('/takmicenja/'),
        api.get('/nastupe/'),
        api.get('/ucesnici/')
      ]);
      
      setDodeljivanja(dodeljivanjaRes.data.results || dodeljivanjaRes.data || []);
      setNagrade(nagradeRes.data.results || nagradeRes.data || []);
      setIzdanja(izdanjaRes.data.results || izdanjaRes.data || []);
      setTakmicenja(takmicenjaRes.data.results || takmicenjaRes.data || []);
      setNastupe(nastupeRes.data.results || nastupeRes.data || []);
      setUcesnici(ucesniciRes.data.results || ucesniciRes.data || []);
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
        datdodele: formData.datdodele,
        sudija: parseInt(formData.sudija)
      };
      
      if (editingItem) {
        response = await api.put(`/dodeljivanja-nagrada/${editingItem.iddg}/`, submitData);
        setDodeljivanja(dodeljivanja.map(item => 
          item.iddg === editingItem.iddg ? response.data : item
        ));
      } else {
        response = await api.post('/dodeljivanja-nagrada/', submitData);
        setDodeljivanja([...dodeljivanja, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
    } catch (error) {
      console.error('Error saving dodeljivanje:', error);
      setError('Greška pri čuvanju dodeljivanja: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Update the nastup to assign the award
      const nastup = nastupe.find(n => n.idn === parseInt(assignData.nastup));
      if (nastup) {
        const updateData = {
          ...nastup,
          dodeljivanje_nagrade: parseInt(assignData.dodeljivanje_nagrade)
        };
        
        await api.put(`/nastupe/${nastup.idn}/`, updateData);
        await fetchData(); // Refresh data
        setShowAssignForm(false);
        setAssignData({ nastup: '', dodeljivanje_nagrade: '' });
      }
    } catch (error) {
      console.error('Error assigning award:', error);
      setError('Greška pri dodeljivanju nagrade: ' + (error.response?.data?.detail || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      datdodele: '',
      sudija: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      datdodele: item.datdodele || '',
      sudija: item.sudija || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovo dodeljivanje?')) {
      try {
        await api.delete(`/dodeljivanja-nagrada/${id}/`);
        setDodeljivanja(dodeljivanja.filter(item => item.iddg !== id));
      } catch (error) {
        console.error('Error deleting dodeljivanje:', error);
        setError('Greška pri brisanju dodeljivanja: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getSudijaName = (sudijaId) => {
    const sudija = sudije.find(s => s.idk === sudijaId);
    return sudija ? sudija.nazivkor : 'N/A';
  };

  const getNastupInfo = (nastup) => {
    const pesma = pesme.find(p => p.idp === nastup.pesma);
    const drzava = drzave.find(d => d.iddr === nastup.drzava);
    return `${pesma?.nazpesme || 'N/A'} - ${drzava?.nazdr || 'N/A'} (Plasman: ${nastup.plasman})`;
  };

  const getAssignedNastupe = (dodeljivanjeId) => {
    return nastupe.filter(n => n.dodeljivanje_nagrade === dodeljivanjeId);
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
              <h1 className="text-3xl font-bold text-gray-800">🏆 Dodeljivanje nagrada</h1>
              <p className="text-gray-600">Upravljaj dodeljivanjima nagrada učesnicima</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Novo dodeljivanje
              </button>
              <button
                onClick={() => setShowAssignForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🎯 Dodeli nagradu
              </button>
            </div>
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

        {/* Award Assignment Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">
                {editingItem ? 'Uredi dodeljivanje' : 'Novo dodeljivanje'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Datum dodeljivanja *
                  </label>
                  <input
                    type="date"
                    value={formData.datdodele}
                    onChange={(e) => setFormData({...formData, datdodele: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Sudija *
                  </label>
                  <select
                    value={formData.sudija}
                    onChange={(e) => setFormData({...formData, sudija: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite sudiju</option>
                    {sudije.map(sudija => (
                      <option key={sudija.idk} value={sudija.idk}>
                        {sudija.nazivkor} - {sudija.titula}
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
                      resetForm();
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

        {/* Assign Award Form Modal */}
        {showAssignForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Dodeli nagradu učesniku</h3>
              
              <form onSubmit={handleAssignSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nastup *
                  </label>
                  <select
                    value={assignData.nastup}
                    onChange={(e) => setAssignData({...assignData, nastup: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite nastup</option>
                    {nastupe.filter(n => !n.dodeljivanje_nagrade).map(nastup => (
                      <option key={nastup.idn} value={nastup.idn}>
                        {getNastupInfo(nastup)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Prikazani su samo nastupi bez dodeljenih nagrada</p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Dodeljivanje nagrade *
                  </label>
                  <select
                    value={assignData.dodeljivanje_nagrade}
                    onChange={(e) => setAssignData({...assignData, dodeljivanje_nagrade: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite dodeljivanje</option>
                    {dodeljivanja.map(dodeljivanje => (
                      <option key={dodeljivanje.iddg} value={dodeljivanje.iddg}>
                        {dodeljivanje.datdodele} - {getSudijaName(dodeljivanje.sudija)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Dodeli
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignForm(false);
                      setAssignData({ nastup: '', dodeljivanje_nagrade: '' });
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
          {dodeljivanja.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema dodeljivanja</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvo dodeljivanje da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj dodeljivanje
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
                      Datum dodeljivanja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sudija
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dodeljene nagrade
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dodeljivanja.map((item) => (
                    <tr key={item.iddg} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.iddg}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.datdodele}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getSudijaName(item.sudija)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getAssignedNastupe(item.iddg).map((nastup, index) => (
                            <div key={nastup.idn} className="bg-gray-50 p-2 rounded mb-1 text-xs">
                              {getNastupInfo(nastup)}
                            </div>
                          ))}
                          {getAssignedNastupe(item.iddg).length === 0 && (
                            <span className="text-gray-400 text-xs">Nema dodeljenih nagrada</span>
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
                          onClick={() => handleDelete(item.iddg)}
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

export default DodeljivanjeNagradaManagement;
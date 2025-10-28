import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ZirijiManagement = () => {
  const [ziriji, setZiriji] = useState([]);
  const [sudije, setSudije] = useState([]);
  const [korisnici, setKorisnici] = useState([]);
  const [sastojSe, setSastojSe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    brclanz: '',
    selectedSudije: [],
    predsednik: '',
    takmicenje: '',
    izdanje: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [zirijiRes, sudijeRes, korisniciRes, sastojSeRes] = await Promise.all([
        api.get('/ziriji/'),
        api.get('/sudije/'),
        api.get('/korisnici/'),
        api.get('/sastavi-ziri/')
      ]);
      
      setZiriji(zirijiRes.data.results || zirijiRes.data);
      setSudije(sudijeRes.data.results || sudijeRes.data);
      setKorisnici(korisniciRes.data.results || korisniciRes.data);
      setSastojSe(sastojSeRes.data.results || sastojSeRes.data);
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
        brclanz: parseInt(formData.brclanz)
      };
      
      if (editingItem) {
        // Update existing jury
        response = await api.put(`/ziriji/${editingItem.idz}/`, submitData);
        
        // Update jury composition
        await updateZiriSastav(editingItem.idz);
        
        setZiriji(ziriji.map(item => 
          item.idz === editingItem.idz ? response.data : item
        ));
      } else {
        // Create new jury
        response = await api.post('/ziriji/', submitData);
        
        // Add jury composition
        await updateZiriSastav(response.data.idz);
        
        setZiriji([...ziriji, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      await fetchData(); // Refresh to show updated compositions
    } catch (error) {
      console.error('Error saving ziri:', error);
      setError('Greška pri čuvanju žirija: ' + (error.response?.data?.detail || error.message));
    }
  };

  const updateZiriSastav = async (ziriId) => {
    try {
      // First, remove all existing members if editing
      if (editingItem) {
        await api.delete(`/ziriji/${ziriId}/sudije/`);
      }

      // Add selected judges
      for (const sudijaId of formData.selectedSudije) {
        await api.post('/sastavi-ziri/', {
          ziri: ziriId,
          sudija: sudijaId,
          predsednik: sudijaId === parseInt(formData.predsednik)
        });
      }
    } catch (error) {
      console.error('Error updating jury composition:', error);
      throw error;
    }
  };

  const resetForm = () => {
    setFormData({
      brclanz: '',
      selectedSudije: [],
      predsednik: '',
      takmicenje: '',
      izdanje: ''
    });
  };

  const handleEdit = async (item) => {
    setEditingItem(item);
    
    try {
      // Fetch current jury composition
      const sastav = await api.get(`/ziriji/${item.idz}/sastav/`);
      const clanovi = sastav.data || [];
      
      setFormData({
        brclanz: item.brclanz || '',
        selectedSudije: clanovi.map(c => c.sudija),
        predsednik: clanovi.find(c => c.predsednik)?.sudija || '',
        takmicenje: item.muzicko_takmicenje || '',
        izdanje: item.izdanje || ''
      });
      setShowForm(true);
    } catch (error) {
      console.error('Error loading jury composition:', error);
      setFormData({
        brclanz: item.brclanz || '',
        selectedSudije: [],
        predsednik: '',
        takmicenje: item.muzicko_takmicenje || '',
        izdanje: item.izdanje || ''
      });
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj žiri?')) {
      try {
        await api.delete(`/ziriji/${id}/`);
        setZiriji(ziriji.filter(item => item.idz !== id));
      } catch (error) {
        console.error('Error deleting ziri:', error);
        setError('Greška pri brisanju žirija: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getSudijaName = (idk) => {
    const korisnik = korisnici.find(k => k.idk === idk);
    return korisnik ? `${korisnik.imek} ${korisnik.przk}` : 'N/A';
  };

  const handleSudijaToggle = (sudijaId) => {
    const selected = formData.selectedSudije.includes(sudijaId);
    let newSelected;
    
    if (selected) {
      newSelected = formData.selectedSudije.filter(id => id !== sudijaId);
      // If removed judge was president, clear president
      if (formData.predsednik === sudijaId.toString()) {
        setFormData({
          ...formData,
          selectedSudije: newSelected,
          predsednik: ''
        });
        return;
      }
    } else {
      newSelected = [...formData.selectedSudije, sudijaId];
    }
    
    setFormData({
      ...formData,
      selectedSudije: newSelected,
      brclanz: newSelected.length.toString()
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam žirije...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">👨‍⚖️ Upravljanje žirijima</h1>
              <p className="text-gray-600">Kreiraj i upravljaj žirijima sa sudijama i predsednikom</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Novi žiri
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
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                {editingItem ? 'Uredi žiri' : 'Novi žiri'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Broj članova žirija
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.brclanz}
                    onChange={(e) => setFormData({...formData, brclanz: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Broj se automatski ažurira na osnovu izabranih sudija
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Sudije u žiriju *
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {sudije.length === 0 ? (
                      <p className="text-gray-500">Nema dostupnih sudija</p>
                    ) : (
                      sudije.map(sudija => (
                        <label key={sudija.idk} className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={formData.selectedSudije.includes(sudija.idk)}
                            onChange={() => handleSudijaToggle(sudija.idk)}
                            className="mr-2"
                          />
                          <span className="text-sm">
                            {getSudijaName(sudija.idk)} - {sudija.titula}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {formData.selectedSudije.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Predsednik žirija *
                    </label>
                    <select
                      value={formData.predsednik}
                      onChange={(e) => setFormData({...formData, predsednik: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Izaberite predsednika</option>
                      {formData.selectedSudije.map(sudijaId => {
                        const sudija = sudije.find(s => s.idk === sudijaId);
                        return (
                          <option key={sudijaId} value={sudijaId}>
                            {getSudijaName(sudijaId)} - {sudija?.titula}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                    disabled={formData.selectedSudije.length === 0 || !formData.predsednik}
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

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg">
          {ziriji.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👨‍⚖️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema žirija</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvi žiri da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj žiri
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
                      Broj članova
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ziriji.map((item) => (
                    <tr key={item.idz} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">Žiri {item.idz}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.brclanz} članova
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
                          onClick={() => handleDelete(item.idz)}
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

export default ZirijiManagement;
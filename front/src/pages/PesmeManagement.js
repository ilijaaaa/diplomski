import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const PesmeManagement = () => {
  const [pesme, setPesme] = useState([]);
  const [zanrovi, setZanrovi] = useState([]);
  const [nastupe, setNastupe] = useState([]);
  const [ucesnici, setUcesnici] = useState([]);
  const [izvodi, setIzvodi] = useState([]);
  const [solisti, setSolisti] = useState([]);
  const [duosi, setDuosi] = useState([]);
  const [grupe, setGrupe] = useState([]);
  const [korisnici, setKorisnici] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [assigningPesma, setAssigningPesma] = useState(null);
  const [formData, setFormData] = useState({
    nazp: '',
    trajanje: '',
    datob: '',
    zanr: ''
  });
  const [assignData, setAssignData] = useState({
    ucesnik: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        pesmeRes, 
        zanroviRes, 
        nastupeRes, 
        ucesniciRes,
        izvodiRes,
        solistiRes,
        duosiRes,
        grupeRes,
        korisniciRes,
      ] = await Promise.all([
        api.get('/pesme/'),
        api.get('/zanrovi/'),
        api.get('/nastupi/'),
        api.get('/ucesnici/'),
        api.get('/izvedbe/'),
        api.get('/solisti/'),
        api.get('/duosi/'),
        api.get('/grupe/'),
        api.get('/korisnici/')
      ]);
      
      setPesme(pesmeRes.data.results || pesmeRes.data);
      setZanrovi(zanroviRes.data.results || zanroviRes.data);
      setNastupe(nastupeRes.data.results || nastupeRes.data);
      setUcesnici(ucesniciRes.data.results || ucesniciRes.data);
      setIzvodi(izvodiRes.data.results || izvodiRes.data);
      setSolisti(solistiRes.data.results || solistiRes.data);
      setDuosi(duosiRes.data.results || duosiRes.data);
      setGrupe(grupeRes.data.results || grupeRes.data);
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
        ...formData,
        trajanje: parseInt(formData.trajanje),
        zanr: parseInt(formData.zanr)
      };
      
      if (editingItem) {
        response = await api.put(`/pesme/${editingItem.idp}/`, submitData);
        setPesme(pesme.map(item => 
          item.idp === editingItem.idp ? response.data : item
        ));
      } else {
        response = await api.post('/pesme/', submitData);
        setPesme([...pesme, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ nazp: '', trajanje: '', datob: '', zanr: '' });
    } catch (error) {
      console.error('Error saving pesma:', error);
      setError('Greška pri čuvanju pesme: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleAssign = (pesma) => {
    setAssigningPesma(pesma);
    setAssignData({ ucesnik: '' });
    setShowAssignForm(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Check if song is already assigned to someone else
      const existingAssignments = izvodi.filter(i => i.pesma === assigningPesma.idp);
      
      if (existingAssignments.length > 0) {
        const currentPerformer = existingAssignments[0];
        const performerInfo = getUcesnikInfo(currentPerformer.ucesnik);
        
        // If trying to assign to the same person, ignore
        if (currentPerformer.ucesnik === parseInt(assignData.ucesnik)) {
          setError('Ovaj učesnik već izvodi ovu pesmu');
          return;
        }
        
        // If trying to assign to someone else, remove previous assignment and add new one
        if (window.confirm(`Pesma "${assigningPesma.nazp}" je već dodeljena izvođaču: ${performerInfo}. Da li želite da je prebacite na novog izvođača?`)) {
          // Find and remove existing assignment
          // Let's try a simple approach - get all assignments and find the one to delete
          const allAssignments = await api.get('/izvedbe/');
          const assignmentToDelete = allAssignments.data.find(a => 
            a.pesma === assigningPesma.idp && a.ucesnik === currentPerformer.ucesnik
          );
          
          if (assignmentToDelete) {
            // Try to delete by compound key lookup using query parameters since Izvodi has no explicit ID
            await api.delete(`/izvedbe/?ucesnik=${assignmentToDelete.ucesnik}&pesma=${assignmentToDelete.pesma}`);
          }
        } else {
          return;
        }
      }
      
      // Add new assignment
      await api.post('/izvedbe/', {
        pesma: assigningPesma.idp,
        ucesnik: parseInt(assignData.ucesnik)
      });
      
      // Refresh data
      await fetchData();
      
      setShowAssignForm(false);
      setAssigningPesma(null);
      setAssignData({ ucesnik: '' });
      
    } catch (error) {
      console.error('Error assigning song:', error);
      setError('Greška pri dodeljivanju pesme: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nazp: item.nazp || '',
      trajanje: item.trajanje || '',
      datob: item.datob ? item.datob.split('T')[0] : '',
      zanr: item.zanr || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu pesmu?')) {
      try {
        await api.delete(`/pesme/${id}/`);
        setPesme(pesme.filter(item => item.idp !== id));
      } catch (error) {
        console.error('Error deleting pesma:', error);
        setError('Greška pri brisanju pesme: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const formatTrajanjeMinSec = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getZanrNaziv = (idzanr) => {
    const zanr = zanrovi.find(z => z.idzanr === idzanr);
    return zanr ? zanr.nazzanr : 'N/A';
  };

  const getUcesnikInfo = (ucesnikId) => {
    const ucesnik = ucesnici.find(u => u.idk === ucesnikId);
    if (!ucesnik) return 'Nepoznat učesnik';

    const korisnik = korisnici.find(k => k.idk === ucesnik.korisnik);
    const korisnikInfo = korisnik ? `${korisnik.ime} ${korisnik.prezime}` : 'Nepoznato ime';

    if (ucesnik.tipu === 'SOLO' && ucesnik.solo) {
      const solo = solisti.find(s => s.ids === ucesnik.solo);
      return `Solo: ${solo?.umime || korisnikInfo}`;
    } else if (ucesnik.tipu === 'DUO' && ucesnik.duo) {
      const duo = duosi.find(d => d.idd === ucesnik.duo);
      return `Duo: ${duo?.nazduo || korisnikInfo}`;
    } else if (ucesnik.tipu === 'GRUPA' && ucesnik.grupa) {
      const grupa = grupe.find(g => g.idg === ucesnik.grupa);
      return `Grupa: ${grupa?.nazg || korisnikInfo}`;
    }
    
    return korisnikInfo;
  };

  const getIzvodjaceForPesma = (pesmaId) => {
    return izvodi.filter(i => i.pesma === pesmaId);
  };

  const getNastupeForPesma = (pesmaId) => {
    return nastupe.filter(n => n.pesma === pesmaId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam pesme...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">🎵 Upravljanje pesmama</h1>
              <p className="text-gray-600">Kreiraj i upravljaj pesmama koje izvode učesnici</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              ➕ Nova pesma
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
                {editingItem ? 'Uredi pesmu' : 'Nova pesma'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Naziv pesme *
                  </label>
                  <input
                    type="text"
                    maxLength="20"
                    value={formData.nazp}
                    onChange={(e) => setFormData({...formData, nazp: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Trajanje (u sekundama) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.trajanje}
                    onChange={(e) => setFormData({...formData, trajanje: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.trajanje && (
                    <p className="text-sm text-gray-500 mt-1">
                      Trajanje: {formatTrajanjeMinSec(parseInt(formData.trajanje))}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Datum objave *
                  </label>
                  <input
                    type="date"
                    value={formData.datob}
                    onChange={(e) => setFormData({...formData, datob: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Žanr *
                  </label>
                  <select
                    value={formData.zanr}
                    onChange={(e) => setFormData({...formData, zanr: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite žanr</option>
                    {zanrovi.map(z => (
                      <option key={z.idzanr} value={z.idzanr}>{z.nazzanr}</option>
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
                      setFormData({ nazp: '', trajanje: '', datob: '', zanr: '' });
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

        {/* Assign Song Modal */}
        {showAssignForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">
                Dodeli pesmu učesniku
              </h3>
              <p className="text-gray-600 mb-4">
                Pesma: <strong>{assigningPesma?.nazp}</strong>
              </p>
              
              <form onSubmit={handleAssignSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Učesnik *
                  </label>
                  <select
                    value={assignData.ucesnik}
                    onChange={(e) => setAssignData({...assignData, ucesnik: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite učesnika</option>
                    {ucesnici.map(ucesnik => (
                      <option key={ucesnik.idk} value={ucesnik.idk}>
                        {getUcesnikInfo(ucesnik.idk)}
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
                      setAssigningPesma(null);
                      setAssignData({ ucesnik: '' });
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
          {pesme.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema pesama</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvu pesmu da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj pesmu
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
                      Trajanje
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum objave
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Žanr
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Izvođači
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pesme.map((item) => (
                    <tr key={item.idp} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.idp}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.nazp}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatTrajanjeMinSec(item.trajanje)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(item.datob)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getZanrNaziv(item.zanr)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getIzvodjaceForPesma(item.idp).length > 0 ? (
                          <div className="space-y-1">
                            {getIzvodjaceForPesma(item.idp).map((izvodi_item, index) => (
                              <div key={`${izvodi_item.ucesnik}-${index}`} className="text-xs bg-blue-50 rounded px-2 py-1">
                                <div className="font-medium">{getUcesnikInfo(izvodi_item.ucesnik)}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Nema izvođača</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAssign(item)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Dodeli pesmu učesniku"
                        >
                          🎤 Dodeli
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          ✏️ Uredi
                        </button>
                        <button
                          onClick={() => handleDelete(item.idp)}
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

export default PesmeManagement;
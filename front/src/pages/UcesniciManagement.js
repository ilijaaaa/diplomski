import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const UcesniciManagement = () => {
  const [ucesnici, setUcesnici] = useState([]);
  const [korisnici, setKorisnici] = useState([]);
  const [solisti, setSolisti] = useState([]);
  const [duosi, setDuosi] = useState([]);
  const [grupe, setGrupe] = useState([]);
  const [drzave, setDrzave] = useState([]);
  const [izdanja, setIzdanja] = useState([]);
  const [takmicenja, setTakmicenja] = useState([]);
  const [ucestva, setUcestva] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    idk: '',
    tipu: 'SOLO',
    // For creating new entities
    umime: '', // solo
    nazduo: '', // duo
    nazg: '', // grupa
    brclang: '', // grupa members count
    // Existing entities
    solo: '',
    duo: '',
    grupa: ''
  });
  const [registrationData, setRegistrationData] = useState({
    ucesnik: '',
    drzava: '',
    izdanje: '',
    // New participant registration
    newParticipant: false,
    ime: '',
    prezime: '',
    email: '',
    password: '',
    tipu: 'SOLO',
    // Solo/Duo/Grupa data
    umime: '',
    nazduo: '',
    nazg: '',
    brclang: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        ucesniciRes, 
        korisniciRes, 
        solistiRes, 
        duosiRes, 
        grupeRes, 
        drzaveRes,
        izdanjaRes,
        takmicenjaRes,
        ucestvaRes
      ] = await Promise.all([
        api.get('/ucesnici/'),
        api.get('/korisnici/'),
        api.get('/solisti/'),
        api.get('/duosi/'),
        api.get('/grupe/'),
        api.get('/drzave/'),
        api.get('/izdanja/'),
        api.get('/muzicka-takmicenja/'),
        api.get('/ucestva/')
      ]);
      
      setUcesnici(ucesniciRes.data.results || ucesniciRes.data);
      setKorisnici(korisniciRes.data.results || korisniciRes.data);
      setSolisti(solistiRes.data.results || solistiRes.data);
      setDuosi(duosiRes.data.results || duosiRes.data);
      setGrupe(grupeRes.data.results || grupeRes.data);
      setDrzave(drzaveRes.data.results || drzaveRes.data);
      setIzdanja(izdanjaRes.data.results || izdanjaRes.data);
      setTakmicenja(takmicenjaRes.data.results || takmicenjaRes.data);
      setUcestva(ucestvaRes.data.results || ucestvaRes.data);
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
      
      let submitData = {
        korisnik: parseInt(formData.idk),
        tipu: formData.tipu,
        solo: null,
        duo: null,
        grupa: null
      };

      // Handle entity creation or selection based on type
      if (formData.tipu === 'SOLO') {
        if (formData.umime) {
          // Create new solo
          const soloRes = await api.post('/solisti/', { umime: formData.umime });
          submitData.solo = soloRes.data.ids;
        } else if (formData.solo) {
          submitData.solo = parseInt(formData.solo);
        }
      } else if (formData.tipu === 'DUO') {
        if (formData.nazduo) {
          // Create new duo
          const duoRes = await api.post('/duosi/', { nazduo: formData.nazduo });
          submitData.duo = duoRes.data.idd;
        } else if (formData.duo) {
          submitData.duo = parseInt(formData.duo);
        }
      } else if (formData.tipu === 'GRUPA') {
        if (formData.nazg) {
          // Create new grupa
          const grupaRes = await api.post('/grupe/', { 
            nazg: formData.nazg, 
            brclang: parseInt(formData.brclang) 
          });
          submitData.grupa = grupaRes.data.idg;
        } else if (formData.grupa) {
          submitData.grupa = parseInt(formData.grupa);
        }
      }
      
      if (editingItem) {
        response = await api.put(`/ucesnici/${editingItem.idk}/`, submitData);
        setUcesnici(ucesnici.map(item => 
          item.idk === editingItem.idk ? response.data : item
        ));
      } else {
        response = await api.post('/ucesnici/', submitData);
        setUcesnici([...ucesnici, response.data]);
      }
      
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      // Refresh lists to show new entities
      await fetchData();
    } catch (error) {
      console.error('Error saving ucesnik:', error);
      setError('Greška pri čuvanju učesnika: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      
      let ucesnikId = null;
      
      if (registrationData.newParticipant) {
        // Create new user and participant
        
        // 1. Create new Korisnik
        const korisnikRes = await api.post('/korisnici/', {
          ime: registrationData.ime,
          prezime: registrationData.prezime,
          email: registrationData.email,
          password: registrationData.password
        });
        const korisnikId = korisnikRes.data.idk;
        
        // 2. Create appropriate entity (Solo/Duo/Grupa)
        let entityId = null;
        if (registrationData.tipu === 'SOLO') {
          const soloRes = await api.post('/solisti/', {
            umime: registrationData.umime
          });
          entityId = soloRes.data.ids;
        } else if (registrationData.tipu === 'DUO') {
          const duoRes = await api.post('/duosi/', {
            nazduo: registrationData.nazduo
          });
          entityId = duoRes.data.idd;
        } else if (registrationData.tipu === 'GRUPA') {
          const grupaRes = await api.post('/grupe/', {
            nazg: registrationData.nazg,
            brclang: parseInt(registrationData.brclang)
          });
          entityId = grupaRes.data.idg;
        }
        
        // 3. Create Ucesnik - use POST with korisnik ID in data
        const ucesnikData = {
          idk: korisnikId,
          tipu: registrationData.tipu,
          solo: registrationData.tipu === 'SOLO' ? entityId : null,
          duo: registrationData.tipu === 'DUO' ? entityId : null,
          grupa: registrationData.tipu === 'GRUPA' ? entityId : null
        };
        
        // Use POST with the korisnik ID in the data
        const ucesnikRes = await api.post('/ucesnici/', ucesnikData);
        ucesnikId = ucesnikRes.data.idk;
        
        // Refresh ucesnici list
        const ucesniciRes = await api.get('/ucesnici/');
        setUcesnici(ucesniciRes.data.results || ucesniciRes.data);
        
      } else {
        // Use existing participant
        ucesnikId = parseInt(registrationData.ucesnik);
      }
      
      // First ensure the country participates in the edition (Ucestvuje)
      let ucestvujeId = null;
      const existingUcestvo = ucestva.find(u => 
        u.drzava === parseInt(registrationData.drzava) && 
        u.izdanje === parseInt(registrationData.izdanje)
      );
      
      if (existingUcestvo) {
        ucestvujeId = existingUcestvo.ucestvuje_id;
      } else {
        // Create new Ucestvuje if it doesn't exist
        const ucestvujeRes = await api.post('/ucestva/', {
          drzava: parseInt(registrationData.drzava),
          izdanje: parseInt(registrationData.izdanje)
        });
        ucestvujeId = ucestvujeRes.data.ucestvuje_id;
        
        // Refresh ucestva list
        const ucestvaRes = await api.get('/ucestva/');
        setUcestva(ucestvaRes.data.results || ucestvaRes.data);
      }
      
      // Create Reprezentuje (participant represents country)
      await api.post('/reprezentacije/', {
        ucesnik: ucesnikId,
        ucestvuje: ucestvujeId
      });
      
      setShowRegistrationForm(false);
      setRegistrationData({
        ucesnik: '',
        drzava: '',
        izdanje: '',
        newParticipant: false,
        ime: '',
        prezime: '',
        email: '',
        password: '',
        tipu: 'SOLO',
        umime: '',
        nazduo: '',
        nazg: '',
        brclang: ''
      });
      
      // Show success message
      if (registrationData.newParticipant) {
        alert('Novi učesnik je kreiran i uspešno registrovan na takmičenje!');
      } else {
        alert('Učesnik je uspešno registrovan na takmičenje!');
      }
      
    } catch (error) {
      console.error('Error registering participant:', error);
      setError('Greška pri registraciji učesnika: ' + (error.response?.data?.detail || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      idk: '',
      tipu: 'SOLO',
      umime: '',
      nazduo: '',
      nazg: '',
      brclang: '',
      solo: '',
      duo: '',
      grupa: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      idk: item.idk || '',
      tipu: item.tipu || 'SOLO',
      umime: '',
      nazduo: '',
      nazg: '',
      brclang: '',
      solo: item.solo || '',
      duo: item.duo || '',
      grupa: item.grupa || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog učesnika?')) {
      try {
        await api.delete(`/ucesnici/${id}/`);
        setUcesnici(ucesnici.filter(item => item.idk !== id));
      } catch (error) {
        console.error('Error deleting ucesnik:', error);
        setError('Greška pri brisanju učesnika: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const getKorisnikNaziv = (idk) => {
    const korisnik = korisnici.find(k => k.idk === idk);
    return korisnik ? `${korisnik.imek} ${korisnik.przk}` : 'N/A';
  };

  const getDrzavaNaziv = (idk) => {
    const korisnik = korisnici.find(k => k.idk === idk);
    if (!korisnik || !korisnik.drz) return 'N/A';
    const drzava = drzave.find(d => d.iddr === korisnik.drz);
    return drzava ? drzava.nazdr : 'N/A';
  };

  const getIzdanjeInfo = (izdanjeId) => {
    const izdanje = izdanja.find(i => i.idizd === izdanjeId);
    if (!izdanje) return null;
    
    const takmicenje = takmicenja.find(t => t.idmt === izdanje.muzicko_takmicenje);
    if (!takmicenje) return null;
    
    return `${takmicenje.naztakm} - ${izdanje.idizd}`;
  };

  const getEntityName = (item) => {
    switch (item.tipu) {
      case 'SOLO':
        if (item.solo) {
          const solo = solisti.find(s => s.ids === item.solo);
          return solo ? solo.umime : 'N/A';
        }
        return 'N/A';
      case 'DUO':
        if (item.duo) {
          const duo = duosi.find(d => d.idd === item.duo);
          return duo ? duo.nazduo : 'N/A';
        }
        return 'N/A';
      case 'GRUPA':
        if (item.grupa) {
          const grupa = grupe.find(g => g.idg === item.grupa);
          return grupa ? grupa.nazg : 'N/A';
        }
        return 'N/A';
      default:
        return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavam učesnike...</p>
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
              <h1 className="text-3xl font-bold text-gray-800">👥 Upravljanje učesnicima</h1>
              <p className="text-gray-600">Kreiraj i upravljaj učesnicima takmičenja</p>
            </div>
            <div className="space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Novi učesnik
              </button>
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🎯 Registruj na takmičenje
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                {editingItem ? 'Uredi učesnika' : 'Novi učesnik'}
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
                  >
                    <option value="">Izaberite korisnika</option>
                    {korisnici.filter(k => k.tipk !== 'ORGANIZATOR' && k.tipk !== 'SUDIJA').map(k => (
                      <option key={k.idk} value={k.idk}>
                        {k.imek} {k.przk} ({k.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Tip učesnika *
                  </label>
                  <select
                    value={formData.tipu}
                    onChange={(e) => setFormData({...formData, tipu: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="SOLO">Solo</option>
                    <option value="DUO">Duo</option>
                    <option value="GRUPA">Grupa</option>
                  </select>
                </div>

                {/* Solo Fields */}
                {formData.tipu === 'SOLO' && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-3">Solo podaci</h4>
                    
                    <div className="mb-3">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Postojeći solo
                      </label>
                      <select
                        value={formData.solo}
                        onChange={(e) => setFormData({...formData, solo: e.target.value, umime: ''})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Kreiraj novi</option>
                        {solisti.map(s => (
                          <option key={s.ids} value={s.ids}>{s.umime}</option>
                        ))}
                      </select>
                    </div>

                    {!formData.solo && (
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Umetničko ime *
                        </label>
                        <input
                          type="text"
                          maxLength="20"
                          value={formData.umime}
                          onChange={(e) => setFormData({...formData, umime: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={!formData.solo}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Duo Fields */}
                {formData.tipu === 'DUO' && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-3">Duo podaci</h4>
                    
                    <div className="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Napomena:</strong> Svaki učesnik mora imati svoj entitet (duo/grupu). 
                        Za više članova istog dua/grupe, kreirajte poseban entitet za svakog učesnika 
                        ili koristite postojeći.
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Postojeći duo
                      </label>
                      <select
                        value={formData.duo}
                        onChange={(e) => setFormData({...formData, duo: e.target.value, nazduo: ''})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Kreiraj novi</option>
                        {duosi.map(d => (
                          <option key={d.idd} value={d.idd}>{d.nazduo}</option>
                        ))}
                      </select>
                    </div>

                    {!formData.duo && (
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                          Naziv dua *
                        </label>
                        <input
                          type="text"
                          maxLength="20"
                          value={formData.nazduo}
                          onChange={(e) => setFormData({...formData, nazduo: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={!formData.duo}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Grupa Fields */}
                {formData.tipu === 'GRUPA' && (
                  <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-3">Grupa podaci</h4>
                    
                    <div className="mb-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Napomena:</strong> Svaki učesnik mora imati svoj entitet (duo/grupu). 
                        Za više članova iste grupe, kreirajte poseban entitet za svakog učesnika 
                        ili koristite postojeći.
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Postojeća grupa
                      </label>
                      <select
                        value={formData.grupa}
                        onChange={(e) => setFormData({...formData, grupa: e.target.value, nazg: '', brclang: ''})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Kreiraj novu</option>
                        {grupe.map(g => (
                          <option key={g.idg} value={g.idg}>{g.nazg} ({g.brclang} članova)</option>
                        ))}
                      </select>
                    </div>

                    {!formData.grupa && (
                      <>
                        <div className="mb-3">
                          <label className="block text-gray-700 font-semibold mb-2">
                            Naziv grupe *
                          </label>
                          <input
                            type="text"
                            maxLength="20"
                            value={formData.nazg}
                            onChange={(e) => setFormData({...formData, nazg: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={!formData.grupa}
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-semibold mb-2">
                            Broj članova *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={formData.brclang}
                            onChange={(e) => setFormData({...formData, brclang: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={!formData.grupa}
                          />
                        </div>
                      </>
                    )}
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

        {/* Registration Modal */}
        {showRegistrationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">
                Registruj učesnika na takmičenje
              </h3>
              
              <form onSubmit={handleRegistration}>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={registrationData.newParticipant}
                      onChange={(e) => setRegistrationData({...registrationData, newParticipant: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-gray-700 font-semibold">Kreiraj novog korisnika</span>
                  </label>
                </div>

                {registrationData.newParticipant ? (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Ime *
                      </label>
                      <input
                        type="text"
                        value={registrationData.ime}
                        onChange={(e) => setRegistrationData({...registrationData, ime: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={registrationData.newParticipant}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Prezime *
                      </label>
                      <input
                        type="text"
                        value={registrationData.prezime}
                        onChange={(e) => setRegistrationData({...registrationData, prezime: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={registrationData.newParticipant}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={registrationData.email}
                        onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={registrationData.newParticipant}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Lozinka *
                      </label>
                      <input
                        type="password"
                        value={registrationData.password}
                        onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={registrationData.newParticipant}
                        minLength={6}
                        placeholder="Minimum 6 karaktera"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Tip učesnika *
                      </label>
                      <select
                        value={registrationData.tipu}
                        onChange={(e) => setRegistrationData({...registrationData, tipu: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={registrationData.newParticipant}
                      >
                        <option value="SOLO">Solo</option>
                        <option value="DUO">Duo</option>
                        <option value="GRUPA">Grupa</option>
                      </select>
                    </div>

                    {/* Entity creation fields */}
                    {registrationData.tipu === 'SOLO' && (
                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Umetničko ime *
                        </label>
                        <input
                          type="text"
                          value={registrationData.umime}
                          onChange={(e) => setRegistrationData({...registrationData, umime: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={registrationData.newParticipant}
                        />
                      </div>
                    )}

                    {registrationData.tipu === 'DUO' && (
                      <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">
                          Naziv dua *
                        </label>
                        <input
                          type="text"
                          value={registrationData.nazduo}
                          onChange={(e) => setRegistrationData({...registrationData, nazduo: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required={registrationData.newParticipant}
                        />
                      </div>
                    )}

                    {registrationData.tipu === 'GRUPA' && (
                      <>
                        <div className="mb-4">
                          <label className="block text-gray-700 font-semibold mb-2">
                            Naziv grupe *
                          </label>
                          <input
                            type="text"
                            value={registrationData.nazg}
                            onChange={(e) => setRegistrationData({...registrationData, nazg: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={registrationData.newParticipant}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-700 font-semibold mb-2">
                            Broj članova *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={registrationData.brclang}
                            onChange={(e) => setRegistrationData({...registrationData, brclang: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={registrationData.newParticipant}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2">
                      Učesnik *
                    </label>
                    <select
                      value={registrationData.ucesnik}
                      onChange={(e) => setRegistrationData({...registrationData, ucesnik: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={!registrationData.newParticipant}
                    >
                      <option value="">Izaberite učesnika</option>
                      {ucesnici.map(ucesnik => (
                        <option key={ucesnik.idk} value={ucesnik.idk}>
                          {getKorisnikNaziv(ucesnik.idk)} ({ucesnik.tipu}) - {getEntityName(ucesnik)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}



                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Država *
                  </label>
                  <select
                    value={registrationData.drzava}
                    onChange={(e) => setRegistrationData({...registrationData, drzava: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite državu</option>
                    {drzave.map(drzava => (
                      <option key={drzava.iddr} value={drzava.iddr}>
                        {drzava.nazdr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Izdanje takmičenja *
                  </label>
                  <select
                    value={registrationData.izdanje}
                    onChange={(e) => setRegistrationData({...registrationData, izdanje: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Izaberite izdanje</option>
                    {izdanja
                      .filter(izdanje => {
                        const takmicenjeInfo = getIzdanjeInfo(izdanje.idizd);
                        return takmicenjeInfo !== null;
                      })
                      .map(izdanje => (
                        <option key={izdanje.idizd} value={izdanje.idizd}>
                          {getIzdanjeInfo(izdanje.idizd)} ({izdanje.datpoc} - {izdanje.datkraj})
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Registruj
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrationForm(false);
                      setRegistrationData({
                        ucesnik: '',
                        drzava: '',
                        izdanje: '',
                        newParticipant: false,
                        ime: '',
                        prezime: '',
                        email: '',
                        tipu: 'SOLO',
                        umime: '',
                        nazduo: '',
                        nazg: '',
                        brclang: ''
                      });
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
          {ucesnici.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema učesnika</h3>
              <p className="text-gray-500 mb-4">Kreirajte prvog učesnika da biste počeli</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ➕ Kreiraj učesnika
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Korisnik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tip
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entitet
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ucesnici.map((item) => (
                    <tr key={item.idk} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{getKorisnikNaziv(item.idk)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.tipu === 'SOLO' ? 'bg-blue-100 text-blue-800' :
                          item.tipu === 'DUO' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.tipu}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getEntityName(item)}</div>
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

export default UcesniciManagement;
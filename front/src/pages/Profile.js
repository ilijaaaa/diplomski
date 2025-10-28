import React, { useState, useEffect } from 'react';
import { authService } from '../services/api';

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    imek: '',
    przk: '',
    mejl: '',
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Osvežavaj formData kada se user menja
  useEffect(() => {
    if (user) {
      setFormData({
        imek: user.imek || '',
        przk: user.przk || '',
        mejl: user.mejl || '',
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const updateData = {};

      // Samo dodaj polja koja su se promenila
      if (formData.imek !== user?.imek && formData.imek.trim()) {
        updateData.imek = formData.imek.trim();
      }

      if (formData.przk !== user?.przk && formData.przk.trim()) {
        updateData.przk = formData.przk.trim();
      }

      if (formData.mejl !== user?.mejl && formData.mejl.trim()) {
        updateData.mejl = formData.mejl.trim();
      }

      // Ako korisnik želi da promijeni lozinku
      if (formData.old_password && formData.new_password) {
        if (formData.new_password !== formData.new_password_confirm) {
          setError('Nove lozinke se ne poklapaju');
          setLoading(false);
          return;
        }
        updateData.old_password = formData.old_password;
        updateData.new_password = formData.new_password;
      }

      // Ako nema nikakvih promena
      if (Object.keys(updateData).length === 0) {
        setMessage('Nema promena za ažuriranje');
        setLoading(false);
        return;
      }

      const response = await authService.updateProfile(updateData);
      
      // Ažuriraj state sa novim podacima
      setUser(response.data.user);
      setMessage('Profil je uspešno ažuriran!');
      setEditMode(false);
      
      // Osvežavaj formData sa novim vrednostima
      setFormData({
        imek: response.data.user.imek,
        przk: response.data.user.przk,
        mejl: response.data.user.mejl,
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (err) {
      let errorMsg = 'Greška pri ažuriranju profila';
      
      if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Greška mreže - proveri da li je backend server pokrenut na portu 8000';
      } else if (err.response?.status === 401) {
        errorMsg = 'Neautorizovan pristup - možda je potrebno da se ponovo prijaviš';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
      console.error('Greška pri ažuriranju:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (tipk) => {
    const roles = {
      'SUDIJA': '🎵 Sudija',
      'ORGANIZATOR': '🎪 Organizator',
      'UCESNIK': '🎤 Učesnik',
    };
    return roles[tipk] || tipk;
  };

  const getRoleColor = (tipk) => {
    const colors = {
      'SUDIJA': 'from-yellow-400 to-yellow-600',
      'ORGANIZATOR': 'from-green-400 to-green-600',
      'UCESNIK': 'from-purple-500 to-pink-600',
    };
    return colors[tipk] || 'from-gray-400 to-gray-600';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getRoleColor(user?.tipk)} rounded-lg shadow-lg p-8 text-white mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{getRoleLabel(user?.tipk)}</h1>
              <p className="text-lg opacity-90 mt-2">
                {user?.imek} {user?.przk}
              </p>
            </div>
            <span className="text-6xl">
              {user?.tipk === 'SUDIJA' && '🎵'}
              {user?.tipk === 'ORGANIZATOR' && '🎪'}
              {user?.tipk === 'UCESNIK' && '🎤'}
            </span>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ✗ {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {!editMode ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Informacije o profilu</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-gray-600 font-semibold">Korisničko ime</label>
                  <p className="text-gray-800 text-lg">{user?.username}</p>
                </div>
                
                <div>
                  <label className="text-gray-600 font-semibold">Ime</label>
                  <p className="text-gray-800 text-lg">{user?.imek}</p>
                </div>
                
                <div>
                  <label className="text-gray-600 font-semibold">Prezime</label>
                  <p className="text-gray-800 text-lg">{user?.przk}</p>
                </div>
                
                <div>
                  <label className="text-gray-600 font-semibold">Email</label>
                  <p className="text-gray-800 text-lg">{user?.mejl}</p>
                </div>

                {user?.sudija?.titula && (
                  <div>
                    <label className="text-gray-600 font-semibold">Titula</label>
                    <p className="text-gray-800 text-lg">{user?.sudija?.titula}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                ✏️ Uredi profil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Uredi profil</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Ime</label>
                  <input
                    type="text"
                    name="imek"
                    value={formData.imek}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Prezime</label>
                  <input
                    type="text"
                    name="przk"
                    value={formData.przk}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    name="mejl"
                    value={formData.mejl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <hr className="my-6" />

                <h3 className="text-lg font-bold text-gray-800 mb-4">Promjena lozinke (opciono)</h3>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Stara lozinka</label>
                  <input
                    type="password"
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ostavi prazno ako ne želiš da promijeniš"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Nova lozinka</label>
                  <input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ostavi prazno ako ne želiš da promijeniš"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Potvrdi novu lozinku</label>
                  <input
                    type="password"
                    name="new_password_confirm"
                    value={formData.new_password_confirm}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Ostavi prazno ako ne želiš da promijeniš"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Čuvanje...' : '💾 Čuva'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setError('');
                    setMessage('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition"
                >
                  ✕ Otkaži
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default Profile;

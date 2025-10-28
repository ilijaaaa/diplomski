import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Greška pri prijavi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🎵</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Muzičko takmičenje</h1>
          <p className="text-gray-600 mt-2">Prijava u sistem</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Korisničko ime</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Unesite korisničko ime"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
              placeholder="Unesite lozinku"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Učitavanje...' : 'Prijava'}
          </button>
        </form>

        <div className="mt-6 border-t pt-6">
          <p className="text-gray-600 text-center mb-4">Nemate nalog?</p>
          <div className="space-y-2">
            <Link
              to="/register-sudija"
              className="block w-full text-center bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition"
            >
              🎵 Registracija - Sudija
            </Link>
            <Link
              to="/register-organizator"
              className="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
            >
              🎪 Registracija - Organizator
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const RegisterOrganizator = ({ setUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    imek: '',
    przk: '',
    mejl: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.registerOrganizator(formData);
      
      localStorage.setItem('access_token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri registraciji');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <span className="text-5xl">🎪</span>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">Registracija - Organizator</h1>
          <p className="text-gray-600 mt-2">Kreirajte nalog za organizatora</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="username"
            placeholder="Korisničko ime"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            required
          />

          <input
            type="text"
            name="imek"
            placeholder="Ime"
            value={formData.imek}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            required
          />

          <input
            type="text"
            name="przk"
            placeholder="Prezime"
            value={formData.przk}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            required
          />

          <input
            type="email"
            name="mejl"
            placeholder="Email"
            value={formData.mejl}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Lozinka"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            required
          />

          <input
            type="password"
            name="password2"
            placeholder="Potvrdi lozinku"
            value={formData.password2}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
          >
            {loading ? 'Učitavanje...' : 'Registruj se'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">Već imaš nalog?</p>
          <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
            Prijava
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganizator;

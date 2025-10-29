import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const UcesnikStatus = () => {
  const [currentUcesnik, setCurrentUcesnik] = useState(null);
  const [nastupe, setNastupe] = useState([]);
  const [ocene, setOcene] = useState([]);
  const [sudije, setSudije] = useState([]);
  const [pesme, setPesme] = useState([]);
  const [drzave, setDrzave] = useState([]);
  const [nagrade, setNagrade] = useState([]);
  const [dodeljivanja, setDodeljivanja] = useState([]);
  const [takmickarski_krugovi, setTakmickarskiKrugovi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting fetchData...');
      
      // Get current authenticated user info using /auth/me/
      const meRes = await api.get('/auth/me/');
      const currentUser = meRes.data;
      
      console.log('Current user from /auth/me/:', currentUser);
      
      if (!currentUser || !currentUser.ucesnik) {
        console.log('No ucesnik found in currentUser');
        setError('Korisnik nije prijavljen ili nije učesnik');
        return;
      }

      const ucesnikId = currentUser.ucesnik.idk;
      console.log('Ucesnik ID:', ucesnikId);

      console.log('Fetching ucesnik details...');
      const ucesnikRes = await api.get(`/ucesnici/${ucesnikId}/`);
      const ucesnikData = ucesnikRes.data;
      console.log('Ucesnik data:', ucesnikData);

      const [
        nastupeRes,
        oceneRes,
        sudijeRes,
        pesmeRes,
        drzaveRes,
        nagradeRes,
        dodeljivanjaRes,
        krugoviRes
      ] = await Promise.all([
        api.get('/nastupi/'),
        api.get('/ocene/'),
        api.get('/sudije/'),
        api.get('/pesme/'),
        api.get('/drzave/'),
        api.get('/nagrade/'),
        api.get('/dodeljivanja-nagrada/'),
        api.get('/takmickarski-krugovi/')
      ]);

      const ucesnikDataFromList = ucesnikRes.data;
      setCurrentUcesnik(ucesnikData);

      const allNastupe = nastupeRes.data.results || nastupeRes.data;
      const allOcene = oceneRes.data.results || oceneRes.data;
      
      setSudije(sudijeRes.data.results || sudijeRes.data);
      setPesme(pesmeRes.data.results || pesmeRes.data);
      setDrzave(drzaveRes.data.results || drzaveRes.data);
      setNagrade(nagradeRes.data.results || nagradeRes.data);
      setDodeljivanja(dodeljivanjaRes.data.results || dodeljivanjaRes.data);
      setTakmickarskiKrugovi(krugoviRes.data.results || krugoviRes.data);

      // Filter nastupe for current participant's songs
      // First, get songs performed by this participant
      console.log('Fetching izvedbe...');
      const izvodiRes = await api.get('/izvedbe/');
      const izvodi = izvodiRes.data.results || izvodiRes.data;
      console.log('Izvodi data:', izvodi);
      
      const participantSongs = izvodi
        .filter(i => i.ucesnik === ucesnikData.idk)
        .map(i => i.pesma);
        
      console.log('Participant songs:', participantSongs);

      const participantNastupe = allNastupe.filter(n => participantSongs.includes(n.pesma));
      console.log('Participant nastupe:', participantNastupe);
      setNastupe(participantNastupe);

      // Filter ocene for participant's performances
      const participantOcene = allOcene.filter(o => 
        participantNastupe.some(n => n.idn === o.nastup)
      );
      setOcene(participantOcene);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Greška pri učitavanju podataka: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPesmaInfo = (pesmaId) => {
    const pesma = pesme.find(p => p.idp === pesmaId);
    return pesma ? pesma.nazp : `Pesma ${pesmaId}`;
  };

  const getDrzavaInfo = (drzavaId) => {
    const drzava = drzave.find(d => d.iddr === drzavaId);
    return drzava ? drzava.nazdr : `Država ${drzavaId}`;
  };

  const getKrugInfo = (krugId) => {
    const krug = takmickarski_krugovi.find(k => k.idtk === krugId);
    return krug ? `Krug ${krug.rbrtk}` : `Krug ${krugId}`;
  };

  const getSudijaInfo = (sudijaId) => {
    const sudija = sudije.find(s => s.idk === sudijaId);
    if (!sudija) return `Sudija ${sudijaId}`;
    const korisnik = sudija.korisnik_info || sudija.idk;
    // korisnik_info comes from serializer; fallback to idk if not present
    if (korisnik && korisnik.imek) {
      return `${korisnik.imek} ${korisnik.przk}`;
    }
    return `Sudija ${sudijaId}`;
  };

  const getOceneForNastup = (nastupId) => {
    return ocene.filter(o => o.nastup === nastupId);
  };

  const getAwardForNastup = (nastup) => {
    if (!nastup.dodeljivanje_nagrade) return null;
    const dodeljivanje = dodeljivanja.find(d => d.iddg === nastup.dodeljivanje_nagrade);
    if (!dodeljivanje) return null;
    // Try to use nagrada_info if serializer provided it
    if (dodeljivanje.nagrada_info && dodeljivanje.nagrada_info.naznag) {
      return dodeljivanje.nagrada_info.naznag;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Učitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎭 Status nastupa</h1>
          {currentUcesnik && (
            <p className="text-gray-600">
                Pregled nastupa za {currentUcesnik.korisnik_info?.imek} {currentUcesnik.korisnik_info?.przk}
                <span className="text-blue-600 font-semibold"> ({currentUcesnik.tipu})</span>
              </p>
          )}
          <div className="mt-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              ← Nazad na Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Participant Info */}
        {currentUcesnik && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Informacije o učesniku</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip učešća</label>
                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                  {currentUcesnik.tipu}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ukupno poena</label>
                <div className="px-3 py-2 bg-blue-100 rounded-lg font-semibold">
                  {nastupe.reduce((sum, n) => sum + n.ukbod, 0)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Najbolji plasman</label>
                <div className="px-3 py-2 bg-green-100 rounded-lg font-semibold">
                  {nastupe.length > 0 ? `#${Math.min(...nastupe.map(n => n.plasman))}` : 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Osvojenih nagrada</label>
                <div className="px-3 py-2 bg-yellow-100 rounded-lg font-semibold">
                  {nastupe.filter(n => getAwardForNastup(n)).length}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performances */}
        {nastupe.length > 0 ? (
          <div className="space-y-6">
            {nastupe.map((nastup) => {
              const nastupOcene = getOceneForNastup(nastup.idn);
              const award = getAwardForNastup(nastup);
              
              return (
                <div key={nastup.idn} className="bg-white rounded-lg shadow-lg">
                  <div className="p-6">
                    {/* Performance Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                          #{nastup.rbrn}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-800">
                            {getPesmaInfo(nastup.pesma)}
                          </h3>
                          <p className="text-gray-600">
                            {getKrugInfo(nastup.takmickarski_krug)} - {getDrzavaInfo(nastup.drzava)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{nastup.ukbod} bodova</div>
                        <div className="text-sm text-gray-500">Redosled: #{nastup.rbrn} | Plasman: #{nastup.plasman}</div>
                        {award && (
                          <div className="text-sm text-yellow-600 font-semibold mt-1">
                            🏆 {award}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Scores */}
                    {nastupOcene.length > 0 ? (
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Ocene žirija</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {nastupOcene.map((ocena, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-700">
                                    {getSudijaInfo(ocena.sudija)}
                                  </div>
                                  <div className="text-xs text-gray-500">Sudija</div>
                                </div>
                                <div className="text-xl font-bold text-blue-600">
                                  {ocena.bod}/10
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Statistics */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {(nastupOcene.reduce((sum, o) => sum + o.bod, 0) / nastupOcene.length).toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-500">Prosečna ocena</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {Math.max(...nastupOcene.map(o => o.bod))}
                              </div>
                              <div className="text-sm text-gray-500">Najveća ocena</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-gray-900">
                                {Math.min(...nastupOcene.map(o => o.bod))}
                              </div>
                              <div className="text-sm text-gray-500">Najmanja ocena</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="text-yellow-600 mr-3">⏳</div>
                          <div>
                            <div className="font-semibold text-yellow-800">Čeka se ocenjivanje</div>
                            <div className="text-sm text-yellow-700">Žiri još uvek nije ocenio ovaj nastup</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema nastupa</h3>
            <p className="text-gray-500">Trenutno nemate nastupe u sistemu</p>
          </div>
        )}

        {/* Overall Statistics */}
        {nastupe.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Ukupna statistika</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {nastupe.reduce((sum, n) => sum + n.ukbod, 0)}
                </div>
                <div className="text-sm text-gray-500">Ukupno bodova</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(nastupe.reduce((sum, n) => sum + n.ukbod, 0) / nastupe.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Prosečan rezultat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.min(...nastupe.map(n => n.plasman))}
                </div>
                <div className="text-sm text-gray-500">Najbolji plasman</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {nastupe.filter(n => getAwardForNastup(n)).length}
                </div>
                <div className="text-sm text-gray-500">Broj nagrada</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UcesnikStatus;
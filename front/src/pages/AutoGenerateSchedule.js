import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AutoGenerateSchedule = () => {
  const [takmickarski_krugovi, setTakmickarskiKrugovi] = useState([]);
  const [selectedKrug, setSelectedKrug] = useState('');
  const [potentialNastupe, setPotentialNastupe] = useState([]);
  const [generatedSchedule, setGeneratedSchedule] = useState([]);
  const [pesme, setPesme] = useState([]);
  const [zanrovi, setZanrovi] = useState([]);
  const [izvodi, setIzvodi] = useState([]);
  const [ucesnici, setUcesnici] = useState([]);
  const [drzave, setDrzave] = useState([]);
  const [ucestvuju, setUcestvuju] = useState([]);
  const [reprezentuje, setReprezentuje] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);
  const [startTime, setStartTime] = useState('20:00');

  // Define generatePotentialPerformances BEFORE useEffect that uses it
  const generatePotentialPerformances = useCallback(() => {
    if (!selectedKrug) return;

    const selectedKrugData = takmickarski_krugovi.find(k => k.idtk === parseInt(selectedKrug));
    if (!selectedKrugData) return;

    console.log('Generating potential performances...');
    console.log('Selected krug:', selectedKrug);
    console.log('Izvodi count:', izvodi.length);
    console.log('Ucesnici count:', ucesnici.length);
    if (izvodi.length > 0) console.log('First izvodi_item:', izvodi[0]);
    if (ucesnici.length > 0) console.log('First ucesnik:', ucesnici[0]);

    // Get all participants performing songs
    const performances = izvodi.map(izvodi_item => {
      const ucesnik = ucesnici.find(u => u.idk === izvodi_item.ucesnik);
      const pesma = pesme.find(p => p.idp === izvodi_item.pesma);
      
      if (!ucesnik || !pesma) {
        console.log('Missing ucesnik or pesma for izvodi_item:', izvodi_item);
        return null;
      }

      // Find which country this participant represents
      const predstavlja = reprezentuje.find(r => r.ucesnik === ucesnik.idk);
      if (!predstavlja) return null;

      const ucestvuje = ucestvuju.find(u => u.ucestvuje_id === predstavlja.ucestvuje);
      if (!ucestvuje) return null;

      // Check if this participation is for the selected edition 
      // (we assume takmickarski_krug belongs to specific edition)
      const drzava = drzave.find(d => d.iddr === ucestvuje.drzava);
      if (!drzava) return null;

      const zanr = zanrovi.find(z => z.idzanr === pesma.zanr);

      return {
        ucesnik: ucesnik,
        pesma: pesma,
        drzava: drzava,
        zanr: zanr,
        izvodi_item: izvodi_item
      };
    }).filter(p => p !== null);

    setPotentialNastupe(performances);
  }, [selectedKrug, takmickarski_krugovi, izvodi, ucesnici, pesme, reprezentuje, ucestvuju, drzave, zanrovi]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedKrug) {
      generatePotentialPerformances();
    }
  }, [selectedKrug, izvodi, ucesnici, pesme, ucestvuju, reprezentuje, generatePotentialPerformances]);

  // Helper functions for participant display
  const getUcesnikName = (ucesnik) => {
    if (!ucesnik) return 'Nepoznat učesnik';
    
    // Check for solo participant
    if (ucesnik.solo_info) {
      return ucesnik.solo_info.umime;
    }
    
    // Check for duo participant
    if (ucesnik.duo_info) {
      return ucesnik.duo_info.nazduo;
    }
    
    // Check for group participant
    if (ucesnik.grupa_info) {
      return ucesnik.grupa_info.nazg;
    }
    
    // Fallback to korisnik info
    if (ucesnik.korisnik_info) {
      return `${ucesnik.korisnik_info.imek} ${ucesnik.korisnik_info.przk}`;
    }
    
    return 'Nepoznat učesnik';
  };

  const getUcesnikType = (ucesnik) => {
    if (!ucesnik) return 'Nepoznat tip';
    
    if (ucesnik.solo_info) return 'Solo';
    if (ucesnik.duo_info) return 'Duo';
    if (ucesnik.grupa_info) return 'Grupa';
    
    return 'Nepoznat tip';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        krugoviRes,
        pesmeRes,
        zanroviRes,
        izvodiRes,
        ucesniciRes,
        drzaveRes,
        ucestvujuRes,
        reprezentujuRes
      ] = await Promise.all([
        api.get('/takmickarski-krugovi/'),
        api.get('/pesme/'),
        api.get('/zanrovi/'),
        api.get('/izvedbe/'),
        api.get('/ucesnici/'),
        api.get('/drzave/'),
        api.get('/ucestva/'),
        api.get('/reprezentacije/')
      ]);
      
      setTakmickarskiKrugovi(krugoviRes.data.results || krugoviRes.data);
      setPesme(pesmeRes.data.results || pesmeRes.data);
      setZanrovi(zanroviRes.data.results || zanroviRes.data);
      setIzvodi(izvodiRes.data.results || izvodiRes.data);
      setUcesnici(ucesniciRes.data.results || ucesniciRes.data);
      setDrzave(drzaveRes.data.results || drzaveRes.data);
      setUcestvuju(ucestvujuRes.data.results || ucestvujuRes.data);
      setReprezentuje(reprezentujuRes.data.results || reprezentujuRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Greška pri učitavanju podataka: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateOptimalSchedule = () => {
    if (potentialNastupe.length === 0) {
      alert('Nema učesnika za generiranje rasporeda');
      return;
    }

    setGenerating(true);

    try {
      // Group performances by genre
      const genreGroups = {};
      potentialNastupe.forEach(performance => {
        const genreId = performance.zanr?.idzanr || 'unknown';
        if (!genreGroups[genreId]) {
          genreGroups[genreId] = [];
        }
        genreGroups[genreId].push(performance);
      });

      // Shuffle performances within each genre group
      Object.keys(genreGroups).forEach(genreId => {
        genreGroups[genreId] = shuffleArray(genreGroups[genreId]);
      });

      const genreKeys = Object.keys(genreGroups);
      const schedule = [];
      let currentTime = new Date(`2025-01-01 ${startTime}:00`);
      
      // Distribute performances to avoid consecutive same genres
      let genreIndex = 0;
      let performanceNumber = 1;

      while (schedule.length < potentialNastupe.length) {
        const currentGenre = genreKeys[genreIndex % genreKeys.length];
        
        if (genreGroups[currentGenre] && genreGroups[currentGenre].length > 0) {
          const performance = genreGroups[currentGenre].shift();
          
          const startTimeFormatted = currentTime.toTimeString().slice(0, 5);
          const duration = performance.pesma.trajanje || 180; // Default 3 minutes
          const endTime = new Date(currentTime.getTime() + duration * 1000);
          const endTimeFormatted = endTime.toTimeString().slice(0, 5);

          schedule.push({
            rbrn: performanceNumber,
            performance: performance,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            duration: duration,
            estimatedScore: 0, // Set to 0 - judges will assign actual scores later
            plasman: 0 // Will be calculated after sorting by score
          });

          // Add 5 minutes break between performances
          currentTime = new Date(endTime.getTime() + 5 * 60 * 1000);
          performanceNumber++;
        }
        
        genreIndex++;
        
        // Safety check to avoid infinite loop
        if (genreIndex > genreKeys.length * potentialNastupe.length) {
          break;
        }
      }

      // Calculate placements based on estimated scores
      schedule.sort((a, b) => b.estimatedScore - a.estimatedScore);
      schedule.forEach((item, index) => {
        item.plasman = index + 1;
      });

      // Re-sort by performance order
      schedule.sort((a, b) => a.rbrn - b.rbrn);

      setGeneratedSchedule(schedule);
      setScheduleGenerated(true);

    } catch (error) {
      console.error('Error generating schedule:', error);
      setError('Greška pri generisanju rasporeta: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveScheduleToDatabase = async () => {
    try {
      setLoading(true);

      // Save each performance as Nastup
      for (const scheduleItem of generatedSchedule) {
        const nastupData = {
          ukbod: scheduleItem.estimatedScore,
          rbrn: scheduleItem.rbrn,
          plasman: scheduleItem.plasman,
          drzava: scheduleItem.performance.drzava.iddr,
          pesma: scheduleItem.performance.pesma.idp,
          takmickarski_krug: parseInt(selectedKrug)
        };

        await api.post('/nastupi/', nastupData);
      }

      alert('Raspored je uspešno sačuvan u bazu podataka!');
      setGeneratedSchedule([]);
      setScheduleGenerated(false);

    } catch (error) {
      console.error('Error saving schedule:', error);
      setError('Greška pri čuvanju rasporeta: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  // getGenreDistribution function removed - not used

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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 Automatsko formiranje rasporeta</h1>
          <p className="text-gray-600">Generiši optimalan redosled nastupa sa obzirom na žanrove i trajanje</p>
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

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Konfiguracija rasporeta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Takmičarski krug
              </label>
              <select
                value={selectedKrug}
                onChange={(e) => setSelectedKrug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Izaberite krug</option>
                {takmickarski_krugovi.map((krug) => (
                  <option key={krug.idtk} value={krug.idtk}>
                    Krug {krug.rbrtk} - {new Date(krug.datodrz).toLocaleDateString('sr-RS')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vreme početka
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broj učesnika
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg">
                {potentialNastupe.length} učesnika
              </div>
            </div>
          </div>

          {selectedKrug && potentialNastupe.length > 0 && (
            <div className="mt-4">
              <button
                onClick={generateOptimalSchedule}
                disabled={generating}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                {generating ? 'Generiše se...' : '🎯 Generiši optimalni raspored'}
              </button>
            </div>
          )}
        </div>

        {/* Generated Schedule */}
        {scheduleGenerated && (
          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Generisani raspored nastupa</h2>
                <button
                  onClick={saveScheduleToDatabase}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  💾 Sačuvaj u bazu
                </button>
              </div>

              {/* Genre Distribution - REMOVED */}

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Redni broj
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vreme
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Učesnik
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pesma
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Žanr
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trajanje
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Država
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {generatedSchedule.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {item.rbrn}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.startTime}</div>
                          <div className="text-xs text-gray-500">do {item.endTime}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getUcesnikName(item.performance.ucesnik)}
                          </div>
                          <div className="text-xs text-gray-500">{getUcesnikType(item.performance.ucesnik)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.performance.pesma.nazp}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.performance.pesma.zanr_naziv || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.performance.drzava.nazdr}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary - REMOVED */}
            </div>
          </div>
        )}

        {/* Potential Participants Preview */}
        {selectedKrug && potentialNastupe.length > 0 && !scheduleGenerated && (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Učesnici za raspored</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {potentialNastupe.map((performance, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-900">
                      {getUcesnikName(performance.ucesnik)}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{performance.ucesnik.tipu}</div>
                    <div className="text-sm text-blue-600">{performance.pesma.nazp}</div>
                    <div className="text-xs text-gray-500">
                      {performance.pesma.zanr_naziv || 'Nepoznat žanr'} • {Math.floor((performance.pesma.trajanje || 180) / 60)}:{((performance.pesma.trajanje || 180) % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-green-600 mt-1">{performance.drzava.nazdr}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedKrug && potentialNastupe.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nema učesnika</h3>
            <p className="text-gray-500">Nema učesnika koji izvode pesme za izabrani takmičarski krug</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoGenerateSchedule;
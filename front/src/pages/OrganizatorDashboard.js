import React from 'react';
import { Link } from 'react-router-dom';

const OrganizatorDashboard = ({ user }) => {
  const managementSections = [
    {
      title: 'Takmičenja',
      description: 'Upravljaj osnovnim informacijama o takmičenjima',
      icon: '🏆',
      path: '/organizator/takmicenja',
      color: 'bg-blue-500'
    },
    {
      title: 'Izdanja',
      description: 'Upravljaj izdanjima takmičenja',
      icon: '📅',
      path: '/organizator/izdanja',
      color: 'bg-green-500'
    },
    {
      title: 'Takmičarski krugovi',
      description: 'Podesi krugove i faze takmičenja',
      icon: '🔄',
      path: '/organizator/krugovi',
      color: 'bg-purple-500'
    },
    {
      title: 'Dvorane',
      description: 'Upravljaj mestima održavanja',
      icon: '🏛️',
      path: '/organizator/dvorane',
      color: 'bg-orange-500'
    },
    {
      title: 'Države',
      description: 'Upravljaj državama učesnicama',
      icon: '🌍',
      path: '/organizator/drzave',
      color: 'bg-indigo-500'
    },
    {
      title: 'Učesnici',
      description: 'Upravljaj učesnicima takmičenja',
      icon: '🎤',
      path: '/organizator/ucesnici',
      color: 'bg-pink-500'
    },
    {
      title: 'Pesme',
      description: 'Upravljaj pesmama koje se izvode',
      icon: '🎵',
      path: '/organizator/pesme',
      color: 'bg-yellow-500'
    },
    {
      title: 'Sudije',
      description: 'Upravljaj sudijama takmičenja',
      icon: '👨‍⚖️',
      path: '/organizator/sudije',
      color: 'bg-red-500'
    },
    {
      title: 'Žiriji',
      description: 'Formiranje žirija i odabir predsednika',
      icon: '👥',
      path: '/organizator/ziriji',
      color: 'bg-teal-500'
    },
    {
      title: 'Nagrade',
      description: 'Upravljaj nagradama takmičenja',
      icon: '🏅',
      path: '/organizator/nagrade',
      color: 'bg-amber-500'
    },
    {
      title: 'Dodeljivanje nagrada',
      description: 'Dodeli nagrade pobednicima',
      icon: '🏆',
      path: '/organizator/dodeljivanje-nagrada',
      color: 'bg-yellow-500'
    },
    {
      title: 'Auto raspored nastupa',
      description: 'Automatski generiši optimalni redosled nastupa',
      icon: '🎯',
      path: '/auto-generate-schedule',
      color: 'bg-emerald-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🎪 Dobrodošli, Organizatore!</h2>
        <p className="text-lg opacity-90">
          {user.imek} {user.przk}
        </p>
        <p className="text-sm opacity-75 mt-2">
          Upravljajte svim aspektima muzičkog takmičenja
        </p>
      </div>

      {/* Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementSections.map((section, index) => (
          <Link
            key={index}
            to={section.path}
            className="group bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-gray-400"
          >
            <div className="flex items-start space-x-4">
              <div className={`${section.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-300`}>
                {section.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {section.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats - REMOVED */}
    </div>
  );
};

export default OrganizatorDashboard;
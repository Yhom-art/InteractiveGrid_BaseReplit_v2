import React from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery } from '@tanstack/react-query';

export function DashboardPage() {
  // Récupérer des statistiques de base
  const chimerasQuery = useQuery({
    queryKey: ['/api/chimeras'],
    staleTime: 60000, // 1 minute
  });
  
  const editorialsQuery = useQuery({
    queryKey: ['/api/editorials'],
    staleTime: 60000, // 1 minute
  });
  
  const gridConfigQuery = useQuery({
    queryKey: ['/api/grid-config'],
    staleTime: 60000, // 1 minute
  });
  
  // Statistiques pour le tableau de bord
  const stats = [
    {
      name: 'Fiches Chimères',
      value: chimerasQuery.data?.length || 0,
      status: chimerasQuery.isLoading ? 'Chargement...' : 'Disponible'
    },
    {
      name: 'Éléments Éditoriaux',
      value: editorialsQuery.data?.length || 0,
      status: editorialsQuery.isLoading ? 'Chargement...' : 'Disponible'
    },
    {
      name: 'Positions dans la Grille',
      value: gridConfigQuery.data?.length || 0,
      status: gridConfigQuery.isLoading ? 'Chargement...' : 'Disponible'
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-mono text-3xl font-bold leading-tight">TABLEAU DE BORD</h1>
        <p className="text-gray-600 font-mono text-sm leading-tight">Gestion des fiches fantômes et de la grille chimérique</p>
      </div>

      {/* Afficher les statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div 
            key={stat.name}
            className="bg-white shadow p-6"
            style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
          >
            <h3 className="text-gray-500 font-mono text-sm leading-tight">{stat.name}</h3>
            <div className="mt-2 flex items-baseline">
              <span className="font-mono text-3xl font-semibold text-gray-900 leading-tight">{stat.value}</span>
            </div>
            <div className="mt-1">
              <span className={`font-mono text-xs leading-tight ${
                stat.status === 'Disponible' ? 'text-green-600' : 'text-amber-500'
              }`}>
                {stat.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bienvenue */}
      <div className="bg-white shadow p-6">
        <h2 className="font-mono text-xl font-semibold mb-4 leading-tight">BIENVENUE DANS L'ADMINISTRATION DES FICHES FANTÔMES</h2>
        <p className="mb-4 font-mono text-sm leading-tight">
          Ce backoffice vous permet de gérer le contenu des fiches NFT (chimères) et des éléments éditoriaux qui
          apparaissent dans la Grille Chimérique.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 font-mono text-sm leading-tight">
          <li>Gérez les informations complètes des chimères (nom, description, attributs, etc.)</li>
          <li>Configurez les éléments éditoriaux spéciaux qui servent de navigation</li>
          <li>Contrôlez le placement et la visibilité des éléments dans la grille</li>
        </ul>
      </div>
    </AdminLayout>
  );
}
import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Chimera } from '@shared/schema';
import { Link } from 'wouter';

// Page d'administration des chimères (fiches NFT)
export function ChimerasPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // Récupérer la liste des chimères
  const { data: chimeras, isLoading, error } = useQuery({
    queryKey: ['/api/chimeras'],
    staleTime: 10000, // 10 secondes
  });

  // Mutation pour supprimer une chimère
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/chimeras/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chimeras'] });
      setConfirmDelete(null);
    },
  });

  // Filtrer les chimères selon le terme de recherche
  const filteredChimeras = chimeras?.filter((chimera: Chimera) => 
    chimera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chimera.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Galerie de Chimères</h1>
          <p className="text-gray-600">Gérez les NFTs et Doublures Lumières</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/chimeras/new?type=NFT">
            <a className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle Chimère NFT
            </a>
          </Link>
          <Link href="/admin/chimeras/new?type=DOUBLURE">
            <a className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouvelle Doublure Lumière
            </a>
          </Link>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Rechercher par nom ou référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            {/* Icône de recherche */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
      </div>

      {/* Contenu principal avec défilement */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ maxHeight: 'calc(100vh - 270px)', overflowY: 'auto' }}>
        {isLoading ? (
          <div className="p-6 text-center">
            <p>Chargement des fiches chimères...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <p>Erreur lors du chargement des fiches. Veuillez réessayer.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rareté</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredChimeras?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucune chimère trouvée.
                  </td>
                </tr>
              ) : (
                filteredChimeras?.map((chimera: Chimera) => (
                  <tr key={chimera.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chimera.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded overflow-hidden bg-gray-100">
                        <img
                          src={chimera.imageUrl}
                          alt={chimera.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            console.error(`Erreur de chargement d'image pour ${chimera.name}:`, chimera.imageUrl);
                            // Utiliser une couleur de fond avec les initiales au lieu d'une image
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.style.display = 'flex';
                              parent.style.alignItems = 'center';
                              parent.style.justifyContent = 'center';
                              parent.style.backgroundColor = '#f3f4f6';
                              const initials = document.createElement('span');
                              initials.textContent = chimera.name.substring(0, 2).toUpperCase();
                              initials.style.fontWeight = 'bold';
                              initials.style.color = '#6366f1';
                              parent.appendChild(initials);
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{chimera.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{chimera.reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${chimera.type === 'FREE' ? 'bg-green-100 text-green-800' : 
                          chimera.type === 'ADOPT' ? 'bg-yellow-100 text-yellow-800' :
                          chimera.type === 'ADOPTED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'}`}>
                        {chimera.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {chimera.rarity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/chimeras/${chimera.id}`}>
                        <a className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs">Éditer</a>
                      </Link>
                      
                      {confirmDelete === chimera.id ? (
                        <span className="ml-2">
                          <button
                            className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded text-xs mr-1"
                            onClick={() => deleteMutation.mutate(chimera.id)}
                          >
                            Confirmer
                          </button>
                          <button
                            className="bg-gray-500 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Annuler
                          </button>
                        </span>
                      ) : (
                        <button
                          className="ml-2 bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded text-xs"
                          onClick={() => setConfirmDelete(chimera.id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
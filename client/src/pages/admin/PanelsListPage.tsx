import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams, useLocation } from 'wouter';

/**
 * Page d'administration pour gérer les panels associés à une chimère ou un élément éditorial
 */
export function PanelsListPage() {
  const { itemType, itemId } = useParams<{ itemType: string; itemId: string }>();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  // Charger les données de l'élément parent (chimère ou éditorial)
  const itemQuery = useQuery({
    queryKey: [`/api/${itemType}s/${itemId}`],
  });
  
  // Charger la liste des panels associés à cet élément
  const panelsQuery = useQuery({
    queryKey: [`/api/panels?${itemType}Id=${itemId}`],
  });
  
  // Mutation pour supprimer un panel
  const deleteMutation = useMutation({
    mutationFn: async (panelId: number) => {
      const response = await fetch(`/api/panels/${panelId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du panel');
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalider les requêtes pour actualiser les données
      queryClient.invalidateQueries({ queryKey: [`/api/panels?${itemType}Id=${itemId}`] });
      setConfirmDelete(null);
    }
  });
  
  // Détermine le titre de la page
  let pageTitle = 'Panels';
  if (itemQuery.data && itemQuery.data.name) {
    pageTitle = `Panels pour ${itemQuery.data.name}`;
  } else if (itemType === 'chimera') {
    pageTitle = 'Panels pour la Chimère';
  } else if (itemType === 'editorial') {
    pageTitle = 'Panels pour l\'Élément Éditorial';
  }
  
  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <p className="text-gray-600">
            Gérez les panels modulaires avec différents composants interactifs
          </p>
        </div>
        <a 
          href={`/admin/${itemType}/${itemId}/panels/new`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer"
        >
          Créer un nouveau panel
        </a>
      </div>
      
      {/* Affichage des panels */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {panelsQuery.isLoading ? (
          <div className="p-6 text-center">
            <p>Chargement des panels...</p>
          </div>
        ) : panelsQuery.error ? (
          <div className="p-6 text-center text-red-500">
            <p>Erreur lors du chargement des panels. Veuillez réessayer.</p>
          </div>
        ) : panelsQuery.data?.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">Aucun panel n'a été créé pour cet élément.</p>
            <p>
              <a 
                href={`/admin/${itemType}/${itemId}/panels/new`}
                className="text-blue-600 hover:underline"
              >
                Créer votre premier panel
              </a>
            </p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Composants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thème</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {panelsQuery.data?.map((panel: any) => (
                <tr key={panel.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {panel.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{panel.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {panel.components?.length || 0} composants
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {panel.theme === 'light' ? 'Clair' : 
                     panel.theme === 'dark' ? 'Sombre' : 'Personnalisé'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${panel.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {panel.isPublished ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <a 
                      href={`/admin/${itemType}/${itemId}/panels/${panel.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Éditer
                    </a>
                    
                    {confirmDelete === panel.id ? (
                      <>
                        <button
                          className="text-red-600 hover:text-red-900 mr-2"
                          onClick={() => deleteMutation.mutate(panel.id)}
                        >
                          Confirmer
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          onClick={() => setConfirmDelete(null)}
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => setConfirmDelete(panel.id)}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Informations sur le constructeur de panel */}
      <div className="bg-blue-50 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-semibold text-blue-900 mb-3">Enrichir vos fiches avec des composants interactifs</h2>
        <p className="text-blue-800 mb-4">
          Les panels vous permettent d'enrichir vos fiches NFT avec différents types de composants interactifs:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-blue-900 mb-2">Composants spécialisés</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Cartes interactives</li>
              <li>• Lecteurs de podcast</li>
              <li>• Intégration de wallets</li>
              <li>• Galeries d'images</li>
              <li>• Vidéos et audios</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-blue-900 mb-2">Mise en page flexible</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Réorganisation par glisser-déposer</li>
              <li>• Thèmes personnalisables</li>
              <li>• Visibilité conditionnelle</li>
              <li>• Adaptation aux différents appareils</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-medium text-blue-900 mb-2">Fonctionnalités avancées</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Connexion aux données blockchain</li>
              <li>• Formulaires interactifs</li>
              <li>• Intégration des réseaux sociaux</li>
              <li>• Liens externes et partage</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
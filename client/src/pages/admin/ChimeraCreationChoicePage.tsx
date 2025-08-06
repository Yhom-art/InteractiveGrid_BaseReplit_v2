import React from 'react';
import { AdminLayout } from './AdminLayout';
import { useLocation } from 'wouter';

export function ChimeraCreationChoicePage() {
  const [, setLocation] = useLocation();

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Créer une nouvelle chimère</h1>
          <p className="text-gray-600 mt-2">
            Choisissez une méthode pour ajouter une nouvelle chimère à la grille
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Option 1: Création manuelle */}
          <div 
            onClick={() => setLocation('/admin/chimeras/new/manual')}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold mb-2">Création manuelle</h2>
            <p className="text-gray-600 mb-4">
              Renseignez tous les détails de la chimère manuellement, y compris le nom, la référence, l'image, etc.
            </p>
            <p className="text-sm text-blue-600">
              Parfait pour créer des chimères de test ou pour préparer des contenus avant la mise en ligne des NFT.
            </p>
          </div>

          {/* Option 2: Création depuis une NFT */}
          <div 
            onClick={() => setLocation('/admin/chimeras/new/nft')}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>

            <h2 className="text-xl font-bold mb-2">Importer depuis une NFT</h2>
            <p className="text-gray-600 mb-4">
              Connectez la chimère à une NFT existante en fournissant son adresse. Les métadonnées et l'image seront automatiquement récupérées.
            </p>
            <p className="text-sm text-purple-600">
              Idéal pour intégrer des NFT réelles dans la grille avec leurs métadonnées authentiques.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setLocation('/admin/chimeras')}
            className="text-gray-600 hover:text-gray-800"
          >
            Retourner à la galerie
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ChimeraCreationChoicePage;
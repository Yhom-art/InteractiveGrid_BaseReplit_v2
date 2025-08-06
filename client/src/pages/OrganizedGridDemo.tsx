import React from 'react';
import { OrganizedGrid } from '../components/grid/OrganizedGrid';

/**
 * Page de démonstration de la grille chimérique organisée
 * Affiche des colonnes avec différents types de containers bien visibles
 * pour faciliter la compréhension des effets d'expansion
 */
export default function OrganizedGridDemo() {
  return (
    <div className="w-full h-screen relative bg-gray-50">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-white shadow-sm">
        <div className="font-bold">Grille Chimérique Organisée</div>
        <div className="flex space-x-4">
          <div className="text-sm text-gray-600">
            Types de containers organisés par colonnes :
          </div>
          <div className="flex space-x-2 text-xs">
            <div className="px-2 py-1 bg-green-100 rounded text-green-800">Colonne 1: FREE - Étend vers le haut</div>
            <div className="px-2 py-1 bg-orange-100 rounded text-orange-800">Colonne 2: ADOPT - Demi-extension vers le bas</div>
            <div className="px-2 py-1 bg-pink-100 rounded text-pink-800">Colonne 3: ADOPTED - Étend vers le bas</div>
            <div className="px-2 py-1 bg-gray-100 rounded text-gray-800">Colonne 4: EDITORIAL - Fixe</div>
            <div className="px-2 py-1 bg-blue-100 rounded text-blue-800">Colonne 5: MIXTE - Types alternés</div>
          </div>
        </div>
      </div>
      
      {/* Grille chimérique organisée */}
      <OrganizedGrid debugMode={true} />
    </div>
  );
}
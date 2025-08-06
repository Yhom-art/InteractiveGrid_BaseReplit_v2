import React from 'react';
import { ChimericGridV2 } from '../components/grid/ChimericGridV2';

/**
 * Page de démonstration de la grille chimérique
 * Utilise la nouvelle architecture avec des composants spécifiques
 * pour chaque type de container
 */
export default function GridDemo() {
  return (
    <div className="w-full h-screen relative bg-gray-50">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-white shadow-sm">
        <div className="font-bold">Grille Chimérique V2</div>
        <div className="flex space-x-4">
          <div className="text-sm text-gray-600">
            Types de containers :
          </div>
          <div className="flex space-x-2 text-xs">
            <div className="px-2 py-1 bg-green-100 rounded text-green-800">FREE - Étend vers le haut</div>
            <div className="px-2 py-1 bg-pink-100 rounded text-pink-800">ADOPTED - Étend vers le bas</div>
            <div className="px-2 py-1 bg-orange-100 rounded text-orange-800">ADOPT - Demi-extension vers le bas</div>
            <div className="px-2 py-1 bg-gray-100 rounded text-gray-800">EDITORIAL - Fixe</div>
          </div>
        </div>
      </div>
      
      {/* Grille chimérique avec containers spécifiques */}
      <ChimericGridV2 debugMode={true} />
    </div>
  );
}
import React from 'react';
import { SpiralGrid } from '../components/grid/SpiralGrid';

/**
 * Page de démonstration de la grille chimérique en spirale
 * Cette implémentation positionne les containers en spirale depuis le centre
 * et permet d'ajouter de nouveaux containers dynamiquement
 */
export default function SpiralGridDemo() {
  return (
    <div className="w-full h-screen relative bg-gray-50">
      {/* Navigation */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 bg-white shadow-sm">
        <div className="font-bold">Grille Chimérique en Spirale</div>
        <div className="flex space-x-4">
          <div className="text-sm text-gray-600">
            Fonctionnalités :
          </div>
          <div className="flex space-x-2 text-xs">
            <div className="px-2 py-1 bg-blue-100 rounded text-blue-800">Positionnement en spirale</div>
            <div className="px-2 py-1 bg-green-100 rounded text-green-800">Ajout dynamique</div>
            <div className="px-2 py-1 bg-purple-100 rounded text-purple-800">Panels sur toute la hauteur</div>
            <div className="px-2 py-1 bg-yellow-100 rounded text-yellow-800">Centrage automatique</div>
            <div className="px-2 py-1 bg-red-100 rounded text-red-800">
              Mode Debug (<span className="font-mono">D</span>)
            </div>
          </div>
        </div>
      </div>
      
      {/* Grille chimérique en spirale */}
      <SpiralGrid debugMode={true} />
    </div>
  );
}
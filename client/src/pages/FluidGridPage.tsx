import React from 'react';
import { FluidGrid } from '@/components/FluidGrid/Grid';

/**
 * Page de démonstration pour la nouvelle grille fluide
 * Implémentation propre et modulaire basée sur notre POC
 */
export default function FluidGridPage() {
  return (
    <div className="fluid-grid-page">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Grille Chimérique Fluide</h1>
        
        <div className="bg-blue-50 p-4 mb-6 rounded-md border border-blue-200">
          <h2 className="font-bold mb-2">Fonctionnalités</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Containers avec 4 types d'expansion (none, oneone_up, oneone_dwn, onehalf_dwn)</li>
            <li>Expansion des containers avec décalage automatique des voisins</li>
            <li>Panels qui s'étendent sur toute la hauteur avec contenu aligné</li>
            <li>Un seul panel par colonne pour éviter les chevauchements</li>
            <li>Interface intuitive avec zones de clic sophistiquées</li>
            <li>Mode debug activé pour visualiser les zones de clic</li>
          </ul>
        </div>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
          <h3 className="font-bold mb-1">Comment interagir avec la grille</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li><strong>Container fermé</strong>: Cliquez n'importe où pour l'agrandir</li>
            <li><strong>Container ouvert</strong>: 
              <ul className="list-disc pl-5 mt-1">
                <li>Cliquez en haut à droite (X) pour le refermer</li>
                <li>Cliquez sur la partie droite pour ouvrir le panel</li>
                <li>La partie principale du container est réservée pour le déplacement (futur)</li>
              </ul>
            </li>
          </ul>
        </div>
        
        {/* Grille fluide avec mode debug activé */}
        <FluidGrid debug={true} />
      </div>
    </div>
  );
}
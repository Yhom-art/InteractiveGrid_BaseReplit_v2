import React from 'react';
import GrilleChimeriqueV2Page from './GrilleChimeriqueV2Page';

export function GridMapV2Page() {
  React.useEffect(() => {
    // Appliquer la classe pour grille interactive
    const root = document.getElementById('root');
    if (root) {
      console.log('🎯 APP: Ajout classe with-interactive-grid');
      root.classList.add('with-interactive-grid');
    }
    return () => {
      if (root) {
        console.log('🎯 APP: Suppression classe with-interactive-grid');
        root.classList.remove('with-interactive-grid');
      }
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Grille principale - cœur de l'application */}
      <GrilleChimeriqueV2Page />
    </div>
  );
}
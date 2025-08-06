import React from 'react';
import { GrilleChimerique } from '../components/GrilleChimerique/GrilleChimerique';

/**
 * Page principale de la Grille Chimérique
 * Cette implémentation est basée sur notre POC functional, 
 * avec une architecture plus propre et modulaire
 */
export default function GrilleChimeriquePage() {
  return (
    <div className="grille-chimerique-page">
      <GrilleChimerique debug={false} />
    </div>
  );
}
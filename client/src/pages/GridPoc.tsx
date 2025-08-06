import React from 'react';
import { GridMaster } from '@/components/poc/GridMaster';

export default function GridPoc() {
  return (
    <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute top-0 left-0 p-4 z-50">
        <h1 className="text-xl font-bold text-white">POC: Système de Rails</h1>
        <p className="text-sm text-gray-300 mt-1">
          Prototype du nouveau système de grille avec rails verticaux pour les panels
        </p>
      </div>
      
      <GridMaster />
    </div>
  );
}
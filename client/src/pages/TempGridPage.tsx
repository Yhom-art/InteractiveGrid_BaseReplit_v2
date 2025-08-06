import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export function TempGridPage() {
  // Grille 16x16 basique pour test
  const renderGrid = () => {
    const cells = [];
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        cells.push(
          <div
            key={`${row}-${col}`}
            className="w-32 h-32 border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500"
          >
            {row},{col}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/admin" className="p-2 hover:bg-gray-200 rounded-lg mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Page Temporaire - Grille Test 16x16</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Grille 16x16 générée</h2>
          <div 
            className="grid gap-1 overflow-auto"
            style={{ 
              gridTemplateColumns: 'repeat(16, 128px)',
              maxHeight: '80vh'
            }}
          >
            {renderGrid()}
          </div>
        </div>
      </div>
    </div>
  );
}
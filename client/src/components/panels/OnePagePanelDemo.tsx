import React, { useState } from 'react';
import { OnePagePanel } from './OnePagePanel';
import { chimeresData, demoConfig } from '@/data/chimeresData';
import { Link } from 'wouter';

export function OnePagePanelDemo() {
  const [activePanel, setActivePanel] = useState(true);
  const [selectedChimereId, setSelectedChimereId] = useState(demoConfig.chimereId);
  
  // Trouver la chimère à afficher
  const chimereData = chimeresData.find(c => c.id === selectedChimereId) || chimeresData[0];
  
  // Configuration du panel
  const panelConfig = {
    ...demoConfig,
    chimereId: selectedChimereId
  };
  
  const handleClose = () => {
    setActivePanel(false);
    // Réafficher après 1 seconde pour la démo
    setTimeout(() => {
      setActivePanel(true);
    }, 1000);
  };
  
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Header avec contrôles */}
      <div className="bg-gray-800 p-4 text-white">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold">Démonstration du Panel One Page</h1>
          <Link to="/panel-demo">
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm">
              Voir version avec onglets
            </button>
          </Link>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setActivePanel(!activePanel)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {activePanel ? 'Masquer Panel' : 'Afficher Panel'}
          </button>
          
          <select 
            value={selectedChimereId}
            onChange={(e) => setSelectedChimereId(parseInt(e.target.value))}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            {chimeresData.map(chimere => (
              <option key={chimere.id} value={chimere.id}>
                {chimere.name} ({chimere.type})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Zone de la grille simulée */}
      <div className="flex-1 relative">
        {/* Grille simulée */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 gap-1 opacity-10">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="bg-gray-600 rounded"></div>
          ))}
        </div>
        
        {/* Position indicative */}
        <div 
          className="absolute bg-blue-500/30 border border-blue-500 flex items-center justify-center text-blue-200 font-mono text-sm"
          style={{ 
            left: `${demoConfig.position.left - 20}px`, 
            top: '50%', 
            width: '10px', 
            height: '100%',
            transform: 'translateY(-50%)'
          }}
        >
          <span className="transform -rotate-90">Position du panel</span>
        </div>
        
        {/* Panel */}
        {activePanel && (
          <OnePagePanel
            config={panelConfig}
            chimereData={chimereData}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Panel } from './Panel';
import { chimeresData, demoConfig } from '@/data/chimeresData';
import { PanelTab } from '@/types/chimereTypes';

export function PanelDemo() {
  const [activePanel, setActivePanel] = useState(true);
  const [activeTab, setActiveTab] = useState<PanelTab>(demoConfig.activeTab);
  
  // Trouver la chimère à afficher
  const chimereData = chimeresData.find(c => c.id === demoConfig.chimereId) || chimeresData[0];
  
  // Configuration du panel avec l'onglet actif
  const panelConfig = {
    ...demoConfig,
    activeTab
  };
  
  const handleClose = () => {
    setActivePanel(false);
    // Réafficher après 1 seconde pour la démo
    setTimeout(() => {
      setActivePanel(true);
    }, 1000);
  };
  
  const handleChangeTab = (tab: PanelTab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden flex flex-col">
      {/* Header avec contrôles */}
      <div className="bg-gray-800 p-4 text-white">
        <h1 className="text-xl font-bold mb-2">Démonstration du Panel Chimérique</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => setActivePanel(!activePanel)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            {activePanel ? 'Masquer Panel' : 'Afficher Panel'}
          </button>
          
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as PanelTab)}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            <option value={PanelTab.INFO}>Info</option>
            <option value={PanelTab.NFT}>NFT</option>
            <option value={PanelTab.AUDIO}>Audio</option>
            <option value={PanelTab.MAP}>Map</option>
            <option value={PanelTab.STATS}>Stats</option>
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
          <Panel
            config={panelConfig}
            chimereData={chimereData}
            onClose={handleClose}
            onChangeTab={handleChangeTab}
          />
        )}
      </div>
    </div>
  );
}
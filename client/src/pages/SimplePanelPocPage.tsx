import React, { useState } from 'react';

// Démo simple directement intégrée dans la page
export default function SimplePanelPocPage() {
  // État des panels ouverts
  const [openPanels, setOpenPanels] = useState<number[]>([]);
  
  // Données de démo
  const panels = [
    { id: 1, title: "Panel Rouge", color: "#ffcccc" },
    { id: 2, title: "Panel Vert", color: "#ccffcc" },
    { id: 3, title: "Panel Bleu", color: "#ccccff" },
    { id: 4, title: "Panel Jaune", color: "#ffffcc" }
  ];
  
  // Fonction pour basculer un panel
  const togglePanel = (id: number) => {
    if (openPanels.includes(id)) {
      // Fermer le panel
      setOpenPanels(openPanels.filter(panelId => panelId !== id));
    } else {
      // Ouvrir le panel
      setOpenPanels([...openPanels, id]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Démonstration: Panels Multiples</h1>
      <p className="mb-6">Cette page montre comment ouvrir plusieurs panels simultanément.</p>
      
      <div className="bg-blue-50 p-4 mb-8 border border-blue-300 rounded-md">
        <strong>Mode d'emploi:</strong> Cliquez sur les boutons pour ouvrir plusieurs panels en même temps.
        Les panels s'afficheront côte à côte sans se chevaucher.
      </div>
      
      {/* Boutons pour ouvrir les panels */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {panels.map(panel => (
          <button
            key={panel.id}
            onClick={() => togglePanel(panel.id)}
            className={`px-4 py-2 rounded-md ${
              openPanels.includes(panel.id) 
                ? "bg-gray-800 text-white" 
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {openPanels.includes(panel.id) ? `Fermer ${panel.title}` : `Ouvrir ${panel.title}`}
          </button>
        ))}
      </div>
      
      {/* Panneaux ouverts */}
      <div className="flex gap-6 flex-wrap">
        {openPanels.map(panelId => {
          const panel = panels.find(p => p.id === panelId);
          if (!panel) return null;
          
          return (
            <div 
              key={panel.id}
              className="rounded-lg shadow-lg p-6 w-64 relative"
              style={{ backgroundColor: panel.color }}
            >
              <h2 className="text-xl font-bold mb-2">{panel.title}</h2>
              <p className="mb-4">Contenu du panel #{panel.id}</p>
              <p>Ce panel est ouvert.</p>
              
              <button
                onClick={() => togglePanel(panel.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Débogage */}
      <div className="mt-12 p-4 bg-gray-100 rounded-md">
        <h3 className="font-bold mb-2">État actuel:</h3>
        <p>Panels ouverts: {openPanels.length}</p>
        <p>IDs des panels: {openPanels.join(', ') || 'Aucun'}</p>
      </div>
    </div>
  );
}
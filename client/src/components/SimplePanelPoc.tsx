import React, { useState } from 'react';

// Un POC ultra-simplifié pour démontrer l'ouverture simultanée de plusieurs panels

export function SimplePanelPoc() {
  // État pour stocker les IDs des panels ouverts
  const [openPanels, setOpenPanels] = useState<number[]>([]);
  
  // Fonction pour ouvrir/fermer un panel
  const togglePanel = (id: number) => {
    // Vérifier si le panel est déjà ouvert
    if (openPanels.includes(id)) {
      // Fermer ce panel
      setOpenPanels(openPanels.filter(panelId => panelId !== id));
    } else {
      // Ouvrir ce panel (ajout à la liste des panels ouverts)
      setOpenPanels([...openPanels, id]);
    }
  };
  
  // Données simplifiées pour les boutons et les panels
  const items = [
    { id: 1, name: 'Panel Rouge', color: '#ffcccc' },
    { id: 2, name: 'Panel Vert', color: '#ccffcc' },
    { id: 3, name: 'Panel Bleu', color: '#ccccff' },
    { id: 4, name: 'Panel Jaune', color: '#ffffcc' },
  ];
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>POC Simple - Panels Multiples</h1>
      <p>Cliquez sur les boutons pour ouvrir ou fermer les panels correspondants</p>
      
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        margin: '20px 0',
        flexWrap: 'wrap'
      }}>
        {items.map(item => (
          <button 
            key={item.id}
            onClick={() => togglePanel(item.id)}
            style={{
              padding: '10px 15px',
              backgroundColor: openPanels.includes(item.id) ? '#333' : '#eee',
              color: openPanels.includes(item.id) ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {openPanels.includes(item.id) ? `Fermer ${item.name}` : `Ouvrir ${item.name}`}
          </button>
        ))}
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        margin: '40px 0',
        flexWrap: 'wrap'
      }}>
        {openPanels.map((panelId, index) => {
          const item = items.find(i => i.id === panelId);
          if (!item) return null;
          
          return (
            <div 
              key={panelId}
              style={{
                width: '250px',
                minHeight: '150px',
                backgroundColor: item.color,
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
            >
              <h3>{item.name}</h3>
              <p>Contenu du panel {panelId}</p>
              <p>Ce panel est actuellement ouvert</p>
              <button
                onClick={() => togglePanel(panelId)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#f0f0f0', 
        borderRadius: '4px',
        marginTop: '20px'
      }}>
        <h3>État actuel</h3>
        <p>Panels ouverts: {openPanels.length}</p>
        <p>IDs des panels: {openPanels.join(', ') || 'Aucun'}</p>
      </div>
    </div>
  );
}
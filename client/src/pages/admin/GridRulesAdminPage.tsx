import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { CustomCursorSimple } from '@/components/GrilleChimerique/CustomCursorSimple';

// Types d'expansion des containers (nouveaux noms)
enum ContainerType {
  ONE = "one",
  ONE_AND_HALF_DWN = "oneAndHalfDwn", 
  ONE_ONE_UP = "oneOneUp",
  ONE_ONE_DWN = "oneOneDwn"
}

enum ContainerExpansionType {
  NONE = "none",
  ONEONE_UP = "oneone_up",    // +1 cellule vers le haut
  ONEHALF_DWN = "onehalf_dwn", // +0.5 cellule vers le bas  
  ONEONE_DWN = "oneone_dwn"   // +1 cellule vers le bas
}

// Dimensions exactes (de V1)
const CONTAINER_SIZE = 128;
const CONTAINER_GAP = 4;
const EXPANSIONS = {
  [ContainerExpansionType.NONE]: { 
    height: CONTAINER_SIZE, 
    offsetTop: 0, 
    pushAmount: 0 
  },
  [ContainerExpansionType.ONEONE_UP]: { 
    height: 260, 
    offsetTop: -(260 - CONTAINER_SIZE), 
    pushAmount: 260 - CONTAINER_SIZE // 132px vers le haut
  },
  [ContainerExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - CONTAINER_SIZE // 132px vers le bas
  },
  [ContainerExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - CONTAINER_SIZE // 64px vers le bas
  }
};

// Interface pour containers POC
interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ContainerExpansionType;
  isExpanded: boolean;
  isOpen: boolean;
}

// Grille POC 5x5
const GRID_SIZE = 5;
const CENTER_CELL = 2; // Index 2 = cellule centrale dans grille 5x5

// Composant container POC
function ContainerPOC({ 
  container, 
  position, 
  onToggleExpansion, 
  onTogglePanel 
}: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  const expansion = EXPANSIONS[container.expansionType];
  const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;
  const offsetTop = container.isExpanded ? expansion.offsetTop : 0;

  // Couleurs selon le type
  const typeColors = {
    [ContainerType.ONE]: '#9CA3AF',
    [ContainerType.ONE_AND_HALF_DWN]: '#059669', 
    [ContainerType.ONE_ONE_UP]: '#4F46E5',
    [ContainerType.ONE_ONE_DWN]: '#DC2626'
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top + offsetTop,
        width: CONTAINER_SIZE,
        height: height,
        backgroundColor: typeColors[container.type],
        border: '2px solid #374151',
        transition: 'all 0.3s ease',
        cursor: 'grab',
        zIndex: container.isExpanded ? 20 : 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'Roboto Mono, monospace'
      }}
      onMouseDown={() => onToggleExpansion(container.id)}
    >
      <div>{container.type.toUpperCase()}</div>
      <div>ID: {container.id}</div>
      <div>{container.isExpanded ? 'EXPANDED' : 'NORMAL'}</div>
      
      {/* Zone panel (coin droit) */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 20,
          height: 20,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(255,255,255,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px'
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onTogglePanel(container.id);
        }}
      >
        P
      </div>
    </div>
  );
}

// Panel POC (ouverture par la droite, toute hauteur de grille)
function PanelPOC({ 
  container, 
  onClose,
  position,
  gridHeight 
}: {
  container: Container;
  onClose: () => void;
  position: { left: number; top: number };
  gridHeight: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: position.left + CONTAINER_SIZE + 8,
        top: 0, // Panel prend toute la hauteur depuis le top de la grille
        width: 304,
        height: gridHeight + 200, // Hauteur complète de la grille + marge pour expansions
        backgroundColor: '#FFFFFF',
        border: '2px solid #374151',
        padding: '16px',
        zIndex: 50,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        fontFamily: 'Roboto Mono, monospace'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
          Panel {container.type.toUpperCase()}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            width: '24px',
            height: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
      <div style={{ fontSize: '14px', color: '#374151' }}>
        <div>Container ID: {container.id}</div>
        <div>Type: {container.type}</div>
        <div>Position: {container.col},{container.row}</div>
        <div>Expansion: {container.expansionType}</div>
        <div>État: {container.isExpanded ? 'Étendu' : 'Normal'}</div>
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#F3F4F6' }}>
          <strong>Panel sur toute hauteur</strong><br/>
          Pousse les colonnes à droite
        </div>
      </div>
    </div>
  );
}

export default function GridRulesAdminPage() {
  // État des containers POC
  const [containers, setContainers] = useState<Container[]>(() => {
    const initialContainers: Container[] = [];
    let id = 1;
    
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        // Répartition des types
        let type: ContainerType;
        let expansionType: ContainerExpansionType;
        
        if (row === CENTER_CELL && col === CENTER_CELL) {
          // Centre = ONE_ONE_DWN
          type = ContainerType.ONE_ONE_DWN;
          expansionType = ContainerExpansionType.ONEONE_DWN;
        } else if ((row + col) % 4 === 0) {
          type = ContainerType.ONE;
          expansionType = ContainerExpansionType.NONE;
        } else if ((row + col) % 4 === 1) {
          type = ContainerType.ONE_ONE_UP;
          expansionType = ContainerExpansionType.ONEONE_UP;
        } else if ((row + col) % 4 === 2) {
          type = ContainerType.ONE_AND_HALF_DWN;
          expansionType = ContainerExpansionType.ONEHALF_DWN;
        } else {
          type = ContainerType.ONE_ONE_DWN;
          expansionType = ContainerExpansionType.ONEONE_DWN;
        }
        
        initialContainers.push({
          id,
          col,
          row,
          type,
          expansionType,
          isExpanded: false,
          isOpen: false
        });
        id++;
      }
    }
    
    return initialContainers;
  });

  const [openPanels, setOpenPanels] = useState<number[]>([]);

  // Gestion des interactions
  const handleToggleExpansion = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isExpanded: !container.isExpanded }
        : container
    ));
  };

  const handleTogglePanel = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isOpen: !container.isOpen }
        : container
    ));
    
    setOpenPanels(prev => 
      prev.includes(id) 
        ? prev.filter(panelId => panelId !== id)
        : [...prev, id]
    );
  };

  const handleClosePanel = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isOpen: false }
        : container
    ));
    
    setOpenPanels(prev => prev.filter(panelId => panelId !== id));
  };

  // Calcul des positions avec logique de poussée verticale par colonne et horizontale par panels
  const getContainerPosition = (container: Container) => {
    let adjustedTop = container.row * (CONTAINER_SIZE + CONTAINER_GAP);
    let adjustedLeft = container.col * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // 1. Poussée verticale dans la même colonne seulement
    containers.forEach(otherContainer => {
      if (otherContainer.id === container.id || !otherContainer.isExpanded) return;
      if (otherContainer.col !== container.col) return; // Seule la même colonne est affectée
      
      const expansion = EXPANSIONS[otherContainer.expansionType];
      
      if (otherContainer.expansionType === ContainerExpansionType.ONEONE_UP) {
        // ONE_ONE_UP pousse vers le haut - containers au-dessus dans la même colonne
        if (container.row < otherContainer.row) {
          adjustedTop -= expansion.pushAmount;
        }
      } else if (otherContainer.expansionType === ContainerExpansionType.ONEONE_DWN || 
                 otherContainer.expansionType === ContainerExpansionType.ONEHALF_DWN) {
        // ONE_AND_HALF_DWN/ONE_ONE_DWN poussent vers le bas - containers en-dessous dans la même colonne
        if (container.row > otherContainer.row) {
          adjustedTop += expansion.pushAmount;
        }
      }
    });
    
    // 2. Poussée horizontale par les panels ouverts
    openPanels.forEach(panelId => {
      const panelContainer = containers.find(c => c.id === panelId);
      if (!panelContainer) return;
      
      // Si le container actuel est à droite du panel ouvert, il est poussé
      if (container.col > panelContainer.col) {
        adjustedLeft += 312; // 304px (largeur panel) + 8px (marge)
      }
    });
    
    return { left: adjustedLeft, top: adjustedTop };
  };

  // Dimensions totales de la grille
  const gridWidth = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;
  const gridHeight = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;

  return (
    <div className="min-h-screen bg-[#F0F0F0] p-8" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <CustomCursorSimple />
      
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/dashboard">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 transition-colors">
              <span className="mr-2">←</span>
              Retour Dashboard
            </button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-800 mb-2">Admin Règles Grille</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm">POC Distribution & Expansions</span>
          </div>
          
          <Link href="/v2">
            <button className="flex items-center px-4 py-2 bg-green-100 text-green-700 border border-green-200 hover:border-green-300 transition-colors">
              Voir Grille V2
              <span className="ml-2">→</span>
            </button>
          </Link>
        </div>

        {/* Instructions */}
        <div className="bg-white border border-gray-300 p-4 mb-6">
          <h3 className="font-semibold mb-2">POC Test Règles :</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <div>• <strong>Clic container</strong> : Toggle expansion (ONE=aucune, ONE_ONE_UP=+1↑, ONE_AND_HALF_DWN=+0.5↓, ONE_ONE_DWN=+1↓)</div>
            <div>• <strong>Clic bouton P</strong> : Ouvrir/fermer panel (toute hauteur, pousse colonnes droite)</div>
            <div>• <strong>Couleurs</strong> : Gris=ONE, Bleu=ONE_ONE_UP, Vert=ONE_AND_HALF_DWN, Rouge=ONE_ONE_DWN</div>
            <div>• <strong>Logique</strong> : Expansion = poussée verticale même colonne, Panel = poussée horizontale colonnes droite</div>
          </div>
        </div>

        {/* Zone grille POC */}
        <div className="bg-white border border-gray-300 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">POC Grille 5x5 - Test Règles Distribution</h2>
          
          {/* Container de la grille */}
          <div 
            style={{
              position: 'relative',
              width: gridWidth + 800, // Espace pour panels multiples
              height: gridHeight + 300, // Espace pour expansions verticales
              margin: '0 auto',
              backgroundColor: '#F8F9FA',
              border: '2px dashed #9CA3AF',
              padding: '100px',
              overflow: 'auto' // Permettre le scroll
            }}
            data-cursor-type="grab"
          >
            {/* Rendu des containers */}
            {containers.map(container => {
              const position = getContainerPosition(container);
              return (
                <ContainerPOC
                  key={container.id}
                  container={container}
                  position={{ left: position.left + 100, top: position.top + 100 }}
                  onToggleExpansion={handleToggleExpansion}
                  onTogglePanel={handleTogglePanel}
                />
              );
            })}

            {/* Rendu des panels ouverts */}
            {openPanels.map(panelId => {
              const container = containers.find(c => c.id === panelId);
              if (!container) return null;
              
              const position = getContainerPosition(container);
              return (
                <PanelPOC
                  key={`panel-${panelId}`}
                  container={container}
                  position={{ left: position.left + 100, top: position.top + 100 }}
                  gridHeight={gridHeight}
                  onClose={() => handleClosePanel(panelId)}
                />
              );
            })}
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 bg-white border border-gray-300 p-4">
          <h3 className="font-semibold mb-3">Statistiques POC :</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">ONE :</span> {containers.filter(c => c.type === ContainerType.ONE).length}
            </div>
            <div>
              <span className="font-medium">ONE_ONE_UP :</span> {containers.filter(c => c.type === ContainerType.ONE_ONE_UP).length}
            </div>
            <div>
              <span className="font-medium">ONE_AND_HALF_DWN :</span> {containers.filter(c => c.type === ContainerType.ONE_AND_HALF_DWN).length}
            </div>
            <div>
              <span className="font-medium">ONE_ONE_DWN :</span> {containers.filter(c => c.type === ContainerType.ONE_ONE_DWN).length}
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="font-medium">Containers étendus :</span> {containers.filter(c => c.isExpanded).length} | 
            <span className="font-medium ml-4">Panels ouverts :</span> {openPanels.length}
          </div>
        </div>
      </div>
    </div>
  );
}
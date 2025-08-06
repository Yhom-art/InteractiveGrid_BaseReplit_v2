import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { CustomCursorSimple } from '@/components/GrilleChimerique/CustomCursorSimple';
import { generateSpiralPositions } from '@/utils/spiralAlgorithm';

import { CustomCursorV2 } from '@/components/CustomCursorV2';
import { useGrabCursor } from '@/hooks/useCursorBlocking';

// Types d'expansion des containers (nouveaux noms)
enum ContainerType {
  NEUTRAL = "neutral", // Composant de base neutre
  ONE = "one",
  ONE_AND_HALF_DWN = "oneAndHalfDwn", 
  ONE_ONE_UP = "oneOneUp",
  ONE_ONE_DWN = "oneOneDwn"
}

enum ContainerExpansionType {
  NONE = "none",
  ONEONE_UP = "oneone_up",
  ONEHALF_DWN = "onehalf_dwn",
  ONEONE_DWN = "oneone_dwn"
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
    pushAmount: 260 - CONTAINER_SIZE
  },
  [ContainerExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - CONTAINER_SIZE
  },
  [ContainerExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - CONTAINER_SIZE
  }
};

// Interface pour containers
interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ContainerExpansionType;
  isExpanded: boolean;
  isOpen: boolean;
}

// Grille complète 32x32
const GRID_SIZE = 32;
const CENTER_COL = 16;
const CENTER_ROW = 16;

// Container NEUTRAL - Référence de base pour positionnement précis
function ContainerNEUTRAL({ container, position, onToggleExpansion, onTogglePanel }: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        backgroundColor: '#FFFFFF',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '10px',
        fontFamily: 'Roboto Mono, monospace',
        pointerEvents: 'none'
      }}
    >
      <div>NEUTRAL</div>
      
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="FREE"
        onMouseDown={() => onToggleExpansion(container.id)}
      />
      
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 16,
          height: 16,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="PANEL"
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

// Container spécifique ONE (base - curseur FREE)
function ContainerONE({ container, position, onToggleExpansion, onTogglePanel }: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: CONTAINER_SIZE,
        height: CONTAINER_SIZE,
        backgroundColor: '#FFFFFF',
        border: 'none',
        transition: 'all 0.3s ease',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '10px',
        fontFamily: 'Roboto Mono, monospace',
        pointerEvents: 'none' // Permet le clic-grab de la grille
      }}
    >
      <div>ONE</div>
      
      {/* Zone centrale ronde 32px - curseur FREE */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="FREE"
        onMouseDown={() => onToggleExpansion(container.id)}
      />
      
      {/* Zone panel */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 16,
          height: 16,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="PANEL"
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

// Container spécifique ONE_ONE_UP (+1↑ - curseur FREE)
function ContainerONE_ONE_UP({ container, position, onToggleExpansion, onTogglePanel }: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  const expansion = EXPANSIONS[ContainerExpansionType.ONEONE_UP];
  const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;
  const offsetTop = container.isExpanded ? expansion.offsetTop : 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top + offsetTop,
        width: CONTAINER_SIZE,
        height: height,
        backgroundColor: '#FFFFFF',
        border: 'none',
        transition: 'all 0.3s ease',
        zIndex: container.isExpanded ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '10px',
        fontFamily: 'Roboto Mono, monospace',
        pointerEvents: 'none'
      }}
    >
      <div>ONE_ONE_UP</div>
      
      {/* Zone centrale ronde 32px - curseur FREE */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="FREE"
        onMouseDown={() => onToggleExpansion(container.id)}
      />
      
      {/* Zone panel */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 16,
          height: 16,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="PANEL"
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

// Container spécifique ONE_AND_HALF_DWN (+0.5↓ - curseur ADOPT)
function ContainerONE_AND_HALF_DWN({ container, position, onToggleExpansion, onTogglePanel }: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  const expansion = EXPANSIONS[ContainerExpansionType.ONEHALF_DWN];
  const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: CONTAINER_SIZE,
        height: height,
        backgroundColor: '#FFFFFF',
        border: 'none',
        transition: 'all 0.3s ease',
        zIndex: container.isExpanded ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '10px',
        fontFamily: 'Roboto Mono, monospace',
        pointerEvents: 'none'
      }}
    >
      <div>ONE_AND_HALF_DWN</div>
      
      {/* Zone centrale ronde 32px - curseur ADOPT */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="ADOPT"
        onMouseDown={() => onToggleExpansion(container.id)}
      />
      
      {/* Zone panel */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 16,
          height: 16,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="PANEL"
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

// Container spécifique ONE_ONE_DWN (+1↓ - curseur ADOPTED)
function ContainerONE_ONE_DWN({ container, position, onToggleExpansion, onTogglePanel }: {
  container: Container;
  position: { left: number; top: number };
  onToggleExpansion: (id: number) => void;
  onTogglePanel: (id: number) => void;
}) {
  const expansion = EXPANSIONS[ContainerExpansionType.ONEONE_DWN];
  const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;

  return (
    <div
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        width: CONTAINER_SIZE,
        height: height,
        backgroundColor: '#FFFFFF',
        border: 'none',
        transition: 'all 0.3s ease',
        zIndex: container.isExpanded ? 2 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#374151',
        fontSize: '10px',
        fontFamily: 'Roboto Mono, monospace',
        pointerEvents: 'none'
      }}
    >
      <div>ONE_ONE_DWN</div>
      
      {/* Zone centrale ronde 32px - curseur MEET */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          width: 32,
          height: 32,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="MEET"
        onMouseDown={() => onToggleExpansion(container.id)}
      />
      
      {/* Zone panel */}
      <div
        className="container-zone-clickable"
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 16,
          height: 16,
          backgroundColor: container.isOpen ? '#F59E0B' : 'rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
        data-container-type="PANEL"
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

// Fonction de rendu selon le type
function renderContainerByType(container: Container, position: { left: number; top: number }, onToggleExpansion: (id: number) => void, onTogglePanel: (id: number) => void) {
  switch (container.type) {
    case ContainerType.NEUTRAL:
      return <ContainerNEUTRAL key={container.id} container={container} position={position} onToggleExpansion={onToggleExpansion} onTogglePanel={onTogglePanel} />;
    case ContainerType.ONE:
      return <ContainerONE key={container.id} container={container} position={position} onToggleExpansion={onToggleExpansion} onTogglePanel={onTogglePanel} />;
    case ContainerType.ONE_ONE_UP:
      return <ContainerONE_ONE_UP key={container.id} container={container} position={position} onToggleExpansion={onToggleExpansion} onTogglePanel={onTogglePanel} />;
    case ContainerType.ONE_AND_HALF_DWN:
      return <ContainerONE_AND_HALF_DWN key={container.id} container={container} position={position} onToggleExpansion={onToggleExpansion} onTogglePanel={onTogglePanel} />;
    case ContainerType.ONE_ONE_DWN:
      return <ContainerONE_ONE_DWN key={container.id} container={container} position={position} onToggleExpansion={onToggleExpansion} onTogglePanel={onTogglePanel} />;
    default:
      return <ContainerNEUTRAL key={container.id} container={container} position={position} onToggleExpansion={onToggleExpansion} onTogglePanel={onTogglePanel} />;
  }
}

// Interface pour contenus NFT
interface NFTContent {
  id: string;
  type: 'image' | 'text' | 'video' | 'audio';
  title: string;
  data: {
    url?: string;
    text?: string;
    description?: string;
  };
  positioning: {
    alignWithContainer: boolean;
    verticalOffset: number; // Décalage par rapport au container
    heightMode: 'fit' | 'scroll' | 'fixed';
  };
}

// SuperContainer supprimé - remplacé par architecture dormante par colonne

// Container-Fluide - Vis-à-vis avec container parent selon position grille
function ContainerFluide({ 
  container, 
  position,
  gridHeight 
}: {
  container: Container;
  position: { left: number; top: number };
  gridHeight: number;
}) {
  // Position du container dans la grille (0-31 pour rows)
  const containerRow = container.row;
  const cellHeight = CONTAINER_SIZE + CONTAINER_GAP; // 132px
  
  // Position dans SuperContainer avec marge 4px - remontée de 3px - vis-à-vis du container parent
  const fluidTopInSuperContainer = (containerRow * cellHeight) - (3 * cellHeight) + 4 - 3;
  
  // Hauteur selon type d'expansion du container
  const expansionConfig = EXPANSIONS[container.expansionType];
  const fluidHeight = expansionConfig.height;

  return (
    <div>
      {/* Fond blanc au-dessus du Container-Fluide, collé sans espacement */}
      <div 
        style={{
          position: 'absolute',
          top: 4,
          left: 0,
          width: '100%',
          height: fluidTopInSuperContainer - 4,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E9ECEF',
          borderBottom: 'none',
          zIndex: 0,
          boxSizing: 'border-box'
        }}
      />
      
      {/* Container-Fluide */}
      <div 
        style={{
          position: 'absolute',
          top: fluidTopInSuperContainer,
          left: 0,
          width: '100%',
          height: fluidHeight,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E9ECEF',
          borderTop: 'none',
          zIndex: 1,
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}

// Container-Panel - Se cale sous le Container-Fluide, hauteur variable
function ContainerPanel({ 
  container, 
  position,
  onClose 
}: {
  container: Container;
  position: { left: number; top: number };
  onClose: () => void;
}) {
  const mockNFTContent: NFTContent = {
    id: `nft-${container.id}`,
    type: 'image',
    title: `NFT Content ${container.type}`,
    data: {
      url: '/attached_assets/Yhom_Doublures/YHOM_CarouselInsta_PHOEÌTIQUE_11_1748264121356.jpg',
      description: `Contenu dynamique pour container ${container.id}`
    },
    positioning: {
      alignWithContainer: true,
      verticalOffset: 0,
      heightMode: 'scroll'
    }
  };

  // Calcul position et hauteur dans SuperContainer
  const containerRow = container.row;
  const cellHeight = CONTAINER_SIZE + CONTAINER_GAP;
  const expansionConfig = EXPANSIONS[container.expansionType];
  
  // Position : sous le Container-Fluide avec espacement de 4px et remontée (avec décalage -3 cellules)
  const panelTop = ((containerRow * cellHeight) - (3 * cellHeight)) + expansionConfig.height + (4 - 3) + 2; // Position fluide remontée + 2px espacement
  
  // Hauteur : tout le reste du SuperContainer moins marge bottom
  const panelHeight = 4220 - panelTop - 4;

  return (
    <div 
      style={{
        position: 'absolute',
        top: panelTop,
        left: 0,
        width: '100%', // Aucune marge latérale
        height: panelHeight,
        padding: '12px',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        zIndex: 2,
        boxSizing: 'border-box',
        overflow: 'auto' // Pour contenu de longueurs variables
      }}
    >
      {/* En-tête Panel avec bouton fermeture */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#DC2626' }}>
          CONTAINER-PANEL
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
        {mockNFTContent.title}
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <img 
          src={mockNFTContent.data.url} 
          alt={mockNFTContent.title}
          style={{ 
            width: '100%', 
            height: 'auto',
            borderRadius: '4px',
            border: '1px solid #E5E7EB'
          }}
        />
      </div>

      <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4' }}>
        <div><strong>Container:</strong> ({container.col},{container.row})</div>
        <div><strong>Type:</strong> {container.type}</div>
        <div><strong>Hauteur Panel:</strong> Configurable par Admin</div>
      </div>
    </div>
  );
}

// Panel V2 supprimé - remplacé par architecture SuperContainer dormante

function GrilleChimeriqueV2Page() {
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  // Activer le curseur grab centralisé depuis la base de données
  useGrabCursor(true);

  // Raccourci clavier pour admin (Ctrl+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setLocation('/admin/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  // Gestion du grab/drag native
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Clic gauche seulement
      const scrollContainer = e.currentTarget as HTMLElement;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setScrollStart({ x: scrollContainer.scrollLeft, y: scrollContainer.scrollTop });
      scrollContainer.style.cursor = 'grabbing';
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const scrollContainer = document.querySelector('[data-grab-container]') as HTMLElement;
      if (!scrollContainer) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      scrollContainer.scrollLeft = scrollStart.x - deltaX;
      scrollContainer.scrollTop = scrollStart.y - deltaY;
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const scrollContainer = document.querySelector('[data-grab-container]') as HTMLElement;
        if (scrollContainer) {
          scrollContainer.style.cursor = 'grab';
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, dragStart, scrollStart]);

  // État des containers avec distribution spiral
  const [containers, setContainers] = useState<Container[]>(() => {
    const totalContainers = GRID_SIZE * GRID_SIZE;
    const initialContainers: Container[] = [];
    
    // Générer les positions en spirale depuis le centre
    const spiralPositions = generateSpiralPositions(
      CENTER_COL, 
      CENTER_ROW, 
      'clockwise',
      'right',
      totalContainers
    );
    
    // Créer les containers avec distribution par type
    spiralPositions.forEach((position, index) => {
      let type: ContainerType;
      let expansionType: ContainerExpansionType;
      
      // Distribution par cycles de 5 (inclut NEUTRAL)
      const typeIndex = index % 5;
      
      switch (typeIndex) {
        case 0:
          type = ContainerType.NEUTRAL;
          expansionType = ContainerExpansionType.NONE;
          break;
        case 1:
          type = ContainerType.ONE;
          expansionType = ContainerExpansionType.NONE;
          break;
        case 2:
          type = ContainerType.ONE_ONE_UP;
          expansionType = ContainerExpansionType.ONEONE_UP;
          break;
        case 3:
          type = ContainerType.ONE_AND_HALF_DWN;
          expansionType = ContainerExpansionType.ONEHALF_DWN;
          break;
        case 4:
        default:
          type = ContainerType.ONE_ONE_DWN;
          expansionType = ContainerExpansionType.ONEONE_DWN;
          break;
      }
      
      initialContainers.push({
        id: index + 1,
        col: position.x,
        row: position.y,
        type,
        expansionType,
        isExpanded: false,
        isOpen: false
      });
    });
    
    return initialContainers;
  });

  const [openPanels, setOpenPanels] = useState<number[]>([]);

  // Dimensions totales de la grille 32x32
  const gridWidth = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;
  const gridHeight = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;

  // Centrage automatique de la grille au démarrage
  useEffect(() => {
    const timer = setTimeout(() => {
      const scrollContainer = document.querySelector('[data-grab-container]');
      if (scrollContainer) {
        // Centrer exactement sur le container central (16,16) de la grille 32x32
        const centerContainerX = 16 * (CONTAINER_SIZE + CONTAINER_GAP) + 1000;
        const centerContainerY = 16 * (CONTAINER_SIZE + CONTAINER_GAP) + 1000;
        
        scrollContainer.scrollTo({
          left: centerContainerX - scrollContainer.clientWidth / 2,
          top: centerContainerY - scrollContainer.clientHeight / 2,
          behavior: 'instant'
        });
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Gestion des interactions
  const handleToggleExpansion = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isExpanded: !container.isExpanded }
        : container
    ));
  };

  const handleTogglePanel = (id: number) => {
    const targetContainer = containers.find(c => c.id === id);
    if (!targetContainer) return;

    // Vérifier s'il y a déjà un panel ouvert dans cette colonne
    const existingPanelInColumn = openPanels.find(panelId => {
      const panelContainer = containers.find(c => c.id === panelId);
      return panelContainer && panelContainer.col === targetContainer.col;
    });

    setContainers(prev => prev.map(container => {
      if (container.id === id) {
        return { ...container, isOpen: !container.isOpen };
      }
      // Fermer l'ancien panel de la même colonne
      if (existingPanelInColumn && container.id === existingPanelInColumn) {
        return { ...container, isOpen: false };
      }
      return container;
    }));
    
    setOpenPanels(prev => {
      // Supprimer l'ancien panel de la même colonne s'il existe
      const filteredPanels = existingPanelInColumn 
        ? prev.filter(panelId => panelId !== existingPanelInColumn)
        : prev;
      
      // Ajouter ou supprimer le panel actuel
      return filteredPanels.includes(id) 
        ? filteredPanels.filter(panelId => panelId !== id)
        : [...filteredPanels, id];
    });
  };

  const handleClosePanel = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isOpen: false }
        : container
    ));
    
    setOpenPanels(prev => prev.filter(panelId => panelId !== id));
  };

  // Calcul des positions avec logique de poussée
  const getContainerPosition = (container: Container) => {
    let adjustedTop = container.row * (CONTAINER_SIZE + CONTAINER_GAP);
    let adjustedLeft = container.col * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Poussée verticale dans la même colonne
    containers.forEach(otherContainer => {
      if (otherContainer.id === container.id || !otherContainer.isExpanded) return;
      if (otherContainer.col !== container.col) return;
      
      const expansion = EXPANSIONS[otherContainer.expansionType];
      
      if (otherContainer.expansionType === ContainerExpansionType.ONEONE_UP) {
        if (container.row < otherContainer.row) {
          adjustedTop -= expansion.pushAmount;
        }
      } else if (otherContainer.expansionType === ContainerExpansionType.ONEONE_DWN || 
                 otherContainer.expansionType === ContainerExpansionType.ONEHALF_DWN) {
        if (container.row > otherContainer.row) {
          adjustedTop += expansion.pushAmount;
        }
      }
    });
    
    // Poussée horizontale par les panels ouverts
    openPanels.forEach(panelId => {
      const panelContainer = containers.find(c => c.id === panelId);
      if (!panelContainer) return;
      
      if (container.col > panelContainer.col) {
        adjustedLeft += 308; // 304 (largeur panel) + 4 (gap)
      }
    });
    
    return { left: adjustedLeft, top: adjustedTop };
  };



  // Protection pour éviter le fullscreen sur les pages admin
  const isGridMapRoute = typeof window !== 'undefined' && window.location.pathname === '/';

  return (
    <div className={isGridMapRoute ? "absolute inset-0 bg-[#F0F0F0]" : "min-h-screen bg-[#F0F0F0]"} style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <CustomCursorV2 />
      {/* V2 utilise le curseur personnalisé global */}

      {/* Grille Map complète avec grab natif */}
      <div 
        className="grille-v2-container"
        style={{
          position: isGridMapRoute ? 'absolute' : 'relative',
          ...(isGridMapRoute ? { inset: 0 } : { minHeight: '100vh' }),
          backgroundColor: '#F0F0F0',
          overflow: 'auto',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        data-grab-container
        onMouseDown={handleMouseDown}
      >
        <div 
          style={{
            position: 'relative',
            width: gridWidth + 2000,
            height: gridHeight + 2000,
            padding: '1000px'
          }}
        >
          {/* Rendu des containers */}
          {containers.map(container => {
            const position = getContainerPosition(container);
            return renderContainerByType(
              container,
              { left: position.left + 1000, top: position.top + 1000 },
              handleToggleExpansion,
              handleTogglePanel
            );
          })}

          {/* SuperContainers dormants par colonne avec cumul de décalages */}
          {Array.from({ length: 32 }, (_, col) => {
            // Vérifier s'il y a un panel ouvert dans cette colonne
            const hasOpenPanelInColumn = openPanels.some(panelId => {
              const container = containers.find(c => c.id === panelId);
              return container && container.col === col;
            });
            
            if (!hasOpenPanelInColumn) return null;
            
            // Calculer le cumul de décalages des SuperContainers précédents
            let cumulativeSuperContainerOffset = 0;
            for (let prevCol = 0; prevCol < col; prevCol++) {
              const hasPrevPanelOpen = openPanels.some(panelId => {
                const container = containers.find(c => c.id === panelId);
                return container && container.col === prevCol;
              });
              if (hasPrevPanelOpen) {
                cumulativeSuperContainerOffset += 304 + CONTAINER_GAP; // Largeur SuperContainer + gap
              }
            }
            
            // SuperContainer position : base colonne + décalage cumul + offset SuperContainers précédents
            const baseColPosition = col * (CONTAINER_SIZE + CONTAINER_GAP);
            const superContainerLeft = baseColPosition + CONTAINER_SIZE + CONTAINER_GAP + cumulativeSuperContainerOffset + 1000;
            
            return (
              <div
                key={`supercontainer-col-${col}`}
                style={{
                  position: 'absolute',
                  left: superContainerLeft,
                  top: 1000,
                  width: 304,
                  height: 4220,
                  backgroundColor: 'transparent',
                  border: 'none',
                  zIndex: 50,
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  pointerEvents: 'none'
                }}
              >
                {/* Contenu géré par les composants Fluide et Panel */}
                {openPanels.map(panelId => {
                  const container = containers.find(c => c.id === panelId);
                  if (!container || container.col !== col) return null;
                  
                  return (
                    <div 
                      key={`panel-content-${panelId}`}
                      style={{ pointerEvents: 'auto' }}  // Réactive les interactions pour les composants internes
                    >
                      <ContainerFluide 
                        container={container} 
                        position={{ left: 0, top: 0 }}
                        gridHeight={gridHeight}
                      />
                      <ContainerPanel 
                        container={container} 
                        position={{ left: 0, top: 0 }}
                        onClose={() => handleClosePanel(panelId)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GrilleChimeriqueV2Page;

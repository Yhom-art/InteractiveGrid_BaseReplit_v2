import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { CustomCursorV2 } from '@/components/CustomCursorV2';


// Interface pour la configuration de grille depuis la BDD
interface GridConfig {
  id: number;
  pageName: string;
  gridModel: string;
  deploymentRules: DeploymentRule[];
  gridSettings: {
    size: number;
    containerSize: number;
    containerGap: number;
  };
}

interface DeploymentRule {
  id: string;
  name: string;
  type: 'spiral' | 'random-active' | 'random-inactive';
  contentTypes: string[];
  priority: number;
  enabled: boolean;
  maxItems?: number;
  spiralConfig?: {
    centerX: number;
    centerY: number;
    direction: 'clockwise' | 'counterclockwise';
  };
}

interface GeneratedContainer {
  id: number;
  position: { x: number; y: number };
  type: 'nft' | 'info' | 'audio' | 'video' | 'empty';
  contentData?: any;
  containerType: string;
  cursorType: string;
  isExpanded: boolean;
  isOpen: boolean;
}

// Génération de positions spiral depuis les règles BDD
function generatePositionsFromRules(rules: DeploymentRule[], gridSize: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  
  for (const rule of rules.filter(r => r.enabled)) {
    if (rule.type === 'spiral' && rule.spiralConfig) {
      const { centerX, centerY, direction } = rule.spiralConfig;
      const maxItems = rule.maxItems || 50;
      
      // Algorithme spiral simplifié
      let x = centerX;
      let y = centerY;
      let dx = 0;
      let dy = -1;
      
      for (let i = 0; i < maxItems && positions.length < 200; i++) {
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
          positions.push({ x, y });
        }
        
        if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
          [dx, dy] = direction === 'clockwise' ? [-dy, dx] : [dy, -dx];
        }
        
        x += dx;
        y += dy;
      }
    }
  }
  
  return positions;
}

function GrilleGenereeV3Page() {
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });
  const [containers, setContainers] = useState<GeneratedContainer[]>([]);

  // Récupération de la configuration Market Castings depuis la BDD
  const gridConfigQuery = useQuery({
    queryKey: ['/api/grid-v3-config/market-castings'],
    queryFn: () => fetch('/api/grid-v3-config/market-castings').then(res => res.json())
  });

  // Génération des containers basée sur la configuration BDD
  useEffect(() => {
    if (gridConfigQuery.data) {
      const config: GridConfig = gridConfigQuery.data;
      const gridSize = config.gridSettings?.size || 32;
      const positions = generatePositionsFromRules(config.deploymentRules, gridSize);
      
      const generatedContainers: GeneratedContainer[] = positions.map((pos, index) => ({
        id: index + 1,
        position: pos,
        type: index % 5 === 0 ? 'nft' : 
              index % 4 === 0 ? 'audio' :
              index % 3 === 0 ? 'video' : 'info',
        containerType: 'FREE',
        cursorType: 'meet',
        isExpanded: false,
        isOpen: false
      }));
      
      setContainers(generatedContainers);
    }
  }, [gridConfigQuery.data]);

  // Dimensions de la grille
  const CONTAINER_SIZE = 128;
  const CONTAINER_GAP = 4;
  const GRID_SIZE = 32;
  const gridWidth = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;
  const gridHeight = GRID_SIZE * (CONTAINER_SIZE + CONTAINER_GAP) - CONTAINER_GAP;

  // Centrage automatique
  useEffect(() => {
    const timer = setTimeout(() => {
      const scrollContainer = document.querySelector('[data-grab-container-v3]');
      if (scrollContainer) {
        const centerX = 16 * (CONTAINER_SIZE + CONTAINER_GAP) + 1000;
        const centerY = 16 * (CONTAINER_SIZE + CONTAINER_GAP) + 1000;
        
        scrollContainer.scrollTo({
          left: centerX - scrollContainer.clientWidth / 2,
          top: centerY - scrollContainer.clientHeight / 2,
          behavior: 'instant'
        });
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  // Gestion du grab/drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
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
      
      const scrollContainer = document.querySelector('[data-grab-container-v3]') as HTMLElement;
      if (!scrollContainer) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      scrollContainer.scrollLeft = scrollStart.x - deltaX;
      scrollContainer.scrollTop = scrollStart.y - deltaY;
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        const scrollContainer = document.querySelector('[data-grab-container-v3]') as HTMLElement;
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

  // Raccourci admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        setLocation('/admin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  // Gestion des interactions containers
  const handleContainerClick = (id: number) => {
    setContainers(prev => prev.map(container => 
      container.id === id 
        ? { ...container, isExpanded: !container.isExpanded }
        : container
    ));
  };

  // Rendu des containers générés
  const renderContainer = (container: GeneratedContainer) => {
    const left = container.position.x * (CONTAINER_SIZE + CONTAINER_GAP);
    const top = container.position.y * (CONTAINER_SIZE + CONTAINER_GAP);
    
    const backgroundColor = {
      nft: '#FF26BE',
      audio: '#8B5CF6',
      video: '#EF4444',
      info: '#3B82F6',
      empty: '#6B7280'
    }[container.type];

    return (
      <div
        key={container.id}
        style={{
          position: 'absolute',
          left: left + 1000,
          top: top + 1000,
          width: CONTAINER_SIZE,
          height: container.isExpanded ? CONTAINER_SIZE * 2 : CONTAINER_SIZE,
          backgroundColor,
          border: '2px solid white',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: container.isExpanded ? 10 : 1,
          userSelect: 'none',
          fontFamily: 'Roboto Mono, monospace'
        }}
        onClick={() => handleContainerClick(container.id)}
        data-cursor-type={container.cursorType}
      >
        <div style={{ textAlign: 'center' }}>
          <div>{container.type.toUpperCase()}</div>
          <div style={{ fontSize: '8px', opacity: 0.8 }}>
            ({container.position.x},{container.position.y})
          </div>
        </div>
      </div>
    );
  };

  const isGridMapRoute = typeof window !== 'undefined' && window.location.pathname === '/grille-generee-v3';

  return (
    <div className="min-h-screen bg-[#F0F0F0]" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <CustomCursorV2 />
      
      {/* Indicateur de statut de connexion */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        background: gridConfigQuery.isSuccess ? '#10B981' : gridConfigQuery.isError ? '#EF4444' : '#F59E0B',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 1000,
        fontFamily: 'Roboto Mono, monospace'
      }}>
        BDD: {gridConfigQuery.isSuccess ? 'CONNECTÉE' : gridConfigQuery.isError ? 'ERREUR' : 'CHARGEMENT...'}
        {gridConfigQuery.isSuccess && ` • ${containers.length} containers générés`}
      </div>

      {/* Grille générée avec grab natif */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#F0F0F0',
          overflow: 'auto',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        data-grab-container-v3
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
          {/* Grille de fond */}
          <div
            style={{
              position: 'absolute',
              left: 1000,
              top: 1000,
              width: gridWidth,
              height: gridHeight,
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${CONTAINER_SIZE + CONTAINER_GAP}px ${CONTAINER_SIZE + CONTAINER_GAP}px`,
              opacity: 0.3
            }}
          />

          {/* Containers générés */}
          {containers.map(container => renderContainer(container))}

          {/* Indicateur centre grille */}
          <div
            style={{
              position: 'absolute',
              left: 16 * (CONTAINER_SIZE + CONTAINER_GAP) + 1000 - 2,
              top: 16 * (CONTAINER_SIZE + CONTAINER_GAP) + 1000 - 2,
              width: 4,
              height: 4,
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              zIndex: 100
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default GrilleGenereeV3Page;
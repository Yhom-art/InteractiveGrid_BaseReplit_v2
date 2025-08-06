import React from 'react';
import { ContainerData, ContainerType } from '@/types/common';
import { ContainerFactory } from '../containers';

interface GridColumnProps {
  index: number;             // Index de la colonne
  containers: ContainerData[]; // Containers dans cette colonne
  isPanelActive: boolean;    // Si le panel est actif pour cette colonne
  activePanelContainer?: ContainerData; // Container qui a activé le panel
  totalGridHeight: number;   // Hauteur totale de la grille
  cellSize: number;          // Taille d'une cellule (CONTAINER_SIZE)
  cellSpacing: number;       // Espacement entre les cellules
  onContainerClick: (containerId: number) => void;  // Pour cliquer sur un container
  onPanelClose: (containerId: number) => void;     // Pour fermer un panel
}

export function GridColumn({
  index,
  containers,
  isPanelActive,
  activePanelContainer,
  totalGridHeight,
  cellSize,
  cellSpacing,
  onContainerClick,
  onPanelClose
}: GridColumnProps) {
  // Constantes
  const TOTAL_SIZE = cellSize + cellSpacing; // Taille totale d'une cellule avec espacement
  const PANEL_WIDTH_DORMANT = 4;
  const PANEL_WIDTH_ACTIVE = TOTAL_SIZE * 3; // 3 colonnes de large

  // Calculer la position de base de la colonne
  const columnLeft = index * TOTAL_SIZE;
  
  return (
    <div 
      className="absolute" 
      style={{ 
        left: `${columnLeft}px`,
        top: 0,
        width: `${TOTAL_SIZE}px`,
        height: `${totalGridHeight}px`
      }}
    >
      {/* Containers dans cette colonne */}
      {containers.map(container => (
        <div 
          key={`container-cell-${container.id}`}
          className="absolute"
          style={{
            left: 0,
            top: container.position ? container.position.y * TOTAL_SIZE : 0,
            width: `${cellSize}px`,
            height: `${cellSize}px`
          }}
        >
          <ContainerFactory
            id={container.id}
            state={container.state}
            type={container.type}
            position={{ left: 0, top: 0 }} // Position relative à cette div
            onClick={() => onContainerClick(container.id)}
            onPanelToggle={() => {}} // Géré au niveau supérieur maintenant
          />
        </div>
      ))}

      {/* Panel dormant (toujours visible) */}
      <div
        className="absolute bg-white"
        style={{
          left: `${cellSize}px`,
          top: 0,
          width: `${PANEL_WIDTH_DORMANT}px`,
          height: `${totalGridHeight}px`,
          opacity: isPanelActive ? 1 : 0.2,
          transition: 'opacity 0.3s ease',
          zIndex: 5
        }}
      />

      {/* Panel actif (visible uniquement si isPanelActive est true) */}
      {isPanelActive && activePanelContainer && (
        <>
          {/* Fond du panel */}
          <div
            className="absolute bg-white"
            style={{
              left: `${cellSize + PANEL_WIDTH_DORMANT}px`,
              top: 0,
              width: `${PANEL_WIDTH_ACTIVE - PANEL_WIDTH_DORMANT}px`, // Reste de la largeur du panel
              height: `${totalGridHeight}px`,
              zIndex: 20,
              transition: 'width 0.3s ease'
            }}
          />
          
          {/* Contenu du panel */}
          <div
            className="absolute bg-white shadow-lg border border-gray-200 rounded overflow-hidden"
            style={{
              left: `${cellSize + PANEL_WIDTH_DORMANT + 8}px`, // Légèrement décalé
              top: `${activePanelContainer.position ? activePanelContainer.position.y * TOTAL_SIZE : 0}px`,
              width: `${PANEL_WIDTH_ACTIVE - PANEL_WIDTH_DORMANT - 16}px`, // Un peu moins large
              maxHeight: '80vh',
              zIndex: 100
            }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Container #{activePanelContainer.id}</h3>
                <button 
                  className="p-1 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() => onPanelClose(activePanelContainer.id)}
                >
                  ×
                </button>
              </div>
              <div>
                <p>Type: {activePanelContainer.type}</p>
                <p>State: {activePanelContainer.state}</p>
                {activePanelContainer.type === ContainerType.EDITORIAL && (
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="font-medium">{activePanelContainer.title || "Éditorial"}</h4>
                    <p className="text-sm mt-1">Contenu éditorial pour ce container.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
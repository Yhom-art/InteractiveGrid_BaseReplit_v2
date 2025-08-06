import React from 'react';
import { ContainerBase, ContainerBaseProps } from './ContainerBase';
import { ContainerState } from '@/types/common';

// Container oneone_up (FREE): extension vers le haut de 132px
export function ContainerOneoneUp(props: ContainerBaseProps) {
  // Hauteur du container selon son état
  const containerHeight = props.state === ContainerState.FREE ? '260px' : '128px';
  
  // Position verticale selon l'état - important pour le container FREE
  // Dans l'état ouvert, le contenu s'étend vers le haut, mais la position de base reste la même
  const containerTop = props.state === ContainerState.FREE 
    ? props.position.top - 132 // Décalé vers le haut pour l'extension 
    : props.position.top;      // Position normale
  
  // Style spécifique pour ce type de container
  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    top: containerTop,
    transformOrigin: 'bottom', // Point d'ancrage en bas
  };
  
  return (
    <ContainerBase
      {...props}
      style={{ ...containerStyle, ...props.style }}
      className={`container-oneone-up ${props.className || ''}`}
    >
      {/* Contenu du container FREE (oneone_up) */}
      <div className="w-full h-full flex flex-col relative">
        {/* Zone d'extension (visible uniquement si ouvert) */}
        {props.state === ContainerState.FREE && (
          <div className="h-[132px] bg-green-100 flex items-center justify-center">
            <div className="text-center text-green-800 font-medium">EXTENSION</div>
          </div>
        )}
        
        {/* Zone principale (toujours visible) */}
        <div className="flex-grow bg-white flex items-center justify-center">
          <div className="text-center">
            {props.title || "Container oneone_up"}
          </div>
        </div>
      </div>
    </ContainerBase>
  );
}
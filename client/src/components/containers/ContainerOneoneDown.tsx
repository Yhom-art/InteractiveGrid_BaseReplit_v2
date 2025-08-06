import React from 'react';
import { ContainerBase, ContainerBaseProps } from './ContainerBase';
import { ContainerState } from '@/types/common';

// Container oneone_down (ADOPTED): extension vers le bas de 132px
export function ContainerOneoneDown(props: ContainerBaseProps) {
  // Hauteur du container selon son état
  const containerHeight = props.state === ContainerState.ADOPTED ? '260px' : '128px';
  
  // Style spécifique pour ce type de container
  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    transformOrigin: 'top', // Point d'ancrage en haut
  };
  
  return (
    <ContainerBase
      {...props}
      style={{ ...containerStyle, ...props.style }}
      className={`container-oneone-down ${props.className || ''}`}
    >
      {/* Contenu du container ADOPTED (oneone_down) */}
      <div className="w-full h-full flex flex-col relative">
        {/* Zone principale (toujours visible) */}
        <div className="h-[128px] bg-white flex items-center justify-center">
          <div className="text-center">
            {props.title || "Container oneone_down"}
          </div>
        </div>
        
        {/* Zone d'extension (visible uniquement si ouvert) */}
        {props.state === ContainerState.ADOPTED && (
          <div className="h-[132px] bg-pink-100 flex items-center justify-center">
            <div className="text-center text-pink-800 font-medium">EXTENSION</div>
          </div>
        )}
      </div>
    </ContainerBase>
  );
}
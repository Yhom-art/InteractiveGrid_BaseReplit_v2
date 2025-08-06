import React from 'react';
import { ContainerBase, ContainerBaseProps } from './ContainerBase';
import { ContainerState } from '@/types/common';

// Container onehalf_down (ADOPT): extension partielle vers le bas de 64px
export function ContainerOnehalfDown(props: ContainerBaseProps) {
  // Hauteur du container selon son état
  const containerHeight = props.state === ContainerState.ADOPT ? '192px' : '128px';
  
  // Style spécifique pour ce type de container
  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    transformOrigin: 'top', // Point d'ancrage en haut
  };
  
  return (
    <ContainerBase
      {...props}
      style={{ ...containerStyle, ...props.style }}
      className={`container-onehalf-down ${props.className || ''}`}
    >
      {/* Contenu du container ADOPT (onehalf_down) */}
      <div className="w-full h-full flex flex-col relative">
        {/* Zone principale (toujours visible) */}
        <div className="h-[128px] bg-white flex items-center justify-center">
          <div className="text-center">
            {props.title || "Container onehalf_down"}
          </div>
        </div>
        
        {/* Zone d'extension (visible uniquement si ouvert) */}
        {props.state === ContainerState.ADOPT && (
          <div className="h-[64px] bg-orange-100 flex items-center justify-center">
            <div className="text-center text-orange-800 font-medium">DEMI-EXT</div>
          </div>
        )}
      </div>
    </ContainerBase>
  );
}
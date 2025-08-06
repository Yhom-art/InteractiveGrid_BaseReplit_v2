import React from 'react';
import { ContainerBase, ContainerBaseProps } from './ContainerBase';

// Container standard (type "one"): taille fixe 128x128
export function ContainerOne(props: ContainerBaseProps) {
  // Style spécifique
  const containerStyle: React.CSSProperties = {
    height: '128px',  // Hauteur fixe
  };
  
  return (
    <ContainerBase
      {...props}
      style={{ ...containerStyle, ...props.style }}
    >
      {/* Contenu du container standard */}
      <div className="w-full h-full flex items-center justify-center text-center p-2">
        {props.title ? (
          <div>{props.title}</div>
        ) : (
          <div className="text-gray-500">Container standard</div>
        )}
      </div>
    </ContainerBase>
  );
}
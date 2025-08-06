import React from 'react';
import { ContainerState, ContainerType } from '@/types/common';

export interface ContainerBaseProps {
  id: number;
  state: ContainerState;
  type: ContainerType;
  position: {
    left: number;
    top: number;
  };
  onClick: () => void;
  onPanelToggle?: (containerId: number) => void;
  debugMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  // Props supplémentaires pour les containers éditoriaux
  editorialImage?: string;
  url?: string;
  title?: string;
}

export function ContainerBase({ 
  id, 
  state, 
  type, 
  position,
  onClick,
  onPanelToggle,
  debugMode,
  className = '',
  style = {},
  children,
  editorialImage,
  url,
  title
}: ContainerBaseProps) {
  // État interne du container (fermé par défaut)
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Classes CSS selon l'état
  const containerClasses = `
    container 
    ${className} 
    relative border overflow-hidden
    ${state === ContainerState.CLOSED ? 'border-gray-200' : 'border-gray-400'}
    ${isHovered ? 'shadow-md' : ''}
  `.trim();
  
  // Style de base
  const containerStyle: React.CSSProperties = {
    width: '128px',  // Taille standard d'un container
    ...style,        // Styles supplémentaires
    position: 'absolute',
    left: position.left,
    top: position.top,
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    transition: 'height 0.3s ease, background-color 0.2s ease, box-shadow 0.2s ease',
    zIndex: 10,
  };
  
  // Gestion des événements
  const handleClick = () => {
    onClick();
  };
  
  const handlePanelToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPanelToggle) {
      onPanelToggle(id);
    }
  };
  
  // Contenu du container
  return (
    <div
      className={containerClasses}
      style={containerStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-container-id={id}
      data-container-type={type}
      data-container-state={state}
    >
      {/* En mode debug: afficher l'ID et le type */}
      {debugMode && (
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 z-20">
          ID: {id} | {type}
          <br />
          État: {state}
        </div>
      )}
      
      {/* Contenu du container */}
      {children}
      
      {/* Bouton de panel sur la droite */}
      {onPanelToggle && (
        <div 
          className="absolute top-0 bottom-0 right-0 w-4 bg-white bg-opacity-80 flex items-center justify-center cursor-pointer hover:bg-opacity-100"
          onClick={handlePanelToggle}
        >
          <div className="h-12 w-1 bg-gray-300 rounded-full hover:bg-gray-500" />
        </div>
      )}
    </div>
  );
}
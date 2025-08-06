import React from 'react';
import { PanelData, Container } from './types';
import { ContainerType } from '@/types/common';

interface FluidPanelProps {
  // Données du panel
  panel: PanelData;
  
  // Container associé au panel
  container: Container;
  
  // Position calculée pour le panel
  position: {
    left: number;
    top: number;
  };
  
  // Dimensions de la grille pour calculer la hauteur du panel
  gridHeight: number;
  
  // Position verticale alignée avec le container parent
  alignedContentTop: number;
  
  // Callback pour fermer le panel
  onClose: (containerId: number) => void;
  
  // Mode debug optionnel
  debug?: boolean;
}

/**
 * Panel fluide qui s'étend sur toute la hauteur de la grille
 * avec son contenu aligné avec le container parent
 */
export function FluidPanel({
  panel,
  container,
  position,
  gridHeight,
  alignedContentTop,
  onClose,
  debug = false
}: FluidPanelProps) {
  // Couleurs selon le type de container
  const getColors = (type: ContainerType): { bg: string, border: string } => {
    switch (type) {
      case ContainerType.FREE:
        return { bg: '#E0F4FF', border: '#58C4DD' };
      case ContainerType.ADOPT:
        return { bg: '#FEF8E2', border: '#F2C94C' };
      case ContainerType.ADOPTED:
        return { bg: '#FFECEC', border: '#EB5757' };
      case ContainerType.EDITORIAL:
        return { bg: '#E8FFF3', border: '#6FCF97' };
      default:
        return { bg: '#f5f5f5', border: '#cccccc' };
    }
  };
  
  const colors = getColors(container.type);
  
  // Gérer la fermeture du panel
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(panel.containerId);
    
    if (debug) {
      console.log(`Panel ${panel.containerId} closed`);
    }
  };
  
  return (
    <div
      className="fluid-panel"
      style={{
        width: 304, // Largeur standard des panels
        height: gridHeight,
        backgroundColor: colors.bg,
        position: 'absolute',
        left: position.left,
        top: position.top,
        borderRadius: '8px',
        border: `2px solid ${colors.border}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease-out',
        zIndex: 10,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* En-tête du panel */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${colors.border}`,
        background: `linear-gradient(to right, ${colors.bg}, white)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: colors.border,
            marginRight: '8px'
          }} />
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            {container.type} #{panel.containerId}
          </h3>
        </div>
        
        <button 
          style={{
            background: '#eee',
            border: 'none',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px'
          }}
          onClick={handleClose}
        >
          ×
        </button>
      </div>
      
      {/* Zone de contenu alignée avec le container parent */}
      <div style={{
        padding: '16px',
        marginTop: alignedContentTop - 40, // Positionne le contenu au niveau du container
        borderTop: `1px solid ${colors.border}`,
        background: 'white',
        maxHeight: '80%',
        overflow: 'auto',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)'
      }}>          
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          Position: (Col {container.col}, Row {container.row})
        </p>
        
        {/* Ici, nous pourrons intégrer le vrai contenu du panel */}
        {/* Contenu de démonstration pour le moment */}
        <div className="panel-content">
          <h4 style={{ marginTop: 0 }}>Détails du Container</h4>
          
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#f9f9f9', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <div><strong>ID:</strong> {container.id}</div>
            <div><strong>Type:</strong> {container.type}</div>
            <div><strong>Expansion:</strong> {container.expansionType}</div>
            <div><strong>Position:</strong> Col {container.col}, Row {container.row}</div>
          </div>
          
          <p style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.4' }}>
            Ce panel est aligné avec son container parent et occupe toute
            la hauteur de la grille. Le contenu réel sera intégré ici.
          </p>
          
          {debug && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>Debug:</strong> Panel aligné à {alignedContentTop}px du haut
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
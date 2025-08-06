import React, { useState, useEffect } from 'react';
import { formatImagePathForDisplay } from '@/utils/imageUtils';
import { calculateHumanScaleFactor, getCalibrationDebugInfo } from '@/utils/deviceCalibration';
import { CalibrationTestTool } from './CalibrationTestTool';

interface EchelleHumaineProps {
  imageUrl: string;
  isActive: boolean;
  onClose: () => void;
  mousePosition: { x: number; y: number };
  panelBounds?: { left: number; width: number; top: number; height: number };
  onCooldownEnd?: () => void; // Callback pour signaler la fin de la pause
  onCountdownUpdate?: (countdown: number) => void; // Callback pour transmettre le timer
}

/**
 * Module dédié pour l'effet "échelle humaine"
 * Affiche l'image zoomée par-dessus tout le panel
 */
export function EchelleHumaine({ imageUrl, isActive, onClose, mousePosition, panelBounds, onCooldownEnd, onCountdownUpdate }: EchelleHumaineProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });

  const [calibratedZoomLevel, setCalibratedZoomLevel] = useState('700%');
  const [debugMode, setDebugMode] = useState(false);
  const [showTestTool, setShowTestTool] = useState(false);

  // Calibration automatique au montage du composant
  useEffect(() => {
    const calibration = calculateHumanScaleFactor('face');
    const zoomPercentage = calibration.recommendedZoomLevel;
    setCalibratedZoomLevel(`${zoomPercentage}%`);
    
    // Debug info en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔬 Calibration Échelle Humaine:', {
        appareil: calibration.device?.name || 'Appareil inconnu',
        confiance: calibration.confidence,
        facteurEchelle: calibration.scaleFactor,
        zoomRecommande: `${zoomPercentage}%`,
        taillePysiqueEcran: calibration.physicalScreenSize,
        debug: getCalibrationDebugInfo()
      });
    }
  }, []);

  // Activation/désactivation simple au survol
  useEffect(() => {
    if (isActive) {
      // Activation immédiate au survol
      setIsVisible(true);
    } else {
      // Fermeture immédiate quand on sort de la zone
      setIsVisible(false);
    }
  }, [isActive]);



  // Navigation dans l'image basée sur la position de la souris
  useEffect(() => {
    if (isVisible && mousePosition) {
      // Convertir la position de la souris en pourcentages pour la navigation
      setImagePosition({
        x: Math.max(0, Math.min(100, mousePosition.x)),
        y: Math.max(0, Math.min(100, mousePosition.y))
      });
    }
  }, [mousePosition, isVisible]);

  if (!isVisible) return null;

  // Utiliser les dimensions du panel si disponibles, sinon dimensions par défaut
  const containerStyle = panelBounds ? {
    position: 'absolute' as const,
    top: panelBounds.top,
    left: panelBounds.left,
    width: panelBounds.width,
    height: panelBounds.height,
    zIndex: 9999,
    pointerEvents: 'none' as const,
    overflow: 'hidden'
  } : {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    pointerEvents: 'none' as const,
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      {/* Image zoomée échelle humaine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${formatImagePathForDisplay(imageUrl)})`,
          backgroundSize: calibratedZoomLevel, // Zoom calibré automatiquement selon l'appareil
          backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
          backgroundRepeat: 'no-repeat',
          transition: 'background-position 0.1s ease-out, opacity 0.3s ease-out',
          opacity: isVisible ? 1 : 0
        }}
      />

      {/* Indicateur de calibration et mode debug */}
      {debugMode && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <div>Zoom calibré: {calibratedZoomLevel}</div>
          <div>Position: {imagePosition.x.toFixed(1)}%, {imagePosition.y.toFixed(1)}%</div>
          <button
            onClick={() => {
              console.log('🔬 Debug Calibration:', getCalibrationDebugInfo());
            }}
            style={{
              background: '#444',
              color: 'white',
              border: 'none',
              padding: '2px 6px',
              marginTop: '4px',
              marginRight: '4px',
              borderRadius: '2px',
              fontSize: '10px'
            }}
          >
            Log Debug Info
          </button>
          <button
            onClick={() => setShowTestTool(!showTestTool)}
            style={{
              background: '#006600',
              color: 'white',
              border: 'none',
              padding: '2px 6px',
              marginTop: '4px',
              borderRadius: '2px',
              fontSize: '10px'
            }}
          >
            {showTestTool ? 'Fermer' : 'Test'} Outil
          </button>
        </div>
      )}

      {/* Toggle debug mode avec double-clic */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '20px',
          height: '20px',
          background: 'transparent',
          zIndex: 10001,
          pointerEvents: 'auto'
        }}
        onDoubleClick={() => setDebugMode(!debugMode)}
        title="Double-clic pour activer/désactiver le mode debug"
      />

      {/* Outil de test de calibration */}
      {showTestTool && <CalibrationTestTool />}
    </div>
  );
}
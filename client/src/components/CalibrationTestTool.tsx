import React, { useState, useEffect } from 'react';
import { calculateHumanScaleFactor, getCalibrationDebugInfo } from '@/utils/deviceCalibration';

/**
 * Outil de test pour vérifier la calibration de l'échelle humaine
 */
export function CalibrationTestTool() {
  const [calibration, setCalibration] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testMode, setTestMode] = useState<'face' | 'hand' | 'eye'>('face');
  const [showRuler, setShowRuler] = useState(false);

  useEffect(() => {
    const cal = calculateHumanScaleFactor(testMode);
    const debug = getCalibrationDebugInfo();
    setCalibration(cal);
    setDebugInfo(debug);
  }, [testMode]);

  if (!calibration) return <div>Chargement de la calibration...</div>;

  // Calcul de la taille réelle d'un centimètre sur cet écran
  const pixelsPerCm = calibration.device?.resolution.width / calibration.physicalScreenSize.widthCm;
  const oneCmInPixels = pixelsPerCm;

  // Références de taille humaine
  const humanReferences = {
    face: { width: 14, height: 20, description: "Visage humain moyen" },
    hand: { width: 8, height: 18, description: "Main humaine moyenne" },
    eye: { width: 2.5, height: 1.2, description: "Œil humain moyen" }
  };

  const currentRef = humanReferences[testMode];

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '400px',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 10000,
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>Test de Calibration Échelle Humaine</h3>
      
      {/* Informations sur l'appareil détecté */}
      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px' }}>
        <div><strong>Appareil détecté:</strong> {calibration.device?.name || 'Inconnu'}</div>
        <div><strong>Confiance:</strong> {calibration.confidence}</div>
        <div><strong>Taille écran:</strong> {calibration.device?.screenSizeInches}" diagonale</div>
        <div><strong>Résolution:</strong> {calibration.device?.resolution.width} × {calibration.device?.resolution.height}</div>
        <div><strong>PPI:</strong> {calibration.device?.pixelDensity}</div>
        <div><strong>Taille physique:</strong> {calibration.physicalScreenSize.widthCm.toFixed(1)} × {calibration.physicalScreenSize.heightCm.toFixed(1)} cm</div>
      </div>

      {/* Sélecteur de référence */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px' }}><strong>Référence à tester:</strong></div>
        {Object.entries(humanReferences).map(([key, ref]) => (
          <label key={key} style={{ display: 'block', marginBottom: '5px' }}>
            <input
              type="radio"
              checked={testMode === key}
              onChange={() => setTestMode(key as any)}
              style={{ marginRight: '8px' }}
            />
            {ref.description} ({ref.width} × {ref.height} cm)
          </label>
        ))}
      </div>

      {/* Calculs pour la référence actuelle */}
      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0, 255, 0, 0.1)', borderRadius: '4px' }}>
        <div><strong>Zoom recommandé:</strong> {calibration.recommendedZoomLevel}%</div>
        <div><strong>Facteur d'échelle:</strong> {calibration.scaleFactor.toFixed(2)}x</div>
        <div><strong>Pixels par cm:</strong> {pixelsPerCm.toFixed(1)} px/cm</div>
        <div><strong>1 cm sur votre écran:</strong> {oneCmInPixels.toFixed(1)} pixels</div>
      </div>

      {/* Échantillon de test visuel */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '8px' }}><strong>Test visuel - {currentRef.description}:</strong></div>
        
        {/* Rectangle à l'échelle réelle */}
        <div style={{
          width: `${currentRef.width * oneCmInPixels}px`,
          height: `${currentRef.height * oneCmInPixels}px`,
          border: '2px solid #00ff00',
          background: 'rgba(0, 255, 0, 0.2)',
          margin: '10px 0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          textAlign: 'center'
        }}>
          {currentRef.width} × {currentRef.height} cm
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '0',
            fontSize: '10px',
            color: '#00ff00'
          }}>
            Taille réelle sur votre écran
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#888', marginTop: '25px' }}>
          Ce rectangle devrait mesurer exactement {currentRef.width} cm × {currentRef.height} cm 
          sur votre écran physique. Vous pouvez le vérifier avec une règle !
        </div>
      </div>

      {/* Bouton pour afficher/masquer la règle */}
      <button
        onClick={() => setShowRuler(!showRuler)}
        style={{
          background: '#444',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          marginBottom: '15px',
          cursor: 'pointer'
        }}
      >
        {showRuler ? 'Masquer' : 'Afficher'} règle de test
      </button>

      {/* Règle de test */}
      {showRuler && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ marginBottom: '8px' }}><strong>Règle de 10 cm:</strong></div>
          <div style={{
            width: `${10 * oneCmInPixels}px`,
            height: '20px',
            background: 'linear-gradient(to right, #fff 0%, #fff 50%, #000 50%, #000 100%)',
            backgroundSize: `${oneCmInPixels}px 20px`,
            border: '1px solid #fff',
            position: 'relative'
          }}>
            {Array.from({ length: 11 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${i * oneCmInPixels}px`,
                  top: '20px',
                  fontSize: '8px',
                  color: '#fff',
                  transform: 'translateX(-50%)'
                }}
              >
                {i}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
            Cette règle devrait mesurer exactement 10 cm sur votre écran
          </div>
        </div>
      )}

      {/* Informations détaillées pour debug */}
      <details style={{ marginTop: '15px' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>Informations détaillées</summary>
        <pre style={{ 
          fontSize: '10px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '10px', 
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {JSON.stringify({
            screen: debugInfo.rawScreen,
            window: debugInfo.window,
            userAgent: navigator.userAgent.substring(0, 100) + '...',
            calculatedValues: {
              pixelsPerCm: pixelsPerCm.toFixed(2),
              scaleFactor: calibration.scaleFactor.toFixed(2),
              recommendedZoom: calibration.recommendedZoomLevel
            }
          }, null, 2)}
        </pre>
      </details>

      {/* Bouton de fermeture */}
      <button
        onClick={() => {
          const element = document.getElementById('calibration-test-tool');
          if (element) element.remove();
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#ff4444',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        ×
      </button>
    </div>
  );
}

/**
 * Fonction utilitaire pour afficher l'outil de test
 */
export function showCalibrationTestTool() {
  // Éviter les doublons
  const existing = document.getElementById('calibration-test-tool');
  if (existing) {
    existing.remove();
  }

  // Créer un conteneur React pour l'outil
  const container = document.createElement('div');
  container.id = 'calibration-test-tool';
  document.body.appendChild(container);

  // Note: Dans un vrai projet, il faudrait utiliser ReactDOM.render
  // Pour simplifier, on va ajouter l'outil directement
  console.log('🔬 Outil de test disponible. Appelez showCalibrationTestTool() dans la console du navigateur.');
}

// Rendre la fonction disponible globalement pour les tests
if (typeof window !== 'undefined') {
  (window as any).showCalibrationTestTool = showCalibrationTestTool;
}
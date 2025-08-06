import React, { useRef, useEffect, useState } from 'react';
import { MusicPlayer } from '../MusicPlayer';
import { useProximityVolume } from '../../hooks/useProximityVolume';

interface MusicContainerDemoProps {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function MusicContainerDemo({ position, size }: MusicContainerDemoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerPosition, setCenterPosition] = useState({ x: 0, y: 0 });

  // Calculer la position centrale du container
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCenterPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  }, [position, size]);

  // Utiliser le hook de proximité
  const { volume, distance, isInRange } = useProximityVolume(
    centerPosition,
    {
      maxDistance: 400,
      falloffCurve: 'smooth',
      minVolume: 0.05,
      updateInterval: 100
    }
  );

  // Données musicales de démonstration avec un fichier existant
  const demoMusicData = {
    audioUrl: '/attached_assets/Yhom_Doublures/idlespoppoppopofficialvideoyoutube_1748287098911.mp3',
    title: 'Idle Pop Demo',
    artist: 'Yhom Audio',
    album: 'Doublures Collection'
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        border: `2px solid ${isInRange ? '#ff0080' : '#333'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        transition: 'border-color 0.3s ease',
        boxShadow: isInRange ? '0 0 20px rgba(255, 0, 128, 0.3)' : 'none'
      }}
      data-container-type="MUSIC"
    >
      {/* Indicateur visuel de proximité */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, 
            rgba(255, 0, 128, 0) 0%, 
            rgba(255, 0, 128, ${volume}) ${volume * 100}%, 
            rgba(255, 0, 128, 0) 100%)`,
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
      />

      {/* Header avec titre */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #444',
          background: 'rgba(0,0,0,0.3)'
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: '#ff0080',
            fontWeight: 'bold',
            textAlign: 'center',
            fontFamily: 'monospace'
          }}
        >
          ♪ MUSIC ZONE ♪
        </div>
      </div>

      {/* Player musical avec volume de proximité */}
      <div style={{ padding: '8px' }}>
        <MusicPlayer
          audioUrl={demoMusicData.audioUrl}
          title={demoMusicData.title}
          volume={volume}
          autoplay={false}
        />
      </div>

      {/* Métadonnées musicales */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '12px',
          right: '12px',
          fontSize: '9px',
          color: '#888',
          textAlign: 'center',
          borderTop: '1px solid #444',
          paddingTop: '6px',
          fontFamily: 'monospace'
        }}
      >
        <div style={{ marginBottom: '2px' }}>
          Artist: {demoMusicData.artist}
        </div>
        <div>
          Album: {demoMusicData.album}
        </div>
      </div>

      {/* Indicateur de distance */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontSize: '8px',
          color: volume > 0.5 ? '#00ff80' : volume > 0.2 ? '#ff0080' : '#666',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          border: `1px solid ${volume > 0.5 ? '#00ff80' : volume > 0.2 ? '#ff0080' : '#666'}`
        }}
      >
        {Math.round(distance)}px
      </div>
    </div>
  );
}
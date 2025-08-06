import React, { useRef, useEffect, useState } from 'react';
import { MusicPlayer } from './MusicPlayer';
import { useProximityVolume } from '../hooks/useProximityVolume';
import { MusicComponent } from '@shared/schema';

interface MusicContainerProps {
  musicData: MusicComponent;
  containerPosition: { x: number; y: number };
  containerSize: { width: number; height: number };
  onPlay?: (musicId: number) => void;
  onPause?: (musicId: number) => void;
}

export function MusicContainer({
  musicData,
  containerPosition,
  containerSize,
  onPlay,
  onPause
}: MusicContainerProps) {
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
  }, [containerPosition, containerSize]);

  // Utiliser le hook de proximité avec les paramètres musicaux
  const { volume, distance, isInRange } = useProximityVolume(
    centerPosition,
    {
      maxDistance: musicData.proximitySettings?.maxDistance || 500,
      falloffCurve: musicData.proximitySettings?.falloffCurve || 'smooth',
      minVolume: musicData.proximitySettings?.minVolume || 0.1,
      updateInterval: 50 // Mise à jour plus fréquente pour la musique
    }
  );

  const handlePlay = () => {
    if (onPlay) onPlay(musicData.id);
  };

  const handlePause = () => {
    if (onPause) onPause(musicData.id);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        border: `2px solid ${isInRange ? '#ff0080' : '#333'}`,
        borderRadius: '4px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #000 0%, #111 100%)',
        transition: 'border-color 0.3s ease'
      }}
      data-container-type="MUSIC"
      data-music-id={musicData.id}
    >
      {/* Indicateur visuel de proximité */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            #ff0080 ${volume * 100}%, 
            transparent 100%)`,
          zIndex: 10,
          transition: 'all 0.1s ease'
        }}
      />

      {/* Player musical avec volume de proximité */}
      <MusicPlayer
        audioUrl={musicData.audioUrl}
        title={musicData.title}
        volume={volume}
        autoplay={Boolean(musicData.autoplay)}
        onPlay={handlePlay}
        onPause={handlePause}
      />

      {/* Métadonnées musicales */}
      {(musicData.artist || musicData.album) && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            fontSize: '9px',
            color: '#666',
            textAlign: 'center',
            borderTop: '1px solid #333',
            paddingTop: '4px'
          }}
        >
          {musicData.artist && (
            <div style={{ marginBottom: '2px' }}>
              Artist: {musicData.artist}
            </div>
          )}
          {musicData.album && (
            <div>
              Album: {musicData.album}
            </div>
          )}
        </div>
      )}

      {/* Debug info (seulement en développement) */}
      {import.meta.env.DEV && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '8px',
            color: '#666',
            background: 'rgba(0,0,0,0.8)',
            padding: '2px 4px',
            borderRadius: '2px'
          }}
        >
          Vol: {Math.round(volume * 100)}% | 
          Dist: {Math.round(distance)}px
        </div>
      )}
    </div>
  );
}
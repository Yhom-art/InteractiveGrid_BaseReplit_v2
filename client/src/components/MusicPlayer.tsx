import React, { useRef, useState, useEffect } from 'react';
import { useAudioManager } from '../hooks/useAudioManager';

interface MusicPlayerProps {
  audioUrl: string;
  title?: string;
  volume?: number; // Volume contrôlé par la proximité (0-1)
  autoplay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onVolumeChange?: (volume: number) => void;
}

export function MusicPlayer({ 
  audioUrl, 
  title = "Musique", 
  volume = 1,
  autoplay = false,
  onPlay, 
  onPause,
  onVolumeChange
}: MusicPlayerProps) {
  const playerId = `music-player-${audioUrl}-${Date.now()}`;
  const { audioRef, playAudio, pauseAudio } = useAudioManager(playerId);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [internalVolume, setInternalVolume] = useState(volume);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (autoplay) {
        togglePlay();
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, autoplay]);

  // Appliquer le volume de proximité
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const finalVolume = volume * internalVolume;
      audio.volume = finalVolume;
      if (onVolumeChange) {
        onVolumeChange(finalVolume);
      }
    }
  }, [volume, internalVolume, onVolumeChange]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    try {
      if (isPlaying) {
        pauseAudio();
        setIsPlaying(false);
        if (onPause) onPause();
      } else {
        await playAudio();
        setIsPlaying(true);
        if (onPlay) onPlay();
      }
    } catch (error) {
      console.error('Erreur lecture audio:', error);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setInternalVolume(newVolume);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = Math.round((volume * internalVolume) * 100);

  if (!audioUrl) {
    return (
      <div style={{
        border: '1px solid #000',
        padding: '12px',
        fontFamily: 'monospace',
        fontSize: '11px',
        textAlign: 'center',
        background: '#f5f5f5'
      }}>
        ♪ Aucune musique
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100px',
      fontFamily: 'monospace',
      fontSize: '11px',
      lineHeight: '1.2',
      position: 'relative',
      background: '#000',
      color: '#fff',
      padding: '12px',
      border: '2px solid #333'
    }}>
      {/* Audio element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Header avec titre et indicateur de volume */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        borderBottom: '1px solid #333',
        paddingBottom: '8px'
      }}>
        <div style={{
          fontWeight: 'bold',
          fontSize: '12px',
          color: '#ff0080'
        }}>
          ♪ {title}
        </div>
        <div style={{
          fontSize: '10px',
          color: volume < 0.3 ? '#666' : volume < 0.7 ? '#ff0080' : '#00ff80'
        }}>
          VOL: {volumePercent}%
        </div>
      </div>
      
      {/* Contrôles principaux */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px'
      }}>
        {/* Bouton Play/Pause */}
        <button
          onClick={togglePlay}
          style={{
            width: '32px',
            height: '32px',
            border: '1px solid #ff0080',
            background: isPlaying ? '#ff0080' : 'transparent',
            color: isPlaying ? '#000' : '#ff0080',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        {/* Barre de progression */}
        <div 
          style={{
            flex: 1,
            height: '8px',
            border: '1px solid #333',
            cursor: 'pointer',
            position: 'relative',
            background: '#111'
          }}
          onClick={handleSeek}
        >
          <div 
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #ff0080, #00ff80)',
              width: `${progressPercent}%`,
              transition: 'width 0.1s'
            }}
          />
        </div>
        
        {/* Temps */}
        <div style={{
          fontSize: '10px',
          minWidth: '65px',
          textAlign: 'right',
          color: '#ccc'
        }}>
          {formatTime(currentTime)}/{formatTime(duration)}
        </div>
      </div>

      {/* Contrôle de volume local */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '10px'
      }}>
        <span style={{ color: '#666' }}>GAIN:</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={internalVolume}
          onChange={handleVolumeSlider}
          style={{
            flex: 1,
            height: '4px',
            background: '#333',
            outline: 'none'
          }}
        />
        <span style={{ 
          minWidth: '30px', 
          color: '#666' 
        }}>
          {Math.round(internalVolume * 100)}%
        </span>
      </div>

      {/* Indicateur de proximité */}
      {volume < 1 && (
        <div style={{
          marginTop: '8px',
          fontSize: '9px',
          color: '#666',
          textAlign: 'center',
          borderTop: '1px solid #333',
          paddingTop: '6px'
        }}>
          Distance: {Math.round((1 - volume) * 100)}% de la source
        </div>
      )}
    </div>
  );
}
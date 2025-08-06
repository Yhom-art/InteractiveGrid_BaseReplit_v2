import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function AudioPlayer({ 
  audioUrl, 
  title = "Audio", 
  onPlay, 
  onPause, 
  onTimeUpdate 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(audio.currentTime, audio.duration);
      }
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
  }, [audioUrl, onTimeUpdate]);

  const togglePlay = async () => {
    console.log("🎵 AUDIO: Clic sur bouton play détecté !");
    console.log("🎵 AUDIO: audioRef.current:", audioRef.current);
    console.log("🎵 AUDIO: audioUrl:", audioUrl);
    console.log("🎵 AUDIO: isPlaying:", isPlaying);
    
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      console.log("❌ AUDIO: Pas de référence audio ou URL manquante !");
      return;
    }

    try {
      if (isPlaying) {
        console.log("⏸️ AUDIO: Pause de la lecture");
        audio.pause();
        setIsPlaying(false);
        if (onPause) onPause();
      } else {
        console.log("▶️ AUDIO: Démarrage de la lecture");
        await audio.play();
        console.log("✅ AUDIO: Lecture démarrée avec succès");
        setIsPlaying(true);
        if (onPlay) onPlay();
      }
    } catch (error) {
      console.error('❌ AUDIO: Erreur lecture audio:', error);
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    return (
      <div style={{
        border: '1px solid #000',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '11px',
        textAlign: 'center'
      }}>
        Aucun audio
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '80px', // Hauteur minimum standardisée
      fontFamily: 'monospace',
      fontSize: '11px',
      lineHeight: '1.2',
      position: 'relative',
      zIndex: 200, // Au-dessus des zones d'interaction
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      {/* Audio element caché */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Titre */}
      <div style={{
        marginBottom: '8px',
        fontWeight: 'bold',
        fontSize: '12px'
      }}>
        {title}
      </div>
      
      {/* Contrôles */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid #000',
        padding: '6px',
        position: 'relative',
        zIndex: 201 // Encore plus haut pour les contrôles
      }}>
        {/* Bouton Play/Pause */}
        <button
          onClick={togglePlay}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          style={{
            width: '24px',
            height: '24px',
            border: '1px solid #000',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            padding: '0',
            position: 'relative',
            zIndex: 202
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        {/* Barre de progression */}
        <div 
          style={{
            flex: 1,
            height: '6px',
            border: '1px solid #000',
            cursor: 'pointer',
            position: 'relative',
            background: 'white',
            zIndex: 202
          }}
          onClick={handleSeek}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div 
            style={{
              height: '100%',
              background: '#000',
              width: `${progressPercent}%`,
              transition: 'width 0.1s',
              pointerEvents: 'none'
            }}
          />
        </div>
        
        {/* Temps */}
        <div style={{
          fontSize: '10px',
          minWidth: '60px',
          textAlign: 'right'
        }}>
          {formatTime(currentTime)}/{formatTime(duration)}
        </div>
      </div>
    </div>
  );
}
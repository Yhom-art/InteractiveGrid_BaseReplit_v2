import { useRef, useEffect, useState, useCallback } from 'react';

interface MusicContainerProps {
  containerId: number;
  title: string;
  audioUrl: string;
  loop: boolean;
  isVisible: boolean;
  artist?: string;
  onVolumeChange?: (volume: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  triggerPlay?: boolean;
  spatialDistance?: number;
}

export function MusicContainer({
  containerId,
  title,
  audioUrl,
  loop,
  isVisible,
  artist,
  onVolumeChange,
  onPlayStateChange,
  triggerPlay = false,
  spatialDistance = 0
}: MusicContainerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [heartCount, setHeartCount] = useState(0);
  const [isHearted, setIsHearted] = useState(false);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0);
  const [pulseOpacity, setPulseOpacity] = useState(0);
  const targetVolumeRef = useRef<number>(0);
  const targetOpacityRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const opacityAnimationFrameRef = useRef<number>();
  const pulseAnimationRef = useRef<number>();

  // Initialisation de l'élément audio
  useEffect(() => {
    if (!audioRef.current && isVisible) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = loop;
      audioRef.current.preload = 'metadata';
      
      // Événements audio
      const handlePlay = () => {
        setIsPlaying(true);
        onPlayStateChange?.(true);
      };
      
      const handlePause = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        onPlayStateChange?.(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      };
      
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      
      setIsConfigured(true);
      console.log(`🎵 MusicContainer ${containerId} "${title}" configuré`);
      
      // Cleanup
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('play', handlePlay);
          audioRef.current.removeEventListener('pause', handlePause);
          audioRef.current.removeEventListener('ended', handleEnded);
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    }
  }, [containerId, audioUrl, loop, isVisible, title, onPlayStateChange]);

  // Gestion de la spatialisation par distance
  useEffect(() => {
    if (audioRef.current && isConfigured) {
      // Calcul du volume spatial basé sur la distance
      let spatialVolume = 0;
      
      const maxDistance = 500; // Distance maximale d'audibilité (0%) - équivalent d'une cellule
      const minDistance = 60;  // Distance minimale pour volume maximum (100%)

      if (spatialDistance <= minDistance) {
        spatialVolume = 1; // 100% volume au plus proche
      } else if (spatialDistance <= maxDistance) {
        // Diminution linéaire progressive du volume de 100% à 0%
        const distanceRange = maxDistance - minDistance; // 320px de portée
        const currentDistance = spatialDistance - minDistance;
        spatialVolume = Math.max(0, 1 - (currentDistance / distanceRange));
      } else {
        spatialVolume = 0; // 0% volume au-delà de la distance max
      }
      
      // S'assurer que le volume reste dans [0, 1]
      spatialVolume = Math.max(0, Math.min(1, spatialVolume));
      
      // Stocker le volume cible et l'opacité cible (même valeur)
      targetVolumeRef.current = spatialVolume;
      targetOpacityRef.current = spatialVolume;
      
      // Annuler les animations précédentes
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (opacityAnimationFrameRef.current) {
        cancelAnimationFrame(opacityAnimationFrameRef.current);
      }
      
      // Fonction de lissage du volume
      const smoothVolumeTransition = () => {
        if (!audioRef.current) return;
        
        const currentVolume = audioRef.current.volume;
        const targetVolume = targetVolumeRef.current;
        const difference = targetVolume - currentVolume;
        
        // Facteur de lissage (plus petit = plus lisse)
        const smoothingFactor = 0.1;
        
        if (Math.abs(difference) > 0.001) {
          const newVolume = currentVolume + (difference * smoothingFactor);
          audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
          setVolume(newVolume);
          onVolumeChange?.(newVolume);
          
          // Continuer l'animation
          animationFrameRef.current = requestAnimationFrame(smoothVolumeTransition);
        } else {
          // Finaliser au volume exact
          audioRef.current.volume = targetVolume;
          setVolume(targetVolume);
          onVolumeChange?.(targetVolume);
        }
      };
      
      // Fonction de lissage de l'opacité du background
      const smoothOpacityTransition = () => {
        const currentOpacity = backgroundOpacity;
        const targetOpacity = targetOpacityRef.current;
        const difference = targetOpacity - currentOpacity;
        
        // Facteur de lissage (plus petit = plus lisse)
        const smoothingFactor = 0.1;
        
        if (Math.abs(difference) > 0.001) {
          const newOpacity = currentOpacity + (difference * smoothingFactor);
          setBackgroundOpacity(Math.max(0, Math.min(1, newOpacity)));
          
          // Continuer l'animation
          opacityAnimationFrameRef.current = requestAnimationFrame(smoothOpacityTransition);
        } else {
          // Finaliser à l'opacité exacte
          setBackgroundOpacity(targetOpacity);
        }
      };
      
      // Démarrer les transitions lissées
      animationFrameRef.current = requestAnimationFrame(smoothVolumeTransition);
      opacityAnimationFrameRef.current = requestAnimationFrame(smoothOpacityTransition);
    }
  }, [spatialDistance, isConfigured, onVolumeChange, backgroundOpacity]);

  // Déclenchement Play on Move
  useEffect(() => {
    if (triggerPlay && audioRef.current && isConfigured && !isPlaying) {
      console.log(`🎵 TRIGGER PLAY pour container ${containerId}`);
      audioRef.current.play().catch(err => {
        console.warn(`Erreur lecture audio container ${containerId}:`, err);
      });
    }
  }, [triggerPlay, containerId, isConfigured, isPlaying]);

  // Fonction toggle pour contrôle manuel
  const togglePlay = useCallback(() => {
    if (audioRef.current && isConfigured) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.warn(`Erreur lecture audio container ${containerId}:`, err);
        });
      }
    }
  }, [isPlaying, containerId, isConfigured]);

  // Animation de pulsation continue
  useEffect(() => {
    let startTime = Date.now();
    
    const animatePulse = () => {
      const elapsed = Date.now() - startTime;
      const cycle = (elapsed % 1500) / 1500; // Cycle plus rapide de 1.5 secondes
      const pulse = (Math.sin(cycle * Math.PI * 2) + 1) / 2; // Oscillation entre 0 et 1
      const intensity = pulse * backgroundOpacity * 0.6; // Maximum 60% d'intensité basé sur la proximité
      
      setPulseOpacity(intensity);
      pulseAnimationRef.current = requestAnimationFrame(animatePulse);
    };
    
    pulseAnimationRef.current = requestAnimationFrame(animatePulse);
    
    return () => {
      if (pulseAnimationRef.current) {
        cancelAnimationFrame(pulseAnimationRef.current);
      }
    };
  }, [backgroundOpacity]);

  // Nettoyage des animations au démontage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (opacityAnimationFrameRef.current) {
        cancelAnimationFrame(opacityAnimationFrameRef.current);
      }
      if (pulseAnimationRef.current) {
        cancelAnimationFrame(pulseAnimationRef.current);
      }
    };
  }, []);

  // Gestion du cœur/like
  const toggleHeart = useCallback(() => {
    if (!isHearted) {
      setHeartCount(prev => prev + 1);
      setIsHearted(true);
    }
  }, [isHearted]);

  // Formatage du temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  const volumePercentage = Math.round(volume * 100);
  const volumeLevel = Math.ceil((volume * 5)); // 0-5 barres

  return (
    <div 
      className="music-container-ui"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `rgba(255, 20, 147, ${backgroundOpacity})`, // Rose fuchsia avec opacité variable
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '8px',
        pointerEvents: 'auto',
        color: 'white'
      }}
      data-cursor-type="panel"
      data-container-type="music"
      data-music-id={containerId}
    >
      {/* Couche de pulsation avec dégradé radial */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at center, rgba(255, 20, 147, ${pulseOpacity}) 0%, rgba(255, 20, 147, ${pulseOpacity * 0.7}) 30%, rgba(255, 20, 147, ${pulseOpacity * 0.3}) 60%, transparent 80%)`,
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Timer en haut (plus petit) */}
      <div style={{
        fontSize: '10px',
        fontFamily: 'monospace',
        textAlign: 'center',
        lineHeight: '1',
        position: 'relative',
        zIndex: 2
      }}>
        {formatTime(currentTime)}
      </div>

      {/* Titre en dessous avec plus d'espacement */}
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        textAlign: 'center',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        marginTop: '4px',
        lineHeight: '1',
        position: 'relative',
        zIndex: 2
      }}>
        {title}
      </div>

      {/* Ligne de contrôle horizontale */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: '20px',
        paddingRight: '20px',
        marginTop: '0px',
        width: '100%',
        height: '32px',
        boxSizing: 'border-box',
        position: 'absolute',
        top: '50%',
        left: '0',
        transform: 'translateY(-50%)',
        zIndex: 2
      }}>
        {/* Filet horizontal reliant pause et play */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          right: '20px',
          height: '1px',
          backgroundColor: 'white',
          transform: 'translateY(-0.5px)',
          zIndex: 1
        }} />
        {/* Bouton Pause */}
        <button
          onClick={togglePlay}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            position: 'absolute',
            left: '16px',
            zIndex: 2
          }}
          title="Pause"
        >
          <img 
            src="/attached_assets/Yhom_PictosMarket/Player_Pause.svg" 
            style={{ width: '14px', height: '14px' }}
            alt="pause"
          />
        </button>

        {/* Bouton Cœur - centré */}
        <button
          onClick={toggleHeart}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            position: 'absolute',
            left: '50%',
            top: '2px',
            transform: 'translateX(-50%)',
            zIndex: 2
          }}
          title="Like"
        >
          <img 
            src={`/attached_assets/Yhom_PictosMarket/Player_${isHearted ? 'Loved' : 'ToLove'}.svg`}
            style={{ width: '28px', height: '28px' }}
            alt="heart"
          />
        </button>

        {/* Bouton Play - tout à droite */}
        <button
          onClick={togglePlay}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16px',
            height: '16px',
            position: 'absolute',
            right: '16px',
            zIndex: 2
          }}
          title="Play"
        >
          <img 
            src="/attached_assets/Yhom_PictosMarket/Player_Play.svg" 
            style={{ width: '16px', height: '16px' }}
            alt="play"
          />
        </button>
      </div>

      {/* Crédit en bas - position absolue */}
      <div style={{
        fontSize: '9px',
        textAlign: 'center',
        opacity: 0.9,
        lineHeight: '1.2',
        position: 'absolute',
        bottom: '8px',
        left: '8px',
        right: '8px',
        zIndex: 3
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>{heartCount}</span> THXS TO
        </div>
        <div style={{ marginTop: '1px' }}>
          {artist || 'CREATOR'}
        </div>
      </div>

      {/* Indicateur de volume (masqué dans la nouvelle interface) */}
      <div style={{ display: 'none' }}>
        {[1, 2, 3, 4, 5].map(bar => (
          <div key={bar} />
        ))}
      </div>
    </div>
  );
}
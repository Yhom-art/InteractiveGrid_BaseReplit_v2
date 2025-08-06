import { useRef, useEffect } from 'react';

// Gestionnaire global pour éviter les conflits entre lecteurs audio
class AudioManager {
  private currentPlayer: HTMLAudioElement | null = null;
  private currentPlayerId: string | null = null;
  private spatialAudioRef: HTMLAudioElement | null = null;

  setSpatialAudioRef(audioRef: HTMLAudioElement): void {
    this.spatialAudioRef = audioRef;
    console.log('🎵 MANAGER: Audio spatial enregistré');
  }

  playSpatialAudio(): Promise<void> {
    if (!this.spatialAudioRef) {
      throw new Error('Audio spatial non configuré');
    }
    
    // Arrêter les autres lecteurs
    if (this.currentPlayer && this.currentPlayer !== this.spatialAudioRef) {
      console.log('🎵 MANAGER: Arrêt du lecteur panel pour audio spatial');
      this.currentPlayer.pause();
    }
    
    this.currentPlayer = this.spatialAudioRef;
    this.currentPlayerId = 'spatial-audio';
    
    console.log('🎵 MANAGER: Démarrage audio spatial');
    return this.spatialAudioRef.play();
  }

  playAudio(audioElement: HTMLAudioElement, playerId: string): Promise<void> {
    console.log(`🎵 MANAGER: Tentative de lecture ${playerId}`);
    
    // Arrêter TOUS les autres lecteurs, y compris l'audio spatial
    if (this.currentPlayer && this.currentPlayer !== audioElement) {
      console.log('🎵 MANAGER: Arrêt du lecteur précédent');
      this.currentPlayer.pause();
    }
    
    if (this.spatialAudioRef && this.spatialAudioRef !== audioElement) {
      console.log('🎵 MANAGER: Arrêt de l\'audio spatial');
      this.spatialAudioRef.pause();
    }

    this.currentPlayer = audioElement;
    this.currentPlayerId = playerId;
    
    return audioElement.play();
  }

  pauseAudio(audioElement: HTMLAudioElement, playerId: string): void {
    if (this.currentPlayer === audioElement && this.currentPlayerId === playerId) {
      audioElement.pause();
      this.currentPlayer = null;
      this.currentPlayerId = null;
    }
  }

  stopAllAudio(): void {
    if (this.currentPlayer) {
      this.currentPlayer.pause();
      this.currentPlayer = null;
      this.currentPlayerId = null;
    }
  }

  isCurrentPlayer(playerId: string): boolean {
    return this.currentPlayerId === playerId;
  }
}

// Instance globale unique
const audioManager = new AudioManager();

export function useAudioManager(playerId: string) {
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    // Enregistrer l'audio spatial dans le gestionnaire global
    if (playerId === 'spatial-audio') {
      audioManager.setSpatialAudioRef(audioRef.current);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [playerId]);

  const playAudio = async (): Promise<void> => {
    if (audioRef.current) {
      return audioManager.playAudio(audioRef.current, playerId);
    }
  };

  const playSpatialAudio = async (): Promise<void> => {
    return audioManager.playSpatialAudio();
  };

  const pauseAudio = (): void => {
    if (audioRef.current) {
      audioManager.pauseAudio(audioRef.current, playerId);
    }
  };

  const stopAllAudio = (): void => {
    audioManager.stopAllAudio();
  };

  const isCurrentPlayer = (): boolean => {
    return audioManager.isCurrentPlayer(playerId);
  };

  return {
    audioRef,
    playAudio,
    playSpatialAudio,
    pauseAudio,
    stopAllAudio,
    isCurrentPlayer
  };
}
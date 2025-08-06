import { useState, useEffect, useRef, useCallback } from 'react';
import { MusicComponent } from '@shared/schema';
import { useMultipleProximityVolumes } from './useProximityVolume';

interface MusicSource {
  id: string;
  musicData: MusicComponent;
  position: { x: number; y: number };
  isPlaying: boolean;
  audioRef?: HTMLAudioElement;
}

export function useMusicManager() {
  const [musicSources, setMusicSources] = useState<Record<string, MusicSource>>({});
  const [globalMuted, setGlobalMuted] = useState(false);
  const audioRefsRef = useRef<Record<string, HTMLAudioElement>>({});

  // Calculer les positions et volumes de proximité pour toutes les sources
  const proximityData = useMultipleProximityVolumes(
    Object.values(musicSources).map(source => ({
      id: source.id,
      position: source.position,
      options: {
        maxDistance: source.musicData.proximitySettings?.maxDistance || 500,
        falloffCurve: source.musicData.proximitySettings?.falloffCurve || 'smooth',
        minVolume: source.musicData.proximitySettings?.minVolume || 0.1
      }
    }))
  );

  // Appliquer les volumes de proximité aux éléments audio
  useEffect(() => {
    Object.entries(proximityData.volumes).forEach(([sourceId, volume]) => {
      const audioRef = audioRefsRef.current[sourceId];
      if (audioRef && !globalMuted) {
        audioRef.volume = volume;
      }
    });
  }, [proximityData.volumes, globalMuted]);

  // Couper/remettre le son global
  useEffect(() => {
    Object.values(audioRefsRef.current).forEach(audioRef => {
      if (globalMuted) {
        audioRef.volume = 0;
      } else {
        const sourceId = Object.keys(audioRefsRef.current).find(
          id => audioRefsRef.current[id] === audioRef
        );
        if (sourceId && proximityData.volumes[sourceId] !== undefined) {
          audioRef.volume = proximityData.volumes[sourceId];
        }
      }
    });
  }, [globalMuted, proximityData.volumes]);

  const registerMusicSource = useCallback((
    id: string,
    musicData: MusicComponent,
    position: { x: number; y: number }
  ) => {
    setMusicSources(prev => ({
      ...prev,
      [id]: {
        id,
        musicData,
        position,
        isPlaying: false
      }
    }));
  }, []);

  const unregisterMusicSource = useCallback((id: string) => {
    setMusicSources(prev => {
      const { [id]: removed, ...rest } = prev;
      return rest;
    });
    
    // Nettoyer la référence audio
    if (audioRefsRef.current[id]) {
      delete audioRefsRef.current[id];
    }
  }, []);

  const updateMusicPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setMusicSources(prev => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], position } : prev[id]
    }));
  }, []);

  const setAudioRef = useCallback((id: string, audioElement: HTMLAudioElement | null) => {
    if (audioElement) {
      audioRefsRef.current[id] = audioElement;
    } else if (audioRefsRef.current[id]) {
      delete audioRefsRef.current[id];
    }
  }, []);

  const playMusic = useCallback((id: string) => {
    setMusicSources(prev => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], isPlaying: true } : prev[id]
    }));
  }, []);

  const pauseMusic = useCallback((id: string) => {
    setMusicSources(prev => ({
      ...prev,
      [id]: prev[id] ? { ...prev[id], isPlaying: false } : prev[id]
    }));
  }, []);

  const pauseAllMusic = useCallback(() => {
    Object.values(audioRefsRef.current).forEach(audioRef => {
      audioRef.pause();
    });
    
    setMusicSources(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(id => {
        updated[id] = { ...updated[id], isPlaying: false };
      });
      return updated;
    });
  }, []);

  const getActiveSources = useCallback(() => {
    return Object.values(musicSources).filter(source => source.isPlaying);
  }, [musicSources]);

  const getSourcesInRange = useCallback(() => {
    return Object.entries(proximityData.distances)
      .filter(([_, distance]) => distance <= 500) // Distance par défaut
      .map(([id]) => musicSources[id])
      .filter(Boolean);
  }, [proximityData.distances, musicSources]);

  return {
    musicSources,
    proximityData,
    globalMuted,
    setGlobalMuted,
    registerMusicSource,
    unregisterMusicSource,
    updateMusicPosition,
    setAudioRef,
    playMusic,
    pauseMusic,
    pauseAllMusic,
    getActiveSources,
    getSourcesInRange
  };
}
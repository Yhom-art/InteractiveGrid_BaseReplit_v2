import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface ProximityVolumeOptions {
  maxDistance?: number; // Distance maximale d'audibilité (en pixels)
  falloffCurve?: 'linear' | 'exponential' | 'smooth';
  minVolume?: number; // Volume minimum (même à distance maximale)
  updateInterval?: number; // Intervalle de mise à jour en ms
}

export function useProximityVolume(
  sourcePosition: Position,
  options: ProximityVolumeOptions = {}
) {
  const {
    maxDistance = 500,
    falloffCurve = 'smooth',
    minVolume = 0,
    updateInterval = 100
  } = options;

  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [volume, setVolume] = useState(1);
  const [distance, setDistance] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculer la distance entre deux points
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculer le volume basé sur la distance
  const calculateVolume = (dist: number): number => {
    if (dist >= maxDistance) return minVolume;
    
    const normalizedDistance = dist / maxDistance;
    let volumeRatio: number;

    switch (falloffCurve) {
      case 'linear':
        volumeRatio = 1 - normalizedDistance;
        break;
      case 'exponential':
        volumeRatio = Math.pow(1 - normalizedDistance, 2);
        break;
      case 'smooth':
      default:
        // Courbe smooth step pour une transition plus naturelle
        volumeRatio = 1 - (3 * Math.pow(normalizedDistance, 2) - 2 * Math.pow(normalizedDistance, 3));
        break;
    }

    return Math.max(minVolume, volumeRatio);
  };

  // Suivre la position de la souris
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculer le volume et la distance périodiquement
  useEffect(() => {
    const updateVolumeAndDistance = () => {
      const currentDistance = calculateDistance(mousePosition, sourcePosition);
      const currentVolume = calculateVolume(currentDistance);
      
      setDistance(currentDistance);
      setVolume(currentVolume);
    };

    // Calcul initial
    updateVolumeAndDistance();

    // Mise à jour périodique
    intervalRef.current = setInterval(updateVolumeAndDistance, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mousePosition, sourcePosition, maxDistance, falloffCurve, minVolume, updateInterval]);

  return {
    volume,
    distance,
    mousePosition,
    sourcePosition,
    maxDistance,
    isInRange: distance <= maxDistance
  };
}

// Hook pour gérer plusieurs sources audio avec leurs positions
export function useMultipleProximityVolumes(
  sources: Array<{ id: string; position: Position; options?: ProximityVolumeOptions }>
) {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [distances, setDistances] = useState<Record<string, number>>({});

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateAll = () => {
      const newVolumes: Record<string, number> = {};
      const newDistances: Record<string, number> = {};

      sources.forEach(({ id, position, options = {} }) => {
        const {
          maxDistance = 500,
          falloffCurve = 'smooth',
          minVolume = 0
        } = options;

        const dx = mousePosition.x - position.x;
        const dy = mousePosition.y - position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let volume = minVolume;
        if (distance < maxDistance) {
          const normalizedDistance = distance / maxDistance;
          switch (falloffCurve) {
            case 'linear':
              volume = 1 - normalizedDistance;
              break;
            case 'exponential':
              volume = Math.pow(1 - normalizedDistance, 2);
              break;
            case 'smooth':
            default:
              volume = 1 - (3 * Math.pow(normalizedDistance, 2) - 2 * Math.pow(normalizedDistance, 3));
              break;
          }
          volume = Math.max(minVolume, volume);
        }

        newVolumes[id] = volume;
        newDistances[id] = distance;
      });

      setVolumes(newVolumes);
      setDistances(newDistances);
    };

    updateAll();
    const interval = setInterval(updateAll, 100);

    return () => clearInterval(interval);
  }, [mousePosition, sources]);

  return {
    volumes,
    distances,
    mousePosition
  };
}
import { useQuery } from '@tanstack/react-query';
import { Chimera } from '@shared/schema';

/**
 * Hook pour récupérer la liste des chimères depuis l'API
 */
export function useChimeras() {
  return useQuery<Chimera[]>({
    queryKey: ['/api/chimeras'],
    queryFn: async () => {
      const response = await fetch('/api/chimeras');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des chimères');
      }
      
      return response.json();
    },
  });
}

/**
 * Hook pour récupérer une chimère spécifique par son ID
 */
export function useChimera(id: number | null) {
  return useQuery<Chimera>({
    queryKey: ['/api/chimeras', id],
    queryFn: async () => {
      if (id === null) {
        throw new Error('ID de chimère non spécifié');
      }
      
      const response = await fetch(`/api/chimeras/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération de la chimère ${id}`);
      }
      
      return response.json();
    },
    enabled: id !== null,
  });
}
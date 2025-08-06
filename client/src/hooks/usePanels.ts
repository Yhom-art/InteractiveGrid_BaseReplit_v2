import { useQuery } from '@tanstack/react-query';
import { Panel } from '@shared/schema';

/**
 * Hook pour récupérer les panels associés à une chimère spécifique
 * @param chimeraId ID de la chimère pour laquelle récupérer les panels
 */
export function usePanelsByChimera(chimeraId: number | null) {
  return useQuery<Panel[]>({
    queryKey: ['/api/panels', 'by-chimera', chimeraId],
    queryFn: async () => {
      if (chimeraId === null) {
        return [];
      }
      
      const response = await fetch(`/api/panels?chimeraId=${chimeraId}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des panels pour la chimère ${chimeraId}`);
      }
      
      return response.json();
    },
    enabled: chimeraId !== null,
  });
}

/**
 * Hook pour récupérer un panel spécifique par son ID
 */
export function usePanel(id: number | string | null) {
  return useQuery<Panel>({
    queryKey: ['/api/panels', id],
    queryFn: async () => {
      if (id === null) {
        throw new Error('ID de panel non spécifié');
      }
      
      const response = await fetch(`/api/panels/${id}`);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération du panel ${id}`);
      }
      
      return response.json();
    },
    enabled: id !== null,
  });
}

/**
 * Hook pour récupérer tous les panels disponibles
 */
export function usePanels() {
  return useQuery<Panel[]>({
    queryKey: ['/api/panels'],
    queryFn: async () => {
      const response = await fetch('/api/panels');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des panels');
      }
      
      // Récupérer les panels de base
      const panels = await response.json();
      
      // Pour chaque panel, récupérer ses composants
      const panelsWithComponents = await Promise.all(
        panels.map(async (panel: Panel) => {
          const detailResponse = await fetch(`/api/panels/${panel.id}`);
          if (detailResponse.ok) {
            return await detailResponse.json();
          }
          return panel;
        })
      );
      
      return panelsWithComponents;
    },
  });
}
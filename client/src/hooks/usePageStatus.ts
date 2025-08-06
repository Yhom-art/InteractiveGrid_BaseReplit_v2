import { useQuery } from '@tanstack/react-query';
import { PAGE_STATUS_CONFIG } from '@/pages/admin/AdminHomePage';

// Hook pour valider automatiquement le statut d'une page
export const usePageStatus = (route: string) => {
  return useQuery({
    queryKey: ['page-status', route],
    queryFn: async () => {
      const config = PAGE_STATUS_CONFIG[route as keyof typeof PAGE_STATUS_CONFIG];
      if (!config) return { status: 'unknown', isValid: false };

      // Pour les pages "indexed", pas de validation
      if (config.status === 'indexed') {
        return { status: 'indexed', isValid: true, needsComponent: true };
      }

      try {
        // Test de connectivité selon le type de page
        switch (config.type) {
          case 'DATABASE':
            // Vérifier les APIs de base de données
            const dbTests = await Promise.allSettled([
              fetch('/api/music-containers').then(r => r.ok),
              fetch('/api/cursors-v2').then(r => r.ok),
              fetch('/api/container-layer-configurations').then(r => r.ok)
            ]);
            const dbConnected = dbTests.some(test => test.status === 'fulfilled' && test.value);
            return { 
              status: dbConnected ? '✓' : 'beta', 
              isValid: dbConnected,
              lastChecked: new Date().toISOString()
            };

          case 'GRID':
            // Vérifier les APIs de grille
            const gridTest = await fetch('/api/grid-v3-config/market-castings').then(r => r.ok);
            return { 
              status: gridTest ? '✓' : 'beta', 
              isValid: gridTest,
              lastChecked: new Date().toISOString()
            };

          case 'SETTINGS':
            // Vérifier les APIs de paramètres
            const settingsTests = await Promise.allSettled([
              fetch('/api/cursors-v2').then(r => r.ok),
              fetch('/api/menu-roue-config').then(r => r.ok)
            ]);
            const settingsConnected = settingsTests.some(test => test.status === 'fulfilled' && test.value);
            return { 
              status: settingsConnected ? '✓' : 'beta', 
              isValid: settingsConnected,
              lastChecked: new Date().toISOString()
            };

          default:
            return { 
              status: config.status, 
              isValid: config.hasComponent,
              lastChecked: new Date().toISOString()
            };
        }
      } catch (error) {
        console.warn(`Page status validation failed for ${route}:`, error);
        return { 
          status: 'beta', 
          isValid: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date().toISOString()
        };
      }
    },
    refetchInterval: 30000, // Re-vérifier toutes les 30 secondes
    staleTime: 15000 // Données considérées fraîches pendant 15 secondes
  });
};

// Hook pour obtenir un résumé global des statuts
export const useGlobalPageStatus = () => {
  const routes = Object.keys(PAGE_STATUS_CONFIG);
  
  return useQuery({
    queryKey: ['global-page-status'],
    queryFn: async () => {
      const results = await Promise.allSettled(
        routes.map(async (route) => {
          const config = PAGE_STATUS_CONFIG[route as keyof typeof PAGE_STATUS_CONFIG];
          if (config.status === 'indexed') return { route, status: 'indexed' };
          
          try {
            // Test rapide de connectivité
            const response = await fetch(`${route.replace('/admin', '/api')}`, { 
              method: 'HEAD',
              signal: AbortSignal.timeout(2000)
            });
            return { 
              route, 
              status: response.ok ? '✓' : 'beta',
              responseTime: Date.now()
            };
          } catch {
            return { route, status: 'beta' };
          }
        })
      );

      const summary = {
        total: routes.length,
        connected: 0,
        beta: 0,
        indexed: 0,
        lastUpdate: new Date().toISOString(),
        details: results.map(result => 
          result.status === 'fulfilled' ? result.value : { route: 'unknown', status: 'error' }
        )
      };

      summary.details.forEach(detail => {
        if (detail.status === '✓') summary.connected++;
        else if (detail.status === 'beta') summary.beta++;
        else if (detail.status === 'indexed') summary.indexed++;
      });

      return summary;
    },
    refetchInterval: 60000, // Re-vérifier toutes les minutes
    staleTime: 30000
  });
};
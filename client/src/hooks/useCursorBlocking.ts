import { useEffect, useState } from 'react';

export interface CursorBlockingOptions {
  disablePointerEvents?: boolean;
  disableTextSelection?: boolean;
  disableImageDrag?: boolean;
  disableContextMenu?: boolean;
  customCursor?: string;
}

/**
 * Hook pour gérer les blocages de curseurs système et appliquer des curseurs personnalisés
 */
export function useCursorBlocking(options: CursorBlockingOptions = {}) {
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (!isBlocking) return;

    const originalStyles = {
      userSelect: document.body.style.userSelect,
      pointerEvents: document.body.style.pointerEvents,
      cursor: document.body.style.cursor
    };

    // Appliquer les blocages
    if (options.disableTextSelection) {
      document.body.style.userSelect = 'none';
      (document.body.style as any).webkitUserSelect = 'none';
      (document.body.style as any).mozUserSelect = 'none';
      (document.body.style as any).msUserSelect = 'none';
    }

    if (options.disablePointerEvents) {
      document.body.style.pointerEvents = 'none';
    }

    if (options.customCursor) {
      document.body.style.cursor = options.customCursor;
      console.log(`🎯 CURSOR APPLIED TO BODY:`, options.customCursor);
      console.log(`🔍 Body cursor style:`, document.body.style.cursor);
      console.log(`🖱️ Cursor active on body element:`, document.body);
    }

    // Gestionnaires d'événements pour blocages avancés
    const handleContextMenu = (e: MouseEvent) => {
      if (options.disableContextMenu) {
        e.preventDefault();
      }
    };

    const handleDragStart = (e: DragEvent) => {
      if (options.disableImageDrag && (e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      if (options.disableTextSelection) {
        e.preventDefault();
      }
    };

    // Ajouter les écouteurs
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Nettoyage
    return () => {
      // Restaurer les styles originaux
      document.body.style.userSelect = originalStyles.userSelect;
      document.body.style.pointerEvents = originalStyles.pointerEvents;
      document.body.style.cursor = originalStyles.cursor;

      // Retirer les écouteurs
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [isBlocking, options]);

  return {
    enableBlocking: () => setIsBlocking(true),
    disableBlocking: () => setIsBlocking(false),
    isBlocking
  };
}

/**
 * Hook spécialisé pour l'administration avec curseur Admin depuis la base de données
 */
export function useAdminCursor(enabled: boolean = true) {
  const [adminCursorStyle, setAdminCursorStyle] = useState<string | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Écouter les changements globaux de curseur
  useEffect(() => {
    const handleCursorUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('cursor-admin-updated', handleCursorUpdate);
    return () => window.removeEventListener('cursor-admin-updated', handleCursorUpdate);
  }, []);

  useEffect(() => {
    console.log(`🔄 useAdminCursor hook called - enabled: ${enabled}, refreshTrigger: ${refreshTrigger}`);
    
    if (!enabled) {
      console.log(`❌ useAdminCursor disabled`);
      setAdminCursorStyle(undefined);
      return;
    }

    console.log(`🔍 Fetching cursor admin from database...`);
    
    // Récupérer le curseur admin et ses paramètres depuis la base de données
    Promise.all([
      fetch('/api/cursors-v2').then(res => res.json()),
      fetch('/api/cursor-sizes').then(res => res.json())
    ])
      .then(([cursors, sizes]) => {
        console.log(`📦 API Response - cursors:`, cursors.length, 'items');
        console.log(`📦 API Response - sizes:`, sizes.length, 'items');
        
        const adminCursor = cursors.find((cursor: any) => 
          cursor.name === 'Cursor Admin' && cursor.enabled
        );
        
        console.log(`🔍 Admin cursor found:`, adminCursor);
        
        if (adminCursor) {
          console.log(`📋 Using cursor assetPath: ${adminCursor.assetPath}`);
          
          // Chercher les paramètres de taille pour ce curseur (desktop par défaut)
          const cursorSizes = sizes.filter((size: any) => 
            size.cursor_sizes?.cursorId === adminCursor.id && 
            size.cursor_sizes?.deviceType === 'DESKTOP'
          );
          
          // IMPORTANT: Utiliser l'assetPath de la base de données au lieu du fallback
          let cursorStyle = `url(${adminCursor.assetPath}), auto`;
          
          // Si des paramètres de taille existent, les appliquer
          if (cursorSizes.length > 0) {
            const sizeConfig = cursorSizes[0].cursor_sizes;
            const size = sizeConfig.standardSize || 32;
            const offsetX = sizeConfig.offsetX || 0;
            const offsetY = sizeConfig.offsetY || 0;
            
            // Calculer le hotspot (centre + offset personnalisé)
            const hotspotX = (size / 2) + offsetX;
            const hotspotY = (size / 2) + offsetY;
            
            cursorStyle = `url(${adminCursor.assetPath}) ${hotspotX} ${hotspotY}, auto`;
            console.log(`⚙️ Applied cursor sizes - Size: ${size}, Offset: ${offsetX},${offsetY}, Hotspot: ${hotspotX},${hotspotY}`);
          }
          
          setAdminCursorStyle(cursorStyle);
          console.log(`✅ Curseur admin appliqué: ${cursorStyle}`);
          console.log(`🔗 AssetPath utilisé: ${adminCursor.assetPath}`);
        } else {
          // Fallback sur le curseur statique si aucun admin n'est trouvé
          const fallbackStyle = 'url(/src/assets/cursors/cursor-admin.svg), auto';
          setAdminCursorStyle(fallbackStyle);
          console.log(`⚠️ Fallback curseur admin: ${fallbackStyle}`);
        }
      })
      .catch((error) => {
        // Fallback en cas d'erreur
        const errorStyle = 'url(/src/assets/cursors/cursor-admin.svg), auto';
        setAdminCursorStyle(errorStyle);
        console.error(`❌ Erreur chargement curseur admin:`, error);
        console.log(`⚠️ Error fallback curseur admin: ${errorStyle}`);
      });
  }, [enabled, refreshTrigger]);

  return useCursorBlocking({
    disableTextSelection: true,
    disableImageDrag: true,
    disableContextMenu: false,
    customCursor: adminCursorStyle
  });
}

/**
 * Hook spécialisé pour la page d'accueil avec curseur Grab depuis la base de données
 */
export function useGrabCursor(enabled: boolean = true) {
  const [grabCursorStyle, setGrabCursorStyle] = useState<string | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Écouter les événements de mise à jour des curseurs
  useEffect(() => {
    const handleCursorUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('cursor-grab-updated', handleCursorUpdate);
    return () => window.removeEventListener('cursor-grab-updated', handleCursorUpdate);
  }, []);

  useEffect(() => {
    console.log(`🔄 useGrabCursor hook called - enabled: ${enabled}, refreshTrigger: ${refreshTrigger}`);
    
    if (!enabled) {
      console.log(`❌ useGrabCursor disabled`);
      setGrabCursorStyle(undefined);
      return;
    }

    console.log(`🔍 Fetching cursor grab from database...`);
    
    // Récupérer le curseur grab et ses paramètres depuis la base de données
    Promise.all([
      fetch('/api/cursors-v2').then(res => res.json()),
      fetch('/api/cursor-sizes').then(res => res.json())
    ])
      .then(([cursors, sizes]) => {
        console.log(`📦 API Response - cursors:`, cursors.length, 'items');
        console.log(`📦 API Response - sizes:`, sizes.length, 'items');
        
        const grabCursor = cursors.find((cursor: any) => 
          cursor.type === 'GRAB' && cursor.enabled
        );
        
        console.log(`🔍 Grab cursor found:`, grabCursor);
        
        if (grabCursor) {
          console.log(`📋 Using cursor assetPath: ${grabCursor.assetPath}`);
          
          // Chercher les paramètres de taille pour ce curseur (desktop par défaut)
          const cursorSizes = sizes.filter((size: any) => 
            size.cursor_sizes?.cursorId === grabCursor.id && 
            size.cursor_sizes?.deviceType === 'DESKTOP'
          );
          
          let cursorStyle = `url(${grabCursor.assetPath}), auto`;
          
          // Si des paramètres de taille existent, les appliquer
          if (cursorSizes.length > 0) {
            const sizeConfig = cursorSizes[0].cursor_sizes;
            const size = sizeConfig.standardSize || 32;
            const offsetX = sizeConfig.offsetX || 0;
            const offsetY = sizeConfig.offsetY || 0;
            
            // Calculer le hotspot (centre + offset personnalisé)
            const hotspotX = (size / 2) + offsetX;
            const hotspotY = (size / 2) + offsetY;
            
            cursorStyle = `url(${grabCursor.assetPath}) ${hotspotX} ${hotspotY}, auto`;
            console.log(`⚙️ Applied grab cursor sizes - Size: ${size}, Offset: ${offsetX},${offsetY}, Hotspot: ${hotspotX},${hotspotY}`);
          } else {
            // Créer des paramètres par défaut pour ce curseur s'ils n'existent pas
            console.log(`🔧 Creating default parameters for grab cursor ${grabCursor.id}`);
            fetch('/api/cursor-sizes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                cursorId: grabCursor.id,
                deviceType: 'DESKTOP',
                resolutionCategory: 'STANDARD',
                standardSize: 32,
                scale: 100,
                offsetX: 0,
                offsetY: 0,
                enabled: true
              })
            }).then(() => {
              console.log(`✅ Default parameters created for grab cursor`);
            }).catch(err => {
              console.error(`❌ Failed to create default parameters:`, err);
            });
          }
          
          setGrabCursorStyle(cursorStyle);
          console.log(`✅ Curseur grab appliqué: ${cursorStyle}`);
          console.log(`🔗 AssetPath utilisé: ${grabCursor.assetPath}`);
        } else {
          // Fallback sur le curseur statique si aucun grab n'est trouvé
          const fallbackStyle = 'url(/src/assets/cursors/cursor-grab.svg), auto';
          setGrabCursorStyle(fallbackStyle);
          console.log(`⚠️ Fallback curseur grab: ${fallbackStyle}`);
        }
      })
      .catch((error) => {
        // Fallback en cas d'erreur
        const errorStyle = 'url(/src/assets/cursors/cursor-grab.svg), auto';
        setGrabCursorStyle(errorStyle);
        console.error(`❌ Erreur chargement curseur grab:`, error);
        console.log(`⚠️ Error fallback curseur grab: ${errorStyle}`);
      });
  }, [enabled, refreshTrigger]);

  return useCursorBlocking({
    disableTextSelection: true,
    disableImageDrag: true,
    disableContextMenu: false,
    customCursor: grabCursorStyle
  });
}
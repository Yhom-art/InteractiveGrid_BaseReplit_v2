import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CursorV2 } from '@shared/schema';

/**
 * Hook pour le nouveau système de curseurs V2 basé sur la base de données
 */
export function useCursorV2(forceAdminMode = false) {
  const [activeCursor, setActiveCursor] = useState<CursorV2 | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Récupérer les curseurs actifs depuis la base de données
  const cursorsQuery = useQuery({
    queryKey: ['/api/cursors-v2'],
    queryFn: () => fetch('/api/cursors-v2').then(res => res.json())
  });

  const activeCursors = Array.isArray(cursorsQuery.data) 
    ? cursorsQuery.data.filter((cursor: CursorV2) => cursor.enabled).sort((a, b) => a.priority - b.priority)
    : [];

  // Déterminer le curseur par défaut selon le contexte
  const getDefaultCursor = () => {
    if (forceAdminMode) {
      // En mode admin : curseur Admin en priorité
      return activeCursors.find((cursor: CursorV2) => cursor.type === 'NAVIGATION') || activeCursors[0];
    } else {
      // En mode app : curseur Grab en priorité
      return activeCursors.find((cursor: CursorV2) => cursor.type === 'GRAB') || activeCursors[0];
    }
  };

  const defaultCursor = getDefaultCursor();

  useEffect(() => {
    if (defaultCursor && !activeCursor) {
      setActiveCursor(defaultCursor);
    }
  }, [defaultCursor, activeCursor, forceAdminMode]);

  // Gestion du suivi de la souris avec détection contextuelle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Détection du curseur contextuel basé sur les attributs data-cursor-type
      let element = e.target as HTMLElement;
      let cursorType: string | null = null;
      
      // Remonter l'arbre DOM pour trouver le premier élément avec data-cursor-type
      while (element && !cursorType) {
        cursorType = element.getAttribute('data-cursor-type');
        if (!cursorType && element.parentElement) {
          element = element.parentElement;
        } else {
          break;
        }
      }
      
      // Changer le curseur selon le contexte
      if (cursorType) {
        const contextCursor = activeCursors.find((cursor: CursorV2) => {
          switch (cursorType) {
            case 'navigation':
              return cursor.type === 'NAVIGATION';
            case 'grab':
              return cursor.type === 'GRAB';
            case 'adopt':
              return cursor.type === 'ADOPT';
            case 'meet':
              return cursor.type === 'FREE';
            case 'knok':
              return cursor.type === 'A_ADOPTER';
            default:
              return false;
          }
        });
        
        if (contextCursor && contextCursor.id !== activeCursor?.id) {
          setActiveCursor(contextCursor);
        }
      } else if (activeCursor?.id !== defaultCursor?.id) {
        // Retourner au curseur par défaut si aucun contexte spécifique
        setActiveCursor(defaultCursor);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeCursors, activeCursor, defaultCursor]);

  // Masquer le curseur natif du navigateur
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body, *, *:hover {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return {
    activeCursor,
    setActiveCursor,
    position,
    isVisible,
    activeCursors
  };
}
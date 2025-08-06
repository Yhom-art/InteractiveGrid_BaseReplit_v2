import React, { useState, useEffect, useRef } from 'react';

interface NameRevealAnimationProps {
  name: string;
  isVisible: boolean;
}

/**
 * Composant pour animer l'apparition du nom avec :
 * 1. Un effet de fade in synchronisé avec le zoom
 * 2. Un effet d'interlettrage qui se déploie naturellement
 * 
 * Version améliorée avec une approche impérative et un bouclage fonctionnel
 */
export function NameRevealAnimation({ name, isVisible }: NameRevealAnimationProps) {
  // États pour gérer l'animation
  const [opacity, setOpacity] = useState(0);
  const [letterSpacing, setLetterSpacing] = useState(0);
  
  // Référence pour savoir si l'animation est en cours
  const animatingRef = useRef(false);
  
  // Référence pour les timeouts
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Nettoyer les timeouts à la destruction
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // La fonction principale qui gère l'animation
  useEffect(() => {
    // Si le container est survolé et qu'aucune animation n'est en cours
    if (isVisible && !animatingRef.current) {
      // Marquer que l'animation est en cours
      animatingRef.current = true;
      console.log(`Démarrage animation pour ${name}`);
      
      // Fonction pour animer l'apparition du nom
      const animateNameReveal = () => {
        // Phase 1: Apparition avec écartement lettres
        const phaseAppear = () => {
          setOpacity(0);
          setLetterSpacing(0);
          
          timeoutRef.current = setTimeout(() => {
            setOpacity(0.5);
            setLetterSpacing(1);
            
            timeoutRef.current = setTimeout(() => {
              setOpacity(1);
              setLetterSpacing(2);
              
              timeoutRef.current = setTimeout(() => {
                setOpacity(1);
                setLetterSpacing(3);
                
                // Passer à la phase de maintien
                timeoutRef.current = setTimeout(phaseMaintain, 500);
              }, 150);
            }, 150);
          }, 150);
        };
        
        // Phase 2: Maintien de l'interlettrage maximal
        const phaseMaintain = () => {
          timeoutRef.current = setTimeout(() => {
            // Passer à la phase de retour
            phaseReturn();
          }, 1000);
        };
        
        // Phase 3: Retour progressif à l'interlettrage normal
        const phaseReturn = () => {
          setLetterSpacing(2.5);
          
          timeoutRef.current = setTimeout(() => {
            setLetterSpacing(2);
            
            timeoutRef.current = setTimeout(() => {
              setLetterSpacing(1.5);
              
              timeoutRef.current = setTimeout(() => {
                setLetterSpacing(1);
                
                timeoutRef.current = setTimeout(() => {
                  setLetterSpacing(0.5);
                  
                  timeoutRef.current = setTimeout(() => {
                    setLetterSpacing(0);
                    
                    // Passer à la phase de disparition
                    phaseFadeOut();
                  }, 150);
                }, 150);
              }, 150);
            }, 150);
          }, 150);
        };
        
        // Phase 4: Disparition finale
        const phaseFadeOut = () => {
          setOpacity(0.8);
          
          timeoutRef.current = setTimeout(() => {
            setOpacity(0.6);
            
            timeoutRef.current = setTimeout(() => {
              setOpacity(0.4);
              
              timeoutRef.current = setTimeout(() => {
                setOpacity(0.2);
                
                timeoutRef.current = setTimeout(() => {
                  setOpacity(0);
                  
                  // Animation terminée, on peut en redémarrer une
                  animatingRef.current = false;
                }, 150);
              }, 150);
            }, 150);
          }, 150);
        };
        
        // Démarrer l'animation complète
        phaseAppear();
      };
      
      // Lancer l'animation
      animateNameReveal();
    }
  }, [isVisible, name]);
  
  return (
    <div 
      className="font-mono font-bold text-black uppercase tracking-wider text-sm"
      style={{
        opacity: opacity,
        letterSpacing: `${letterSpacing}px`,
        transition: 'opacity 150ms ease-in-out, letter-spacing 150ms ease-in-out'
      }}
    >
      {name}
    </div>
  );
}

export default NameRevealAnimation;
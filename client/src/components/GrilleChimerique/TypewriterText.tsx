import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  name: string;  // Nom de la NFT
  isVisible: boolean;  // Si le container est survolé
}

/**
 * Version simplifiée avec une approche impérative pour l'animation
 * Séquence : FREE -> effacer -> [NOM] -> effacer -> FREE
 */
export function TypewriterText({ name, isVisible }: TypewriterTextProps) {
  // État du texte affiché
  const [displayText, setDisplayText] = useState("FREE");
  
  // Référence pour savoir si l'animation est en cours
  const animatingRef = useRef(false);
  
  // Référence pour le timeout actuel
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Référence pour le texte de la NFT
  const nftName = name || "DOUBLURE";
  
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
      console.log(`Démarrage animation pour ${nftName}`);
      
      // Fonction récursive pour l'animation
      const animateTypewriter = () => {
        // Phase 1: Effacement de FREE
        const eraseInitial = () => {
          setDisplayText("FRE");
          timeoutRef.current = setTimeout(() => {
            setDisplayText("FR");
            timeoutRef.current = setTimeout(() => {
              setDisplayText("F");
              timeoutRef.current = setTimeout(() => {
                setDisplayText("");
                timeoutRef.current = setTimeout(typeNftName, 300);
              }, 100);
            }, 100);
          }, 100);
        };
        
        // Phase 2: Écriture du nom NFT
        const typeNftName = () => {
          let currentIndex = 0;
          
          const typeNextLetter = () => {
            currentIndex++;
            // Si on n'a pas fini d'écrire le nom
            if (currentIndex <= nftName.length) {
              setDisplayText(nftName.slice(0, currentIndex));
              timeoutRef.current = setTimeout(typeNextLetter, 100);
            } else {
              // Pause avec le nom complet
              timeoutRef.current = setTimeout(eraseNftName, 1000);
            }
          };
          
          // Commencer avec la première lettre
          setDisplayText(nftName.slice(0, 1));
          timeoutRef.current = setTimeout(typeNextLetter, 100);
        };
        
        // Phase 3: Effacement du nom NFT
        const eraseNftName = () => {
          let currentLength = nftName.length;
          
          const eraseNextLetter = () => {
            currentLength--;
            // Si on n'a pas fini d'effacer
            if (currentLength >= 0) {
              setDisplayText(nftName.slice(0, currentLength));
              timeoutRef.current = setTimeout(eraseNextLetter, 100);
            } else {
              // Transition vers récriture de FREE
              timeoutRef.current = setTimeout(typeFree, 300);
            }
          };
          
          timeoutRef.current = setTimeout(eraseNextLetter, 100);
        };
        
        // Phase 4: Récriture de FREE
        const typeFree = () => {
          setDisplayText("F");
          timeoutRef.current = setTimeout(() => {
            setDisplayText("FR");
            timeoutRef.current = setTimeout(() => {
              setDisplayText("FRE");
              timeoutRef.current = setTimeout(() => {
                setDisplayText("FREE");
                // Animation terminée, on peut en redémarrer une
                animatingRef.current = false;
              }, 100);
            }, 100);
          }, 100);
        };
        
        // Démarrer l'animation complète
        timeoutRef.current = setTimeout(eraseInitial, 500);
      };
      
      // Lancer l'animation
      animateTypewriter();
    }
  }, [isVisible, nftName]);
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="relative font-mono font-medium text-white uppercase tracking-wider text-xs">
        <span>{displayText}</span>
        <span 
          className="absolute -right-1 top-0 w-[2px] h-[14px] bg-white"
          style={{ animation: 'blink-cursor 0.6s step-end infinite' }}
        ></span>
      </div>
    </div>
  );
}

export default TypewriterText;
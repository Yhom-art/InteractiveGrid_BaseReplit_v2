import React, { useState, useEffect, useRef } from 'react';

interface WhereIsAnimationProps {
  name: string;     // Nom de la NFT
  isVisible: boolean; // Si le container est survolé
}

/**
 * Animation avec effet de flou pour containers ADOPT
 * Séquence : 
 * - WHERE IS ? (alterne entre flou et net en état normal)
 * - Au survol: transition vers flou complet puis disparition
 * - Apparition du nom en typewriter
 * - Pause
 * - Effacement avec flou
 * - Réapparition de WHERE IS ? qui reprend son cycle
 */
export function WhereIsAnimation({ name, isVisible }: WhereIsAnimationProps) {
  // États pour gérer le texte et les animations
  const [displayText, setDisplayText] = useState("WHERE IS");
  const [showQuestion, setShowQuestion] = useState(true);
  const [blurAmount, setBlurAmount] = useState(0);
  const [opacity, setOpacity] = useState(1);
  
  // Référence pour savoir si l'animation est en cours
  const animatingRef = useRef(false);
  
  // Référence pour le timeout actuel
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Référence pour le texte de la NFT
  const nftName = name || "UNKNOWN";
  
  // État de l'animation
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'fadeOut' | 'typeName' | 'pause' | 'eraseName' | 'fadeIn'>('idle');
  
  // Nettoyer les timeouts à la destruction
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Animation de flou en état inactif (non survolé)
  useEffect(() => {
    if (!isVisible && animationPhase === 'idle') {
      // Animation de flou/non-flou en boucle
      const blurAnimation = () => {
        // Cycle du flou: 0px -> 2px -> 0px sur une période de 5 secondes
        const duration = 5000;
        const interval = 100;
        const steps = duration / interval;
        let step = 0;
        
        const animate = () => {
          step = (step + 1) % steps;
          // Calculer la valeur de flou avec une fonction sinusoïdale
          const blurValue = 2 * Math.sin((step / steps) * Math.PI * 2);
          setBlurAmount(Math.abs(blurValue));
          
          if (!isVisible && animationPhase === 'idle') {
            timeoutRef.current = setTimeout(animate, interval);
          }
        };
        
        animate();
      };
      
      blurAnimation();
    }
  }, [isVisible, animationPhase]);

  // Gérer la transition au survol
  useEffect(() => {
    if (isVisible && !animatingRef.current) {
      // Marquer que l'animation est en cours
      animatingRef.current = true;
      
      // Séquence d'animation
      const sequence = async () => {
        // Phase 1: WHERE IS devient flou et disparaît
        setAnimationPhase('fadeOut');
        let step = 0;
        const fadeOutSteps = 15;
        
        return new Promise<void>((resolve) => {
          const fadeOut = () => {
            step++;
            const progress = step / fadeOutSteps;
            setBlurAmount(8 * progress);
            setOpacity(1 - progress);
            
            if (step < fadeOutSteps) {
              timeoutRef.current = setTimeout(fadeOut, 40);
            } else {
              resolve();
            }
          };
          
          fadeOut();
        }).then(() => {
          // Phase 2: Affichage du nom en typewriter (sans flou)
          setAnimationPhase('typeName');
          setBlurAmount(0);
          setOpacity(1);
          setShowQuestion(false);
          setDisplayText("");
          
          return new Promise<void>((resolve) => {
            let currentIndex = 0;
            
            const typeNextLetter = () => {
              currentIndex++;
              
              if (currentIndex <= nftName.length) {
                setDisplayText(nftName.slice(0, currentIndex));
                const speed = 70 + Math.floor(currentIndex / nftName.length * 20);
                timeoutRef.current = setTimeout(typeNextLetter, speed);
              } else {
                // Pause avec le nom complet
                setAnimationPhase('pause');
                timeoutRef.current = setTimeout(() => resolve(), 1000);
              }
            };
            
            if (nftName.length > 0) {
              setDisplayText(nftName.slice(0, 1));
              timeoutRef.current = setTimeout(typeNextLetter, 70);
            } else {
              resolve();
            }
          });
        }).then(() => {
          // Phase 3: Effacement du nom avec flou
          setAnimationPhase('eraseName');
          let step = 0;
          const eraseSteps = 15;
          
          return new Promise<void>((resolve) => {
            const eraseWithBlur = () => {
              step++;
              const progress = step / eraseSteps;
              setBlurAmount(8 * progress);
              setOpacity(1 - progress);
              
              if (step < eraseSteps) {
                timeoutRef.current = setTimeout(eraseWithBlur, 40);
              } else {
                resolve();
              }
            };
            
            eraseWithBlur();
          });
        }).then(() => {
          // Phase 4: Réapparition de WHERE IS avec du flou qui diminue
          setAnimationPhase('fadeIn');
          setDisplayText("WHERE IS");
          setShowQuestion(true);
          setOpacity(0.2);
          let step = 0;
          const fadeInSteps = 15;
          
          return new Promise<void>((resolve) => {
            const fadeIn = () => {
              step++;
              const progress = step / fadeInSteps;
              setBlurAmount(8 * (1 - progress));
              setOpacity(0.2 + 0.8 * progress);
              
              if (step < fadeInSteps) {
                timeoutRef.current = setTimeout(fadeIn, 40);
              } else {
                resolve();
              }
            };
            
            fadeIn();
          });
        }).then(() => {
          // Animation terminée, retour à l'état idle
          setAnimationPhase('idle');
          animatingRef.current = false;
        });
      };
      
      sequence();
    }
  }, [isVisible, nftName]);
  
  // Pour les besoins de l'affichage, on décompose WHERE IS pour mieux contrôler l'espacement
  const renderText = () => {
    if (displayText === "WHERE IS") {
      return (
        <>
          <span>WHER</span>
          <span style={{ marginRight: '-0.2em' }}>E</span>
          <span> </span>
          <span style={{ marginLeft: '-0.2em' }}>I</span>
          <span>S</span>
        </>
      );
    } else if (displayText === "WHERE I") {
      return (
        <>
          <span>WHER</span>
          <span style={{ marginRight: '-0.2em' }}>E</span>
          <span> </span>
          <span style={{ marginLeft: '-0.2em' }}>I</span>
        </>
      );
    } else {
      return <span>{displayText}</span>;
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div 
        className="relative font-mono font-bold text-black uppercase text-xs"
        style={{ 
          filter: `blur(${blurAmount}px)`,
          opacity: opacity,
          transition: animationPhase === 'idle' ? 'filter 0.5s ease-in-out' : 'none'
        }}
      >
        {renderText()}
        {showQuestion && (
          <span 
            className="ml-1 blinking-question"
            style={{ fontWeight: 'bold', fontSize: 'inherit' }}
          >?</span>
        )}
      </div>
    </div>
  );
}

export default WhereIsAnimation;
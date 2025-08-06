import React, { useState, useEffect, useRef } from 'react';

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
export function BlurWhereIsAnimation({ name, isVisible }) {
  // États pour gérer le texte et les animations
  const [displayText, setDisplayText] = useState("WHERE IS");
  const [showQuestion, setShowQuestion] = useState(true);
  const [blurAmount, setBlurAmount] = useState(0);
  const [opacity, setOpacity] = useState(1);
  
  // Référence pour savoir si l'animation est en cours
  const animatingRef = useRef(false);
  
  // Référence pour le timeout actuel
  const timeoutRef = useRef(null);
  
  // Référence pour le texte de la NFT
  const nftName = name || "UNKNOWN";
  
  // État de l'animation
  const [animationPhase, setAnimationPhase] = useState('idle');
  
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
        // Cycle du flou: 0px -> 1.8px -> 0px sur une période de 8 secondes (plus lent et moins intense)
        const duration = 8000;
        const interval = 120;
        const steps = duration / interval;
        let step = 0;
        
        const animate = () => {
          step = (step + 1) % steps;
          // Calculer la valeur de flou avec une fonction sinusoïdale plus douce
          const blurValue = 1.8 * Math.sin((step / steps) * Math.PI * 2);
          // Utiliser un easing pour rendre les transitions plus douces
          const easedBlur = Math.abs(blurValue);
          
          // Utiliser requestAnimationFrame pour des animations plus fluides
          setBlurAmount(easedBlur);
          
          if (!isVisible && animationPhase === 'idle') {
            timeoutRef.current = setTimeout(animate, interval);
          }
        };
        
        animate();
      };
      
      blurAnimation();
    }
    
    // Si l'état passe d'idle à autre chose, arrêter l'animation de flou
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, animationPhase]);

  // Gérer la transition au survol
  useEffect(() => {
    if (isVisible && !animatingRef.current) {
      // Marquer que l'animation est en cours et stopper immédiatement l'animation de flou cyclique
      animatingRef.current = true;
      
      // Phase 1: Augmentation RAPIDE du flou jusqu'à disparition complète de WHERE IS ?
      const startHoverSequence = () => {
        // Fixer l'animation à fadeOut immédiatement pour éviter tout clignottement
        setAnimationPhase('fadeOut');
        
        // Arrêter immédiatement l'animation cyclique et fixer un état de départ
        setBlurAmount(1); 
        
        let step = 0;
        const fadeOutSteps = 10; // Moins d'étapes pour une transition plus rapide
        let nameAppeared = false; // Garde-fou pour le démarrage du nom
        
        const fadeOut = () => {
          step++;
          const progress = step / fadeOutSteps;
          
          // Accélération forte au début (easing cubic)
          const easeInProgress = progress * progress * progress;
          
          // Augmenter rapidement le flou et diminuer l'opacité
          setBlurAmount(10 * easeInProgress);
          setOpacity(1 - easeInProgress);
          
          // Quand on atteint ~75% du flou/transparence, commencer à afficher le nom
          if (progress >= 0.75 && !nameAppeared) {
            nameAppeared = true;
            // Préparer l'apparition du nom en parallèle
            setTimeout(() => {
              // Reset complet pour l'apparition du nom
              setBlurAmount(0);
              setShowQuestion(false);
              setDisplayText("");
              startTypewriter();
            }, 10);
          }
          
          if (step < fadeOutSteps) {
            // Transition très rapide (15ms)
            timeoutRef.current = setTimeout(fadeOut, 15);
          } else if (!nameAppeared) {
            // Si on n'a pas encore commencé à afficher le nom
            setBlurAmount(0);
            setOpacity(0);
            setShowQuestion(false);
            setDisplayText("");
            startTypewriter();
          }
          // Si nameAppeared est true, on a déjà lancé l'animation du nom
        };
        
        fadeOut();
      };
      
      // Phase 2: Écriture du nom (typewriter) - garantir aucun flou
      const startTypewriter = () => {
        setAnimationPhase('typeName');
        // Assurer une visibilité parfaite (pas de flou, opacité complète)
        // Forcer à zéro ABSOLUMENT toute trace de flou
        setBlurAmount(0); 
        setOpacity(1);
        
        // Garantir que WhereIS est complètement invisible avant d'afficher le nom
        // pour éviter tout effet de superposition
        setShowQuestion(false); // Cacher complètement le point d'interrogation
        
        // Réinitialiser le style pour éliminer toute lueur résiduelle
        document.querySelectorAll('.blinking-question').forEach(el => {
          if (el) el.style.textShadow = 'none';
        });
        
        let currentIndex = 0;
        
        const typeNextLetter = () => {
          currentIndex++;
          
          if (currentIndex <= nftName.length) {
            setDisplayText(nftName.slice(0, currentIndex));
            // Vitesse constante pour un effet très net
            timeoutRef.current = setTimeout(typeNextLetter, 60);
          } else {
            // Pause nette de 1 seconde sur le nom complet - SANS AUCUN EFFET
            setAnimationPhase('pause');
            // Encore une fois, s'assurer qu'il n'y a aucun flou pendant la pause
            setBlurAmount(0);
            timeoutRef.current = setTimeout(startCrossFade, 1000);
          }
        };
        
        // Démarrer avec la première lettre, mais d'abord attendre un court instant
        // pour s'assurer que tous les états précédents (flou, opacité) sont bien appliqués
        if (nftName.length > 0) {
          // Commencer par un texte vide
          setDisplayText("");
          timeoutRef.current = setTimeout(() => {
            setBlurAmount(0); // Réaffirmer l'absence de flou
            setDisplayText(nftName.slice(0, 1));
            timeoutRef.current = setTimeout(typeNextLetter, 60);
          }, 50);
        } else {
          timeoutRef.current = setTimeout(startCrossFade, 200);
        }
      };
      
      // Phase 3: Transition croisée - le nom devient flou pendant que WHERE IS ? réapparaît
      const startCrossFade = () => {
        setAnimationPhase('crossFade');
        
        // Préparer le retour de WHERE IS en arrière-plan
        setDisplayText("WHERE IS");
        setShowQuestion(true);
        
        let step = 0;
        const crossFadeSteps = 15;
        
        const crossFade = () => {
          step++;
          const progress = step / crossFadeSteps;
          
          // Augmenter le flou sur le nom progressivement
          setBlurAmount(8 * progress);
          
          // Lors de la transition croisée :
          // - Le nom (actuellement affiché) devient de plus en plus flou et transparent
          // - WHERE IS (qui se trouve "derrière") devient de plus en plus visible
          setOpacity(1 - (0.7 * progress)); // Ne pas aller jusqu'à disparition complète
          
          if (step < crossFadeSteps) {
            timeoutRef.current = setTimeout(crossFade, 30);
          } else {
            // Le nom est maintenant flou, WHERE IS est partiellement visible
            // Terminer la réapparition de WHERE IS
            finishFadeIn();
          }
        };
        
        crossFade();
      };
      
      // Phase 4: Finalisation de la réapparition de WHERE IS
      const finishFadeIn = () => {
        setAnimationPhase('fadeIn');
        
        let step = 0;
        const fadeInSteps = 10;
        
        const fadeIn = () => {
          step++;
          const progress = step / fadeInSteps;
          
          // Diminuer le flou et augmenter l'opacité jusqu'à l'état normal
          setBlurAmount(8 * (1 - progress));
          setOpacity(0.3 + progress * 0.7); // De 30% à 100% d'opacité
          
          if (step < fadeInSteps) {
            timeoutRef.current = setTimeout(fadeIn, 30);
          } else {
            // Animation terminée - retour à l'état normal
            setAnimationPhase('idle');
            animatingRef.current = false;
            // Initialiser le flou à un niveau bas pour reprendre le cycle
            setBlurAmount(0.5);
          }
        };
        
        fadeIn();
      };
      
      // Démarrer la séquence
      startHoverSequence();
    }
  }, [isVisible, nftName]);
  
  // Contrôle de l'espacement pour WHERE IS
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

export default BlurWhereIsAnimation;
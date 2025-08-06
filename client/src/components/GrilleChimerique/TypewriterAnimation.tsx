import React, { useState, useEffect, useRef } from 'react';

interface TypewriterAnimationProps {
  name: string;
  isVisible: boolean;
}

/**
 * Animation de type machine à écrire simplifiée pour les containers FREE
 * Séquence : FREE -> effacer -> [NOM] -> effacer -> FREE
 */
export function TypewriterAnimation({ name, isVisible }: TypewriterAnimationProps) {
  // État pour suivre si l'animation est en cours
  const [animationActive, setAnimationActive] = useState(false);
  
  // ID d'animation unique pour permettre de réinitialiser l'animation
  const [animationId, setAnimationId] = useState(1);
  
  // Référence pour le timer de fin d'animation
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Référence pour savoir si on attend déjà la fin d'une animation
  const isWaitingRef = useRef(false);
  
  // Variable pour les tests, à enlever en production
  const nftName = name || "DOUBLURE";
  
  // Effet pour le déclenchement initial de l'animation au survol
  useEffect(() => {
    if (isVisible && !isWaitingRef.current) {
      // Déclencher l'animation
      console.log(`Déclenchement animation pour ${nftName}`);
      setAnimationActive(true);
      isWaitingRef.current = true;
      
      // Attendre la fin de l'animation puis réinitialiser
      timerRef.current = setTimeout(() => {
        console.log(`Fin de l'animation pour ${nftName}, prêt pour redéclenchement`);
        // On incrémente l'ID d'animation pour forcer le navigateur à appliquer une nouvelle animation
        setAnimationId(prev => prev + 1);
        isWaitingRef.current = false;
      }, 5100); // Légèrement plus long que l'animation
    }
    
    // Nettoyage à la destruction du composant
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isVisible, nftName, animationId]);
  
  // Découper le nom en lettres individuelles pour l'animation
  const letters = nftName.split('');
  
  // ID unique pour l'animation
  const animKey = `${nftName.replace(/[^a-zA-Z0-9]/g, '')}-${animationId}`;
  
  // Création d'un élément style personnalisé pour injecter le nom NFT directement dans l'animation
  const customStyle = `
    .typewriter-display[data-anim-key="${animKey}"] .typewriter-content::before {
      animation: none; /* Désactive toute animation précédente */
    }
    
    .typewriter-display[data-anim-key="${animKey}"][data-animation-state="triggered"] .typewriter-content::before {
      content: "FREE";
      animation: typewriter-sequence-${animKey} 5s ease-in-out forwards;
    }
    
    @keyframes typewriter-sequence-${animKey} {
      /* Départ avec FREE pendant 0.5s */
      0%, 10% { content: "FREE"; }
      
      /* Effacement progressif sur 0.5s */
      12% { content: "FRE"; }
      14% { content: "FR"; }
      16% { content: "F"; }
      18% { content: ""; }
      
      /* Pause vide pendant 0.25s */
      20% { content: ""; }
      
      /* Affichage du nom NFT lettre par lettre */
      22% { content: "${letters[0] || ''}"; }
      24% { content: "${letters[0] || ''}${letters[1] || ''}"; }
      26% { content: "${letters[0] || ''}${letters[1] || ''}${letters[2] || ''}"; }
      28% { content: "${letters[0] || ''}${letters[1] || ''}${letters[2] || ''}${letters[3] || ''}"; }
      30% { content: "${letters[0] || ''}${letters[1] || ''}${letters[2] || ''}${letters[3] || ''}${letters[4] || ''}"; }
      32% { content: "${letters[0] || ''}${letters[1] || ''}${letters[2] || ''}${letters[3] || ''}${letters[4] || ''}${letters[5] || ''}"; }
      34% { content: "${letters[0] || ''}${letters[1] || ''}${letters[2] || ''}${letters[3] || ''}${letters[4] || ''}${letters[5] || ''}${letters[6] || ''}"; }
      36% { content: "${letters[0] || ''}${letters[1] || ''}${letters[2] || ''}${letters[3] || ''}${letters[4] || ''}${letters[5] || ''}${letters[6] || ''}${letters[7] || ''}"; }
      38%, 60% { content: "${nftName}"; }
      
      /* Pause avec le nom pendant 0.5s */
      62% { content: "${nftName}"; }
      
      /* Effacement du nom progressivement */
      64% { content: "${nftName.slice(0, -1) || ''}"; }
      66% { content: "${nftName.slice(0, -2) || ''}"; }
      68% { content: "${nftName.slice(0, -3) || ''}"; }
      70% { content: "${nftName.slice(0, -4) || ''}"; }
      72% { content: "${nftName.slice(0, -5) || ''}"; }
      74% { content: "${nftName.slice(0, -6) || ''}"; }
      76% { content: "${nftName.slice(0, -7) || ''}"; }
      78% { content: ""; }
      
      /* Réapparition de FREE sur 0.5s */
      80% { content: "F"; }
      85% { content: "FR"; }
      90% { content: "FRE"; }
      95%, 100% { content: "FREE"; }
    }
  `;
  
  return (
    <div className="typewriter-wrapper">
      {/* Style personnalisé injecté avec une clé unique pour forcer le remontage */}
      <style key={animKey} dangerouslySetInnerHTML={{ __html: customStyle }} />
      
      {/* Affichage du typewriter */}
      <div 
        className="typewriter-display"
        data-anim-key={animKey}
        data-animation-state={animationActive ? 'triggered' : 'idle'}
      >
        <span className="typewriter-content"></span>
        <span className="typewriter-cursor"></span>
      </div>
    </div>
  );
}

export default TypewriterAnimation;
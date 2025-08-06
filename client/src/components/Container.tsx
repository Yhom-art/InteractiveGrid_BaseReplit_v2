import React from 'react';
import { ContainerState, ContainerType, CursorType, ClickAction } from "@/types/common";
import { images } from '../assets/images';
import { ClickZones } from './containers/ClickZones';
import { AdoptedClickZones } from './containers/AdoptedClickZones';

interface ContainerProps {
  id: number;
  state: ContainerState;
  type: ContainerType;
  position: {
    left: number;
    top: number;
  };
  onClick: () => void;
  showClickZone?: boolean;
  onPanelToggle?: (containerId: number) => void;  // Changé de columnIndex à containerId
  debugMode?: boolean;
  // Propriétés pour les conteneurs éditoriaux
  editorialImage?: string;
  url?: string;
  title?: string;
}

export function Container({ 
  id, 
  state, 
  type, 
  position, 
  onClick, 
  showClickZone = false,
  onPanelToggle,
  debugMode = false,
  // Nouvelles propriétés pour les conteneurs éditoriaux
  editorialImage,
  url,
  title
}: ContainerProps) {
  // États pour gérer le hover et l'animation
  const [isHovered, setIsHovered] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  // Référence pour l'image qui va zoomer
  const imgRef = React.useRef<HTMLImageElement>(null);
  
  // Fonction pour forcer l'arrêt de toute animation et revenir à l'état normal
  const forceStopAnimation = () => {
    if (imgRef.current) {
      // Désactiver temporairement les transitions/animations
      imgRef.current.style.animation = 'none';
      imgRef.current.style.transition = 'none';
      
      // Retirer toutes les classes d'animation
      imgRef.current.classList.remove('zoom-in', 'zoom-out');
      
      // Forcer le retour à l'échelle normale
      imgRef.current.style.transform = 'scale(1)';
      
      // Nettoyer après un léger délai
      setTimeout(() => {
        if (imgRef.current) {
          imgRef.current.style.animation = '';
          imgRef.current.style.transition = '';
        }
      }, 100);
    }
  };
  
  // Gestionnaire pour la fin d'animation - assure le cycle complet zoom-in puis zoom-out
  const handleAnimationEnd = React.useCallback((e: AnimationEvent) => {
    if (e.animationName === 'zoom-in' && imgRef.current) {
      // Quand zoom-in est terminé, démarrer zoom-out automatiquement
      imgRef.current.classList.remove('zoom-in');
      imgRef.current.classList.add('zoom-out');
    } else if (e.animationName === 'zoom-out') {
      // Fin du cycle complet
      setIsAnimating(false);
      if (imgRef.current) {
        imgRef.current.classList.remove('zoom-out');
      }
    }
  }, []);
  
  // Ajouter/supprimer le gestionnaire d'événements d'animation
  React.useEffect(() => {
    const imgElement = imgRef.current;
    if (imgElement) {
      imgElement.addEventListener('animationend', handleAnimationEnd);
    }
    
    return () => {
      if (imgElement) {
        imgElement.removeEventListener('animationend', handleAnimationEnd);
      }
    };
  }, [handleAnimationEnd]);
  
  // Effet pour démarrer la séquence d'animation ZoomHoverGrid au survol
  React.useEffect(() => {
    // Ne démarrer que si: container fermé, pas déjà en animation, et vient d'être survolé
    if (isHovered && !isAnimating && state === ContainerState.CLOSED && imgRef.current) {
      setIsAnimating(true);
      
      // Nettoyer et forcer le redémarrage de l'animation
      imgRef.current.classList.remove('zoom-in', 'zoom-out');
      void imgRef.current.offsetWidth; // Force un reflow
      
      // Démarrer le zoom-in - Le zoom-out se lancera automatiquement via handleAnimationEnd
      imgRef.current.classList.add('zoom-in');
    }
  }, [isHovered, isAnimating, state]);
  
  // Dimensions fixes selon le schéma précis
  const layerSize = 128; // Toutes les couches font 128×128px
  
  // Hauteur du container et positions des couches
  let containerHeight = layerSize; // Par défaut, 128px (fermé)
  let imgPosition = 0; // Position de l'image
  let cardPosition = 0; // Position de la carte
  let yOffset = 0; // Décalage vertical pour le conteneur entier
  
  // Container ouvert : les dimensions et positions dépendent du type
  if (state !== ContainerState.CLOSED) {
    if (type === ContainerType.ADOPT) {
      // Type ADOPT (onehalf_dwn) : 128×192px, image en haut, carte en bas
      // Extension vers le bas de 66px
      containerHeight = 192;
      imgPosition = 0; // Image en haut
      cardPosition = 66; // Carte décalée de 66px vers le bas
      yOffset = 0; // Pas de décalage vertical
    } 
    else if (type === ContainerType.ADOPTED) {
      // Type ADOPTED (oneone_dwn) : 128×260px, extension vers le bas de 132px
      containerHeight = 260;
      imgPosition = 0; // Image en haut
      cardPosition = 128; // Carte décalée de 128px vers le bas
      yOffset = 0; // Pas de décalage vertical
    } 
    else if (type === ContainerType.FREE) {
      // Type FREE (oneone_up) : 128×260px, extension vers le HAUT de 132px
      containerHeight = 260;
      // L'image reste au fond (bottom) du container pour container-oneone_up
      imgPosition = 132; // Image à 132px du haut (donc au fond)
      // La carte se place en haut du container
      cardPosition = 0; // Carte au tout en haut (s'étend vers le haut)
      // Le point d'ancrage du container doit être en bas (pour s'étendre vers le haut)
      yOffset = -132; // Le container s'étend vers le haut de 132px
    }
    else {
      // Autres types ou type par défaut (container-one)
      containerHeight = 128; // Taille fixe
      imgPosition = 0;
      cardPosition = 0;
      yOffset = 0;
    }
  }
  
  // Déterminer la couleur de fond en fonction de l'état - transparent pour tous les types
  let backgroundColor = 'transparent'; // Pas de fond pour tous les containers
  
  // Le texte à afficher
  let displayText = `Cell ${id + 1}`;
  
  if (state === ContainerState.ADOPT) {
    displayText = 'MiniCard';
  } else if (state === ContainerState.ADOPTED) {
    displayText = 'Card Adopted';
  } else if (state === ContainerState.FREE) {
    displayText = 'Card Free';
  }
  
  // Indiquer le type pour les cellules fermées
  if (state === ContainerState.CLOSED) {
    if (type === ContainerType.ADOPT) {
      displayText = 'CLOSED_ADOPT';
    } else if (type === ContainerType.ADOPTED) {
      displayText = 'CLOSED_ADOPTED';
    } else if (type === ContainerType.FREE) {
      displayText = 'CLOSED_FREE';
    } else {
      displayText = 'CLOSED_INACTIVE';
    }
  }
  
  // Définir le style du container avec la hauteur précise
  const containerStyles = {
    position: 'absolute',
    width: '128px',
    height: `${containerHeight}px`,
    backgroundColor,
    left: `${position.left}px`,
    
    // IMPORTANT: Position verticale spécifique pour container-oneone_up (FREE)
    // Pour un container FREE ouvert, on le déplace vers le haut pour simuler l'extension ascendante
    top: type === ContainerType.FREE && state === ContainerState.FREE 
        ? `${position.top - 132}px` // Décalage vers le haut de 132px (extension vers le haut)
        : `${position.top}px`,     // Position normale pour les autres

    border: debugMode ? '3px solid red' : 'none',
    transformOrigin: 'bottom center', // Origine de transformation en bas
    transition: 'height 0.3s ease-out, top 0.3s ease-out' // Animation fluide
  };
  
  // Fonction pour obtenir l'image selon le type de container
  const getLayerPicImage = () => {
    // Pour les conteneurs éditoriaux, utiliser l'image fournie
    if (type === ContainerType.EDITORIAL && editorialImage) {
      return editorialImage;
    }
    
    // Alterner entre deux variantes d'images selon l'ID pour les autres types
    const isAlternate = id % 2 !== 0;
    
    if (type === ContainerType.ADOPT) {
      return isAlternate ? images.adoptAlt : images.adopt;
    } else if (type === ContainerType.ADOPTED) {
      return isAlternate ? images.adoptedAlt : images.adopted;
    } else if (type === ContainerType.FREE) {
      return isAlternate ? images.freeAlt : images.free;
    } else if (type === ContainerType.EDITORIAL) {
      // Si on arrive ici, c'est qu'editorialImage n'est pas défini
      return images.editorial; // Image éditoriale par défaut
    } else {
      return images.adopt; // Image par défaut
    }
  };
  
  // Obtenir le nom de la chimère sans le numéro à la fin
  const getChimeraName = () => {
    // Pour les conteneurs éditoriaux, utiliser le titre fourni
    if (type === ContainerType.EDITORIAL && title) {
      return title;
    }
    
    const isAlternate = id % 2 !== 0;
    
    if (type === ContainerType.ADOPT) {
      return isAlternate ? "FLORAMIN" : "BENSÉ";
    } else if (type === ContainerType.ADOPTED) {
      return isAlternate ? "DALLIA" : "LAURIENCE";
    } else if (type === ContainerType.FREE) {
      return isAlternate ? "JOSCOIS" : "MAÏD";
    } else if (type === ContainerType.EDITORIAL) {
      // Si on arrive ici, c'est que title n'est pas défini
      return "ÉDITO";
    } else {
      return "UNKNOWN";
    }
  };
  
  // Gérer l'action en fonction de la zone cliquée
  const handleZoneClick = (action: "close" | "open" | "openPanel", e: React.MouseEvent) => {
    // Empêcher la propagation pour éviter de déclencher le drag
    e.stopPropagation();
    e.preventDefault();
    
    console.log(`Zone clicked: ${action} on container ${id} (type: ${type}, state: ${state})`);
    
    // Réinitialiser les états
    setIsHovered(false);
    setIsAnimating(false);
    
    // Arrêter toute animation en cours et forcer le retour à l'état normal
    forceStopAnimation();
    
    // Lorsqu'on ferme un container, on veut fermer le container et pas le panel
    if (action === "close") {
      console.log("Action: CLOSE CONTAINER");
      // Désactiver toutes les animations sur la page entière
      document.body.classList.add('no-animations');
      
      // Forcer l'état de l'image
      if (imgRef.current) {
        // Appliquer brutalement le style de reset
        imgRef.current.style.transition = 'none';
        imgRef.current.style.animation = 'none';
        imgRef.current.style.transform = 'scale(1)';
      }
      
      // IMPORTANT: Pour un conteneur ouvert, on ne veut pas déclencher la fonction onClick standard
      // car elle pourrait activer le panel. On veut spécifiquement fermer le conteneur.
      if (state !== ContainerState.CLOSED) {
        // Utiliser un nouvel événement personnalisé pour indiquer une fermeture explicite
        const closeEvent = new CustomEvent('container-close', { 
          detail: { containerId: id } 
        });
        document.dispatchEvent(closeEvent);
      } else {
        // Si fermé, on peut utiliser onClick normalement
        onClick();
      }
      
      // Réactiver les animations après la transition
      setTimeout(() => {
        document.body.classList.remove('no-animations');
      }, 300);
    } else if (action === "openPanel" && onPanelToggle) {
      console.log("Action: OPEN_PANEL", { id, onPanelToggle: !!onPanelToggle });
      
      // Ouvrir/remplacer un panel dans cette colonne
      onPanelToggle(id);
    } else if (action === "open") {
      // Ouvrir le container
      onClick();
    } else {
      console.log("Aucune action effectuée", { action, onPanelToggle: !!onPanelToggle });
    }
  };
  
  // Si le container est fermé, on a juste une zone de clic centrale
  if (state === ContainerState.CLOSED) {
    return (
      <div
        className="absolute transition-all duration-500 ease-in-out"
        style={{
          ...containerStyles,
          transition: 'left 0.3s ease-out, top 0.3s ease-out'
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          // Active l'effet de zoom sur l'image via l'useEffect
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        // On ajoute l'attribut data-cursor-type selon le type de container
        data-cursor-type={
          type === ContainerType.ADOPT ? CursorType.ADOPT :
          type === ContainerType.ADOPTED ? CursorType.MEET :
          type === ContainerType.FREE ? CursorType.KNOK :
          type === ContainerType.EDITORIAL ? CursorType.INFO :
          CursorType.GRAB
        }
      >
        {/* Container pour les layers visuels */}
        <div className="relative w-full h-full overflow-hidden">
          {/* 1. Layer-PIC (toujours visible) */}
          <div className="absolute inset-0 z-10 overflow-hidden" style={{ transition: 'none' }}>
            {/* Image du type spécifique de container */}
            <div 
              className="relative w-full h-full"
              style={{
                // Pour le type ADOPTED fermé, positionner l'image en bas
                display: 'flex',
                flexDirection: 'column',
                justifyContent: type === ContainerType.ADOPTED ? 'flex-end' : 'flex-start',
                transition: 'none'
              }}
            >
              <img 
                ref={imgRef}
                src={getLayerPicImage()} 
                alt={type === ContainerType.EDITORIAL ? "Editorial content" : "Chimera"} 
                className={`
                  w-full h-full object-cover zoom-effect 
                  ${type === ContainerType.ADOPT ? 'filter blur-sm' : ''}
                  ${type === ContainerType.EDITORIAL ? 'rounded-md border-2 border-white' : ''}
                `}
                // Ajouter l'attribut data-cursor-type sur l'image pour les containers EDITO
                data-cursor-type={type === ContainerType.EDITORIAL ? "info" : undefined}
              />
            </div>
          </div>
          
          {/* 2. Layer-TXT pour container fermé de type FREE */}
          {type === ContainerType.FREE && (
            <div className="absolute inset-0 z-40 flex justify-center items-center p-3">
              <span className="font-['Roboto_Mono'] text-white text-[12px] font-bold leading-[0.85] text-center">
                {isHovered ? (
                  <>
                    {getChimeraName()}<br />
                    IS FREE !
                  </>
                ) : (
                  "FREE"
                )}
              </span>
            </div>
          )}
          
          {/* 2. Layer-TXT pour container fermé de type ADOPTED - Texte visible uniquement au survol */}
          {type === ContainerType.ADOPTED && (
            <div className="absolute inset-0 z-40 flex justify-center items-center p-3">
              <span className="font-['Roboto_Mono'] text-white text-[12px] font-bold leading-[0.85] text-center">
                {isHovered ? getChimeraName() : null}
              </span>
            </div>
          )}
          
          {/* Layer-TXT pour container de type EDITORIAL */}
          {type === ContainerType.EDITORIAL && (
            <div className="absolute inset-0 z-40 flex justify-center items-center p-3">
              <span className="font-['Roboto_Mono'] text-white text-[12px] font-bold leading-[0.85] text-center bg-black bg-opacity-50 px-2 py-1 rounded">
                {isHovered ? title || "ÉDITO" : null}
              </span>
            </div>
          )}
          
          {/* Layer-OVERLAY pour container fermé */}
          {type === ContainerType.ADOPT && (
            <div 
              className="absolute inset-0 z-20 bg-[#E5D1D3]"
              style={{
                opacity: 0.8
              }}
            />
          )}
          
          {/* Layer-OVERLAY pour container fermé de type FREE (couleurs spécifiques) */}
          {type === ContainerType.FREE && (
            <div 
              className="absolute inset-0 z-20 layer-overlay-free"
            />
          )}
          
          {/* Layer-TXT pour container fermé de type ADOPT */}
          {type === ContainerType.ADOPT && (
            <div className="absolute inset-0 z-40 flex justify-center items-center p-3">
              <span className="font-['Roboto_Mono'] text-black text-[12px] font-bold leading-[0.85] text-center">
                {isHovered ? (
                  `${getChimeraName()}_${id.toString().padStart(4, '0')}`
                ) : (
                  <>
                    WHERE IS<br />
                    {getChimeraName()} ?
                  </>
                )}
              </span>
            </div>
          )}
          
          {/* Texte d'information pour les autres types de containers (INACTIVE) */}
          {type === ContainerType.INACTIVE && (
            <div className="absolute inset-0 z-40 flex justify-center items-center p-3">
              <div className="text-center font-['Roboto_Mono'] text-gray-500 text-[12px] font-bold leading-[0.85]">
                {displayText}
              </div>
            </div>
          )}
        </div>
        
        {/* Zones de clic interactives */}
        <ClickZones
          containerType={type}
          containerState={state}
          containerId={id}
          debugMode={debugMode}
          onZoneClick={(action, e) => {
            // Réinitialiser les états
            setIsHovered(false);
            setIsAnimating(false);
            
            // Utiliser notre fonction pour arrêter proprement les animations
            forceStopAnimation();
            
            if (action === "open") {
              // Appeler le callback pour ouvrir le container
              onClick();
            }
          }}
        />
      </div>
    );
  }
  
  // Container ouvert avec ses différentes couches
  // Gestion spécifique pour container-oneone_up (FREE)
  if (type === ContainerType.FREE && state === ContainerState.FREE) {
    // Rendu spécial pour un container qui s'étend vers le haut
    return (
      <div 
        className="absolute"
        style={{
          // Largeur standard mais hauteur étendue
          width: '128px',
          height: '260px', 
          // Position avec décalage vers le haut pour l'extension
          left: position.left,
          top: position.top - 132,
          // Style visuel pour debug
          backgroundColor: debugMode ? 'rgba(0, 255, 0, 0.15)' : 'transparent',
          border: debugMode ? '2px solid blue' : 'none',
          // Animation fluide
          transition: "height 0.3s ease-out, top 0.3s ease-out"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-container-state={state}
      >
        {/* Pour debug uniquement */}
        {debugMode && (
          <div className="absolute top-0 left-0 bg-white p-1 text-xs z-50">
            container-oneone_up<br/>
            ID: {id}<br/>
            Extended: 128px → 260px
          </div>
        )}
        
        {/* Conteneur interne avec deux zones distinctes */}
        <div className="relative w-full h-full overflow-visible">
          {/* Zone supérieure - extension vers le haut avec fiche ID uniformisée */}
          <div className="absolute top-0 left-0 w-full h-[132px] bg-white flex flex-col justify-center">
            <div className="p-3 text-xs font-['Roboto_Mono'] text-black">
              <div className="font-bold mb-1">
                {getChimeraName()}_{id.toString().padStart(4, '0')}
              </div>
              <div className="text-[10px] leading-tight">
                Collection<br />
                FREE
              </div>
              <div className="mt-3 border-t border-black pt-2 text-[10px] leading-[0.8]">
                FREE
              </div>
            </div>
          </div>
          
          {/* Zone inférieure - base du container */}
          <div className="absolute bottom-0 left-0 w-full h-[128px] overflow-hidden">
            <img 
              src={getLayerPicImage()} 
              alt="Container FREE" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Zones de clic pour container FREE ouvert */}
          <ClickZones
            containerType={type}
            containerState={state}
            containerId={id}
            debugMode={debugMode}
            onZoneClick={handleZoneClick}
          />
        </div>
      </div>
    );
  }
  
  // Gestion spécifique pour container-oneone_down (ADOPTED)
  if (type === ContainerType.ADOPTED && state === ContainerState.ADOPTED) {
    // Rendu spécial pour un container qui s'étend vers le bas
    return (
      <div 
        className="absolute"
        style={{
          // Largeur standard mais hauteur étendue
          width: '128px',
          height: '260px', 
          // Position standard (extension vers le bas)
          left: position.left,
          top: position.top,
          // Style visuel pour debug
          backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.15)' : 'transparent',
          border: debugMode ? '2px solid red' : 'none',
          // Animation fluide
          transition: "height 0.3s ease-out, top 0.3s ease-out"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-container-state={state}
      >
        {/* Pour debug uniquement */}
        {debugMode && (
          <div className="absolute top-0 left-0 bg-white p-1 text-xs z-50">
            container-oneone_down<br/>
            ID: {id}<br/>
            Extended: 128px → 260px
          </div>
        )}
        
        {/* Conteneur interne avec deux zones distinctes */}
        <div className="relative w-full h-full overflow-visible">
          {/* Zone supérieure - image */}
          <div className="absolute top-0 left-0 w-full h-[128px] overflow-hidden">
            <img 
              src={getLayerPicImage()} 
              alt="Container ADOPTED" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Zone inférieure - extension vers le bas (carte) */}
          <div className="absolute top-[128px] left-0 w-full h-[132px] bg-white">
            <div className="p-3 text-xs font-['Roboto_Mono'] text-black">
              <div className="font-bold mb-1">
                {getChimeraName()}_{id.toString().padStart(4, '0')}
              </div>
              <div className="text-[10px] leading-tight">
                Collection<br />
                NFT {id.toString().padStart(3, '0')}~C
              </div>
              <div className="mt-3 border-t border-black pt-2 text-[10px] leading-[0.8]">
                Cette Chimère a été adoptée
              </div>
            </div>
          </div>
          
          {/* Zones de clic pour container ADOPTED ouvert */}
          <ClickZones
            containerType={type}
            containerState={state}
            containerId={id}
            debugMode={debugMode}
            onZoneClick={handleZoneClick}
          />
        </div>
      </div>
    );
  }
  
  // Gestion spécifique pour container-onehalf_dwn (ADOPT)
  if (type === ContainerType.ADOPT && state === ContainerState.ADOPT) {
    // Rendu spécial pour un container qui s'étend partiellement vers le bas
    return (
      <div 
        className="absolute"
        style={{
          // Largeur standard mais hauteur étendue
          width: '128px',
          height: '192px', // 128px + 64px (extension partielle)
          // Position standard (extension vers le bas)
          left: position.left,
          top: position.top,
          // Style visuel pour debug
          backgroundColor: debugMode ? 'rgba(255, 165, 0, 0.15)' : 'transparent',
          border: debugMode ? '2px solid orange' : 'none',
          // Animation fluide
          transition: "height 0.3s ease-out, top 0.3s ease-out"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-container-state={state}
      >
        {/* Pour debug uniquement */}
        {debugMode && (
          <div className="absolute top-0 left-0 bg-white p-1 text-xs z-50">
            container-onehalf_dwn<br/>
            ID: {id}<br/>
            Extended: 128px → 192px
          </div>
        )}
        
        {/* Conteneur interne avec des layers qui se superposent */}
        <div className="relative w-full h-full overflow-visible">
          {/* Layer-PIC - image sur toute la hauteur, sans flou en position ouverte */}
          <div className="absolute top-0 left-0 w-full h-[128px] overflow-hidden">
            <img 
              src={getLayerPicImage()} 
              alt="Container ADOPT" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Layer-OVERLAY - Maintien de l'overlay original */}
          <div 
            className="absolute left-0 w-full layer-overlay-adopt z-20"
            style={{
              height: '128px', // Hauteur complète pour recouvrir la moitié basse
              top: '64px' // Positionnée à mi-hauteur de l'image
            }}
          >
            <div className="p-3 text-xs font-['Roboto_Mono'] text-black">
              <div className="font-bold mb-1">
                {getChimeraName()}_{id.toString().padStart(4, '0')}
              </div>
              <div className="text-[10px] leading-tight">
                Collection<br />
                NFT {id.toString().padStart(3, '0')}~B
              </div>
              <div className="mt-3 border-t border-black pt-2 text-[10px] leading-[0.8]">
                À adopter
              </div>
            </div>
          </div>
          
          {/* Zones de clic pour container ADOPT ouvert */}
          <ClickZones
            containerType={type}
            containerState={state}
            containerId={id}
            debugMode={debugMode}
            onZoneClick={handleZoneClick}
          />
        </div>
      </div>
    );
  }
  
  // Rendu standard pour tous les autres containers
  return (
    <div 
      className="absolute"
      style={{
        ...containerStyles,
        transition: "width 0.5s ease-in-out, height 0.5s ease-in-out, left 0.3s ease-out, top 0.3s ease-out", // Transitions
      }}
    >
      {/* Contenu visuel du container */}
      <div className="relative w-full h-full">
        {/* Layer-PIC (128×128px) - Position dépend du type de container */}
        <div 
          className="absolute left-0 w-full h-32 z-10"
          style={{
            // Position variable selon le type
            top: `${imgPosition}px`,
            border: debugMode ? '2px solid green' : 'none',
            transition: 'none'  // Désactiver toute transition
          }}
        >
          <img 
            ref={imgRef}
            src={getLayerPicImage()} 
            alt="Chimera" 
            className="w-full h-full object-cover zoom-effect"
            style={{
              // Style transformless - supprime toute transformation animée ou transition au niveau de l'image
              transform: "scale(1)",
              transformOrigin: "33% 50%",
              willChange: "transform"
            }}
          />
        </div>
        
        {/* Layer-OVERLAY pour type FREE (128×128px) - Superposé sur l'image */}
        {type === ContainerType.FREE && (
          <div 
            className="absolute left-0 w-full h-32 layer-overlay-free z-20"
            style={{
              // FREE n'a pas besoin de cette condition car ce n'est jamais ADOPTED
              top: '0'
            }}
          >
            {/* Overlay rose avec mix-blend-mode: hard-light */}
          </div>
        )}
        
        {/* Layer-OVERLAY pour type ADOPT (128×128px) - Décalé verticalement */}
        {type === ContainerType.ADOPT && (
          <div 
            className="absolute left-0 w-full layer-overlay-adopt z-20"
            style={{ 
              top: `${cardPosition}px`, // Position basée sur cardPosition
              height: '128px', // Tous les layers font 128px de haut
              border: debugMode ? '2px solid purple' : 'none'
            }}
          >
            {/* Overlay beige pour la carte avec animation de glissement */}
          </div>
        )}
        
        {/* Layer-CARD (128×128px) - Couche de texte avec décalage vertical */}
        <div 
          className="absolute left-0 w-full z-40"
          style={{
            top: `${cardPosition}px`, // Décalage vertical selon le type
            height: '128px', // Tous les layers font 128px de haut
            backgroundColor: 'transparent',
            border: debugMode ? '2px solid blue' : 'none'
          }}
        >
          {type === ContainerType.FREE && (
            <div className="p-3 text-xs font-['Roboto_Mono'] text-black">
              {/* Contenu spécifique pour les containers FREE */}
              <div className="font-bold mb-1">
                {getChimeraName()}_{id.toString().padStart(4, '0')}
              </div>
              <div className="text-[10px] leading-tight">
                Collection<br />
                NFT {id.toString().padStart(3, '0')}~C
              </div>
              <div className="mt-3 border-t border-black pt-2 text-[10px] leading-[0.8]">
                Cette Chimère n'a pas encore été rencontrée
              </div>
            </div>
          )}
          
          {type === ContainerType.ADOPTED && (
            <div className="p-3 text-xs font-['Roboto_Mono'] text-black card-adopted-slide-in">
              {/* Contenu spécifique pour les containers ADOPTED avec animation d'entrée */}
              <div className="font-bold mb-1">
                {getChimeraName()}_{id.toString().padStart(4, '0')}
              </div>
              <div className="text-[10px] leading-tight">
                Collection<br />
                NFT {id.toString().padStart(3, '0')}~C
              </div>
              <div className="mt-3 border-t border-black pt-2 text-[10px] leading-[0.8]">
                Cette Chimère a été adoptée
              </div>
            </div>
          )}
          
          {type === ContainerType.ADOPT && (
            <div className="p-2 text-xs font-['Roboto_Mono'] text-black h-full flex flex-col justify-between">
              {/* Contenu spécifique pour les containers ADOPT */}
              <div>
                <div className="font-bold">
                  {getChimeraName()}_{id.toString().padStart(4, '0')}
                </div>
                <div className="text-[10px] leading-tight">
                  Collection<br />
                  NFT {id.toString().padStart(3, '0')}~C
                </div>
              </div>
              <div className="border-t border-black pt-1 text-[10px] leading-[0.8]">
                Cette Chimère attend d'être adoptée
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Zone GRAB (pour tout le container en arrière-plan) - Z-INDEX très bas */}
      <div 
        className="absolute w-full h-full cursor-grab"
        style={{
          top: '0',
          left: '0',
          border: debugMode ? '1px dashed blue' : 'none',
          backgroundColor: debugMode ? 'rgba(0, 0, 255, 0.1)' : 'transparent',
          zIndex: 1, // Très bas pour être en arrière-plan
          pointerEvents: 'auto' // Garantir la capture d'événements
        }}
        data-cursor-type={CursorType.GRAB}
      />
      
      {/* Zone ACTION (95x128px) - Position varie selon le type */}
      <div 
        className="absolute cursor-pointer"
        style={{
          width: '95px',
          height: '128px', // Hauteur fixe de 128px
          left: '16.5px',  // (128 - 95) / 2
          // Position différente selon le type
          top: type === ContainerType.ADOPTED 
            ? '0px' // Pour ADOPTED: zone de clic en haut
            : `${cardPosition}px`, // Pour autres: selon décalage
          border: debugMode ? '3px dashed green' : 'none',
          backgroundColor: debugMode ? 'rgba(0, 255, 0, 0.3)' : 'transparent',
          zIndex: 500, // Augmenté pour passer au-dessus des overlays (z-index: 30)
          pointerEvents: 'auto' // Garantir la capture d'événements
        }}
        onClick={(e) => handleZoneClick("openPanel", e)}
        data-cursor-type={
          type === ContainerType.ADOPTED ? CursorType.MEET :
          type === ContainerType.ADOPT ? CursorType.ADOPT :
          type === ContainerType.FREE ? CursorType.KNOK :
          CursorType.GRAB
        }
      />
      
      {/* Zone CLOSE (25x25px au centre de l'image) - Z-INDEX maximum */}
      {/* N'afficher cette zone que pour les types non-ADOPTED (pour éviter les conflits avec ClickZones) */}
      {type !== ContainerType.ADOPTED && (
        <div 
          className="absolute cursor-pointer"
          style={{
            width: '25px',
            height: '25px',
            left: '51.5px', // (128 - 25) / 2
            // Position de la zone CLOSE dépend du type et de la position de l'image
            top: `${imgPosition + 51.5}px`, // Centré sur l'image (position + (128-25)/2)
            border: debugMode ? '1px dashed red' : 'none',
            backgroundColor: debugMode ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
            zIndex: 99999, // Valeur maximale
            pointerEvents: 'auto' // Garantir la capture d'événements
          }}
          onClick={(e) => handleZoneClick("close", e)}
          data-cursor-type={CursorType.CLOSE}
        />
      )}
    </div>
  );
}
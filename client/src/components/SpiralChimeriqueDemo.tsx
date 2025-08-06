import React, { useState, useEffect, useRef, MouseEvent } from "react";
import { Container } from "@/components/Container";
import { CustomCursor } from "@/components/CustomCursor";
import { Button } from "@/components/ui/button";
import { chimeresData } from "@/data/chimeresData";
import { 
  ContainerState, 
  ContainerType, 
  CursorType, 
  ContainerData,
  Position
} from "@/types/common";

// Données de contenu éditorial de test
const EDITORIAL_CONTENT = [
  { title: "Guide des NFTs", url: "https://example.com/nft-guide" },
  { title: "Artistes émergents", url: "https://example.com/emerging-artists" },
  { title: "Le futur de l'art numérique", url: "https://example.com/digital-art-future" },
  { title: "Collection du mois", url: "https://example.com/monthly-collection" },
  { title: "Interviews créateurs", url: "https://example.com/creator-interviews" },
  { title: "Tendances du marché", url: "https://example.com/market-trends" },
  { title: "Tutoriels création", url: "https://example.com/creation-tutorials" },
  { title: "Événements à venir", url: "https://example.com/upcoming-events" },
];

export function SpiralChimeriqueDemo() {
  // Configuration de la taille de la grille visible
  const GRID_SIZE = 5; // Grille 5x5 visible
  const CONTAINER_SIZE = 128; // Taille d'un container en pixels
  const CONTAINER_SPACING = 4; // Espacement entre les containers
  const CENTER_OFFSET = Math.floor(GRID_SIZE / 2); // Offset pour centrer la grille (2 pour une grille 5x5)
  
  const [containers, setContainers] = useState<ContainerData[]>([]);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState<Position>({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<CursorType>(CursorType.GRAB);
  const [editorialCount, setEditorialCount] = useState(0);
  const [totalContainers, setTotalContainers] = useState(1);
  
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Fonction pour générer les coordonnées en spirale
  const generateSpiralCoordinates = (count: number) => {
    const coordinates: {x: number, y: number}[] = [];
    
    // Le premier est au centre
    coordinates.push({ x: 0, y: 0 });
    
    if (count <= 1) return coordinates;
    
    // Direction: 0=droite, 1=bas, 2=gauche, 3=haut
    let direction = 0;
    // Taille du segment actuel
    let segmentLength = 1;
    // Segments complétés dans la direction actuelle
    let segmentsCompleted = 0;
    
    // Position actuelle
    let x = 0, y = 0;
    
    // Pour chaque position restante
    for (let i = 1; i < count; i++) {
      // Mise à jour de la position selon la direction
      switch (direction) {
        case 0: // Droite
          x += 1;
          break;
        case 1: // Bas
          y += 1;
          break;
        case 2: // Gauche
          x -= 1;
          break;
        case 3: // Haut
          y -= 1;
          break;
      }
      
      // Ajouter la nouvelle position
      coordinates.push({ x, y });
      
      // Vérifier si un segment est terminé
      segmentsCompleted++;
      if (segmentsCompleted === segmentLength) {
        // Changer de direction
        direction = (direction + 1) % 4;
        segmentsCompleted = 0;
        
        // Augmenter la longueur du segment tous les 2 changements de direction
        if (direction === 0 || direction === 2) {
          segmentLength++;
        }
      }
    }
    
    return coordinates;
  };
  
  // Générer des containers initiaux
  useEffect(() => {
    // Démarrer avec un seul container au centre
    initializeContainers(1, 0);
  }, []);
  
  // Fonction pour initialiser les containers avec un nombre spécifique
  const initializeContainers = (count: number, editorialCount: number) => {
    // Limiter à 25 containers actifs maximum
    const MAX_ACTIVE_CONTAINERS = 25;
    const activeCount = Math.min(count, MAX_ACTIVE_CONTAINERS);
    
    // Générer les positions en spirale pour l'ensemble de la grille (actifs et inactifs)
    const totalPositionsNeeded = Math.max(count, 36); // Au moins une grille 6x6 pour avoir de l'espace
    const spiralCoordinates = generateSpiralCoordinates(totalPositionsNeeded);
    
    // Types possibles pour les containers
    const types = [
      ContainerType.ADOPT, 
      ContainerType.ADOPTED, 
      ContainerType.FREE
    ];
    
    // Créer des containers avec la distribution appropriée
    const newContainers: ContainerData[] = spiralCoordinates.map((pos, index) => {
      // Les premiers 'activeCount' containers sont actifs, les autres sont inactifs
      if (index < activeCount) {
        const randomTypeIndex = Math.floor(Math.random() * types.length);
        return {
          id: index,
          state: ContainerState.CLOSED,
          type: types[randomTypeIndex],
          position: pos
        };
      } else {
        // Containers inactifs
        return {
          id: index,
          state: ContainerState.CLOSED,
          type: ContainerType.INACTIVE,
          position: pos
        };
      }
    });
    
    // Ajouter des containers éditoriaux à des positions aléatoires
    if (editorialCount > 0) {
      // Sélectionner aléatoirement des indices pour les containers éditoriaux
      // (éviter le premier container qui est au centre)
      const availableIndices = Array.from({ length: activeCount - 1 }, (_, i) => i + 1);
      const editorialIndices: number[] = [];
      
      // Sélectionner aléatoirement des indices
      for (let i = 0; i < Math.min(editorialCount, availableIndices.length); i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const selectedIndex = availableIndices.splice(randomIndex, 1)[0];
        editorialIndices.push(selectedIndex);
      }
      
      // Convertir les containers sélectionnés en containers éditoriaux
      editorialIndices.forEach(index => {
        const randomEditorialIndex = Math.floor(Math.random() * EDITORIAL_CONTENT.length);
        const editorialItem = EDITORIAL_CONTENT[randomEditorialIndex];
        
        newContainers[index] = {
          ...newContainers[index],
          type: ContainerType.EDITORIAL,
          url: editorialItem.url,
          title: editorialItem.title
        };
      });
    }
    
    setContainers(newContainers);
    // Mettre à jour les compteurs en tenant compte de la limite
    setTotalContainers(Math.min(count, MAX_ACTIVE_CONTAINERS));
    setEditorialCount(editorialCount);
  };
  
  // Ajouter un nouveau container NFT
  const addNewContainer = () => {
    // Vérifier si on a atteint la limite de 25 conteneurs actifs
    if (totalContainers + editorialCount >= 25) {
      alert("Limite de 25 conteneurs actifs atteinte !");
      return;
    }
    // Générer une nouvelle grille avec un container NFT de plus
    initializeContainers(totalContainers + 1, editorialCount);
  };
  
  // Ajouter un nouveau container éditorial
  const addNewEditorialContainer = () => {
    // Vérifier si on a atteint la limite de 25 conteneurs actifs
    if (totalContainers + editorialCount >= 25) {
      alert("Limite de 25 conteneurs actifs atteinte !");
      return;
    }
    // Générer une nouvelle grille avec un container éditorial de plus
    initializeContainers(totalContainers, editorialCount + 1);
  };
  
  // Réinitialiser la grille
  const resetGrid = () => {
    initializeContainers(1, 0);
  };
  
  // Random reload - ajoute un nombre aléatoire de containers éditoriaux
  const randomReload = () => {
    // Nombre total de NFTs et d'éditoriaux (entre 15-25 conteneurs actifs)
    const totalActive = Math.floor(Math.random() * 11) + 15; // 15-25 conteneurs actifs
    
    // Proportion d'éditoriaux (15-30% du total)
    const editorialPercentage = Math.random() * 0.15 + 0.15; // Entre 15% et 30%
    const newEditorialCount = Math.floor(totalActive * editorialPercentage);
    
    // Le reste sera des NFTs
    const newNftCount = totalActive - newEditorialCount;
    
    initializeContainers(newNftCount, newEditorialCount);
  };
  
  // Toggle un container entre ouvert et fermé
  const toggleContainer = (id: number) => {
    setContainers(prevContainers => {
      return prevContainers.map(container => {
        if (container.id === id) {
          // Si le container est inactif, ne rien faire
          if (container.type === ContainerType.INACTIVE) {
            return container;
          }
          
          // Si le container est fermé, l'ouvrir selon son type
          if (container.state === ContainerState.CLOSED) {
            // Définir l'état en fonction du type
            let newState = ContainerState.CLOSED;
            if (container.type === ContainerType.ADOPT) {
              newState = ContainerState.ADOPT;
            } else if (container.type === ContainerType.ADOPTED) {
              newState = ContainerState.ADOPTED;
            } else if (container.type === ContainerType.FREE) {
              newState = ContainerState.FREE;
            }
            
            return {
              ...container,
              state: newState
            };
          } else {
            // Si le container est ouvert, le fermer
            return {
              ...container,
              state: ContainerState.CLOSED,
              key: Date.now() // Forcer un remontage
            };
          }
        }
        return container;
      });
    });
  };
  
  // Gestion du déplacement de la grille (drag)
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    // Mise à jour de la position du curseur
    setCursorPosition({ x: e.clientX, y: e.clientY });
    
    // Détection du type de curseur
    const element = e.target as HTMLElement;
    const cursorTypeAttribute = element.getAttribute('data-cursor-type');
    
    if (cursorTypeAttribute) {
      setCursorType(cursorTypeAttribute as CursorType);
    } else {
      setCursorType(CursorType.GRAB);
    }
    
    // Gestion du déplacement de la grille
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  // Calculer la position à l'écran d'un container basé sur sa position logique
  const calculateContainerScreenPosition = (containerPosition: {x: number, y: number}) => {
    // Calculer les coordonnées de pixel à partir des coordonnées logiques de la grille spirale
    const screenX = CENTER_OFFSET * (CONTAINER_SIZE + CONTAINER_SPACING) + 
                   containerPosition.x * (CONTAINER_SIZE + CONTAINER_SPACING) + 
                   position.x;
                   
    const screenY = CENTER_OFFSET * (CONTAINER_SIZE + CONTAINER_SPACING) + 
                   containerPosition.y * (CONTAINER_SIZE + CONTAINER_SPACING) + 
                   position.y;
                   
    return { left: screenX, top: screenY };
  };
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6 flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Test de la Grille Chimérique avec Spirale</h1>
        <div className="flex gap-2 mb-4">
          <Button onClick={addNewContainer}>
            Ajouter NFT
          </Button>
          <Button onClick={addNewEditorialContainer} variant="outline">
            Ajouter Éditorial
          </Button>
          <Button onClick={randomReload} variant="secondary">
            Reload Aléatoire
          </Button>
          <Button onClick={resetGrid} variant="destructive">
            Réinitialiser
          </Button>
        </div>
        <div className="text-sm space-y-1">
          <p>Total containers : {totalContainers} (dont {editorialCount} éditoriaux)</p>
          <p>NFTs : bleu=ADOPT, vert=ADOPTED, rouge=FREE, violet=EDITORIAL</p>
          <p>Chaque nouvel élément est inséré au centre, repoussant les autres selon le motif spiral</p>
        </div>
      </div>
      
      <div 
        className="relative bg-gray-200 rounded-lg shadow-inner overflow-hidden border border-gray-300"
        style={{ height: '70vh' }}
        ref={gridRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Curseur polymorphe personnalisé */}
        <CustomCursor 
          cursorType={cursorType}
          position={cursorPosition}
        />
        
        {/* Conteneur virtuel fixe au centre (repère visuel) */}
        <div 
          className="absolute border border-dashed border-red-500 pointer-events-none"
          style={{ 
            width: CONTAINER_SIZE, 
            height: CONTAINER_SIZE, 
            left: `calc(50% - ${CONTAINER_SIZE/2}px)`, 
            top: `calc(50% - ${CONTAINER_SIZE/2}px)`,
            zIndex: 5
          }}
        >
          <div className="text-xs text-red-500 absolute -top-5 left-0 right-0 text-center">Centre (0,0)</div>
        </div>
        
        {/* Les containers avec positionnement en fonction de leur position logique */}
        {containers.map(container => {
          if (!container.position) return null;
          
          const screenPosition = calculateContainerScreenPosition(container.position);
          
          // Conteneurs inactifs
          if (container.type === ContainerType.INACTIVE) {
            return (
              <div 
                key={`${container.id}-${container.key || 0}`}
                className="absolute"
                style={{
                  width: CONTAINER_SIZE,
                  height: CONTAINER_SIZE,
                  left: screenPosition.left,
                  top: screenPosition.top,
                  backgroundColor: '#f8f8f8',
                  border: '1px dashed #e0e0e0',
                  transition: 'left 0.3s ease-out, top 0.3s ease-out',
                }}
              />
            );
          }
          
          // Conteneurs actifs (ADOPT, ADOPTED, FREE, EDITORIAL)
          // Déterminer le style en fonction du type pour meilleure visualisation
          let borderStyle = "2px solid transparent";
          let backgroundColor = "white";
          
          switch(container.type) {
            case ContainerType.ADOPT:
              borderStyle = "2px solid blue";
              backgroundColor = "rgba(0, 0, 255, 0.1)";
              break;
            case ContainerType.ADOPTED:
              borderStyle = "2px solid green";
              backgroundColor = "rgba(0, 255, 0, 0.1)";
              break;
            case ContainerType.FREE:
              borderStyle = "2px solid red";
              backgroundColor = "rgba(255, 0, 0, 0.1)";
              break;
            case ContainerType.EDITORIAL:
              borderStyle = "2px solid purple";
              backgroundColor = "rgba(128, 0, 128, 0.1)";
              break;
          }
          
          return (
            <div 
              key={`${container.id}-${container.key || 0}`}
              className="absolute flex items-center justify-center"
              style={{
                width: CONTAINER_SIZE,
                height: CONTAINER_SIZE,
                left: screenPosition.left,
                top: screenPosition.top,
                border: borderStyle,
                backgroundColor,
                transition: 'left 0.3s ease-out, top 0.3s ease-out',
                cursor: 'pointer',
                zIndex: container.id === 0 ? 10 : 1 // L'élément central est au-dessus
              }}
              onClick={() => toggleContainer(container.id)}
              data-cursor-type={container.type === ContainerType.ADOPT ? CursorType.ADOPT : CursorType.GRAB}
            >
              <div className="text-center">
                <div className="font-bold">{container.id}</div>
                <div className="text-xs">{container.type}</div>
                {container.type === ContainerType.EDITORIAL && (
                  <div className="text-xs mt-1 max-w-full overflow-hidden text-ellipsis" style={{maxWidth: "90%"}}>
                    {container.title}
                  </div>
                )}
                <div className="text-xs mt-1">
                  x:{container.position.x}, y:{container.position.y}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
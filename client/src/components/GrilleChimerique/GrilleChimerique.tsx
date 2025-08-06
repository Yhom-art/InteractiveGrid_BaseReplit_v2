import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

// Import des types depuis le fichier commun
import { ContainerType, ContainerState, CursorType, ClickAction } from '@/types/common';

// Import du gestionnaire audio global
import { useAudioManager } from '@/hooks/useAudioManager';
import { Editorial } from '@shared/schema';
import { ClickZones } from '@/components/containers/ClickZones';
import { CustomCursorSimple } from './CustomCursorSimple';
import { TypewriterAnimation } from './TypewriterAnimation';
import { TypewriterText } from './TypewriterText';
import { NameRevealAnimation } from './NameRevealAnimation';
import { WhereIsAnimation } from './WhereIsAnimation';

// Import des fonctions utilitaires
import { getContainerTypeForChimera, processImageUrl, getChimeraImageUrl } from './ChimeraUtils';
import { formatImagePathForDisplay } from '@/utils/imageUtils';
import { EchelleHumaineSimple } from '@/components/EchelleHumaineSimple';
import { ComponentInteractionZones, PanelComponentType } from '@/components/ComponentInteractionZones';
import { AudioPlayer } from '@/components/AudioPlayer';
import { MusicContainer } from '@/components/MusicContainer/MusicContainer';

// Composant intégré pour les containers musicaux
function MusicContainerIntegrated({ 
  container, 
  musicContainers, 
  triggerPlay, 
  cursorPosition,
  proximityData
}: {
  container: Container;
  musicContainers: unknown;
  triggerPlay: boolean;
  cursorPosition: { col: number; row: number };
  proximityData: Record<number, { distance: number; volume: number }>;
}) {
  // Trouver les données du container musical
  console.log(`🔍 Recherche musicData pour chimeraId: ${container.chimeraId}`);
  console.log(`🔍 musicContainers disponibles:`, musicContainers);
  
  const musicData = Array.isArray(musicContainers) ? 
    musicContainers.find((mc: any) => mc.id === container.chimeraId) : null;

  console.log(`🔍 musicData trouvé:`, musicData);

  if (!musicData) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#FF1493',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '10px'
      }}>
        NO DATA
      </div>
    );
  }

  // Récupérer les données de proximité calculées en temps réel
  const proximityInfo = proximityData[container.id] || { distance: 999, volume: 0.1 };
  const distance = proximityInfo.distance;
  const volume = proximityInfo.volume;

  return (
    <div 
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
      data-cursor-type="panel2"
      data-container-type="music"
      data-music-id={container.chimeraId}
    >
      {/* Nouvelle interface complète MusicContainer */}
      <MusicContainer
        containerId={musicData.id}
        title={musicData.title || 'Sans titre'}
        audioUrl={musicData.audioUrl}
        loop={musicData.loop || false}
        isVisible={musicData.isVisible}
        artist={musicData.artist}
        triggerPlay={triggerPlay}
        spatialDistance={distance}
      />
      

    </div>
  );
}




// Import des hooks pour récupérer les chimères et les panels
import { useChimeras, useChimera } from '@/hooks/useChimeras';
import { usePanels, usePanelsByChimera } from '@/hooks/usePanels';

// Type pour les données NFT utilisées dans la grille
interface NFTData {
  name: string;
  reference: string;
  collection: string;
  price: string;
  description: string;
  imageUrl: string;
  type: ContainerType;
}

// Constantes pour la grille
const GRID_COLS = 32;    // 32 colonnes pour la grille complète
const GRID_ROWS = 32;    // 32 lignes pour la grille complète
const CENTER_COL = 16;   // Position centrale horizontale
const CENTER_ROW = 16;   // Position centrale verticale
const VISIBLE_COLS = 32; // Afficher la grille complète
const VISIBLE_ROWS = 32; // Afficher la grille complète

// Dimensions des containers et panels
const CONTAINER_SIZE = 128;  // Taille standard de base (128x128px)
const CONTAINER_GAP = 4;     // Écart entre les containers (4px) 
const PANEL_WIDTH = 304;     // Largeur des panels (304px)

// Types d'expansion pour les containers
enum ContainerExpansionType {
  NONE = "none",           // Pas d'expansion (container standard 128px)
  ONEONE_UP = "oneone_up", // Expansion vers le haut (260px total)
  ONEONE_DWN = "oneone_dwn", // Expansion vers le bas (260px total)
  ONEHALF_DWN = "onehalf_dwn" // Expansion vers le bas (192px total)
}

// Dimensions exactes pour chaque type d'expansion
const EXPANSIONS = {
  [ContainerExpansionType.NONE]: { 
    height: CONTAINER_SIZE, 
    offsetTop: 0, 
    pushAmount: 0 
  },
  [ContainerExpansionType.ONEONE_UP]: { 
    height: 260, 
    offsetTop: -(260 - CONTAINER_SIZE), 
    pushAmount: 260 - CONTAINER_SIZE // 132px vers le haut
  },
  [ContainerExpansionType.ONEONE_DWN]: { 
    height: 260, 
    offsetTop: 0, 
    pushAmount: 260 - CONTAINER_SIZE // 132px vers le bas
  },
  [ContainerExpansionType.ONEHALF_DWN]: { 
    height: 192, 
    offsetTop: 0, 
    pushAmount: 192 - CONTAINER_SIZE // 64px vers le bas
  }
};

// Types pour nos modèles de données
interface Container {
  id: number;
  col: number;
  row: number;
  type: ContainerType;
  expansionType: ContainerExpansionType;
  isExpanded: boolean;
  chimeraId: number; // ID de la chimère associée à ce container
}

interface PanelData {
  containerId: number;
  containerCol: number;
  containerRow: number;
  containerType: ContainerType;
  isOpen: boolean;
}

// Couleurs selon le type de container
const COLORS: Record<ContainerType, string> = {
  [ContainerType.FREE]: '#58C4DD',
  [ContainerType.ADOPT]: '#F2C94C',
  [ContainerType.ADOPTED]: '#EB5757',
  [ContainerType.EDITORIAL]: '#6FCF97',
  [ContainerType.INACTIVE]: '#cccccc',
  [ContainerType.MUSIC]: '#FF69B4'
};

/**
 * Grille Chimérique - Implémentation finale
 * Grille avec containers expansibles et panels
 */
export function GrilleChimerique() {
  // État pour suivre les containers survolés
  const [hoveredContainerId, setHoveredContainerId] = useState<number | null>(null);

  // États pour l'échelle humaine
  const [echelleHumaineActive, setEchelleHumaineActive] = useState(false);
  const [echelleHumaineImage, setEchelleHumaineImage] = useState<string>('');
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [panelBounds, setPanelBounds] = useState<{ left: number; width: number; top: number; height: number } | undefined>(undefined);
  const [isZoomInCooldown, setIsZoomInCooldown] = useState(false);
  const [zoomCountdown, setZoomCountdown] = useState(10);

  // États pour le système de proximité sonore
  const [realMousePosition, setRealMousePosition] = useState({ x: 0, y: 0 });
  const [musicProximityData, setMusicProximityData] = useState<Record<number, { distance: number; volume: number }>>({});

  // Fonction globale pour fermer l'échelle humaine depuis useCursorManager
  useEffect(() => {
    (window as any).closeEchelleHumaine = () => {
      console.log('🔍 Fermeture échelle humaine depuis timer curseur');
      setEchelleHumaineActive(false);
    };
    
    return () => {
      delete (window as any).closeEchelleHumaine;
    };
  }, []);

  // Système de suivi du curseur pour proximité sonore
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setRealMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calcul des distances et volumes pour les containers musicaux
  useEffect(() => {
    let animationId: number;
    
    const updateProximity = () => {
      const currentContainers = document.querySelectorAll('[data-container-id]');
      if (currentContainers.length === 0) return;

      const newProximityData: Record<number, { distance: number; volume: number }> = {};

      currentContainers.forEach(element => {
        const containerElement = element as HTMLElement;
        const containerId = parseInt(containerElement.dataset.containerId || '0');
        const containerType = containerElement.dataset.containerType;
        
        if (containerType !== 'music') return;

        const rect = containerElement.getBoundingClientRect();
        const containerCenterX = rect.left + rect.width / 2;
        const containerCenterY = rect.top + rect.height / 2;

        // Calculer la distance entre le curseur et le centre du container
        const distance = Math.sqrt(
          Math.pow(realMousePosition.x - containerCenterX, 2) +
          Math.pow(realMousePosition.y - containerCenterY, 2)
        );

        // Calculer le volume selon la distance (0-100%)
        let volume = 0;
        const maxDistance = 500; // Distance maximale d'audibilité (0%) - équivalent d'une cellule
        const minDistance = 60;  // Distance minimale pour volume maximum (100%)

        if (distance <= minDistance) {
          volume = 1; // 100% volume au plus proche
        } else if (distance <= maxDistance) {
          // Diminution linéaire progressive du volume de 100% à 0%
          const distanceRange = maxDistance - minDistance; // 320px de portée
          const currentDistance = distance - minDistance;
          volume = Math.max(0, 1 - (currentDistance / distanceRange));
        } else {
          volume = 0; // 0% volume au-delà de la distance max
        }

        newProximityData[containerId] = { distance, volume };
      });

      setMusicProximityData(newProximityData);
    };

    // Utiliser requestAnimationFrame pour une animation fluide synchronisée
    animationId = requestAnimationFrame(updateProximity);

    return () => cancelAnimationFrame(animationId);
  }, [realMousePosition]);

  // Fermeture immédiate lors du drag de la grille (à réactiver si nécessaire)
  // useEffect(() => {
  //   if (isDragging && echelleHumaineActive) {
  //     console.log('🔍 Fermeture échelle humaine - drag détecté');
  //     setEchelleHumaineActive(false);
  //   }
  // }, [isDragging, echelleHumaineActive]);
  /**
   * Récupère les données d'une chimère ou d'un élément éditorial à partir de son ID
   * @param chimeraId ID de la chimère ou de l'élément éditorial à récupérer
   * @param isEditorial Indique s'il s'agit d'un élément éditorial
   * @returns Données formatées pour l'affichage
   */
  const getChimeraDataById = (chimeraId: number, isEditorial: boolean = false, isMusic: boolean = false): NFTData => {
    if (isMusic) {
      // Récupérer le container musical dans la liste
      const musicContainer = Array.isArray(musicContainers) ? musicContainers.find((m: any) => m.id === chimeraId) : null;
      
      if (!musicContainer) {
        // Utiliser le premier container musical disponible dans la liste
        const firstAvailable = Array.isArray(musicContainers) && musicContainers.length > 0 ? musicContainers[0] : null;
        if (!firstAvailable) {
          return {
            name: 'Aucun Audio Configuré',
            reference: 'NO-AUDIO',
            collection: 'Yhom Audio',
            price: 'N/A',
            description: 'Aucun container musical disponible',
            imageUrl: '',
            type: ContainerType.MUSIC
          };
        }
        
        return {
          name: firstAvailable.title,
          reference: `MUSIC-${firstAvailable.id}`,
          collection: 'Yhom Audio',
          price: 'N/A',
          description: firstAvailable.artist || 'Container musical',
          imageUrl: '',
          type: ContainerType.MUSIC
        };
      }
      
      // Retourner les données formatées pour le container musical
      return {
        name: musicContainer.title,
        reference: `MUSIC-${musicContainer.id}`,
        collection: 'Yhom Audio',
        price: 'N/A',
        description: musicContainer.artist || 'Container musical',
        imageUrl: '', // Pas d'image pour les containers musicaux
        type: ContainerType.MUSIC
      };
    } else if (isEditorial) {
      // Récupérer l'élément éditorial dans la liste
      const editorial = editorials?.find(e => e.id === chimeraId);
      
      if (!editorial) {
        // Valeurs par défaut si l'élément éditorial n'est pas trouvé
        return {
          name: 'Élément éditorial inconnu',
          reference: 'N/A',
          collection: 'Yhom Editorial',
          price: 'N/A',
          description: 'Aucune description disponible',
          imageUrl: '',
          type: ContainerType.EDITORIAL
        };
      }
      
      // Retourner les données formatées pour l'élément éditorial
      return {
        name: editorial.name,
        reference: editorial.reference,
        collection: 'Yhom Editorial',
        price: 'N/A',
        description: editorial.description,
        imageUrl: processImageUrl(editorial.imageUrl),
        type: ContainerType.EDITORIAL
      };
    } else {
      // Récupérer la chimère dans la liste
      const chimera = chimeras?.find(c => c.id === chimeraId);
      
      if (!chimera) {
        // Valeurs par défaut si la chimère n'est pas trouvée
        return {
          name: 'Chimère inconnue',
          reference: 'N/A',
          collection: 'N/A',
          price: 'N/A',
          description: 'Aucune description disponible',
          imageUrl: '',
          type: ContainerType.FREE
        };
      }
      
      // Convertir le type en ContainerType si nécessaire
      let containerType: ContainerType;
      switch (chimera.type) {
        case 'FREE':
          containerType = ContainerType.FREE;
          break;
        case 'ADOPT':
          containerType = ContainerType.ADOPT;
          break;
        case 'ADOPTED':
          containerType = ContainerType.ADOPTED;
          break;
        case 'EDITORIAL':
          containerType = ContainerType.EDITORIAL;
          break;
        default:
          containerType = ContainerType.INACTIVE;
      }
      
      // Retourner les données formatées
      return {
        name: chimera.name,
        reference: chimera.reference,
        collection: chimera.collection,
        price: chimera.price,
        description: chimera.description,
        imageUrl: getChimeraImageUrl(chimera),
        type: containerType
      };
    }
  };
  // États de base pour la grille
  const [containers, setContainers] = useState<Container[]>([]);
  const [panels, setPanels] = useState<Map<number, PanelData>>(new Map());
  const [columnOffsets, setColumnOffsets] = useState<number[]>(Array(GRID_COLS).fill(0));
  const [verticalShifts, setVerticalShifts] = useState<Map<number, number>>(new Map());
  
  // État pour le mode debug (activable avec la touche 'd')
  const [debug, setDebug] = useState(true); // Activé pour diagnostiquer les containers musicaux // Démarrage en mode debug pour vérification
  
  // État pour le centre de la vue
  const [viewCenter, setViewCenter] = useState({ col: CENTER_COL, row: CENTER_ROW });
  
  // Récupération des chimères depuis la base de données
  const { data: chimeras, isLoading, error } = useChimeras();
  
  // Récupération des éléments éditoriaux
  const { data: editorials = [], isLoading: editorialsLoading } = useQuery<Editorial[]>({ 
    queryKey: ['/api/editorials']
  });
  
  // Récupération de tous les panels
  const { data: allPanels, isLoading: panelsLoading } = usePanels();
  
  // Récupération des containers musicaux
  const { data: musicContainers = [] } = useQuery({
    queryKey: ['/api/music-containers'],
  });
  

  
  // État pour le trigger Play on Move universel
  const [triggerPlayOnMove, setTriggerPlayOnMove] = useState(false);
  const hasMouseMoved = useRef(false);
  
  // Effet d'initialisation - centrage parfait au démarrage
  useEffect(() => {
    console.log('Initialisation de la grille 32x32 centrée sur:', CENTER_COL, CENTER_ROW);
    // S'assurer que la vue est centrée sur la position (16,16)
    setViewCenter({ col: CENTER_COL, row: CENTER_ROW });
    
    // Positionner visuellement le contenu de la grille pour que le centre soit parfaitement visible
    setTimeout(() => {
      const gridContainer = document.querySelector('.grid-content-container') as HTMLElement;
      if (gridContainer) {
        // Calcul pour centrer la grille visuellement
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculer le décalage pour centrer exactement sur la colonne et la rangée centrale
        // Taille d'une cellule = CONTAINER_SIZE + CONTAINER_GAP
        const cellSize = CONTAINER_SIZE + CONTAINER_GAP;
        
        // Position centrale de la grille
        const centralX = CENTER_COL * cellSize;
        const centralY = CENTER_ROW * cellSize;
        
        // Calculer la translation pour que la position centrale soit au milieu de l'écran
        // Ajout d'un ajustement de 66px (moitié de CONTAINER_SIZE) pour aligner parfaitement le centre
        const translateX = (viewportWidth / 2) - centralX - 66;
        const translateY = (viewportHeight / 2) - centralY - 66;
        
        // Appliquer la translation
        gridContainer.style.transform = `translate(${translateX}px, ${translateY}px)`;
        console.log('Centrage visuel appliqué:', translateX, translateY);
      }
    }, 100); // Léger délai pour s'assurer que les éléments DOM sont prêts
  }, []);
  
  // Gérer les raccourcis clavier
  // Gestion des raccourcis clavier - séparé en plusieurs effets pour éviter les problèmes de dépendances
  useEffect(() => {
    const handleDebugToggle = (e: KeyboardEvent) => {
      // Touche 'd' pour activer/désactiver le mode debug
      if (e.key === 'd') {
        setDebug(prev => !prev);
        console.log('Mode debug activé:', !debug);
      }
    };
    
    window.addEventListener('keydown', handleDebugToggle);
    return () => window.removeEventListener('keydown', handleDebugToggle);
  }, [debug]);
  
  // Gestion du recentrage (touche 'c')
  useEffect(() => {
    const handleCenterView = (e: KeyboardEvent) => {
      if (e.key === 'c') {
        setViewCenter({ col: CENTER_COL, row: CENTER_ROW });
        
        // Recentrer la grille visuellement
        const gridContainer = document.querySelector('.grid-content-container') as HTMLElement;
        if (gridContainer) {
          // Calcul pour centrer la grille visuellement
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculer le décalage pour centrer exactement sur la colonne et la rangée centrale
          // Taille d'une cellule = CONTAINER_SIZE + CONTAINER_GAP
          const cellSize = CONTAINER_SIZE + CONTAINER_GAP;
          
          // Position centrale de la grille
          const centralX = CENTER_COL * cellSize;
          const centralY = CENTER_ROW * cellSize;
          
          // Calculer la translation pour que la position centrale soit au milieu de l'écran
          // Ajout d'un ajustement de 66px (moitié de CONTAINER_SIZE) pour aligner parfaitement le centre
          const translateX = (viewportWidth / 2) - centralX - (CONTAINER_SIZE / 2);
          const translateY = (viewportHeight / 2) - centralY - (CONTAINER_SIZE / 2);
          
          // Appliquer la translation
          gridContainer.style.transform = `translate(${translateX}px, ${translateY}px)`;
          console.log('Vue recentrée avec translation:', translateX, translateY);
        }
      }
    };
    
    window.addEventListener('keydown', handleCenterView);
    return () => window.removeEventListener('keydown', handleCenterView);
  }, []);
  
  // Ajout de container test (touche 'a' ou 'q')
  useEffect(() => {
    const handleAddTestContainer = (e: KeyboardEvent) => {
      // Raccourci disponible uniquement en mode debug
      if ((e.key === 'a' || e.key === 'q') && debug) {
        console.log('TEST: Ajout d\'un container test au centre (16,16)');
        
        // Déterminer un type au hasard pour le test
        const typeOptions = [ContainerType.FREE, ContainerType.ADOPT, ContainerType.ADOPTED];
        const randomType = typeOptions[Math.floor(Math.random() * typeOptions.length)];
        
        // Générer un ID unique élevé pour éviter les conflits
        const newId = 99999;
          
        // Créer un nouveau container actif spécial pour le test
        const testContainer: Container = {
          id: newId,
          col: CENTER_COL,
          row: CENTER_ROW,
          type: randomType,
          expansionType: randomType === ContainerType.FREE 
            ? ContainerExpansionType.ONEONE_UP 
            : randomType === ContainerType.ADOPTED
              ? ContainerExpansionType.ONEONE_DWN
              : ContainerExpansionType.ONEHALF_DWN,
          isExpanded: false,
          chimeraId: 1 // Pour le test, utiliser une chimère existante
        };
        
        console.log('TEST: Container créé pour test:', testContainer);
        setContainers(prev => {
          // Créer une copie de l'état
          const updatedContainers = [...prev];
          
          // Chercher et remplacer un container existant au centre s'il existe
          const centerIndex = updatedContainers.findIndex(c => 
            c.col === CENTER_COL && c.row === CENTER_ROW
          );
          
          if (centerIndex >= 0) {
            console.log('TEST: Remplacement du container existant au centre');
            updatedContainers[centerIndex] = testContainer;
          } else {
            console.log('TEST: Ajout d\'un nouveau container au centre');
            updatedContainers.push(testContainer);
          }
          
          return updatedContainers;
        });
      }
    };
    
    window.addEventListener('keydown', handleAddTestContainer);
    return () => window.removeEventListener('keydown', handleAddTestContainer);
  }, [debug, containers]);
  
  // Fonction pour générer des positions en spirale à partir du centre
  const generateSpiralPositions = (count: number): { row: number, col: number }[] => {
    const positions: { row: number, col: number }[] = [];
    
    // Le premier container est toujours au centre
    positions.push({ row: CENTER_ROW, col: CENTER_COL });
    
    if (count <= 1) return positions;
    
    // Algorithme de spirale
    // Direction: 0=droite, 1=bas, 2=gauche, 3=haut
    let direction = 0;
    // Taille du segment actuel
    let segmentLength = 1;
    // Segments complétés dans la direction actuelle
    let segmentsCompleted = 0;
    
    // Position actuelle (commence au centre)
    let currentRow = CENTER_ROW;
    let currentCol = CENTER_COL;
    
    // Générer le reste des positions en spirale
    console.log('Génération de spirale à partir du centre:', CENTER_COL, CENTER_ROW);
    while (positions.length < count) {
      // Avancer dans la direction actuelle
      switch (direction) {
        case 0: // Droite
          currentCol++;
          break;
        case 1: // Bas
          currentRow++;
          break;
        case 2: // Gauche
          currentCol--;
          break;
        case 3: // Haut
          currentRow--;
          break;
      }
      
      // Ajouter la nouvelle position à la liste
      positions.push({ row: currentRow, col: currentCol });
      
      // Vérifier si on a parcouru tout le segment actuel
      segmentsCompleted++;
      if (segmentsCompleted === segmentLength) {
        // Changer de direction
        direction = (direction + 1) % 4;
        segmentsCompleted = 0;
        
        // Après avoir complété 2 segments dans la même direction (horizontal puis vertical),
        // on augmente la longueur du segment
        if (direction === 0 || direction === 2) {
          segmentLength++;
        }
      }
    }
    
    return positions;
  };
  
  // Générer les containers lorsque les chimères et éléments éditoriaux sont chargés
  useEffect(() => {
    // Attendre que les chimères soient chargées
    if (!chimeras || chimeras.length === 0) return;
    
    // Log pour les éléments éditoriaux chargés
    console.log('Éléments éditoriaux chargés:', editorials?.length || 0);
    
    const initialContainers: Container[] = [];
    
    // Remplir la grille entière avec des containers vides (32x32 = 1024 containers au total)
    let containerCount = 0; // Pour debug - compter les containers
    for (let col = 0; col < GRID_COLS; col++) {
      for (let row = 0; row < GRID_ROWS; row++) {
        // Par défaut, ce sont des containers inactifs (vides)
        containerCount++;
        initialContainers.push({
          id: (col * GRID_COLS) + row + 10000, // IDs uniques pour les containers vides (à partir de 10000)
          col,
          row,
          type: ContainerType.INACTIVE,
          expansionType: ContainerExpansionType.NONE,
          isExpanded: false,
          chimeraId: -1 // Pas de chimère associée
        });
      }
    }
    
    // Nombre de chimères à afficher (jusqu'à 50 maximum)
    const chimeraCount = Math.min(chimeras.length, 50);
    
    // Nombre d'éléments éditoriaux à afficher (tous)
    const editorialCount = editorials?.length || 0;
    console.log(`Intégration de ${editorialCount} éléments éditoriaux dans la grille`);
    
    // Générer suffisamment de positions en spirale pour tous les éléments (chimères + éditoriaux)
    const totalPositions = generateSpiralPositions(chimeraCount + editorialCount);
    
    // Nous allons maintenant intercaler les éléments éditoriaux dans la spirale,
    // tout en préservant l'ordre chronologique des chimères
    
    // D'abord, garder la position centrale pour la dernière chimère (la plus récente)
    const centerPosition = totalPositions[0];
    
    // Les positions restantes (après la position centrale)
    const nonCenterPositions = totalPositions.slice(1);
    
    // Générer des indices aléatoires où nous allons insérer les éléments éditoriaux
    // dans la liste des positions (en excluant la position centrale)
    const editorialIndices: number[] = [];
    const maxIndex = nonCenterPositions.length;
    
    // Générer des indices aléatoires uniques pour placer les éléments éditoriaux
    while (editorialIndices.length < editorialCount) {
      const randomIndex = Math.floor(Math.random() * maxIndex);
      // Vérifier que cet indice n'a pas déjà été choisi
      if (!editorialIndices.includes(randomIndex)) {
        editorialIndices.push(randomIndex);
      }
    }
    
    // Trier les indices pour faciliter l'insertion
    editorialIndices.sort((a, b) => a - b);
    
    // Créer un tableau de positions finales avec les éléments éditoriaux intercalés
    const finalPositions: {position: {row: number, col: number}, isEditorial: boolean}[] = [];
    
    // Ajouter la position centrale en premier (toujours une chimère)
    finalPositions.push({position: centerPosition, isEditorial: false});
    
    // Variable pour suivre les éléments éditoriaux déjà placés
    let editorialCount_placed = 0;
    // Variable pour suivre les chimères déjà placées (en excluant celle au centre)
    let chimeraCount_placed = 0;
    
    // Pour chaque position restante, déterminer si c'est une position pour un éditorial ou une chimère
    for (let i = 0; i < nonCenterPositions.length; i++) {
      // Si cet indice est dans la liste des indices pour les éditoriaux, c'est un éditorial
      if (editorialIndices.includes(i) && editorialCount_placed < editorialCount) {
        finalPositions.push({position: nonCenterPositions[i], isEditorial: true});
        editorialCount_placed++;
      } 
      // Sinon, c'est une chimère (si nous n'avons pas dépassé le nombre de chimères)
      else if (chimeraCount_placed < chimeraCount - 1) { // -1 car la première chimère est au centre
        finalPositions.push({position: nonCenterPositions[i], isEditorial: false});
        chimeraCount_placed++;
      }
      // Si nous avons déjà placé toutes les chimères, mais qu'il reste des éditoriaux,
      // utiliser cette position pour un éditorial supplémentaire
      else if (editorialCount_placed < editorialCount) {
        finalPositions.push({position: nonCenterPositions[i], isEditorial: true});
        editorialCount_placed++;
      }
    }
    
    // Séparer les positions finales en positions pour chimères et positions pour éditoriaux
    const chimeraPositions: {row: number, col: number}[] = [];
    const finalEditorialPositions: {row: number, col: number}[] = [];
    
    finalPositions.forEach(item => {
      if (item.isEditorial) {
        finalEditorialPositions.push(item.position);
      } else {
        chimeraPositions.push(item.position);
      }
    });
    
    console.log(`Positions intercalées générées: ${chimeraPositions.length} pour chimères (ordre chronologique préservé), ${finalEditorialPositions.length} pour éditoriaux (positions aléatoires dans la spirale)`);
    
    // Créer un ensemble des positions utilisées pour référence
    const usedPositions = new Set<string>();
    
    // Ajouter toutes les positions à l'ensemble des positions utilisées
    [...chimeraPositions, ...finalEditorialPositions].forEach(({row, col}) => {
      usedPositions.add(`${row},${col}`);
    });
    
    // Créer les containers pour les chimères
    chimeraPositions.forEach(({ row, col }, index) => {
      // On ne modifie pas les coordonnées du premier élément (qui doit être au centre)
      let adjustedCol = col;
      let adjustedRow = row;
      
      // Obtenir la chimère correspondante - ordre inversé
      // La dernière chimère (chimeras.length - 1) est placée au centre (index = 0)
      const chimera = chimeras[chimeras.length - 1 - index];
      
      // Log pour debug - vérifier la position centrale
      if (index === 0) {
        console.log(`Chimère centrale placée à la position (${adjustedCol}, ${adjustedRow})`);
      }
      
      // Déterminer le type de container en fonction de la chimère
      let type = getContainerTypeForChimera(chimera);
      
      // Déterminer le type d'expansion selon le type de container
      let expansionType: ContainerExpansionType;
      
      // Correspondance entre types de container et types d'expansion
      switch (type) {
        case ContainerType.FREE:
          expansionType = ContainerExpansionType.ONEONE_UP; // FREE = extension vers le haut
          break;
        case ContainerType.ADOPTED:
          expansionType = ContainerExpansionType.ONEONE_DWN; // ADOPTED = extension vers le bas
          break;
        case ContainerType.ADOPT:
          expansionType = ContainerExpansionType.ONEHALF_DWN; // ADOPT = extension partielle vers le bas
          break;
        case ContainerType.EDITORIAL:
          expansionType = ContainerExpansionType.NONE; // Éditorial = taille fixe
          break;
        default:
          expansionType = ContainerExpansionType.NONE; // Inactif = taille fixe
          break;
      }
      
      // Ajuster l'ID pour correspondre à la chimère réelle
      // On utilise l'ID de la chimère de la base de données
      const id = chimera.id;
      
      // Ajouter le container à la liste
      initialContainers.push({
        id,
        col,
        row,
        type,
        expansionType,
        isExpanded: false,
        chimeraId: chimera.id // Stocker l'ID de la chimère pour référence
      });
      
      if (debug) {
        console.log(`Container ${id} créé pour la chimère ${chimera.name} (${type})`);
      }
    });
    
    // Créer les conteneurs pour les éléments éditoriaux
    if (editorials && editorials.length > 0) {
      finalEditorialPositions.forEach((position, index) => {
        if (index < editorials.length) {
          const editorial = editorials[index];
          
          // Ajouter le conteneur pour l'élément éditorial
          initialContainers.push({
            id: editorial.id + 50000, // Utiliser un ID avec offset pour éviter les conflits
            col: position.col,
            row: position.row,
            type: ContainerType.EDITORIAL,
            expansionType: ContainerExpansionType.NONE, // Les éditoriaux ne s'étendent pas
            isExpanded: false,
            chimeraId: editorial.id // Utiliser l'ID de l'éditorial comme référence
          });
          
          if (debug) {
            console.log(`Conteneur éditorial ${editorial.id} créé à la position (${position.col}, ${position.row})`);
          }
        }
      });
    }
    
    // Ajouter TOUS les containers musicaux visibles avec disposition en quadrants
    if (musicContainers && Array.isArray(musicContainers) && musicContainers.length > 0) {
      const visibleMusicContainers = musicContainers.filter(mc => mc.isVisible);
      const activeContainers = initialContainers.filter(c => c.chimeraId !== -1);
      
      if (activeContainers.length > 0 && visibleMusicContainers.length > 0) {
        // Calculer les limites de la grille active
        const minCol = Math.min(...activeContainers.map(c => c.col));
        const maxCol = Math.max(...activeContainers.map(c => c.col));
        const minRow = Math.min(...activeContainers.map(c => c.row));
        const maxRow = Math.max(...activeContainers.map(c => c.row));
        
        // Positions existantes des containers musicaux pour éviter les chevauchements
        const usedPositions: Array<{col: number, row: number}> = [];
        
        visibleMusicContainers.forEach((musicContainer, index) => {
          let attempts = 0;
          let position = null;
          
          // Essayer de trouver une position libre jusqu'à 10 tentatives
          while (!position && attempts < 10) {
            const distance = 3; // Distance fixe de 3 comme demandé
            
            // Répartition en quadrants : Nord, Sud, Est, Ouest
            const quadrant = index % 4;
            let musicCol, musicRow;
            
            switch (quadrant) {
              case 0: // Nord
                musicCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
                musicRow = minRow - distance;
                break;
              case 1: // Est  
                musicCol = maxCol + distance;
                musicRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
                break;
              case 2: // Sud
                musicCol = minCol + Math.floor(Math.random() * (maxCol - minCol + 1));
                musicRow = maxRow + distance;
                break;
              case 3: // Ouest
                musicCol = minCol - distance;
                musicRow = minRow + Math.floor(Math.random() * (maxRow - minRow + 1));
                break;
              default:
                musicCol = maxCol + distance;
                musicRow = CENTER_ROW;
            }
            
            // Vérifier si la position est libre (pas de chevauchement)
            const isPositionFree = !usedPositions.some(pos => 
              Math.abs(pos.col - musicCol) < 2 && Math.abs(pos.row - musicRow) < 2
            );
            
            if (isPositionFree) {
              position = { col: musicCol, row: musicRow };
              usedPositions.push(position);
            }
            
            attempts++;
          }
          
          // Si on n'a pas trouvé de position libre, utiliser une position par défaut
          if (!position) {
            position = {
              col: maxCol + 3 + Math.floor(index / 4) * 2,
              row: CENTER_ROW + (index % 4) * 2
            };
            usedPositions.push(position);
          }
          
          // Créer le container musical intégré à la grille
          const musicContainerObj = {
            id: 90000 + musicContainer.id, // ID unique pour chaque container musical
            col: position.col,
            row: position.row,
            type: ContainerType.MUSIC,
            expansionType: ContainerExpansionType.NONE,
            isExpanded: false,
            chimeraId: musicContainer.id // Référence directe au music container
          };
          
          initialContainers.push(musicContainerObj);
          
          console.log(`🎵 Container musical "${musicContainer.title || 'Sans titre'}" (ID: ${musicContainer.id}) intégré à la position (${position.col}, ${position.row}) avec chimeraId: ${musicContainer.id}`);
        });
      }
    }

    setContainers(initialContainers);
    

    
  }, [chimeras, editorials, debug, musicContainers]);
  
  // Déclenchement Play on Move au premier mouvement de souris
  useEffect(() => {
    const handleFirstMouseMove = () => {
      if (!hasMouseMoved.current) {
        hasMouseMoved.current = true;
        setTriggerPlayOnMove(true);
        console.log('🎵 PLAY ON MOVE - Déclenchement universel des containers MUSIC');
      }
    };

    document.addEventListener('mousemove', handleFirstMouseMove);
    return () => document.removeEventListener('mousemove', handleFirstMouseMove);
  }, []);
  

  

  
  // Calculer les décalages horizontaux (colonnes) et verticaux (containers)
  useEffect(() => {
    if (containers.length === 0) return;
    
    // 1. Calculer les décalages horizontaux (pour les panels)
    const newOffsets = Array(GRID_COLS).fill(0);
    
    // Parcourir tous les panels ouverts, triés par colonne
    const openPanels = Array.from(panels.values())
      .filter(panel => panel.isOpen)
      .sort((a, b) => a.containerCol - b.containerCol);
    
    // Pour chaque panel ouvert, calculer l'impact sur les colonnes à droite
    openPanels.forEach(panel => {
      const panelCol = panel.containerCol;
      
      // Toutes les colonnes à droite de celle-ci sont décalées
      for (let col = panelCol + 1; col < GRID_COLS; col++) {
        newOffsets[col] += PANEL_WIDTH + CONTAINER_GAP;
      }
    });
    
    // 2. Calculer les décalages verticaux (pour les containers expandés)
    const newVerticalShifts = new Map<number, number>();
    
    // Pour chaque colonne
    for (let col = 0; col < GRID_COLS; col++) {
      // Récupérer les containers de cette colonne, triés par row
      const colContainers = containers
        .filter(c => c.col === col)
        .sort((a, b) => a.row - b.row);
      
      // Accumuler le décalage vertical en parcourant la colonne de haut en bas
      let accumulatedShift = 0;
      
      for (let i = 0; i < colContainers.length; i++) {
        const container = colContainers[i];
        const containerId = container.id;
        
        // Appliquer le décalage accumulé à ce container
        if (accumulatedShift > 0) {
          newVerticalShifts.set(containerId, accumulatedShift);
        }
        
        // Si ce container est expandé, calculer combien il pousse les suivants
        if (container.isExpanded) {
          const expansionType = container.expansionType;
          const expansionInfo = EXPANSIONS[expansionType];
          
          // Pour les expansions vers le bas, on accumule le décalage
          if (expansionType === ContainerExpansionType.ONEONE_DWN || 
              expansionType === ContainerExpansionType.ONEHALF_DWN) {
            accumulatedShift += expansionInfo.pushAmount;
          }
        }
      }
      
      // Deuxième passe pour les expansions vers le haut
      for (let i = colContainers.length - 1; i >= 0; i--) {
        const container = colContainers[i];
        
        if (container.isExpanded && container.expansionType === ContainerExpansionType.ONEONE_UP) {
          const expansionInfo = EXPANSIONS[container.expansionType];
          
          // Décaler tous les containers au-dessus
          for (let j = i - 1; j >= 0; j--) {
            const upperContainer = colContainers[j];
            const currentShift = newVerticalShifts.get(upperContainer.id) || 0;
            newVerticalShifts.set(
              upperContainer.id, 
              currentShift - Math.abs(expansionInfo.offsetTop)
            );
          }
        }
      }
    }
    
    setColumnOffsets(newOffsets);
    setVerticalShifts(newVerticalShifts);
    
    if (debug) {
      console.log('Décalages horizontaux:', newOffsets);
      console.log('Décalages verticaux:', Array.from(newVerticalShifts.entries())
        .map(([id, shift]) => `#${id}: ${shift}px`)
      );
    }
  }, [containers, panels, debug]);
  
  // Fonction pour basculer l'état d'expansion d'un container
  const toggleContainerExpansion = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    const newContainers = [...containers];
    const containerIndex = newContainers.findIndex(c => c.id === containerId);
    
    if (containerIndex === -1) return;
    
    // Inverser l'état d'expansion
    const newExpanded = !container.isExpanded;
    
    // Pas de gestion spéciale pour les containers FREE lors de la fermeture
    // On laisse les transitions CSS standard gérer le changement
    
    // Si on réduit le container, vérifier si un panel était ouvert et le fermer
    if (!newExpanded && panels.has(containerId)) {
      const newPanels = new Map(panels);
      newPanels.delete(containerId);
      setPanels(newPanels);
      console.log(`Panel fermé lors de la réduction du container ${containerId}`);
    }
    
    // Mettre à jour le container
    newContainers[containerIndex] = {
      ...newContainers[containerIndex],
      isExpanded: newExpanded
    };
    
    setContainers(newContainers);
    console.log(`Container ${containerId} ${newExpanded ? 'agrandi' : 'réduit'} (${container.expansionType})`);
  };
  
  // Fonction pour basculer l'ouverture d'un panel
  const togglePanel = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Un container doit être expandé pour avoir un panel
    if (!container.isExpanded) {
      console.log(`Le container ${containerId} doit être agrandi avant d'ouvrir un panel`);
      return;
    }
    
    // Créer une copie pour modification
    const newPanels = new Map(panels);
    
    // Règle: Un seul panel par colonne
    // Chercher si un autre panel est déjà ouvert dans cette colonne
    const existingPanelInColumn = Array.from(newPanels.values()).find(
      panel => panel.containerCol === container.col && panel.isOpen && panel.containerId !== containerId
    );
    
    // Si un autre panel existe déjà dans cette colonne, le fermer
    if (existingPanelInColumn) {
      newPanels.delete(existingPanelInColumn.containerId);
      console.log(`Panel fermé: ${existingPanelInColumn.containerId}`);
    }
    
    // Si ce panel existe déjà, le fermer
    if (newPanels.has(containerId)) {
      newPanels.delete(containerId);
      console.log(`Panel fermé: ${containerId}`);
    } 
    // Sinon, ouvrir un nouveau panel
    else {
      newPanels.set(containerId, {
        containerId,
        containerCol: container.col,
        containerRow: container.row,
        containerType: container.type,
        isOpen: true
      });
      console.log(`Panel ouvert: ${containerId}`);
    }
    
    // Mettre à jour l'état
    setPanels(newPanels);
    
    // Log pour debug
    console.log('Panels actifs:', Array.from(newPanels.entries())
      .filter(([_, panel]) => panel.isOpen)
      .map(([id, _]) => id)
    );
  };
  
  // Calculer la zone visible en fonction du centre de vue
  const getVisibleBounds = () => {
    const startCol = viewCenter.col - Math.floor(VISIBLE_COLS / 2);
    const startRow = viewCenter.row - Math.floor(VISIBLE_ROWS / 2);
    const endCol = startCol + VISIBLE_COLS;
    const endRow = startRow + VISIBLE_ROWS;
    
    return { startCol, startRow, endCol, endRow };
  };
  
  // Gérer le clic sur un container avec la logique d'interaction
  const handleContainerClick = (containerId: number) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return;
    
    // Déterminer si c'est un conteneur éditorial
    const isEditorial = container.type === ContainerType.EDITORIAL;
    const isMusic = container.type === ContainerType.MUSIC;
    
    // Pour les conteneurs musicaux, comportement spécial
    if (isMusic) {
      console.log('🎵 Clic sur container musical détecté', { containerId, chimeraId: container.chimeraId });
      // Le MusicContainer gère ses propres contrôles audio
      return; // Ne pas agrandir les containers musicaux
    }
    
    // Pour les conteneurs éditoriaux, comportement spécial
    if (isEditorial) {
      // Récupérer l'élément éditorial correspondant
      const editorial = editorials?.find(e => e.id === container.chimeraId);
      
      if (editorial && editorial.externalUrl) {
        // Ouvrir le lien externe dans une nouvelle fenêtre/onglet
        window.open(editorial.externalUrl, '_blank');
        console.log(`Ouverture du lien externe: ${editorial.externalUrl}`);
        return; // Sortir de la fonction après avoir ouvert le lien
      } else {
        console.log(`Aucun lien externe trouvé pour l'élément éditorial #${container.chimeraId}`);
      }
    }
    
    // Comportement par défaut pour tous les conteneurs (y compris éditoriaux sans lien)
    if (container.isExpanded) {
      togglePanel(containerId);
      console.log(`Container ${isEditorial ? 'éditorial ' : ''}déjà agrandi, ouverture du panel`);
    } else {
      toggleContainerExpansion(containerId);
    }
  };
  
  // Fonction pour gérer le déplacement de la vue - Style Google Maps
  // Cette fonction est GLOBALE et TOUJOURS ACTIVE (prioritaire sur tout le reste)
  const handleMapDrag = (e: React.MouseEvent<HTMLElement>) => {
    // Enregistrer où l'utilisateur a commencé le drag
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Log pour debug
    console.log('Starting drag, event target:', e.target);
    
    // Élément qui contient toute la grille (le "fond de carte")
    const mapContent = document.querySelector('.grid-content-container') as HTMLElement;
    if (!mapContent) return;
    
    // Position initiale de la carte
    const computedStyle = window.getComputedStyle(mapContent);
    const transform = computedStyle.transform || computedStyle.webkitTransform;
    
    // Valeurs initiales des translations
    let initialTranslateX = 0;
    let initialTranslateY = 0;
    
    // Extraire les valeurs existantes si présentes
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrix(transform);
      initialTranslateX = matrix.e;
      initialTranslateY = matrix.f;
    }
    
    // Sauvegarder le curseur d'origine pour le restaurer plus tard
    const originalCursor = document.body.style.cursor;
    
    // Activer le mode "grabbing" (poing fermé) pendant le déplacement
    document.body.style.cursor = 'grabbing';
    
    // Gestionnaire de déplacement - exécuté à chaque mouvement de souris
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calcul du déplacement par rapport au point de départ
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Nouvelle position = position initiale + déplacement
      const newX = initialTranslateX + deltaX;
      const newY = initialTranslateY + deltaY;
      
      // Application du déplacement via CSS Transform (performant)
      mapContent.style.transform = `translate(${newX}px, ${newY}px)`;
      
      // Calcul de la position du curseur dans la grille pour spatialisation audio
      const rect = mapContent.getBoundingClientRect();
      const cursorX = moveEvent.clientX - rect.left;
      const cursorY = moveEvent.clientY - rect.top;
      
      // Conversion en coordonnées de grille
      const cursorCol = Math.floor(cursorX / (CONTAINER_SIZE + CONTAINER_GAP));
      const cursorRow = Math.floor(cursorY / (CONTAINER_SIZE + CONTAINER_GAP));
      
      // Le nouveau système MusicContainer gère automatiquement la spatialisation
    };
    
    // Fin du déplacement
    const handleMouseUp = () => {
      // Supprimer les écouteurs temporaires
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Restaurer le curseur d'origine (souvent 'grab' ou forme standard)
      document.body.style.cursor = originalCursor || 'grab';
    };
    
    // Ajouter les écouteurs temporaires pour suivre le mouvement
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Empêcher les comportements par défaut qui pourraient interférer
    e.preventDefault();
  };
  
  // Rendu d'un container avec gestion des expansions
  const renderContainer = (container: Container) => {
    // Calculer les limites de la zone visible
    const { startCol, startRow } = getVisibleBounds();
    
    // Ajuster les positions par rapport à notre zone visible
    const adjustedCol = container.col - startCol;
    const adjustedRow = container.row - startRow;
    
    // Calculer la position avec décalage de colonne (horizontal)
    const left = (adjustedCol * (CONTAINER_SIZE + CONTAINER_GAP)) + columnOffsets[container.col];
    
    // Position de base du container selon sa ligne
    let top = adjustedRow * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Ajouter le décalage vertical s'il existe pour ce container
    const verticalShift = verticalShifts.get(container.id) || 0;
    top += verticalShift;
    
    // Récupérer les dimensions appropriées selon le type d'expansion
    const expansion = container.isExpanded 
      ? EXPANSIONS[container.expansionType] 
      : EXPANSIONS[ContainerExpansionType.NONE];
    
    // Appliquer l'offset vertical si le container est étendu vers le haut
    if (container.isExpanded) {
      top += expansion.offsetTop;
    }
    
    // Déterminer la hauteur du container
    const height = container.isExpanded ? expansion.height : CONTAINER_SIZE;
    
    // État du panel associé à ce container
    const hasOpenPanel = panels.has(container.id) && panels.get(container.id)!.isOpen;
    
    // Récupérer les données NFT pour ce container
    // Vérifier le type de conteneur pour déterminer le mode de récupération des données
    const isEditorial = container.type === ContainerType.EDITORIAL;
    const isMusic = container.type === ContainerType.MUSIC;
    const nftData = getChimeraDataById(container.chimeraId, isEditorial, isMusic);
    
    return (
      <div
        key={`container-${container.id}`}
        className={`container container-${container.id} ${container.isExpanded ? 'expanded' : ''} ${hasOpenPanel ? 'has-panel' : ''} nft-container`}
        data-container-id={container.id}
        data-container-type={container.type.toLowerCase()}
        style={{
          width: CONTAINER_SIZE,
          height,
          backgroundColor: 'transparent',
          position: 'absolute',
          left,
          top,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: container.type === ContainerType.EDITORIAL || container.type === ContainerType.INACTIVE || container.type === ContainerType.MUSIC ? 'default' : 'pointer',
          border: debug ? '1px dashed rgba(0,0,0,0.3)' : 'none',
          transition: 'all 0.3s ease-out',
          zIndex: hasOpenPanel ? 2 : 1,
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        // Handlers pour le zoom et l'interaction de texte
        onMouseEnter={(e) => {
          // 1. Mettre à jour l'état de survol pour ce container
          setHoveredContainerId(container.id);
          console.log(`Hover déclenché pour container ${container.id}, type: ${container.type}`);
          
          // 2. Activer le zoom uniquement si le container n'est pas déjà ouvert
          if (!container.isExpanded) {
            const imageElement = e.currentTarget.querySelector('.nft-image');
            if (imageElement && !imageElement.classList.contains('zoom-active')) {
              // Lancer l'animation de zoom
              imageElement.classList.add('zoom-active');
              console.log(`Zoom lancé pour container ${container.id}`);
              
              // Programmer la réinitialisation après la fin de l'animation complète (5 secondes = 1s in + 4s out)
              setTimeout(() => {
                if (imageElement) {
                  imageElement.classList.remove('zoom-active');
                  console.log(`Animation de zoom terminée pour container ${container.id}`);
                }
              }, 5000);
            }
          }
        }}
        onMouseLeave={() => {
          // Réinitialiser l'état de survol pour tous les types
          setHoveredContainerId(null);
        }}
      >
        {/* Structure en couches (layers) pour le container */}
        
        {/* Layer-Pic - Image NFT en arrière-plan */}
        <div className="layer-pic" style={{
          position: 'absolute',
          // Pour FREE, l'image reste en bas quand ouvert
          top: container.type === ContainerType.FREE && container.isExpanded ? 
               'auto' : 0,
          bottom: container.type === ContainerType.FREE && container.isExpanded ? 
                 0 : 'auto',
          left: 0,
          width: '100%',
          height: CONTAINER_SIZE, // Hauteur fixe pour l'image toujours (128px)
          zIndex: 1,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: debug ? '2px solid blue' : 'none' // Bordure bleue en mode debug
        }}>
          {/* Image NFT avec effet ZoomHoverGrid */}
          <div 
            className="image-container"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              // Déclenche l'effet de zoom uniquement si le container n'est pas déjà ouvert
              if (!container.isExpanded) {
                const imgEl = e.currentTarget.querySelector('.nft-image');
                if (imgEl) {
                  imgEl.classList.add('zoom-active');
                  console.log(`Zoom activé pour container ${container.id}`);
                }
              }
            }}
            onMouseLeave={(e) => {
              const imgEl = e.currentTarget.querySelector('.nft-image');
              if (imgEl) {
                imgEl.classList.remove('zoom-active');
                console.log(`Zoom désactivé pour container ${container.id}`);
              }
            }}
          >
            {/* Rendu spécial pour les containers musicaux */}
            {container.type === ContainerType.MUSIC ? (
              <MusicContainerIntegrated 
                container={container}
                musicContainers={musicContainers}
                triggerPlay={triggerPlayOnMove}
                cursorPosition={{ col: CENTER_COL, row: CENTER_ROW }}
                proximityData={musicProximityData}
              />
            ) : (
              // Rendu standard pour les autres types de containers
              <div 
                className="nft-image"
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${formatImagePathForDisplay(nftData.imageUrl)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'transparent'
                }}
              ></div>
            )}
          </div>
        </div>
        
        {/* Layer-Overlay - Avec effets visuels selon le type */}
        <div 
          className={`layer-overlay ${container.type === ContainerType.FREE && !container.isExpanded ? 'mix-blend-hard-light' : ''}`} 
          style={{
            position: 'absolute',
            width: '100%',
            height: container.isExpanded ? CONTAINER_SIZE : '100%', // Seulement sur la partie image
            zIndex: 2,
            // Couleurs spécifiques selon le type
            backgroundColor: container.type === ContainerType.FREE && !container.isExpanded 
              ? '#FF26BE' // Rose exact pour FREE
              : container.type === ContainerType.ADOPT
                ? 'rgba(229, 209, 211, 0.8)' // E5D1D3 à 80% pour ADOPT
                : 'transparent',
            // Flou pour ADOPT
            backdropFilter: container.type === ContainerType.ADOPT ? 'blur(2px)' : 'none',
            border: debug ? '2px solid green' : 'none', // Bordure verte en mode debug
            // Position de l'overlay selon le type et l'état
            ...(container.type === ContainerType.ADOPT && container.isExpanded 
              ? { top: 'auto', bottom: 0 } 
              : { top: 0, bottom: 'auto' }),
        }}></div>
        
        {/* Cette couche a été supprimée pour éviter la duplication avec layer-text ci-dessous */}
        
        {/* Layer-Card - Affichée selon le type et l'état */}
        <div className="layer-card" style={{
          position: 'absolute',
          // Position adaptée selon le type
          bottom: container.type === ContainerType.FREE ? 'auto' : 0,
          top: container.type === ContainerType.FREE ? 0 : 'auto',
          left: 0,
          width: '100%',
          height: container.type === ContainerType.ADOPTED || container.type === ContainerType.FREE ? '128px' : 'auto',
          // Background transparent pour ADOPT, blanc pour les autres
          backgroundColor: container.type === ContainerType.ADOPT ? 'transparent' : 'white',
          borderTop: container.type === ContainerType.FREE && container.isExpanded ? '1px solid #ddd' : 'none',
          borderBottom: container.type !== ContainerType.FREE && container.isExpanded ? '1px solid #ddd' : 'none',
          padding: '0',
          zIndex: 3,
          // Visible uniquement pour les containers ouverts
          display: container.isExpanded ? 'block' : 'none'
        }}>
          {/* Contenu pour FREE */}
          {container.type === ContainerType.FREE && container.isExpanded && (
            <div style={{
              padding: '16px',
              height: '128px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.name}
              </div>
              <div style={{ 
                fontSize: '10px', 
                marginTop: '2px', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: 'normal',
                lineHeight: '0.9'
              }}>
                {nftData.collection}
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '9px',
                lineHeight: '0.9'
              }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                  {nftData.reference}
                </span>
                <span style={{ color: '#FF26BD', fontWeight: 'bold' }}>
                  {nftData.price}~C
                </span>
              </div>
            </div>
          )}
          
          {/* Contenu pour ADOPT - Layer-Card avec fond transparent mais contenu visible */}
          {container.type === ContainerType.ADOPT && container.isExpanded && (
            <div style={{
              padding: '16px',
              height: '128px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.name}
              </div>
              <div style={{ 
                fontSize: '10px', 
                marginTop: '2px', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.collection}
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '9px',
                lineHeight: '0.9'
              }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                  {nftData.reference}
                </span>
                <span style={{ color: '#FF26BD', fontWeight: 'bold' }}>
                  {nftData.price}~C
                </span>
              </div>
            </div>
          )}
          
          {/* Contenu pour ADOPTED */}
          {container.type === ContainerType.ADOPTED && container.isExpanded && (
            <div style={{
              padding: '16px'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.name}
              </div>
              <div style={{ 
                fontSize: '10px', 
                marginTop: '2px', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.collection}
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '9px',
                lineHeight: '0.9'
              }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                  {nftData.reference}
                </span>
                <span style={{ color: '#FF26BD', fontWeight: 'bold' }}>
                  {nftData.price}~C
                </span>
              </div>
            </div>
          )}
          
          {/* Contenu pour EDITORIAL */}
          {container.type === ContainerType.EDITORIAL && container.isExpanded && (
            <div style={{
              padding: '16px'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 'bold', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.name}
              </div>
              <div style={{ 
                fontSize: '10px', 
                marginTop: '2px', 
                color: 'black',
                fontFamily: "'Roboto Mono', monospace",
                lineHeight: '0.9'
              }}>
                {nftData.collection || 'Editorial'}
              </div>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '4px',
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '9px',
                lineHeight: '0.9'
              }}>
                <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                  {nftData.reference}
                </span>
                <span style={{ color: '#FF26BD', fontWeight: 'bold' }}>
                  0~C
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Layer-ClickZones - Zones cliquables pour les interactions */}
        <div className="layer-clickzones" 
          data-container-type={container.type}
          style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10, // Au-dessus des autres couches pour intercepter les clics
          // Activer les interactions pour tous les types de conteneurs, y compris éditoriaux
          pointerEvents: container.type === ContainerType.INACTIVE 
                        ? 'none' // Désactiver les interactions seulement pour containers inactifs
                        : 'auto'
        }}>
          {/* Grab-zone couvrant l'ensemble du container pour déplacement */}
          <div 
            className="grab-zone"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              cursor: 'grab',
              backgroundColor: debug ? 'rgba(100, 100, 100, 0.1)' : 'transparent',
              border: debug ? '1px solid rgba(100, 100, 100, 0.3)' : 'none',
              zIndex: 0 // Sous les autres zones pour ne pas bloquer leurs interactions
            }}
            data-cursor-type="grab"
            onMouseDown={(e) => {
              // Empêcher le clic de se propager aux zones d'action
              e.stopPropagation();
              // Ici pourrait se trouver la logique de déplacement du container
              console.log(`Début de déplacement pour container ${container.id}`);
            }}
          />
          {/* Container fermé - Zone centrale pour l'ouverture */}
          {!container.isExpanded && (
            <div 
              className="click-zone-center"
              style={{
                position: 'absolute',
                width: '50px',
                height: '50px',
                left: 'calc(50% - 25px)', // Centrage
                top: 'calc(50% - 25px)',  // Centrage
                cursor: container.type === ContainerType.FREE ? 'pointer' : 
                        container.type === ContainerType.ADOPTED ? 'pointer' : 
                        container.type === ContainerType.ADOPT ? 'pointer' : 
                        container.type === ContainerType.EDITORIAL ? 'pointer' : 'pointer',
                borderRadius: '50%',
                backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                border: debug ? '1px dashed red' : 'none'
              }}
              data-cursor-type={
                container.type === ContainerType.FREE ? "knok" :
                container.type === ContainerType.ADOPTED ? "meet" :
                container.type === ContainerType.ADOPT ? "adopt" :
                container.type === ContainerType.EDITORIAL ? "info" :
                container.type === ContainerType.MUSIC ? "panel" : "default"
              }
              onClick={() => handleContainerClick(container.id)}
            />
          )}
          
          {/* Container FREE ouvert */}
          {container.isExpanded && container.type === ContainerType.FREE && (
            <>
              {/* Zone de fermeture centrée sur l'image (en bas) */}
              <div 
                className="click-zone-close"
                style={{
                  position: 'absolute',
                  width: '50px',
                  height: '50px',
                  left: 'calc(50% - 25px)', // Centrage horizontal
                  bottom: '39px',  // 128px/2 - 50px/2 = 39px du bas
                  cursor: 'pointer',
                  borderRadius: '50%',
                  backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                  border: debug ? '1px dashed red' : 'none'
                }}
                data-cursor-type="close"
                onClick={() => toggleContainerExpansion(container.id)}
              />
              
              {/* Zone d'ouverture panel en haut */}
              <div 
                className="click-zone-panel"
                style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  left: 'calc(50% - 45px)', // Centrage
                  top: '20px',  // Partie haute
                  cursor: 'pointer',
                  backgroundColor: debug ? 'rgba(0, 0, 255, 0.3)' : 'transparent',
                  border: debug ? '1px dashed blue' : 'none'
                }}
                data-cursor-type="panel"
                onClick={() => togglePanel(container.id)}
              />
            </>
          )}
          
          {/* Container ADOPTED ouvert */}
          {container.isExpanded && container.type === ContainerType.ADOPTED && (
            <>
              {/* Zone de fermeture en haut */}
              <div 
                className="click-zone-close"
                style={{
                  position: 'absolute',
                  width: '50px',
                  height: '50px',
                  left: 'calc(50% - 25px)', // Centrage
                  top: '39px',  // Sur l'image en haut
                  cursor: 'pointer',
                  borderRadius: '50%',
                  backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                  border: debug ? '1px dashed red' : 'none'
                }}
                data-cursor-type="close"
                onClick={() => toggleContainerExpansion(container.id)}
              />
              
              {/* Zone d'ouverture panel en bas */}
              <div 
                className="click-zone-panel"
                style={{
                  position: 'absolute',
                  width: '90px',
                  height: '90px',
                  left: 'calc(50% - 45px)', // Centrage
                  bottom: '20px',  // Partie basse
                  cursor: 'pointer',
                  backgroundColor: debug ? 'rgba(0, 0, 255, 0.3)' : 'transparent',
                  border: debug ? '1px dashed blue' : 'none'
                }}
                data-cursor-type="panel"
                onClick={() => togglePanel(container.id)}
              />
            </>
          )}
          
          {/* Container ADOPT ouvert */}
          {container.isExpanded && container.type === ContainerType.ADOPT && (
            <>
              {/* Zone de fermeture en haut */}
              <div 
                className="click-zone-close"
                style={{
                  position: 'absolute',
                  width: '50px',
                  height: '50px',
                  left: 'calc(50% - 25px)', // Centrage
                  top: '39px',  // Sur l'image en haut
                  cursor: 'pointer',
                  borderRadius: '50%',
                  backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
                  border: debug ? '1px dashed red' : 'none'
                }}
                data-cursor-type="close"
                onClick={() => toggleContainerExpansion(container.id)}
              />
              
              {/* Zone d'ouverture panel en bas */}
              <div 
                className="click-zone-panel"
                style={{
                  position: 'absolute',
                  width: '90px',
                  height: '64px',
                  left: 'calc(50% - 45px)', // Centrage
                  bottom: '20px',  // Partie basse
                  cursor: 'pointer',
                  backgroundColor: debug ? 'rgba(0, 0, 255, 0.3)' : 'transparent',
                  border: debug ? '1px dashed blue' : 'none'
                }}
                data-cursor-type="panel"
                onClick={() => togglePanel(container.id)}
              />
            </>
          )}
        </div>
        
        {/* Layer-Texte - Avec les indications selon le type et état */}
        <div className="layer-text" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: '8px',
          zIndex: 4,
          border: debug ? '2px solid red' : 'none' // Bordure rouge en mode debug
        }}>
          {debug ? (
            // Affichage en mode debug
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              width: '100%',
              flexDirection: 'column'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%'
              }}>
                <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'white', textShadow: '0 0 2px black' }}>
                  #{container.id}
                </div>
                <div style={{ fontSize: '10px', color: 'white', textShadow: '0 0 2px black' }}>
                  ({container.col}, {container.row})
                </div>
              </div>
              <div style={{ 
                marginTop: '4px',
                fontSize: '10px', 
                color: 'white', 
                backgroundColor: container.type === ContainerType.ADOPTED ? 'rgba(235, 87, 87, 0.7)' :
                                container.type === ContainerType.ADOPT ? 'rgba(242, 201, 76, 0.7)' :
                                container.type === ContainerType.FREE ? 'rgba(88, 196, 221, 0.7)' :
                                'rgba(111, 207, 151, 0.7)',
                textAlign: 'center',
                padding: '1px 4px',
                borderRadius: '2px',
                textShadow: '0 0 1px black'
              }}>
                {container.type}
              </div>
            </div>
          ) : (
            // Affichage normal (hors debug) - solution simplifiée au maximum
            <div style={{
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {/* FREE centered text with animation typewriter */}
              {container.type === ContainerType.FREE && !container.isExpanded && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  width: '100%',
                  padding: '0 8px'
                }}>
                  <TypewriterText 
                    name={nftData.name.split('_')[0]} 
                    isVisible={hoveredContainerId === container.id}
                  />
                </div>
              )}
              
              {/* ADOPTED centered text with animation (fade-in & letter-spacing) */}
              {container.type === ContainerType.ADOPTED && !container.isExpanded && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  width: '100%',
                  padding: '0 8px'
                }}>
                  <NameRevealAnimation 
                    name={nftData.name.split('_')[0]} 
                    isVisible={hoveredContainerId === container.id}
                  />
                </div>
              )}
              
              {/* ADOPT animation: "WHERE IS?" -> Name -> "WHERE IS?" */}
              {container.type === ContainerType.ADOPT && !container.isExpanded && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  width: '100%',
                  padding: '0 8px'
                }}>
                  <WhereIsAnimation 
                    name={nftData.name.split('_')[0]} 
                    isVisible={hoveredContainerId === container.id}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Rendu d'un panel pour un container donné
  const renderPanel = (containerId: number, panel: PanelData) => {
    const container = containers.find(c => c.id === containerId);
    if (!container) return null;
    
    // Récupérer les données de la chimère pour ce container
    // Vérifier si c'est un élément éditorial en fonction du type de conteneur
    const isEditorial = container.type === ContainerType.EDITORIAL;
    const nftData = getChimeraDataById(container.chimeraId, isEditorial);
    
    // URL de l'image pour ce panel
    const imageUrl = nftData.imageUrl;
    
    // Calculer les limites de la zone visible
    const { startCol, startRow } = getVisibleBounds();
    
    // Position horizontale du panel (collé à droite du container)
    const adjustedCol = container.col - startCol;
    const left = (adjustedCol * (CONTAINER_SIZE + CONTAINER_GAP)) + 
                columnOffsets[container.col] + 
                CONTAINER_SIZE + 
                CONTAINER_GAP;
    
    // Position verticale du container avec ses décalages
    const adjustedRow = container.row - startRow;
    const containerShift = verticalShifts.get(container.id) || 0;
    const containerTopPosition = adjustedRow * (CONTAINER_SIZE + CONTAINER_GAP) + containerShift;
    
    // Si le container a une expansion vers le haut, prendre en compte son offset
    const expansionOffset = container.isExpanded && container.expansionType === ContainerExpansionType.ONEONE_UP
      ? EXPANSIONS[ContainerExpansionType.ONEONE_UP].offsetTop
      : 0;
    
    // Position verticale finale du panel (même que le container)
    const top = containerTopPosition + expansionOffset;
    
    // Hauteur totale de la grille visible
    const totalVisibleHeight = VISIBLE_ROWS * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Le panel couvre toute la hauteur de la grille, mais son contenu commence au niveau du container parent
    const contentOffsetTop = top; // Décalage du contenu par rapport au haut du panel
    
    return (
      <div
        key={`panel-${containerId}`}
        className="panel"
        style={{
          width: PANEL_WIDTH,
          height: totalVisibleHeight, // Toute la hauteur de la grille
          backgroundColor: '#ffffff',
          position: 'absolute',
          left,
          top: -270, // Décalage vertical de -270px pour alignement
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderRadius: '4px',
          transition: 'all 0.3s ease-out',
          zIndex: 10,
          overflow: 'visible', // Permettre le débordement pour l'échelle humaine
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Roboto Mono', monospace",
          // Ajouter cette classe pour que le panel soit "attaché" à la grille
          // et se déplace avec elle lors du grab
          pointerEvents: 'all' // Permettre les interactions avec le panel
        }}
      >
        {/* Espace vide pour aligner le contenu avec le container parent */}
        <div style={{ height: contentOffsetTop }}></div>
        
        {/* Zone d'image avec zones d'interaction */}
        <div 
          className="nft-image-container"
          style={{
            width: '100%',
            height: '320px',
            backgroundColor: '#f5f5f5',
            position: 'relative',
            overflow: 'visible' // Permettre le débordement pour l'échelle humaine
          }}>
          
          {/* Image de fond zoomable séparément */}
          <div 
            className="nft-image-bg"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${formatImagePathForDisplay(nftData.imageUrl)})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />

          {/* Icône zoom flottante SUPPRIMÉE pour débugger le curseur SCALE_TIMER */}
          
          {/* Zone GRAB - Marges constantes autour de l'image */}
          <div 
            style={{
              position: 'absolute',
              top: '-12px',
              left: '-12px',
              right: '-12px',
              bottom: '-12px',
              cursor: 'grab',
              zIndex: 1,
              backgroundColor: debug ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
              border: debug ? '1px dashed green' : 'none'
            }}
            data-cursor-type="grab"
            onClick={() => console.log('🎯 Panel: Zone GRAB cliquée')}
          />
          
          {/* Zone SCALE - Moitié haute avec marges */}
          <div 
            style={{
              position: 'absolute',
              top: '30px',
              left: '30px',
              right: '30px',
              height: 'calc(50% - 30px)',
              cursor: 'pointer',
              zIndex: 50,
              backgroundColor: debug ? 'rgba(0, 255, 0, 0.3)' : 'transparent',
              border: debug ? '2px dashed green' : 'none'
            }}
            data-cursor-type="scale"
            onMouseEnter={(e) => {
              // Vérifier si on n'est pas en période de pause
              if (isZoomInCooldown) {
                console.log('🔒 Zoom en pause, activation bloquée');
                return;
              }

              // Capturer les dimensions du panel
              const panel = e.currentTarget.closest('.panel') as HTMLElement;
              if (panel) {
                const rect = panel.getBoundingClientRect();
                setPanelBounds({
                  left: rect.left,
                  width: rect.width,
                  top: rect.top,
                  height: rect.height
                });
              }
              
              // Activer l'échelle humaine pour 10 secondes
              console.log('🔍 Activation zoom échelle humaine (10s)');
              setEchelleHumaineImage(nftData.imageUrl);
              setEchelleHumaineActive(true);
            }}
            onMouseMove={(e) => {
              if (echelleHumaineActive) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setMousePosition({ x, y });
              }
            }}
            onMouseLeave={() => {
              // FERMETURE IMMÉDIATE quand on quitte la zone
              console.log('🔍 Sortie zone SCALE - fermeture immédiate échelle humaine');
              setEchelleHumaineActive(false);
            }}
          />
          
          {/* Zone CLOSE - Moitié basse avec marges */}
          <div 
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '30px',
              right: '30px',
              height: 'calc(50% - 30px)',
              cursor: 'pointer',
              zIndex: 50,
              backgroundColor: debug ? 'rgba(255, 0, 0, 0.3)' : 'transparent',
              border: debug ? '2px dashed red' : 'none'
            }}
            data-cursor-type="close"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🎯 Panel: Zone CLOSE cliquée');
              togglePanel(containerId);
            }}
          />
          
          {/* Ancien bouton de fermeture (conservé pour compatibilité) */}
          <button 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#333',
              fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => togglePanel(containerId)}
          >
            ✕
          </button>
        </div>
        
        {/* En-tête du panel minimal */}
        <div style={{
          padding: '16px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#333',
            lineHeight: '0.9'
          }}>
            {nftData.name}
          </h3>
          
          <div style={{ 
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#FF26BD',
            lineHeight: '0.9'
          }}>
            {nftData.price}~C
          </div>
        </div>
        
        {/* Collection et Référence uniformisées */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          fontSize: '10px',
          lineHeight: '0.9'
        }}>
          <div style={{ color: 'black', marginBottom: '4px' }}>
            {nftData.collection}
          </div>
          <div>
            <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>
              {nftData.reference}
            </span>
          </div>
        </div>
        
        {/* Zone de contenu */}
        <div style={{
          backgroundColor: 'white',
          padding: '14px',
          flex: 1,
          overflow: 'auto'
        }}>
          {/* Description directement sans titre */}
          <p style={{ 
            fontSize: '13px', 
            lineHeight: '1.4',
            color: '#333', 
            margin: '0 0 16px 0',
            padding: '12px',
            backgroundColor: '#f9f9f9',
            borderRadius: '4px',
            boxShadow: 'inset 0 0 4px rgba(0,0,0,0.02)'
          }}>
            {nftData.description}
          </p>
          
          {/* Composants spécifiques à chaque panel de NFT */}
          {container.chimeraId && allPanels && (
            <div style={{ marginTop: '16px' }}>
              {(() => {
                // Trouver le panel correspondant à cette chimère spécifique
                const panelForThisChimera = allPanels.find(p => p.chimeraId === container.chimeraId);
                
                // Si aucun panel n'est trouvé pour cette chimère, afficher un message
                if (!panelForThisChimera) {
                  return (
                    <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                      Aucun panel disponible pour cette chimère
                    </p>
                  );
                }
                
                // Si le panel n'a pas de composants, afficher un message
                if (!(panelForThisChimera as any).components || 
                    (panelForThisChimera as any).components.length === 0) {
                  return (
                    <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                      Aucun composant disponible pour ce panel
                    </p>
                  );
                }
                
                // Afficher les composants du panel
                return (panelForThisChimera as any).components.map((component: any, index: number) => {
                  const isLast = index === ((panelForThisChimera as any).components.length - 1);
                  
                  // Style de base commun pour tous les composants
                  const baseComponentStyle = {
                    marginBottom: isLast ? 0 : '16px',
                    padding: '12px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '13px'
                  };
                  
                  // Rendu dynamique en fonction du type de composant
                  switch (component.type) {
                    case 'map':
                      return (
                        <div key={component.id} style={baseComponentStyle}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{component.title}</h4>
                          <div style={{ height: '180px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            Carte interactive
                          </div>
                        </div>
                      );
                      
                    case 'text':
                      return (
                        <div key={component.id} style={{ 
                          ...baseComponentStyle,
                          padding: '16px 24px',
                          backgroundColor: '#f9f9f9',
                          lineHeight: '1.5'
                        }}>
                          <p style={{ margin: 0 }}>{component.content || "Contenu texte"}</p>
                        </div>
                      );
                      
                    case 'wallet':
                      return (
                        <div key={component.id} style={baseComponentStyle}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{component.title}</h4>
                          <div style={{ 
                            padding: '12px',
                            backgroundColor: '#e8e8e8',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>0x71c...f3a9</span>
                            <button style={{ 
                              border: 'none',
                              backgroundColor: '#333',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}>
                              Copier
                            </button>
                          </div>
                        </div>
                      );
                      
                    case 'audio':
                      // Vérifier si l'URL audio correspond à celle de l'audio spatial pour éviter le doublon
                      const audioUrl = typeof component.content === 'object' && 
                        component.content && 
                        'audioUrl' in component.content 
                          ? component.content.audioUrl as string 
                          : undefined;
                      
                      const musicContainer = musicContainers?.[0];
                      const isSpatialAudio = musicContainer && audioUrl === musicContainer.audioUrl;
                      
                      if (isSpatialAudio) {
                        // Afficher un message au lieu du player pour éviter le doublon
                        return (
                          <div key={component.id} style={baseComponentStyle}>
                            <div style={{
                              padding: '10px',
                              background: 'rgba(255, 0, 0, 0.1)',
                              border: '1px solid #ff0000',
                              borderRadius: '4px',
                              textAlign: 'center'
                            }}>
                              🎵 Audio spatial actif - Contrôlé par le container musical
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <ComponentInteractionZones
                          key={component.id}
                          componentType={PanelComponentType.AUDIO}
                          componentId={component.id.toString()}
                          onAction={(action, compId) => {
                            console.log(`🎯 AUDIO: Action "${action}" détectée`);
                            // Pour l'action play, déclencher directement la lecture
                            if (action === 'play') {
                              // Trouver l'élément audio et déclencher le click sur le bouton play
                              const audioButton = document.querySelector(`[data-audio-id="${compId}"] button`);
                              if (audioButton) {
                                console.log(`🎯 AUDIO: Déclenchement manuel du bouton play`);
                                (audioButton as HTMLButtonElement).click();
                              }
                            }
                          }}
                          onGrab={() => {
                            console.log(`🎯 AUDIO: Grab détecté pour déplacer le panel`);
                          }}
                          debug={false}
                        >
                          <div style={baseComponentStyle} data-audio-id={component.id}>
                            <AudioPlayer
                              audioUrl={audioUrl}
                              title={component.title}
                              onPlay={() => console.log(`🎵 Lecture audio démarrée: ${component.title}`)}
                              onPause={() => console.log(`⏸️ Lecture audio mise en pause: ${component.title}`)}
                              onTimeUpdate={(currentTime, duration) => {
                                // Log périodique toutes les 5 secondes
                                if (Math.floor(currentTime) % 5 === 0) {
                                  console.log(`🎵 Audio progress: ${Math.round(currentTime)}s / ${Math.round(duration)}s`);
                                }
                              }}
                            />
                          </div>
                        </ComponentInteractionZones>
                      );
                      
                    // Support pour le composant galerie
                    case 'galerie':
                    case 'gallery':
                      return (
                        <div key={component.id} style={baseComponentStyle}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{component.title}</h4>
                          <div style={{ 
                            padding: '12px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                              justifyContent: 'center'
                            }}>
                              {[1, 2, 3].map(num => (
                                <div key={num} style={{
                                  width: '80px',
                                  height: '80px',
                                  backgroundColor: '#ccc',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  color: '#555'
                                }}>
                                  Image {num}
                                </div>
                              ))}
                            </div>
                            <div style={{ 
                              display: 'flex',
                              gap: '8px'
                            }}>
                              <button style={{ 
                                border: 'none',
                                backgroundColor: '#333',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}>
                                Précédent
                              </button>
                              <button style={{ 
                                border: 'none',
                                backgroundColor: '#333',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}>
                                Suivant
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                      
                    case 'image':
                      return (
                        <div key={component.id} style={baseComponentStyle}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{component.title}</h4>
                          {component.content && component.content.imageUrl && (
                            <div style={{ 
                              width: '100%',
                              maxHeight: '200px',
                              overflow: 'hidden',
                              borderRadius: '4px',
                              position: 'relative'
                            }}>
                              <img 
                                src={formatImagePathForDisplay(component.content.imageUrl)}
                                alt={component.title || 'Image'}
                                style={{
                                  width: '100%',
                                  height: 'auto',
                                  display: 'block'
                                }}
                                onError={(e) => {
                                  console.log('Erreur de chargement image:', component.content.imageUrl);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    
                    // Gestion des types inconnus - approche flexible pour les futurs composants
                    default:
                      return (
                        <div key={component.id} style={baseComponentStyle}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{component.title || `Composant ${component.type}`}</h4>
                          <div style={{ 
                            padding: '12px',
                            backgroundColor: '#e8e8e8',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '60px'
                          }}>
                            {typeof component.content === 'string' ? (
                              <p style={{ margin: 0 }}>{component.content}</p>
                            ) : (
                              <p style={{ margin: 0, color: '#666' }}>Composant de type: {component.type}</p>
                            )}
                          </div>
                        </div>
                      );
                  }
                });
              })()}
            </div>
          )}
          
          {debug && (
            <div style={{ 
              marginTop: '20px', 
              padding: '8px', 
              backgroundColor: '#f9f9f9',
              fontSize: '11px',
              color: '#999',
              borderRadius: '4px'
            }}>
              <p style={{margin: '3px 0'}}>Position: (Col {container.col}, Row {container.row})</p>
              <p style={{margin: '3px 0'}}>Type: {container.expansionType}</p>
              <p style={{margin: '3px 0'}}>ID: #{containerId}</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Fonction pour rendre une cellule vide à une position donnée
  // Créons un container factice de type EDITORIAL qui fonctionne déjà bien
  const renderEmptyCell = (col: number, row: number) => {
    const { startCol, startRow } = getVisibleBounds();
    
    // Ajuster les positions par rapport à notre zone visible
    const adjustedCol = col - startCol;
    const adjustedRow = row - startRow;
    
    // Calculer la position avec décalage de colonne (horizontal)
    const left = (adjustedCol * (CONTAINER_SIZE + CONTAINER_GAP)) + columnOffsets[col];
    const top = adjustedRow * (CONTAINER_SIZE + CONTAINER_GAP);
    
    // Simuler un faux container avec la structure exacte d'un container réel
    const fakeContainer: Container = {
      id: -1 * (col * 1000 + row), // ID négatif unique pour ne pas interférer avec les vrais IDs
      col, 
      row,
      type: ContainerType.EDITORIAL, // Utiliser le type EDITORIAL qui est le plus simple
      expansionType: ContainerExpansionType.NONE,
      isExpanded: false,
      chimeraId: -1 // ID inexistant
    };
    
    // Données NFT factices pour notre container vide
    const fakeNFTData: NFTData = {
      name: "",
      reference: "",
      collection: "",
      price: "",
      description: "",
      imageUrl: "", // Pas d'image
      type: ContainerType.EDITORIAL
    };
    
    // Hauteur du container
    const height = CONTAINER_SIZE;
    
    // Appliquer la structure DOM exacte mais sans contenu visible
    return (
      <div
        key={`empty-${col}-${row}`}
        className="container"
        style={{
          width: CONTAINER_SIZE,
          height,
          backgroundColor: 'transparent',
          position: 'absolute',
          left,
          top,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease-out',
          zIndex: 1,
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        {/* Layer-Pic - Image NFT en arrière-plan (fond blanc pour cellule vide) */}
        <div className="layer-pic" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: 'none'
        }}>
          {/* Fond blanc pour notre cellule vide */}
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}></div>
        </div>
        
        {/* Layer-ClickZones */}
        <div className="layer-clickzones" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 10,
          pointerEvents: 'auto'
        }}>
          {/* Grab-zone couvrant l'ensemble du container pour déplacement */}
          <div 
            className="grab-zone"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              cursor: 'grab',
              backgroundColor: 'transparent',
              border: 'none',
              zIndex: 0
            }}
            data-cursor-type="grab"
          />
        </div>
      </div>
    );
  };
  
  // SOLUTION SIMPLE : DÉCLENCHER LE PLAY DU CONTAINER MUSICAL AU PREMIER MOUVEMENT
  useEffect(() => {
    const viewport = document.getElementById('grille-chimerique-viewport');
    if (!viewport) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Le nouveau système MusicContainer gère automatiquement le trigger Play on Move
      // Plus besoin de logique spéciale ici
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      console.log('MouseDown sur élément:', e.target);
      handleMapDrag(e as any);
    };
    
    viewport.addEventListener('mousemove', handleMouseMove);
    viewport.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      viewport.removeEventListener('mousemove', handleMouseMove);
      viewport.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containers]);
  
  return (
    <div 
      className="grille-chimerique"
      data-cursor-type="grab" // Appliquer l'attribut data-cursor-type à l'ensemble de la grille
      style={{ 
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: '#f7f7f7', // Fond gris très léger
        userSelect: 'none' // Empêcher la sélection de texte qui interfère avec le grab
      }}
    >
      <div 
        id="grille-chimerique-viewport"
        className="viewport"
        data-cursor-type="grab" // Appliquer également au viewport
        style={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: 'grab'
        }}
      >
        {/* Conteneur pour tous les éléments de la grille - permet navigation fluide */}
        <div 
          className="grid-content-container" 
          style={{ position: 'relative' }}
        >
          {/* Cellules vides pour visualiser la grille entière */}
          {(() => {
            const cells = [];
            const { startCol, startRow, endCol, endRow } = getVisibleBounds();
            
            // Vérifier si une cellule est occupée par un container existant
            const isOccupied = (col: number, row: number) => {
              return containers.some(c => c.col === col && c.row === row && c.chimeraId !== -1);
            };
            
            // Générer toutes les cellules vides dans la zone visible
            for (let col = startCol; col < endCol; col++) {
              for (let row = startRow; row < endRow; row++) {
                // N'afficher les cellules vides que si elles ne sont pas occupées par un container existant
                if (!isOccupied(col, row)) {
                  cells.push(renderEmptyCell(col, row));
                }
              }
            }
            
            return cells;
          })()}
          
          {/* Containers visibles dans la zone d'affichage actuelle */}
          {containers.map(container => {
            // Vérifier si le container est dans la zone visible
            const { startCol, startRow, endCol, endRow } = getVisibleBounds();
            if (container.col < startCol || container.col >= endCol || 
                container.row < startRow || container.row >= endRow) {
              return null; // Ne pas afficher les containers hors de la zone visible
            }
            return renderContainer(container);
          })}
          

          
          {/* IMPORTANT: Les panels sont rendus dans le même conteneur que les containers */}
          {/* pour qu'ils se déplacent ensemble avec le drag */}
          {Array.from(panels.entries())
            .filter(([_, panel]) => panel.isOpen)
            .map(([containerId, panel]) => {
              // Vérifier si le container associé est visible
              const container = containers.find(c => c.id === Number(containerId));
              if (!container) return null;
              
              const { startCol, startRow, endCol, endRow } = getVisibleBounds();
              if (container.col < startCol || container.col >= endCol) {
                return null; // Ne pas afficher les panels dont le container est hors de la zone visible horizontale
              }
              
              return renderPanel(Number(containerId), panel);
            })
          }


        </div>
        
        {/* Overlay de debug (activable avec la touche 'd') */}
        {debug && (
          <div style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '10px',
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 1000
          }}>
            <div>Mode Debug (touche 'd')</div>
            <div>Centre vue: ({viewCenter.col}, {viewCenter.row})</div>
            <div>Containers: {containers.length}</div>
            <div>Panels ouverts: {Array.from(panels.values()).filter(p => p.isOpen).length}</div>
            <div>Déplacez la vue avec le clic gauche et le glisser</div>
          </div>
        )}
        {/* Ajout du curseur personnalisé avec timer intégré */}
        <CustomCursorSimple 
          debug={debug} 
          zoomCountdown={zoomCountdown}
          isZoomActive={echelleHumaineActive}
          isZoomInCooldown={isZoomInCooldown}
        />
        
        {/* Module Échelle Humaine - Version simplifiée sans timer interne */}
        <EchelleHumaineSimple 
          imageUrl={echelleHumaineImage}
          isActive={echelleHumaineActive}
          mousePosition={mousePosition}
          panelBounds={panelBounds}
        />
      </div>
    </div>
  );
}
/**
 * Utilitaire pour générer une spirale de coordonnées depuis un point central
 */

// Structure représentant une position (x, y) dans la grille
export interface GridPosition {
  x: number;
  y: number;
}

export type SpiralDirection = 'clockwise' | 'counterclockwise';
export type StartDirection = 'right' | 'down' | 'left' | 'up';

export interface SpiralConfig {
  centerX: number;
  centerY: number;
  direction: SpiralDirection;
  startDirection: StartDirection;
  skipOccupied: boolean;
}

/**
 * Génère des positions en spirale configurables depuis un point central spécifié
 * 
 * @param config Configuration de la spirale
 * @param count Nombre de positions à générer
 * @param occupiedPositions Positions déjà occupées (optionnel)
 * @returns Tableau de positions (x, y) formant une spirale
 */
export function generateSpiralPositions(
  centerX: number,
  centerY: number, 
  direction: 'clockwise' | 'counterclockwise',
  startDirection: 'right' | 'down' | 'left' | 'up',
  count: number,
  occupiedPositions?: Set<string>,
  config?: SpiralConfig
): GridPosition[] {
  const spiralConfig: SpiralConfig = {
    centerX,
    centerY,
    direction: direction,
    startDirection: startDirection,
    skipOccupied: config?.skipOccupied || false
  };

  const positions: GridPosition[] = [];
  
  // Commencer au centre si libre
  const occupied = occupiedPositions || new Set<string>();
  if (!occupied.has(`${centerX},${centerY}`)) {
    positions.push({ x: centerX, y: centerY });
  }
  
  if (count <= 1) {
    return positions;
  }
  
  // Définir les directions selon le sens de rotation
  const directionsClockwise = [
    { dx: 1, dy: 0 },  // Droite
    { dx: 0, dy: 1 },  // Bas
    { dx: -1, dy: 0 }, // Gauche
    { dx: 0, dy: -1 }  // Haut
  ];
  
  const directionsCounterclockwise = [
    { dx: 1, dy: 0 },  // Droite
    { dx: 0, dy: -1 }, // Haut
    { dx: -1, dy: 0 }, // Gauche
    { dx: 0, dy: 1 }   // Bas
  ];
  
  const directions = spiralConfig.direction === 'clockwise' ? directionsClockwise : directionsCounterclockwise;
  
  // Déterminer l'index de direction de départ
  const startDirectionMap = { 'right': 0, 'down': 1, 'left': 2, 'up': 3 };
  let directionIndex = startDirectionMap[spiralConfig.startDirection];
  
  // Ajuster pour le sens antihoraire
  if (spiralConfig.direction === 'counterclockwise') {
    const counterclockwiseMap = { 'right': 0, 'up': 1, 'left': 2, 'down': 3 };
    directionIndex = counterclockwiseMap[spiralConfig.startDirection];
  }
  
  let stepsInCurrentDirection = 1;
  let stepsTaken = 0;
  let currentX = centerX;
  let currentY = centerY;
  
  // Générer suffisamment de positions pour compenser les positions occupées
  const maxAttempts = count * 3;
  let attempts = 0;
  
  while (positions.length < count && attempts < maxAttempts) {
    const { dx, dy } = directions[directionIndex];
    
    currentX += dx;
    currentY += dy;
    attempts++;
    
    // Vérifier si la position est dans les limites et libre
    const positionKey = `${currentX},${currentY}`;
    const isOccupied = occupied.has(positionKey);
    
    if (!spiralConfig.skipOccupied || !isOccupied) {
      positions.push({ x: currentX, y: currentY });
    }
    
    stepsTaken++;
    
    if (stepsTaken === stepsInCurrentDirection) {
      stepsTaken = 0;
      directionIndex = (directionIndex + 1) % 4;
      
      // Augmenter la longueur du parcours après chaque paire de directions
      if (directionIndex === 0 || directionIndex === 2) {
        stepsInCurrentDirection++;
      }
    }
  }
  
  return positions;
}

/**
 * Vérifie si une position est déjà occupée dans la grille
 * 
 * @param position Position à vérifier
 * @param occupiedPositions Ensemble des positions déjà occupées
 * @returns true si la position est libre, false sinon
 */
export function isPositionFree(position: GridPosition, occupiedPositions: Set<string>): boolean {
  const posKey = `${position.x},${position.y}`;
  return !occupiedPositions.has(posKey);
}

/**
 * Trouve la prochaine position libre dans la spirale
 * 
 * @param centerX Coordonnée X du centre de la spirale
 * @param centerY Coordonnée Y du centre de la spirale
 * @param occupiedPositions Ensemble des positions déjà occupées
 * @returns La première position libre trouvée en spirale
 */
export function findNextFreePosition(
  centerX: number, 
  centerY: number, 
  occupiedPositions: Set<string>
): GridPosition {
  // Générer une spirale assez grande (on peut ajuster si nécessaire)
  const spiralPositions = generateSpiralPositions(centerX, centerY, 'clockwise', 'right', 1000);
  
  // Chercher la première position libre
  for (const position of spiralPositions) {
    if (isPositionFree(position, occupiedPositions)) {
      return position;
    }
  }
  
  // Si aucune position n'est libre, retourner une position par défaut
  // (ce cas ne devrait pas arriver avec une grille suffisamment grande)
  return { x: centerX + spiralPositions.length, y: centerY };
}

/**
 * Convertit un ensemble de positions en Set de clés de position
 * 
 * @param positions Tableau de positions
 * @returns Set contenant les clés des positions au format "x,y"
 */
export function positionsToSet(positions: GridPosition[]): Set<string> {
  const positionSet = new Set<string>();
  
  positions.forEach(pos => {
    positionSet.add(`${pos.x},${pos.y}`);
  });
  
  return positionSet;
}
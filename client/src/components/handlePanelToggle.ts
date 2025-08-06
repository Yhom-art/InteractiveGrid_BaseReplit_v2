import { ContainerData, PanelInfo } from '@/types/common';

// Constants
const CONTAINER_SIZE = 128;
const CONTAINER_SPACING = 4;
const PANEL_WIDTH = 392;

// Cette fonction gère l'ouverture et la fermeture des panels
export function createHandlePanelToggle({ 
  containers, 
  activePanels, 
  setActivePanels, 
  calculateContainerShifts, 
  setContainerShifts,
  setForceRender,
  getGridPosition 
}: {
  containers: ContainerData[];
  activePanels: Map<number, PanelInfo>;
  setActivePanels: (value: Map<number, PanelInfo>) => void;
  calculateContainerShifts: () => Map<number, number>;
  setContainerShifts: (value: Map<number, number>) => void;
  setForceRender: (cb: (prev: number) => number) => void;
  getGridPosition: (container: ContainerData) => { col: number; row: number };
}) {
  return (containerId: number) => {
    console.log("handlePanelToggle appelé pour containerId:", containerId);
    
    // Trouver le container correspondant
    const targetContainer = containers.find(c => c.id === containerId);
    if (!targetContainer || !targetContainer.position) {
      console.error("Container non trouvé ou sans position:", containerId);
      return;
    }
    
    // Récupérer l'état actuel (pour savoir si on est en train d'ouvrir ou de fermer)
    const isAlreadyActive = activePanels.has(containerId);
    console.log("Panel déjà actif pour ce container?", isAlreadyActive);
    
    // Approche simple: vider puis reconstruire tous les panels
    // Étape 1: Créer une liste de tous les panels à afficher après l'opération
    const currentPanels = Array.from(activePanels.entries());
    let panelsToShow: [number, PanelInfo][] = [];
    
    if (isAlreadyActive) {
      // Fermeture: garder tous les panels sauf celui qu'on ferme
      panelsToShow = currentPanels.filter(([id]) => id !== containerId);
      console.log("Fermeture du panel", containerId, "- Panels restants:", panelsToShow.map(([id]) => id));
    } else {
      // Ouverture: ajouter le nouveau panel à la liste existante
      const gridPos = getGridPosition(targetContainer);
      
      // Créer une info de base pour le nouveau panel
      const newPanelInfo: PanelInfo = {
        columnIndex: gridPos.col,
        position: {
          left: (gridPos.col * (CONTAINER_SIZE + CONTAINER_SPACING)) + CONTAINER_SIZE + CONTAINER_SPACING,
          top: gridPos.row * (CONTAINER_SIZE + CONTAINER_SPACING)
        }
      };
      
      // Ajouter ce panel à la liste à afficher
      panelsToShow = [...currentPanels, [containerId, newPanelInfo]];
      console.log("Ouverture d'un nouveau panel", containerId, "- Tous les panels:", panelsToShow.map(([id]) => id));
    }
    
    // Étape 2: Vider les panels actuels
    setActivePanels(new Map());
    
    // Étape 3: Attendre un court instant pour s'assurer que le vidage est effectif
    setTimeout(() => {
      if (panelsToShow.length === 0) {
        // Si plus aucun panel, on s'arrête là
        const newShifts = calculateContainerShifts();
        setContainerShifts(newShifts);
        setForceRender(prev => prev + 1);
        return;
      }
      
      // Étape 4: Trier les panels par colonne (gauche à droite)
      panelsToShow.sort((a, b) => {
        const containerA = containers.find(c => c.id === a[0]);
        const containerB = containers.find(c => c.id === b[0]);
        
        if (!containerA?.position || !containerB?.position) return 0;
        
        const posA = getGridPosition(containerA);
        const posB = getGridPosition(containerB);
        
        return posA.col - posB.col;
      });
      
      // Étape 5: Reconstruire les positions de tous les panels avec les bons décalages
      const newPanels = new Map<number, PanelInfo>();
      
      panelsToShow.forEach(([id, info], index) => {
        const container = containers.find(c => c.id === id);
        if (!container || !container.position) return;
        
        const gridPos = getGridPosition(container);
        
        // Position de base (sans décalage)
        const baseLeft = (gridPos.col * (CONTAINER_SIZE + CONTAINER_SPACING)) + CONTAINER_SIZE + CONTAINER_SPACING;
        
        // Le décalage est basé sur l'index (nombre de panels à gauche)
        const shiftAmount = index * (PANEL_WIDTH + CONTAINER_SPACING);
        
        // Position finale
        const finalLeft = baseLeft + shiftAmount;
        
        // Position verticale légèrement décalée vers le haut par rapport au conteneur
        const baseTop = (gridPos.row * (CONTAINER_SIZE + CONTAINER_SPACING)) - 64; // Décalage vers le haut
        
        // Ajouter le panel à la nouvelle Map
        newPanels.set(id, {
          columnIndex: gridPos.col,
          position: {
            left: finalLeft,
            top: baseTop
          }
        });
        
        console.log(`Panel ${id} (col=${gridPos.col}): index=${index}, baseLeft=${baseLeft}, shiftAmount=${shiftAmount}, finalLeft=${finalLeft}`);
      });
      
      // Étape 6: Appliquer les changements
      setActivePanels(newPanels);
      
      // Étape 7: Recalculer tous les décalages des containers
      const newShifts = calculateContainerShifts();
      setContainerShifts(newShifts);
      
      // Étape 8: Forcer un rafraîchissement complet
      setForceRender(prev => prev + 1);
      
      console.log("Mise à jour des panels terminée");
    }, 50); // Court délai pour garantir la séquence des opérations
  };
}
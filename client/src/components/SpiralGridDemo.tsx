import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Type pour les cases de la grille
interface GridCell {
  index: number;
  x: number;
  y: number;
}

// Composant pour représenter une cellule de la grille
const Cell: React.FC<{ 
  value: number; 
  isCenter: boolean;
}> = ({ value, isCenter }) => {
  return (
    <div 
      className={`flex items-center justify-center w-24 h-24 border-2 text-xl font-bold
        ${isCenter 
          ? 'bg-blue-500 text-white border-blue-700' 
          : 'bg-white border-gray-300 hover:bg-gray-100'}`}
    >
      {value}
    </div>
  );
};

// Fonction principale pour générer les coordonnées en spirale
const generateSpiralCoordinates = (iterations: number): GridCell[] => {
  // Tableau des coordonnées finales
  const cells: GridCell[] = [];
  
  // Pour chaque itération (nouvel ajout)
  for (let i = 0; i < iterations; i++) {
    // À chaque itération, on décale les indices des cellules existantes
    for (let j = 0; j < cells.length; j++) {
      cells[j].index += 1;
    }
    
    // On ajoute le nouvel élément au centre (avec index 0)
    cells.unshift({ index: 0, x: 0, y: 0 });
    
    // On recalcule les positions de toutes les cellules pour maintenir la spirale
    recalculateSpiralPositions(cells);
  }
  
  return cells;
};

// Recalcule les positions des cellules pour maintenir le motif en spirale
const recalculateSpiralPositions = (cells: GridCell[]): void => {
  if (cells.length <= 1) return; // Pas besoin de recalculer s'il n'y a qu'une cellule

  // Logique de positionnement en spirale inversée
  // Le centre reste à (0,0), on place les autres cellules selon leur index

  // Direction: 0=droite, 1=bas, 2=gauche, 3=haut
  let direction = 0;
  // Taille du segment actuel (combien de cases dans cette direction)
  let segmentLength = 1;
  // Segments complétés dans la direction actuelle
  let segmentsCompleted = 0;
  
  // Position actuelle
  let x = 0, y = 0;
  
  // Pour chaque cellule (en sautant l'index 0 qui reste au centre)
  for (let i = 1; i < cells.length; i++) {
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
    
    // Mise à jour des coordonnées de la cellule
    cells[i].x = x;
    cells[i].y = y;
    
    // Vérifier si un segment est terminé
    segmentsCompleted++;
    if (segmentsCompleted === segmentLength) {
      // Changer de direction
      direction = (direction + 1) % 4;
      segmentsCompleted = 0;
      
      // Augmenter la longueur du segment tous les 2 changements de direction
      // (après avoir complété un côté du carré)
      if (direction === 0 || direction === 2) {
        segmentLength++;
      }
    }
  }
};

// Composant principal pour la démonstration
export function SpiralGridDemo() {
  // État pour suivre l'étape actuelle de la simulation
  const [step, setStep] = useState(1);
  // Grille actuelle
  const [grid, setGrid] = useState<GridCell[]>([]);
  // Taille de la grille affichée (5x5)
  const gridSize = 5;
  // Nombre maximum d'étapes
  const maxSteps = 10;

  // Générer la grille à chaque changement d'étape
  useEffect(() => {
    setGrid(generateSpiralCoordinates(step));
  }, [step]);

  // Fonction pour avancer à l'étape suivante
  const nextStep = () => {
    if (step < maxSteps) {
      setStep(step + 1);
    }
  };

  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Rendu visuel de la grille
  const renderGrid = () => {
    // Créer une matrice vide pour représenter la grille
    const offset = Math.floor(gridSize / 2);
    const matrix: (GridCell | null)[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    // Remplir la matrice avec les cellules actuelles
    grid.forEach(cell => {
      // Convertir les coordonnées en indices de matrice (décalage pour centrer)
      const i = cell.y + offset;
      const j = cell.x + offset;
      
      // Vérifier si la cellule est dans les limites de la grille affichée
      if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
        matrix[i][j] = cell;
      }
    });

    // Rendu de la matrice
    return (
      <div className="grid grid-cols-5 gap-1 mb-8">
        {matrix.flat().map((cell, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {cell ? (
              <Cell 
                value={cell.index} 
                isCenter={cell.index === 0}
              />
            ) : (
              <div className="w-24 h-24 border border-dashed border-gray-200 bg-gray-50"></div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Simulation d'insertion en spirale inversée</h1>
      <div className="mb-4 flex justify-between items-center">
        <span className="text-xl font-semibold">Étape {step} sur {maxSteps}</span>
        <div className="space-x-4">
          <Button
            onClick={prevStep}
            disabled={step <= 1}
            variant="outline"
          >
            Étape précédente
          </Button>
          <Button
            onClick={nextStep}
            disabled={step >= maxSteps}
          >
            Étape suivante
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
        {renderGrid()}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Légende</h2>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-blue-500"></div>
          <span>Index 0 (Nouveau élément inséré au centre)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white border border-gray-300"></div>
          <span>Éléments précédemment insérés, repoussés selon le motif en spirale</span>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { ChimereIndicators } from '@/types/chimereTypes';
import { BarChart, LineChart, PieChart } from 'lucide-react';

interface StatsPanelProps {
  indicators: ChimereIndicators;
}

export function StatsPanel({ indicators }: StatsPanelProps) {
  // Convertir les indicateurs en tableau pour faciliter l'affichage
  const mainIndicators = [
    { name: 'Rareté', value: indicators.rarity, color: 'bg-purple-500' },
    { name: 'Popularité', value: indicators.popularity, color: 'bg-blue-500' },
    { name: 'Activité', value: indicators.activity, color: 'bg-green-500' },
    { name: 'Énergie', value: indicators.energy, color: 'bg-red-500' }
  ];

  // Filtrer les indicateurs personnalisés (tous sauf ceux déjà dans mainIndicators)
  const customIndicators = Object.entries(indicators)
    .filter(([key]) => !['rarity', 'popularity', 'activity', 'energy'].includes(key))
    .map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1), // Mettre la première lettre en majuscule
      value,
      color: getRandomColor(key) // Une fonction pour attribuer une couleur
    }));

  return (
    <div className="text-white">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-1">Indicateurs</h3>
        <p className="text-sm text-gray-400">
          Statistiques en temps réel de la Chimère
        </p>
      </div>

      {/* Indicateurs principaux avec barres de progression */}
      <div className="mb-8">
        <h4 className="text-base font-semibold mb-3">Indicateurs principaux</h4>
        <div className="space-y-4">
          {mainIndicators.map((indicator) => (
            <div key={indicator.name}>
              <div className="flex justify-between mb-1">
                <span className="text-sm">{indicator.name}</span>
                <span className="text-sm font-bold">{indicator.value}/100</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${indicator.color}`} style={{ width: `${indicator.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicateurs secondaires en grille */}
      {customIndicators.length > 0 && (
        <div className="mb-6">
          <h4 className="text-base font-semibold mb-3">Indicateurs personnalisés</h4>
          <div className="grid grid-cols-2 gap-4">
            {customIndicators.map((indicator) => (
              <div key={indicator.name} className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">{indicator.name}</span>
                  <span className={`text-sm font-bold ${getTextColor(indicator.value)}`}>
                    {indicator.value}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={indicator.color} 
                    style={{ width: `${normalizeValue(indicator.value)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widgets de visualisation (simulés ici) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center text-center">
          <div className="bg-blue-500/20 p-3 rounded-full mb-2">
            <LineChart size={24} className="text-blue-500" />
          </div>
          <h4 className="text-sm font-semibold">Évolution</h4>
          <p className="text-xs text-gray-400 mt-1">Tendance sur 30 jours</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center text-center">
          <div className="bg-purple-500/20 p-3 rounded-full mb-2">
            <PieChart size={24} className="text-purple-500" />
          </div>
          <h4 className="text-sm font-semibold">Comparaison</h4>
          <p className="text-xs text-gray-400 mt-1">Par rapport aux autres</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4 flex flex-col items-center text-center col-span-2">
          <div className="bg-green-500/20 p-3 rounded-full mb-2">
            <BarChart size={24} className="text-green-500" />
          </div>
          <h4 className="text-sm font-semibold">Performance</h4>
          <p className="text-xs text-gray-400 mt-1">Analyse détaillée des métriques</p>
        </div>
      </div>
    </div>
  );
}

// Fonction pour normaliser n'importe quelle valeur à une échelle de 0-100
function normalizeValue(value: number): number {
  // Si la valeur est déjà entre 0 et 100, on la retourne telle quelle
  if (value >= 0 && value <= 100) return value;
  
  // Pour les valeurs plus grandes, on utilise une échelle logarithmique
  if (value > 100) return Math.min(100, 75 + 25 * Math.log10(value / 100));
  
  // Pour les valeurs négatives, on retourne 0
  return Math.max(0, value);
}

// Fonction pour obtenir une couleur de texte selon la valeur
function getTextColor(value: number): string {
  if (value >= 80) return 'text-green-400';
  if (value >= 50) return 'text-blue-400';
  if (value >= 30) return 'text-yellow-400';
  return 'text-red-400';
}

// Fonction pour générer une couleur basée sur une chaîne
function getRandomColor(str: string): string {
  // Utiliser la chaîne pour générer un nombre déterministe
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Palettes de couleurs prédéfinies pour une meilleure cohérence visuelle
  const colorClasses = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  // Utiliser le hash pour sélectionner une couleur de la palette
  const index = Math.abs(hash) % colorClasses.length;
  return colorClasses[index];
}
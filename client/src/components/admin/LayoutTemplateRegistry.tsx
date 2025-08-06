import React from 'react';
import { cn } from '@/lib/utils';

// Types pour les layouts
export type LayoutType = '1-3' | '2-2' | '1-2-1' | '3-1' | '1-1-1-1' | '2-1-1' | '1-1-2' | 'full-width';

export interface LayoutConfig {
  id: LayoutType;
  name: string;
  description: string;
  columns: number;
  distribution: string[];
  useCases: string[];
  component: React.ComponentType<any>;
}

// Composants de layout
function FullWidthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}

function Layout13({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      <div className="col-span-1">{childArray[0]}</div>
      <div className="col-span-3">{childArray[1]}</div>
    </div>
  );
}

function Layout22({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-2 gap-6", className)}>
      <div>{childArray[0]}</div>
      <div>{childArray[1]}</div>
    </div>
  );
}

function Layout31({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      <div className="col-span-3">{childArray[0]}</div>
      <div className="col-span-1">{childArray[1]}</div>
    </div>
  );
}

function Layout121({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      <div className="col-span-1">{childArray[0]}</div>
      <div className="col-span-2">{childArray[1]}</div>
      <div className="col-span-1">{childArray[2]}</div>
    </div>
  );
}

function Layout211({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      <div className="col-span-2">{childArray[0]}</div>
      <div className="col-span-1">{childArray[1]}</div>
      <div className="col-span-1">{childArray[2]}</div>
    </div>
  );
}

function Layout112({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      <div className="col-span-1">{childArray[0]}</div>
      <div className="col-span-1">{childArray[1]}</div>
      <div className="col-span-2">{childArray[2]}</div>
    </div>
  );
}

function Layout1111({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const childArray = React.Children.toArray(children);
  return (
    <div className={cn("grid grid-cols-4 gap-6", className)}>
      <div>{childArray[0]}</div>
      <div>{childArray[1]}</div>
      <div>{childArray[2]}</div>
      <div>{childArray[3]}</div>
    </div>
  );
}

// Registre des layouts
export const LAYOUT_REGISTRY: Record<LayoutType, LayoutConfig> = {
  'full-width': {
    id: 'full-width',
    name: 'Pleine largeur',
    description: 'Une seule colonne sur toute la largeur',
    columns: 1,
    distribution: ['1fr'],
    useCases: ['Contenu simple', 'Formulaire unique', 'Page d\'accueil'],
    component: FullWidthLayout,
  },
  '1-3': {
    id: '1-3',
    name: 'Sidebar + Principal',
    description: 'Sidebar étroite à gauche, contenu principal large à droite',
    columns: 2,
    distribution: ['1fr', '3fr'],
    useCases: ['Navigation + Contenu', 'Menu + Formulaire principal', 'Filtres + Liste'],
    component: Layout13,
  },
  '3-1': {
    id: '3-1',
    name: 'Principal + Sidebar',
    description: 'Contenu principal large à gauche, sidebar à droite',
    columns: 2,
    distribution: ['3fr', '1fr'],
    useCases: ['Article + Sidebar', 'Contenu + Actions', 'Principal + Infos'],
    component: Layout31,
  },
  '2-2': {
    id: '2-2',
    name: 'Deux colonnes égales',
    description: 'Deux colonnes de même largeur',
    columns: 2,
    distribution: ['1fr', '1fr'],
    useCases: ['Formulaire double', 'Comparaison', 'Avant/Après'],
    component: Layout22,
  },
  '1-2-1': {
    id: '1-2-1',
    name: 'Centre élargi',
    description: 'Colonne centrale large encadrée par deux colonnes plus étroites',
    columns: 3,
    distribution: ['1fr', '2fr', '1fr'],
    useCases: ['Dashboard', 'Éditeur avec panels', 'Interface complexe'],
    component: Layout121,
  },
  '2-1-1': {
    id: '2-1-1',
    name: 'Principale + deux',
    description: 'Colonne principale double largeur, deux colonnes secondaires',
    columns: 3,
    distribution: ['2fr', '1fr', '1fr'],
    useCases: ['Contenu + Actions', 'Principal + Détails', 'Formulaire + Infos'],
    component: Layout211,
  },
  '1-1-2': {
    id: '1-1-2',
    name: 'Deux + large',
    description: 'Deux colonnes étroites, une colonne large à droite',
    columns: 3,
    distribution: ['1fr', '1fr', '2fr'],
    useCases: ['Navigation + Filtres + Contenu', 'Double sidebar + Principal'],
    component: Layout112,
  },
  '1-1-1-1': {
    id: '1-1-1-1',
    name: 'Quatre colonnes',
    description: 'Quatre colonnes de même largeur',
    columns: 4,
    distribution: ['1fr', '1fr', '1fr', '1fr'],
    useCases: ['Grille de cartes', 'Comparaison multiple', 'Dashboard stats'],
    component: Layout1111,
  },
};

// Composant de sélection de layout
export function LayoutSelector({ 
  selected, 
  onSelect, 
  className 
}: { 
  selected: LayoutType; 
  onSelect: (layout: LayoutType) => void; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choisir un modèle de colonnes</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.values(LAYOUT_REGISTRY).map((layout) => (
          <div
            key={layout.id}
            onClick={() => onSelect(layout.id)}
            className={cn(
              "p-4 border-2 rounded-lg cursor-pointer transition-all",
              "hover:border-blue-400 hover:bg-blue-50",
              selected === layout.id 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-300 bg-white"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{layout.name}</h4>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {layout.columns} col
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3">{layout.description}</p>
            
            {/* Visualisation du layout */}
            <div className="mb-3">
              <div 
                className="grid gap-1 h-8"
                style={{ 
                  gridTemplateColumns: layout.distribution.join(' '),
                }}
              >
                {Array.from({ length: layout.columns }).map((_, index) => (
                  <div 
                    key={index} 
                    className="bg-blue-400/30 rounded-sm"
                  />
                ))}
              </div>
            </div>
            
            {/* Cas d'usage */}
            <div className="text-xs text-gray-600">
              <span className="font-medium">Idéal pour:</span>
              <div className="mt-1 space-y-1">
                {layout.useCases.slice(0, 2).map((useCase, index) => (
                  <div key={index}>• {useCase}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper pour obtenir le composant d'un layout
export function getLayoutComponent(layoutId: LayoutType) {
  return LAYOUT_REGISTRY[layoutId]?.component || FullWidthLayout;
}

// Helper pour obtenir la config d'un layout
export function getLayoutConfig(layoutId: LayoutType): LayoutConfig | null {
  return LAYOUT_REGISTRY[layoutId] || null;
}
import React, { useState } from 'react';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AutoTags } from '@/components/admin/PageStatusIndicator';
import { 
  Palette, 
  Type, 
  Zap, 
  Tag, 
  Grid, 
  Settings, 
  Eye, 
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

// Standards de couleurs établis
const COLOR_STANDARDS = {
  tags: {
    connected: { bg: '#10b981', text: 'white', description: 'Composant connecté et opérationnel' },
    beta: { bg: '#f59e0b', text: 'white', description: 'Composant en développement' },
    draft: { bg: '#6b7280', text: 'white', description: 'Composant en phase de conception' },
    new: { bg: '#06b6d4', text: 'white', description: 'Nouveau composant récemment ajouté' },
    version: { bg: '#3b82f6', text: 'white', description: 'Indicateur de version' },
    indexed: { bg: 'transparent', text: '#d1d5db', description: 'Composant indexé (futur)' }
  },
  connections: {
    active: '#10b981',
    inactive: '#d1d5db',
    development: '#f59e0b'
  },
  sections: {
    grid: { primary: '#3b82f6', secondary: '#eff6ff', border: '#dbeafe' },
    components: { primary: '#10b981', secondary: '#f0fdf4', border: '#dcfce7' },
    contents: { primary: '#8b5cf6', secondary: '#faf5ff', border: '#e9d5ff' },
    interface: { primary: '#6b7280', secondary: '#f9fafb', border: '#e5e7eb' }
  }
};

// Standards typographiques
const TYPOGRAPHY_STANDARDS = {
  tags: {
    fontFamily: 'Roboto Mono, monospace',
    fontSize: '8px',
    padding: '2px 4px',
    borderRadius: '2px'
  },
  titles: {
    section: { fontSize: '14px', fontWeight: 'bold' as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
    subsection: { fontSize: '12px', fontWeight: '600' as const },
    item: { fontSize: '11px', fontWeight: 'normal' as const }
  },
  codes: {
    fontFamily: 'Roboto Mono, monospace',
    fontSize: '10px',
    color: '#6b7280'
  }
};

// Standards d'icônes
const ICON_STANDARDS = {
  connection: { component: 'Zap', activeColor: '#10b981', inactiveColor: '#d1d5db', size: '12px' },
  sections: {
    grid: 'Grid',
    components: 'Layers', 
    contents: 'Blocks',
    interface: 'Layout',
    settings: 'Settings'
  },
  actions: {
    view: 'Eye',
    edit: 'Settings',
    database: 'Database',
    upload: 'ArrowDownToLine',
    blockchain: 'Wallet'
  }
};

export function StylesSystemPage() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, item: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const renderColorSwatch = (color: string, name: string) => (
    <div className="flex items-center gap-2 p-2 border rounded">
      <div 
        className="w-6 h-6 rounded border border-gray-300"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1">
        <div className="text-xs font-mono text-gray-900">{name}</div>
        <div className="text-xs text-gray-500 font-mono">{color}</div>
      </div>
      <button
        onClick={() => copyToClipboard(color, name)}
        className="p-1 hover:bg-gray-100 rounded"
      >
        {copiedItem === name ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
      </button>
    </div>
  );

  const renderTagExample = (type: string, config: any) => (
    <div className="flex items-center gap-3 p-3 border rounded">
      <span 
        className="inline-flex items-center px-1 py-0.5 rounded"
        style={{ 
          fontFamily: config.fontFamily || TYPOGRAPHY_STANDARDS.tags.fontFamily,
          fontSize: config.fontSize || TYPOGRAPHY_STANDARDS.tags.fontSize,
          backgroundColor: config.bg,
          color: config.text
        }}
      >
        {type}
      </span>
      <div className="flex-1">
        <div className="text-xs font-medium">{config.description}</div>
        <div className="text-xs text-gray-500 font-mono">bg: {config.bg} | text: {config.text}</div>
      </div>
    </div>
  );

  const renderConnectionExample = () => (
    <div className="grid grid-cols-3 gap-4">
      <div className="flex items-center gap-2 p-3 border rounded">
        <Zap className="w-3 h-3 text-green-500" />
        <div>
          <div className="text-xs font-medium">Connecté</div>
          <div className="text-xs text-gray-500">#10b981</div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 border rounded">
        <Zap className="w-3 h-3 text-orange-400" />
        <div>
          <div className="text-xs font-medium">Développement</div>
          <div className="text-xs text-gray-500">#f59e0b</div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 border rounded">
        <Zap className="w-3 h-3 text-gray-300" />
        <div>
          <div className="text-xs font-medium">Inactif</div>
          <div className="text-xs text-gray-500">#d1d5db</div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeaderTemplate 
          title="STYLES SYSTEM"
        />
        
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Standards visuels et typographiques du projet</p>
            <AutoTags route="/admin/styles-system" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          
          {/* Vue d'ensemble */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">VUE D'ENSEMBLE DU SYSTÈME</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Tag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-blue-900">TAGS SYSTÈME</div>
                <div className="text-xs text-blue-700">5 types définis</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-green-900">CONNEXIONS</div>
                <div className="text-xs text-green-700">3 états visuels</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Type className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-purple-900">TYPOGRAPHIE</div>
                <div className="text-xs text-purple-700">Roboto Mono</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Grid className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <div className="text-sm font-semibold text-gray-900">SECTIONS</div>
                <div className="text-xs text-gray-700">4 catégories</div>
              </div>
            </div>
          </div>

          {/* Système de tags */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">SYSTÈME DE TAGS</h2>
            </div>
            
            <div className="space-y-4">
              {Object.entries(COLOR_STANDARDS.tags).map(([type, config]) => (
                <div key={type}>
                  {renderTagExample(type, config)}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">SPÉCIFICATIONS TECHNIQUES</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-medium text-gray-700">Police</div>
                  <div className="font-mono text-gray-600">{TYPOGRAPHY_STANDARDS.tags.fontFamily}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Taille</div>
                  <div className="font-mono text-gray-600">{TYPOGRAPHY_STANDARDS.tags.fontSize}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Padding</div>
                  <div className="font-mono text-gray-600">{TYPOGRAPHY_STANDARDS.tags.padding}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Border Radius</div>
                  <div className="font-mono text-gray-600">{TYPOGRAPHY_STANDARDS.tags.borderRadius}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Système de connexions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">INDICATEURS DE CONNEXION</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                L'icône éclair indique l'état de connexion d'un composant, séparément des tags de statut.
              </p>
              {renderConnectionExample()}
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-800">VALIDATION AUTOMATIQUE</div>
                  <div className="text-xs text-yellow-700">
                    Les états sont validés automatiquement toutes les 30 secondes via les APIs correspondantes.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Palette de couleurs */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-bold text-gray-900">PALETTE DE COULEURS</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(COLOR_STANDARDS.tags).map(([name, config]) => (
                <div key={name}>
                  {renderColorSwatch(config.bg, `tag-${name}`)}
                </div>
              ))}
              {Object.entries(COLOR_STANDARDS.connections).map(([name, color]) => (
                <div key={name}>
                  {renderColorSwatch(color, `connection-${name}`)}
                </div>
              ))}
            </div>
          </div>

          {/* Standards typographiques */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Type className="w-6 h-6 text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-900">STANDARDS TYPOGRAPHIQUES</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">HIÉRARCHIE DES TITRES</h3>
                <div className="space-y-2">
                  <div style={TYPOGRAPHY_STANDARDS.titles.section} className="text-gray-900">
                    TITRE DE SECTION
                  </div>
                  <div style={TYPOGRAPHY_STANDARDS.titles.subsection} className="text-gray-800">
                    Titre de sous-section
                  </div>
                  <div style={TYPOGRAPHY_STANDARDS.titles.item} className="text-gray-700">
                    Titre d'élément
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">ÉLÉMENTS DE CODE</h3>
                <div 
                  className="p-3 bg-gray-100 rounded font-mono text-gray-600"
                  style={TYPOGRAPHY_STANDARDS.codes}
                >
                  AdminHeaderTemplate.tsx
                </div>
              </div>
            </div>
          </div>

          {/* Guide d'implémentation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">GUIDE D'IMPLÉMENTATION</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">UTILISATION DES AUTOTAGS</div>
                <div className="text-xs text-blue-800 font-mono">
                  &lt;AutoTags route="/admin/example" version="v3" /&gt;
                </div>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-2">CONFIGURATION PAGE_STATUS_CONFIG</div>
                <div className="text-xs text-green-800 font-mono">
                  '/admin/example': &#123; status: '✓', version: 'v3', type: 'GRID', hasComponent: true &#125;
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm font-medium text-purple-900 mb-2">VALIDATION AUTOMATIQUE</div>
                <div className="text-xs text-purple-800">
                  Le système usePageStatus() valide automatiquement les connexions API toutes les 30 secondes.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminCursorProvider>
  );
}
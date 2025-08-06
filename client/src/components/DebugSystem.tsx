import React, { createContext, useContext, useState, useEffect } from 'react';

// Context pour le debug
interface DebugContextType {
  debugMode: boolean;
  toggleDebug: () => void;
  debugFilters: {
    structure: boolean;
    layout: boolean;
    text: boolean;
    interactive: boolean;
    database: boolean;
    template: boolean;
    hardcoded: boolean;
    blockchain: boolean;
  };
  setFilter: (filter: keyof DebugContextType['debugFilters'], value: boolean) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function useDebug() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within DebugProvider');
  }
  return context;
}

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [debugMode, setDebugMode] = useState(false);
  const [debugFilters, setDebugFilters] = useState({
    structure: false,
    layout: false,
    text: false,
    interactive: false,
    database: false,
    template: false,
    hardcoded: false,
    blockchain: false
  });

  const toggleDebug = () => {
    setDebugMode(!debugMode);
  };

  const setFilter = (filter: keyof typeof debugFilters, value: boolean) => {
    // Permet la sélection multiple des filtres
    setDebugFilters(prev => ({ ...prev, [filter]: value }));
  };

  // Gestion clavier
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.key === 'd' || event.key === 'D') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        // Vérifier que l'utilisateur n'est pas en train de taper dans un input
        const activeElement = document.activeElement;
        const isTyping = activeElement?.tagName === 'INPUT' || 
                        activeElement?.tagName === 'TEXTAREA' || 
                        activeElement?.getAttribute('contenteditable') === 'true';
        
        if (!isTyping) {
          event.preventDefault();
          toggleDebug();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode, toggleDebug]);

  // Ajout de la classe debug au body
  useEffect(() => {
    if (debugMode) {
      document.body.classList.add('debug-active');
    } else {
      document.body.classList.remove('debug-active');
    }
  }, [debugMode]);

  return (
    <DebugContext.Provider value={{ debugMode, toggleDebug, debugFilters, setFilter }}>
      {children}
      <DebugStyles active={debugMode} filters={debugFilters} />
      <DebugButton />
      <DebugPanel />
    </DebugContext.Provider>
  );
}

// Bouton debug flottant
function DebugButton() {
  const { debugMode, toggleDebug } = useDebug();
  
  return (
    <button
      onClick={toggleDebug}
      className={`debug-exclude fixed bottom-6 right-20 w-8 h-8 rounded-full shadow-lg transition-all duration-200 z-[99999] ${
        debugMode 
          ? 'bg-pink-500 hover:bg-pink-600' 
          : 'bg-gray-500 hover:bg-gray-600'
      }`}
      title={debugMode ? 'Debug ON - Appuyez sur D' : 'Debug OFF - Appuyez sur D'}
    >
      <div className={`w-3 h-3 rounded-full mx-auto ${debugMode ? 'bg-white' : 'bg-gray-300'}`}></div>
    </button>
  );
}

// Panneau debug en bas du viewport
function DebugPanel() {
  const { debugMode, debugFilters, setFilter } = useDebug();

  if (!debugMode) return null;

  const filters = [
    { key: 'structure' as const, label: 'S Structure', color: 'blue' },
    { key: 'layout' as const, label: 'L Layout', color: 'cyan' },
    { key: 'text' as const, label: 'T Texte', color: 'green' },
    { key: 'interactive' as const, label: 'I Interactif', color: 'orange' },
    { key: 'database' as const, label: '● DB', color: 'purple' },
    { key: 'template' as const, label: '◆ TPL', color: 'pink' },
    { key: 'hardcoded' as const, label: '▲ EXT', color: 'yellow' },
    { key: 'blockchain' as const, label: '⚡ RT', color: 'red' }
  ];

  const getActiveColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500 text-white shadow-lg',
      cyan: 'bg-cyan-500 text-white shadow-lg',
      green: 'bg-green-500 text-white shadow-lg',
      orange: 'bg-orange-500 text-white shadow-lg',
      purple: 'bg-purple-500 text-white shadow-lg',
      pink: 'bg-pink-500 text-white shadow-lg',
      yellow: 'bg-yellow-500 text-white shadow-lg',
      red: 'bg-red-500 text-white shadow-lg'
    };
    return colorMap[color] || 'bg-gray-500 text-white shadow-lg';
  };

  return (
    <div className="debug-exclude fixed bottom-0 left-0 right-0 bg-black/95 text-white px-4 py-3 border-t border-gray-600 backdrop-blur-sm z-[99998]">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="text-green-400 mr-3">DEBUG:</span>
        
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => setFilter(filter.key, !debugFilters[filter.key])}
            className={`debug-exclude px-3 py-1 rounded text-sm transition-all ${
              debugFilters[filter.key]
                ? getActiveColor(filter.color)
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Styles CSS pour le debug
function DebugStyles({ active, filters }: { active: boolean, filters: any }) {
  if (!active) return null;

  return (
    <style>{`
      /* Exclusions debug - éléments à ne jamais débugger */
      .debug-exclude,
      .debug-exclude *,
      [class*="cursor-"],
      [data-cursor-type],
      .cursor-v2-container,
      .cursor-v2-image {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
      }

      /* Structure - Bleu */
      ${filters.structure ? `
        .debug-active div:not(.debug-exclude):not(.debug-exclude *),
        .debug-active section:not(.debug-exclude):not(.debug-exclude *),
        .debug-active article:not(.debug-exclude):not(.debug-exclude *),
        .debug-active nav:not(.debug-exclude):not(.debug-exclude *),
        .debug-active header:not(.debug-exclude):not(.debug-exclude *),
        .debug-active footer:not(.debug-exclude):not(.debug-exclude *),
        .debug-active main:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #3b82f6 !important;
        }
      ` : ''}

      /* Layout - Cyan */
      ${filters.layout ? `
        .debug-active [class*="flex"]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="grid"]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="absolute"]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="relative"]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="fixed"]:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #06b6d4 !important;
        }
      ` : ''}

      /* Texte - Vert */
      ${filters.text ? `
        .debug-active h1:not(.debug-exclude):not(.debug-exclude *),
        .debug-active h2:not(.debug-exclude):not(.debug-exclude *),
        .debug-active h3:not(.debug-exclude):not(.debug-exclude *),
        .debug-active h4:not(.debug-exclude):not(.debug-exclude *),
        .debug-active h5:not(.debug-exclude):not(.debug-exclude *),
        .debug-active h6:not(.debug-exclude):not(.debug-exclude *),
        .debug-active p:not(.debug-exclude):not(.debug-exclude *),
        .debug-active span:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #10b981 !important;
        }
      ` : ''}

      /* Interactif - Orange */
      ${filters.interactive ? `
        .debug-active button:not(.debug-exclude):not(.debug-exclude *),
        .debug-active a:not(.debug-exclude):not(.debug-exclude *),
        .debug-active input:not(.debug-exclude):not(.debug-exclude *),
        .debug-active select:not(.debug-exclude):not(.debug-exclude *),
        .debug-active textarea:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #f97316 !important;
        }
      ` : ''}

      /* Database - Violet */
      ${filters.database ? `
        .debug-active [data-database]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="query"]:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #8b5cf6 !important;
        }
      ` : ''}

      /* Template - Rose */
      ${filters.template ? `
        .debug-active [data-template]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="template"]:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #ec4899 !important;
        }
      ` : ''}

      /* External - Jaune */
      ${filters.hardcoded ? `
        .debug-active [data-external]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="external"]:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #eab308 !important;
        }
      ` : ''}

      /* Runtime - Rouge */
      ${filters.blockchain ? `
        .debug-active [data-runtime]:not(.debug-exclude):not(.debug-exclude *),
        .debug-active [class*="runtime"]:not(.debug-exclude):not(.debug-exclude *) {
          outline: 2px solid #ef4444 !important;
        }
      ` : ''}
    `}</style>
  );
}
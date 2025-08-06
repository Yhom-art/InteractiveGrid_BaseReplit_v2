import React from 'react';
import { Link, useLocation } from 'wouter';

// Layout pour la section admin
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div style={{ display: 'flex', height: 'auto', minHeight: '100vh', background: '#f1f5f9', overflow: 'auto' }}>
      {/* Sidebar */}
      <aside style={{ width: '16rem', background: '#1e293b', color: 'white', position: 'sticky', top: 0, height: '100vh' }}>
        <div className="p-4">
          <h2 className="font-mono text-xl font-bold leading-tight">GRILLE CHIMÉRIQUE</h2>
          <p className="font-mono text-sm text-gray-400 leading-tight">Administration</p>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link 
                href="/admin/dashboard" 
                className={`block py-2 px-4 font-mono text-sm leading-tight transition-colors ${location === '/admin/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                TABLEAU DE BORD
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/chimeras-gallery" 
                className={`block py-2 px-4 font-mono text-sm leading-tight transition-colors ${location.includes('chimeras-gallery') ? 'bg-indigo-700' : 'hover:bg-indigo-600'}`}
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                <span className="flex items-center">
                  <span className="mr-2">🖼️</span>
                  GALERIE NFTS
                </span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/components-examples" 
                className={`block py-2 px-4 font-mono text-sm leading-tight transition-colors ${location.includes('components-examples') ? 'bg-blue-700' : 'hover:bg-blue-600'}`}
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                <span className="flex items-center">
                  <span className="mr-2">✨</span>
                  COMPOSANTS SPÉCIALISÉS
                </span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/editorials" 
                className={`block py-2 px-4 font-mono text-sm leading-tight transition-colors ${location.startsWith('/admin/editorials') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                ÉLÉMENTS ÉDITORIAUX
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/music-containers" 
                className={`block py-2 px-4 font-mono text-sm leading-tight transition-colors ${location.startsWith('/admin/music-containers') ? 'bg-purple-700' : 'hover:bg-purple-600'}`}
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                <span className="flex items-center">
                  <span className="mr-2">♪</span>
                  CONTAINERS MUSICAUX
                </span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/grid" 
                className={`block py-2 px-4 font-mono text-sm leading-tight transition-colors ${location.startsWith('/admin/grid') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                CONFIGURATION GRILLE
              </Link>
            </li>
            <li className="mt-8">
              <Link 
                href="/" 
                className="block py-2 px-4 font-mono text-sm leading-tight text-blue-300 hover:bg-gray-700 transition-colors"
                style={{ cursor: 'url(/src/assets/cursors/cursor-grab.svg) 16 16, pointer' }}
              >
                RETOUR À LA GRILLE
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content with scrollable area */}
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        overflowY: 'auto', 
        overflowX: 'visible',
        height: 'auto', 
        minHeight: '100vh',
        maxHeight: '100vh',
        scrollbarWidth: 'auto',
        scrollbarColor: '#94a3b8 #f1f5f9',
        WebkitOverflowScrolling: 'touch'
      }}>
        {children}
      </main>
    </div>
  );
}
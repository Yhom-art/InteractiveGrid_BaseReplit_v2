import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import cursorGrabSvg from '@/assets/cursors/cursor-grab.svg';
import { CursorType } from '@/types/common';

export function NavigationMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Gestionnaires de drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher le comportement par défaut
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Si on n'a pas bougé (pas de drag), on toggle le menu
    if (!isDragging) {
      toggleMenu();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Ajout/suppression des event listeners pour le drag global
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  const links = [
    // Principal
    { to: '/admin/dashboard', label: '⚙️ Dashboard Admin' },
    { to: '/admin/container-types', label: '📦 Types de Containers' },
    { to: '/admin/container-layers', label: '🔧 Config Layers' },
    { to: '/v1', label: '📍 GridMap v1 Ref' },
    { to: '/grille-chimerique', label: '🌟 Grille Chimérique Final' },
    
    // Tests et POCs
    { to: '/', label: '📋 Tests - Accueil' },
    { to: '/audio-visualizer-poc', label: '🎵 Audio Visualizer POC' },
    { to: '/fluid-column-poc', label: '📋 Tests - Colonnes Fluides' },
    { to: '/new-fluid-grid', label: '📋 Tests - Nouvelle Grille' },
    { to: '/spiral-grid-demo', label: '📋 Tests - Grille Spirale' },
    { to: '/grid-panel-poc', label: '📋 Tests - Panels POC' },
    { to: '/panel-demo', label: '📋 Tests - Panel Demo' },
  ];
  
  return (
    <div 
      ref={menuRef}
      className="fixed z-50"
      style={{
        top: `${position.y}px`,
        right: position.x === 0 ? '16px' : 'auto',
        left: position.x !== 0 ? `${position.x}px` : 'auto',
        transform: position.x === 0 ? 'none' : `translate(${position.x}px, ${position.y}px)`
      }}
    >
      {/* Zone de drag - Header du menu */}
      <div
        className="bg-black/80 text-white p-3 flex items-center justify-center shadow-lg hover:bg-black/90 transition-all group select-none"
        data-cursor-type={CursorType.PANEL}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </div>
      
      {isOpen && (
        <div 
          className="absolute top-12 right-0 bg-white shadow-xl w-64 overflow-hidden"
          onMouseDown={(e) => e.stopPropagation()}
          style={{ cursor: 'default' }}
        >
          <div className="p-3 bg-gray-100 border-b border-gray-200">
            <h3 className="text-gray-700 font-mono text-sm leading-tight">NAVIGUER</h3>
          </div>
          <nav className="py-1">
            {links.map((link, index) => (
              <div key={index} className="block px-3 py-1">
                <div 
                  className="block text-gray-700 hover:bg-gray-100 transition-colors font-mono text-xs leading-tight py-0.5 cursor-pointer"
                  data-cursor-type={CursorType.PANEL}
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = link.to;
                  }}
                >
                  {link.label}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
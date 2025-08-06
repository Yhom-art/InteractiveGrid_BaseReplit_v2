import React from 'react';
import { Link, useLocation } from 'wouter';

/**
 * Menu de navigation simple avec accès aux différentes implémentations de grille
 */
export function SimpleNavigation() {
  const [location] = useLocation();
  
  // Liste des routes principales
  const routes = [
    { path: '/simplified-fluid-grid', label: 'Grille Fluide (Simplifiée)' },
    { path: '/fluid-column-poc', label: 'POC Colonnes Fluides' },
    { path: '/new-fluid-grid', label: 'Nouvelle Grille Fluide' },
    { path: '/grid-panel-poc', label: 'POC Panels' },
    { path: '/spiral-grid-demo', label: 'Grille Spirale' },
    { path: '/', label: 'Accueil' },
  ];
  
  return (
    <div className="simple-navigation" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      padding: '10px 20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {routes.map(route => (
        <Link key={route.path} href={route.path}>
          <a className={location === route.path ? 'active' : ''} style={{
            padding: '6px 12px',
            textDecoration: 'none',
            color: location === route.path ? '#fff' : '#333',
            backgroundColor: location === route.path ? '#0d6efd' : 'transparent',
            borderRadius: '4px',
            fontWeight: location === route.path ? 'bold' : 'normal',
            transition: 'all 0.2s ease'
          }}>
            {route.label}
          </a>
        </Link>
      ))}
    </div>
  );
}
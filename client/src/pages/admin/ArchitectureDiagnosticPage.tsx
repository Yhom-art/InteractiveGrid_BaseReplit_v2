import React, { useState, useEffect } from 'react';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { useQuery } from '@tanstack/react-query';
import { Database, Grid, Package, Map, Settings, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ConnectionStatus {
  id: string;
  name: string;
  type: 'database' | 'api' | 'component' | 'config';
  status: 'connected' | 'disconnected' | 'unknown' | 'partial';
  lastChecked: string;
  details: string;
  dependencies: string[];
}

interface ArchitectureNode {
  id: string;
  name: string;
  type: 'page' | 'api' | 'database' | 'config';
  status: 'active' | 'inactive' | 'error';
  connections: string[];
  position: { x: number; y: number };
}

export default function ArchitectureDiagnosticPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatus[]>([]);

  // Test des connexions principales
  const gridConfigQuery = useQuery({
    queryKey: ['/api/grid-v3-config/market-castings'],
    queryFn: () => fetch('/api/grid-v3-config/market-castings').then(res => res.json()),
    retry: false
  });

  const containerTypesQuery = useQuery({
    queryKey: ['/api/container-layer-configurations'],
    queryFn: () => fetch('/api/container-layer-configurations').then(res => res.json()),
    retry: false
  });

  const cursorsQuery = useQuery({
    queryKey: ['/api/cursors-v2'],
    queryFn: () => fetch('/api/cursors-v2').then(res => res.json()),
    retry: false
  });

  // Architecture nodes avec positions pour visualisation
  const architectureNodes: ArchitectureNode[] = [
    // Pages principales
    { id: 'grid-pages', name: 'Pages Grid', type: 'page', status: 'active', connections: ['grid-config-api'], position: { x: 100, y: 100 } },
    { id: 'grid-distribution', name: 'Règles Distribution', type: 'page', status: 'active', connections: ['grid-config-api'], position: { x: 300, y: 100 } },
    { id: 'container-types', name: 'Types Containers', type: 'page', status: 'active', connections: ['container-api'], position: { x: 500, y: 100 } },
    { id: 'container-admin', name: 'Admin Container Types', type: 'page', status: 'active', connections: ['container-api'], position: { x: 700, y: 100 } },
    
    // APIs
    { id: 'grid-config-api', name: 'Grid Config API', type: 'api', status: gridConfigQuery.isError ? 'error' : 'active', connections: ['database'], position: { x: 200, y: 250 } },
    { id: 'container-api', name: 'Container API', type: 'api', status: containerTypesQuery.isError ? 'error' : 'active', connections: ['database'], position: { x: 600, y: 250 } },
    { id: 'cursor-api', name: 'Cursor API', type: 'api', status: cursorsQuery.isError ? 'error' : 'active', connections: ['database'], position: { x: 400, y: 250 } },
    
    // Database
    { id: 'database', name: 'PostgreSQL Database', type: 'database', status: 'active', connections: [], position: { x: 400, y: 400 } },
    
    // Configurations
    { id: 'market-castings-config', name: 'Market Castings Config', type: 'config', status: gridConfigQuery.isSuccess ? 'active' : 'error', connections: ['grid-config-api'], position: { x: 100, y: 300 } }
  ];

  useEffect(() => {
    // Mise à jour des statuts de connexion
    const statuses: ConnectionStatus[] = [
      {
        id: 'grid-pages-connection',
        name: 'Pages Grid → Market Castings Config',
        type: 'api',
        status: gridConfigQuery.isSuccess ? 'connected' : gridConfigQuery.isError ? 'disconnected' : 'unknown',
        lastChecked: new Date().toLocaleTimeString(),
        details: gridConfigQuery.isError ? 'Erreur de chargement config' : 'Configuration chargée',
        dependencies: ['grid-config-api', 'market-castings-config']
      },
      {
        id: 'distribution-rules-connection',
        name: 'Règles Distribution → Database',
        type: 'database',
        status: 'partial',
        lastChecked: new Date().toLocaleTimeString(),
        details: 'Sauvegarde OK mais lecture config Market Castings incertaine',
        dependencies: ['grid-config-api', 'database']
      },
      {
        id: 'container-types-connection',
        name: 'Container Types → Database',
        type: 'database',
        status: containerTypesQuery.isSuccess ? 'connected' : 'disconnected',
        lastChecked: new Date().toLocaleTimeString(),
        details: containerTypesQuery.isSuccess ? 'Types de containers chargés' : 'Erreur chargement types',
        dependencies: ['container-api', 'database']
      },
      {
        id: 'cursors-connection',
        name: 'Curseurs Dynamiques → Database',
        type: 'database',
        status: cursorsQuery.isSuccess ? 'connected' : 'disconnected',
        lastChecked: new Date().toLocaleTimeString(),
        details: cursorsQuery.isSuccess ? 'Curseurs chargés' : 'Erreur chargement curseurs',
        dependencies: ['cursor-api', 'database']
      }
    ];
    setConnectionStatuses(statuses);
  }, [gridConfigQuery.status, containerTypesQuery.status, cursorsQuery.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'disconnected':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partial':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'disconnected':
      case 'error':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'partial':
        return 'text-yellow-600 border-yellow-200 bg-yellow-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const leftColumn = (
    <div className="space-y-6">
      {/* Statut Global */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="admin-h2 mb-4">Statut Global Architecture</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded border">
            <span className="font-medium">Pages Grid → Market Castings</span>
            {getStatusIcon(gridConfigQuery.isSuccess ? 'connected' : 'disconnected')}
          </div>
          <div className="flex items-center justify-between p-3 rounded border">
            <span className="font-medium">Container Types → Database</span>
            {getStatusIcon(containerTypesQuery.isSuccess ? 'connected' : 'disconnected')}
          </div>
          <div className="flex items-center justify-between p-3 rounded border">
            <span className="font-medium">Curseurs → Database</span>
            {getStatusIcon(cursorsQuery.isSuccess ? 'connected' : 'disconnected')}
          </div>
        </div>
      </div>

      {/* Connexions Détaillées */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="admin-h2 mb-4">Connexions Détaillées</h3>
        <div className="space-y-2">
          {connectionStatuses.map((connection) => (
            <div
              key={connection.id}
              className={`p-3 rounded border cursor-pointer transition-colors ${getStatusColor(connection.status)} ${
                selectedNode === connection.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedNode(connection.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{connection.name}</span>
                {getStatusIcon(connection.status)}
              </div>
              <div className="text-xs opacity-75">{connection.details}</div>
              <div className="text-xs opacity-50 mt-1">Vérifié: {connection.lastChecked}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions de Diagnostic */}
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="admin-h2 mb-4">Actions Diagnostic</h3>
        <div className="space-y-2">
          <button 
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            onClick={() => {
              gridConfigQuery.refetch();
              containerTypesQuery.refetch();
              cursorsQuery.refetch();
            }}
          >
            Actualiser Tous Tests
          </button>
          <button className="w-full p-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-sm">
            Tester Connexions BDD
          </button>
          <button className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm">
            Valider Architecture
          </button>
        </div>
      </div>
    </div>
  );

  const rightColumn = (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="admin-h2 mb-4">Cartographie Architecture</h3>
      
      {/* Schéma visuel simplifié */}
      <div className="relative bg-gray-50 rounded-lg p-4 h-96 overflow-hidden">
        {architectureNodes.map((node) => (
          <div
            key={node.id}
            className={`absolute w-24 h-16 rounded border-2 flex items-center justify-center text-xs font-medium cursor-pointer transition-all ${
              selectedNode === node.id ? 'ring-2 ring-blue-500 z-10' : ''
            } ${getStatusColor(node.status)}`}
            style={{ 
              left: `${(node.position.x / 800) * 100}%`, 
              top: `${(node.position.y / 500) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedNode(node.id)}
          >
            <div className="text-center">
              <div className="mb-1">
                {node.type === 'page' && <Grid className="w-3 h-3 mx-auto" />}
                {node.type === 'api' && <Settings className="w-3 h-3 mx-auto" />}
                {node.type === 'database' && <Database className="w-3 h-3 mx-auto" />}
                {node.type === 'config' && <Package className="w-3 h-3 mx-auto" />}
              </div>
              <div>{node.name}</div>
            </div>
          </div>
        ))}
        
        {/* Lignes de connexion simplifiées */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line x1="20%" y1="20%" x2="40%" y2="50%" stroke="#94a3b8" strokeWidth="2" />
          <line x1="60%" y1="20%" x2="40%" y2="50%" stroke="#94a3b8" strokeWidth="2" />
          <line x1="40%" y1="50%" x2="80%" y2="80%" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      </div>

      {/* Détails du nœud sélectionné */}
      {selectedNode && (
        <div className="mt-6 p-4 border rounded-lg bg-blue-50">
          <h4 className="font-medium mb-2">Détails Connexion</h4>
          <div className="text-sm text-gray-600">
            {connectionStatuses.find(c => c.id === selectedNode)?.details || 
             architectureNodes.find(n => n.id === selectedNode)?.name}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AdminCursorProvider>
      <AdminLayoutTemplate leftColumn={leftColumn}>
        <AdminHeaderTemplate title="DIAGNOSTIC ARCHITECTURE" />
        {rightColumn}
      </AdminLayoutTemplate>
    </AdminCursorProvider>
  );
}
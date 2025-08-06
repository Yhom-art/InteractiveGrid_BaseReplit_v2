import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  Plus, 
  Grid, 
  Settings, 
  FileText, 
  Layers,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useDynamicPageCreation } from '@/hooks/useDynamicPageCreation';

const CREATE_OPTIONS = [
  {
    id: 'grid-models',
    title: 'Modèles de Grilles',
    description: 'Créer et configurer de nouveaux modèles de grilles (32x32, 16x16, etc.)',
    icon: Grid,
    route: '/admin/grid-models',
    category: 'M.APP GRID',
    color: 'blue',
    status: 'available'
  },
  {
    id: 'admin-page',
    title: 'Page Admin',
    description: 'Assistant 3 étapes pour créer une nouvelle page d\'administration',
    icon: FileText,
    action: 'dynamic-creator',
    category: 'INTERFACE ADMIN',
    color: 'green',
    status: 'available'
  },
  {
    id: 'container-layer',
    title: 'Configuration Container Layer',
    description: 'Nouvelle configuration pour les couches de containers',
    icon: Layers,
    route: '/admin/container-layers-v3',
    category: 'COMPONENTS',
    color: 'purple',
    status: 'available'
  },
  {
    id: 'cursor-config',
    title: 'Configuration Curseur',
    description: 'Créer une nouvelle configuration de curseur personnalisé',
    icon: Settings,
    route: '/admin/cursors',
    category: 'COMPONENTS',
    color: 'orange',
    status: 'available'
  }
];

interface CreatePageMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePageMenu({ isOpen, onClose }: CreatePageMenuProps) {
  const { openCreator, CreatorModal } = useDynamicPageCreation();

  const handleOptionClick = (option: typeof CREATE_OPTIONS[0]) => {
    if (option.action === 'dynamic-creator') {
      openCreator();
    }
    onClose();
  };

  const getColorClasses = (color: string, isHover = false) => {
    const baseClasses = {
      blue: isHover ? 'border-blue-400 bg-blue-50' : 'border-blue-200',
      green: isHover ? 'border-green-400 bg-green-50' : 'border-green-200',
      purple: isHover ? 'border-purple-400 bg-purple-50' : 'border-purple-200',
      orange: isHover ? 'border-orange-400 bg-orange-50' : 'border-orange-200',
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.blue;
  };

  const getIconColor = (color: string) => {
    const colors = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      orange: 'text-orange-500',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Créer un nouvel élément</h2>
              <p className="text-sm text-gray-600 mt-1">Choisissez le type d'élément à créer</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>

          {/* Options Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CREATE_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                
                if (option.route) {
                  return (
                    <Link key={option.id} to={option.route}>
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:${getColorClasses(option.color, true)} ${getColorClasses(option.color)}`}
                        onClick={onClose}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-gray-50 ${getIconColor(option.color)}`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{option.title}</h3>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
                                  {option.category}
                                </span>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            <div className="flex items-center mt-2">
                              <Zap className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-600">Disponible</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                } else {
                  return (
                    <div
                      key={option.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:${getColorClasses(option.color, true)} ${getColorClasses(option.color)}`}
                      onClick={() => handleOptionClick(option)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg bg-gray-50 ${getIconColor(option.color)}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">{option.title}</h3>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600`}>
                                {option.category}
                              </span>
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          <div className="flex items-center mt-2">
                            <Zap className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-600">Disponible</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>4 options de création disponibles</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span>Fonctionnel</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  <span>En développement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CreatorModal />
    </>
  );
}
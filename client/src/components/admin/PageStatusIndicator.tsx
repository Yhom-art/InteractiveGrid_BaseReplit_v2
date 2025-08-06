import React from 'react';
import { Zap, Clock, AlertTriangle } from 'lucide-react';
import { usePageStatus } from '@/hooks/usePageStatus';
import { TAG_CONFIGS } from '@shared/tags-system';

interface PageStatusIndicatorProps {
  route: string;
  className?: string;
}

export const PageStatusIndicator: React.FC<PageStatusIndicatorProps> = ({ 
  route, 
  className = "" 
}) => {
  const { data: pageStatus, isLoading, error } = usePageStatus(route);

  if (isLoading) {
    return <Clock className={`w-3 h-3 text-gray-400 animate-pulse ${className}`} />;
  }

  if (error || !pageStatus) {
    return <AlertTriangle className={`w-3 h-3 text-red-400 ${className}`} />;
  }

  // Icône éclair selon le statut validé
  const getStatusIcon = () => {
    switch (pageStatus.status) {
      case '✓':
        return <Zap className={`w-3 h-3 text-green-500 ${className}`} />;
      case 'indexed':
        return <Zap className={`w-3 h-3 text-gray-300 ${className}`} />;
      case 'beta':
      case 'draft':
      case 'new':
        return <Zap className={`w-3 h-3 text-orange-400 ${className}`} />;
      default:
        return <Zap className={`w-3 h-3 text-gray-300 ${className}`} />;
    }
  };

  return (
    <div className="flex items-center gap-1" title={`Status: ${pageStatus.status} - Last checked: ${pageStatus.lastChecked || 'Never'}`}>
      {getStatusIcon()}
    </div>
  );
};

// Composant pour afficher les tags avec validation automatique
interface AutoTagsProps {
  route: string;
  version?: string;
}

// Fonction de rendu des tags avec le système unifié
const renderUnifiedTag = (tagType: string, content: string) => {
  const tagConfig = TAG_CONFIGS[tagType.toUpperCase()];
  const color = tagConfig?.color || '#6b7280';
  
  return (
    <span 
      key={content}
      style={{
        backgroundColor: color,
        color: 'white',
        fontSize: '8px',
        fontFamily: 'Roboto Mono, monospace',
        fontWeight: '500',
        padding: '2px 4px',
        borderRadius: '4px',
        display: 'inline-block',
        whiteSpace: 'nowrap'
      }}
      className="transition-all hover:scale-105"
    >
      {content}
    </span>
  );
};

export const AutoTags: React.FC<AutoTagsProps> = ({ route, version }) => {
  const { data: pageStatus } = usePageStatus(route);
  
  if (!pageStatus || pageStatus.status === 'indexed') {
    return <PageStatusIndicator route={route} />;
  }

  const tags = [];

  // Tags de statut avec système unifié
  if (pageStatus.status === 'beta') {
    tags.push(renderUnifiedTag('beta', 'BETA'));
  } else if (pageStatus.status === 'draft') {
    tags.push(renderUnifiedTag('draft', 'DRAFT'));
  } else if (pageStatus.status === 'new') {
    tags.push(renderUnifiedTag('premium', 'NEW'));
  }

  // Tag de version avec système unifié
  if (version) {
    tags.push(renderUnifiedTag(version.toLowerCase(), version.toUpperCase()));
  }

  return (
    <div className="flex items-center gap-1">
      <PageStatusIndicator route={route} />
      {tags.length > 0 && <div className="flex items-center gap-1">{tags}</div>}
    </div>
  );
};
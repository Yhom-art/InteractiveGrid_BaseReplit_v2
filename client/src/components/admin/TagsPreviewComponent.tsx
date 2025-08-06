import React from 'react';
import { GlobalStyle, TagConfiguration } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { TAG_CONFIGS, generateTagStyle } from '@shared/tags-system';

interface TagsPreviewComponentProps {
  selectedStyleId?: number;
}

export function TagsPreviewComponent({ selectedStyleId }: TagsPreviewComponentProps) {
  // Récupération des configurations de tags sauvegardées
  const tagConfigsQuery = useQuery({
    queryKey: ['/api/tag-configurations'],
    staleTime: 5000,
    refetchInterval: 10000
  });

  // Récupération simple des styles
  const { data: allStyles } = useQuery<GlobalStyle[]>({
    queryKey: ['/api/styles-global']
  });

  // Fusion des configurations par défaut avec les configurations sauvegardées
  const mergedTagConfigs = React.useMemo(() => {
    if (!tagConfigsQuery.data || !Array.isArray(tagConfigsQuery.data)) {
      return TAG_CONFIGS;
    }

    const savedConfigs = tagConfigsQuery.data as TagConfiguration[];
    const merged = { ...TAG_CONFIGS };

    // Appliquer les configurations sauvegardées
    savedConfigs.forEach(saved => {
      if (merged[saved.tagId]) {
        merged[saved.tagId] = {
          ...merged[saved.tagId],
          name: saved.name,
          color: saved.color,
          category: saved.category as any,
          usage: saved.usage,
          isActive: saved.isActive
        };
      }
    });

    return merged;
  }, [tagConfigsQuery.data]);

  // Style sélectionné ou par défaut
  const selectedStyle = selectedStyleId 
    ? allStyles?.find(s => s.id === selectedStyleId)
    : allStyles?.find(s => s.category === 'typography' && s.name.includes('Tag') && s.isActive);

  // Debug pour voir ce qui se passe
  console.log('TagsPreviewComponent - Selected style:', selectedStyle);
  console.log('TagsPreviewComponent - Selected style value:', selectedStyle?.value);

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">
            Prévisualisation Tags - Style: {selectedStyle?.name || 'Auto'}
          </h4>
          <span className="text-xs text-gray-500 font-mono">
            {selectedStyle?.cssVariable}: {selectedStyle?.value}
          </span>
        </div>
        
        {/* Prévisualisation avec système unifié */}
        <div className="flex flex-wrap gap-2">
          {Object.values(mergedTagConfigs).map((tagConfig) => (
            <span
              key={tagConfig.id}
              style={{
                ...generateTagStyle(tagConfig.id),
                backgroundColor: tagConfig.color
              }}
            >
              {tagConfig.name}
            </span>
          ))}
        </div>
        
        {/* Informations du système unifié */}
        <div className="mt-3 text-xs text-gray-600">
          Style unifié: 8px Roboto Mono, padding 2px 4px, radius 4px
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">Système Tags Unifié - Couleurs Authentiques</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><strong>Contenu:</strong></div>
          <div>
            {Object.values(TAG_CONFIGS)
              .filter(tag => tag.category === 'content')
              .map(tag => (
                <div key={tag.id}>
                  {tag.name}: <span className="font-mono">{tag.color}</span>
                </div>
              ))}
          </div>
          
          <div><strong>Statuts:</strong></div>
          <div>
            {Object.values(TAG_CONFIGS)
              .filter(tag => tag.category === 'status')
              .map(tag => (
                <div key={tag.id}>
                  {tag.name}: <span className="font-mono">{tag.color}</span>
                </div>
              ))}
          </div>
          
          <div><strong>Versions:</strong></div>
          <div>
            {Object.values(TAG_CONFIGS)
              .filter(tag => tag.category === 'version')
              .map(tag => (
                <div key={tag.id}>
                  {tag.name}: <span className="font-mono">{tag.color}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
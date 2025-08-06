// Configuration centralisée des sources de contenu et tags
// Ce fichier est la source unique de vérité pour toutes les pages d'administration

export interface ContentSource {
  id: string;
  name: string;
  category: 'NFT' | 'INFO' | 'MUSIC' | 'EDITORIAL';
  description: string;
  enabled: boolean;
  count?: number;
  familyTags: string[];
  rarityTags: string[];
}

export interface TagCategory {
  id: string;
  name: string;
  type: 'family' | 'rarity';
  applicableCategories: string[];
  tags: string[];
}

// Tags centralisés - source unique pour toutes les pages
export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'nft-status',
    name: 'Statuts NFT',
    type: 'family',
    applicableCategories: ['NFT'],
    tags: ['FREE', 'ADOPT', 'ADOPTED', 'RESERVED']
  },
  {
    id: 'nft-rarity',
    name: 'Rareté NFT',
    type: 'rarity',
    applicableCategories: ['NFT'],
    tags: ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
  },
  {
    id: 'info-types',
    name: 'Types INFO',
    type: 'family',
    applicableCategories: ['INFO'],
    tags: ['Descriptions', 'Tutorials', 'News', 'Help', 'FAQ']
  },
  {
    id: 'music-types',
    name: 'Types MUSIC',
    type: 'family',
    applicableCategories: ['MUSIC'],
    tags: ['Ambient', 'Interactive', 'Proximity', 'Background', 'Trigger']
  },
  {
    id: 'editorial-types',
    name: 'Types EDITORIAL',
    type: 'family',
    applicableCategories: ['EDITORIAL'],
    tags: ['Articles', 'Interviews', 'Reviews', 'News', 'Announcements']
  }
];

// Sources de contenu centralisées
export const CONTENT_SOURCES: ContentSource[] = [
  {
    id: 'nft-castings',
    name: 'Castings de Chimères',
    category: 'NFT',
    description: 'Collection principale actuelle',
    enabled: true,
    count: 150,
    familyTags: ['FREE', 'ADOPT', 'ADOPTED', 'RESERVED'],
    rarityTags: ['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']
  },
  {
    id: 'nft-thugshots',
    name: 'ThugShots',
    category: 'NFT',
    description: 'Collection à venir',
    enabled: false,
    count: 0,
    familyTags: ['FREE', 'ADOPT', 'ADOPTED'],
    rarityTags: ['Premium', 'Standard']
  },
  {
    id: 'nft-ozmoz',
    name: 'Ozmoz',
    category: 'NFT',
    description: 'Collection à venir',
    enabled: false,
    count: 0,
    familyTags: ['FREE', 'ADOPT'],
    rarityTags: ['Genesis', 'Evolution']
  },
  {
    id: 'nft-regeneration',
    name: 'Régénération',
    category: 'NFT',
    description: 'Collection à venir',
    enabled: false,
    count: 0,
    familyTags: ['FREE', 'ADOPT'],
    rarityTags: ['Alpha', 'Beta', 'Final']
  },
  {
    id: 'info-containers',
    name: 'Containers INFO',
    category: 'INFO',
    description: 'Informations et descriptions',
    enabled: true,
    count: 25,
    familyTags: ['Descriptions', 'Tutorials', 'News', 'Help'],
    rarityTags: []
  },
  {
    id: 'music-containers',
    name: 'Containers MUSIC',
    category: 'MUSIC',
    description: 'Modules audio spatialisés',
    enabled: true,
    count: 10,
    familyTags: ['Ambient', 'Interactive', 'Proximity', 'Background'],
    rarityTags: []
  },
  {
    id: 'editorial-content',
    name: 'Contenu Éditorial',
    category: 'EDITORIAL',
    description: 'Articles et contenu éditorial',
    enabled: true,
    count: 15,
    familyTags: ['Articles', 'Interviews', 'Reviews', 'News'],
    rarityTags: []
  }
];

// Fonctions utilitaires
export const getTagsForCategory = (category: string, type: 'family' | 'rarity'): string[] => {
  const tagCategory = TAG_CATEGORIES.find(tc => 
    tc.applicableCategories.includes(category) && tc.type === type
  );
  return tagCategory ? tagCategory.tags : [];
};

export const getSourcesByCategory = (category: string): ContentSource[] => {
  return CONTENT_SOURCES.filter(source => source.category === category);
};

export const addNewTag = (categoryId: string, newTag: string): void => {
  const category = TAG_CATEGORIES.find(tc => tc.id === categoryId);
  if (category && !category.tags.includes(newTag)) {
    category.tags.push(newTag);
  }
};

export const addNewSource = (source: Omit<ContentSource, 'id'>): ContentSource => {
  const newSource: ContentSource = {
    ...source,
    id: `${source.category.toLowerCase()}-${Date.now()}`
  };
  CONTENT_SOURCES.push(newSource);
  return newSource;
};
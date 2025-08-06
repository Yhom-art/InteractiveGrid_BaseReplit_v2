import { ContainerType } from '@/types/common';

// Interface pour les données de NFT
export interface NFTData {
  name: string;
  reference: string;
  description: string;
  imageUrl: string;
  price: string;
  collection: string;
}

// Images pour chaque type de container - DÉSACTIVÉES POUR UTILISER LES VRAIES IMAGES
const NFT_IMAGES = {
  // Ces valeurs sont temporairement mises à vide pour éviter le remplacement des images réelles
  [ContainerType.FREE]: '',
  [ContainerType.ADOPT]: '',
  [ContainerType.ADOPTED]: '',
  
  // Images éditoriales spécifiques conservées uniquement pour les types sans image
  [ContainerType.EDITORIAL]: '/src/assets/images/editorial/Rencontres1-1_128x128@4x-8.png',
  [ContainerType.INACTIVE]: '/src/assets/images/editorial/Yhom_128x128@4x-8.png'
};

// Base de données des chimères - Nos "fiches fantômes"
// Ces données seraient normalement récupérées depuis une API 
// connectée à la blockchain pour obtenir les métadonnées NFT
const CHIMERES_DATABASE = [
  {
    id: "63", // ID sous forme de string pour éviter les problèmes d'octal
    name: 'BENSÉ',
    reference: 'CHM-0063',
    description: 'Chimère libre aux formes organiques et structurées, elle évoque une connexion profonde avec les éléments terrestres.',
    imageUrl: '/src/assets/images/chimera3.jpg',
    price: 'FREE ~C',
    collection: 'Les Castings de Chimères',
    type: ContainerType.FREE,
    timestamp: '2025-01-23',
    creator: 'Studio Yhom',
    rarity: 'Uncommon',
    attributes: [
      { trait_type: 'Couleur', value: 'Bleu' },
      { trait_type: 'Forme', value: 'Organique' }
    ]
  },
  {
    id: "61", // ID sous forme de string pour éviter les problèmes d'octal
    name: 'DALLIA',
    reference: 'CHM-0061',
    description: 'Chimère disponible pour adoption, elle représente l\'équilibre parfait entre force et délicatesse. Une création unique à intégrer dans votre collection.',
    imageUrl: '/src/assets/images/chimera1.jpg',
    price: '0.25 ETH ~C',
    collection: 'Les Castings de Chimères',
    type: ContainerType.ADOPT,
    timestamp: '2025-02-15',
    creator: 'Studio Yhom',
    rarity: 'Rare',
    attributes: [
      { trait_type: 'Couleur', value: 'Ocre' },
      { trait_type: 'Forme', value: 'Géométrique' }
    ]
  },
  {
    id: "60", // ID sous forme de string pour éviter les problèmes d'octal
    name: 'FLORAMIN',
    reference: 'CHM-0060',
    description: 'Cette chimère a déjà trouvé son propriétaire. Elle incarne la transformation et l\'adaptation, créant un lien unique avec son possesseur.',
    imageUrl: '/src/assets/images/chimera2.jpg',
    price: 'OWNED',
    collection: 'Les Castings de Chimères',
    type: ContainerType.ADOPTED,
    timestamp: '2025-01-05',
    creator: 'Studio Yhom',
    rarity: 'Epic',
    attributes: [
      { trait_type: 'Couleur', value: 'Violet' },
      { trait_type: 'Forme', value: 'Abstraite' }
    ]
  },
  {
    id: "1", // ID sous forme de string pour éviter les problèmes d'octal
    name: 'Rencontres1',
    reference: 'YHOM-0001',
    description: 'Élément éditorial présentant les rencontres entre l\'humain et les chimères. Ces visuels ne sont pas des NFT mais des éléments de navigation créés par le Studio Yhom.',
    imageUrl: '/attached_assets/Yhom_Editorial/Rencontres1-1_128x128@4x-8.png',
    price: 'EDITORIAL',
    collection: 'Éditions Yhom',
    type: ContainerType.EDITORIAL,
    timestamp: '2024-12-01',
    creator: 'Studio Yhom',
    rarity: 'Unique',
    attributes: [
      { trait_type: 'Type', value: 'Éditorial' },
      { trait_type: 'Format', value: '128x128' }
    ]
  },
  {
    id: "0", // ID sous forme de string pour éviter les problèmes d'octal
    name: 'Yhom',
    reference: 'YHOM-0000',
    description: 'Le logo du Studio Yhom, créateur des chimères. Cet élément éditorial n\'est pas une NFT mais un élément de navigation dans la grille.',
    imageUrl: '/attached_assets/Yhom_Editorial/Yhom_128x128@4x-8.png',
    price: 'EDITORIAL',
    collection: 'Fondation Yhom',
    type: ContainerType.INACTIVE,
    timestamp: '2024-11-01',
    creator: 'Studio Yhom',
    rarity: 'Unique',
    attributes: [
      { trait_type: 'Type', value: 'Logo' },
      { trait_type: 'Format', value: '128x128' }
    ]
  }
];

// Fonction pour obtenir les données chimère par type
function getChimereByType(type: ContainerType) {
  return CHIMERES_DATABASE.find(chimere => chimere.type === type) || CHIMERES_DATABASE[0];
}

// Données fictives pour les NFTs associés à chaque type de container
const NFT_DATA: Record<ContainerType, NFTData> = {
  [ContainerType.FREE]: getChimereByType(ContainerType.FREE),
  [ContainerType.ADOPT]: getChimereByType(ContainerType.ADOPT),
  [ContainerType.ADOPTED]: getChimereByType(ContainerType.ADOPTED),
  [ContainerType.EDITORIAL]: getChimereByType(ContainerType.EDITORIAL),
  [ContainerType.INACTIVE]: getChimereByType(ContainerType.INACTIVE)
};

/**
 * Fonction pour obtenir les données NFT associées à un container
 * @param containerId ID du container
 * @param containerType Type du container
 * @returns Données NFT
 */
export function getNFTDataForContainer(containerId: number, containerType: ContainerType): NFTData {
  // 1. D'abord, essayer de trouver une chimère correspondant au type dans notre base de données
  const baseChimere = getChimereByType(containerType);
  
  // 2. Créer une NFT personnalisée avec l'ID du container si nécessaire
  return {
    ...baseChimere,
    // Cas spécial: si le container a un ID spécifique qui ne correspond pas à notre base de données,
    // on peut personnaliser certaines informations (exemple pour les tests)
    reference: containerId !== parseInt(baseChimere.id as string) 
      ? `CHM-${String(containerId).padStart(4, '0')}`
      : baseChimere.reference
  };
}

/**
 * Traite l'URL de l'image selon son format pour un affichage correct
 * @param imageUrl URL de l'image à traiter
 * @returns URL corrigée pour l'affichage
 */
export function processImageUrl(imageUrl: string): string {
  // Si l'URL est une URL complète (commence par http:// ou https://), la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si c'est un chemin relatif, le convertir en URL absolue
  // Dans le cas des assets locaux, enlever le premier '/' s'il existe
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
  
  // Pour les fichiers dans attached_assets, utiliser le chemin directement
  return `/${cleanPath}`;
}

/**
 * Fonction pour obtenir l'URL d'image d'un NFT
 * @param containerType Type du container
 * @param customImageUrl URL personnalisée pour utiliser l'image réelle du NFT
 * @returns URL de l'image
 */
export function getImageForContainerType(containerType: ContainerType, customImageUrl?: string): string {
  // Si on a une URL personnalisée valide, l'utiliser en priorité
  if (customImageUrl && customImageUrl.trim() !== '') {
    return processImageUrl(customImageUrl);
  }
  
  // Sinon utiliser les images par défaut (qui sont maintenant vides pour FREE/ADOPT/ADOPTED)
  return NFT_IMAGES[containerType];
}
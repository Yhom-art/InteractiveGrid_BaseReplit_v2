import { ContainerType } from '@/types/common';

// Création d'une carte de correspondance entre les IDs de conteneurs et leurs données
export const containerMapping: Record<number, {
  name: string;
  reference: string;
  description: string;
  imageUrl: string;
  containerType: ContainerType;
  collection: string;
  price: string;
}> = {
  // Conteneurs ADOPTED
  19: {
    name: 'DALLIA',
    reference: '0019',
    description: 'Cette Chimère a été adoptée et offre une expérience immersive unique.',
    imageUrl: '/src/assets/images/dallia.jpg',
    containerType: ContainerType.ADOPTED,
    collection: 'NFT 019-C',
    price: 'OWNED'
  },
  17: {
    name: 'LAURIENCE',
    reference: '0021',
    description: 'Chimère adoptée qui apporte une sensation d\'harmonie à son environnement.',
    imageUrl: '/src/assets/images/chimera2.jpg',
    containerType: ContainerType.ADOPTED,
    collection: 'NFT 021-L',
    price: 'OWNED'
  },
  
  // Conteneurs FREE
  1: {
    name: 'MAÏD',
    reference: '0012',
    description: 'Une chimère libre qui évolue constamment, créant des motifs variés à l\'infini.',
    imageUrl: '/src/assets/images/chimera3.jpg',
    containerType: ContainerType.FREE,
    collection: 'Série Libre',
    price: 'FREE'
  },
  5: {
    name: 'JOSCOIS',
    reference: '0033',
    description: 'Chimère libre capturée dans son habitat naturel, connue pour ses motifs uniques.',
    imageUrl: '/src/assets/images/joscois.jpg',
    containerType: ContainerType.FREE,
    collection: 'Série Libre',
    price: 'FREE'
  },
  
  // Conteneurs ADOPT
  2: {
    name: 'BENSÉ',
    reference: '0063',
    description: 'Où se trouve cette chimère ? Adoptez-la pour découvrir ses secrets.',
    imageUrl: '/src/assets/images/chimera1.jpg', // Image alternative pour BENSÉ
    containerType: ContainerType.ADOPT,
    collection: 'NFT 063-B',
    price: '0.25 ETH'
  },
  6: {
    name: 'BENSÉ',
    reference: '0063',
    description: 'Où se trouve cette chimère ? Adoptez-la pour découvrir ses secrets.',
    imageUrl: '/src/assets/images/chimera1.jpg', // Image alternative pour BENSÉ
    containerType: ContainerType.ADOPT,
    collection: 'NFT 063-B',
    price: '0.25 ETH'
  },
  10: {
    name: 'FLORAMIN',
    reference: '0045',
    description: 'Une chimère mystérieuse qui attend d\'être adoptée et révéler ses caractéristiques uniques.',
    imageUrl: '/src/assets/images/floramin.jpg',
    containerType: ContainerType.ADOPT,
    collection: 'NFT 045-F',
    price: '0.15 ETH'
  }
};

// Fonction pour obtenir les données d'un conteneur spécifique
export function getContainerData(id: number) {
  // Si le conteneur existe dans la carte, retourner ses données
  if (containerMapping[id]) {
    return containerMapping[id];
  }
  
  // Sinon, générer des données par défaut
  // Déterminer dynamiquement le type du conteneur en fonction de son ID
  let containerType = ContainerType.FREE; // Par défaut
  
  if (id % 3 === 0) {
    containerType = ContainerType.ADOPT;
  } else if (id % 7 === 0) {
    containerType = ContainerType.ADOPTED;
  }
  
  // Données par défaut basées sur le type
  return {
    name: `CHIMÈRE`,
    reference: `${id.toString().padStart(4, '0')}`,
    description: 'Description en attente de génération.',
    imageUrl: containerType === ContainerType.ADOPT 
      ? '/src/assets/images/chimera1.jpg'
      : containerType === ContainerType.ADOPTED
        ? '/src/assets/images/chimera2.jpg'
        : '/src/assets/images/chimera3.jpg',
    containerType,
    collection: 'Collection Générale',
    price: containerType === ContainerType.ADOPT 
      ? '0.10 ETH'
      : containerType === ContainerType.ADOPTED
        ? 'OWNED'
        : 'FREE'
  };
}
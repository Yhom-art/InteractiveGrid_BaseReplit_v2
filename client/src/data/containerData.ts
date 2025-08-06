import { ContainerType } from '@/types/common';
import { images } from '@/assets/images';

// Données fictives pour les différents types de conteneurs
// Sera utilisé pour maintenir une cohérence entre les containers et les panels
export const containerNFTData = {
  [ContainerType.FREE]: {
    name: 'Nebula',
    reference: 'CHM-102',
    description: 'Une chimère libre aux formes abstraites qui évoque la structure des nébuleuses stellaires.',
    collection: 'Les Castings de Chimères',
    price: 'FREE ~C',
    imageUrl: images.free,
    nftData: {
      tokenId: '8723',
      contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
      owner: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
      creationDate: '2024-02-12'
    },
    indicateurs: {
      rarity: 63,
      popularity: 78,
      activity: 91,
      energy: 87
    },
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco Digital Hub',
      description: 'Centre de création des chimères libres de dernière génération'
    },
    audioContent: [
      {
        id: 'nebula-1',
        title: 'Résonances cosmiques',
        artist: 'Stellar Echo',
        duration: 214,
        type: 'music'
      }
    ]
  },
  
  [ContainerType.ADOPT]: {
    name: 'Phoenix',
    reference: 'CHM-317',
    description: 'Une chimère disponible pour adoption, rayonnante d\'une énergie ardente et transformatrice.',
    collection: 'Les Castings de Chimères',
    price: '0.25 ETH ~C',
    imageUrl: images.adopt,
    nftData: {
      tokenId: '4218',
      contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
      owner: '0x731F9650b69FE063B05a7cA819A3cdb6Dd0686E1',
      creationDate: '2023-12-05'
    },
    indicateurs: {
      rarity: 85,
      popularity: 72,
      activity: 68,
      energy: 94
    },
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      name: 'Paris Numérique',
      description: 'Zone centrale de génération des chimères adoptables'
    },
    audioContent: [
      {
        id: 'phoenix-1',
        title: 'Aura flamboyante',
        artist: 'Ember Collective',
        duration: 187,
        type: 'music'
      }
    ]
  },
  
  [ContainerType.ADOPTED]: {
    name: 'Vortex',
    reference: 'CHM-042',
    description: 'Une chimère déjà adoptée qui génère autour d\'elle un champ d\'énergie spiralé unique.',
    collection: 'Les Castings de Chimères',
    price: 'OWNED',
    imageUrl: images.adopted,
    nftData: {
      tokenId: '7349',
      contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
      owner: '0x9e25CBE8ca6c0cA61D8AA3FD53A2bdFF71917251',
      creationDate: '2024-01-18'
    },
    indicateurs: {
      rarity: 76,
      popularity: 88,
      activity: 54,
      energy: 65
    },
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      name: 'New York Digital Museum',
      description: 'Espace de conservation des chimères adoptées de haute valeur'
    },
    audioContent: [
      {
        id: 'vortex-1',
        title: 'Spirale Dimensionnelle',
        artist: 'Quantum Drift',
        duration: 225,
        type: 'music'
      }
    ]
  },
  
  [ContainerType.EDITORIAL]: {
    name: 'Nexus',
    reference: 'CHM-001',
    description: 'Une chimère éditoriale qui connecte toutes les autres à travers l\'espace et le temps.',
    collection: 'Les Castings de Chimères',
    price: 'SPECIAL',
    imageUrl: images.editorial || images.free, // Fallback si pas d'image éditoriale spécifique
    nftData: {
      tokenId: '1001',
      contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
      owner: 'Yhom Foundation',
      creationDate: '2023-09-30'
    },
    indicateurs: {
      rarity: 100,
      popularity: 95,
      activity: 100,
      energy: 100
    },
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      name: 'London Digital Archives',
      description: 'Quartier général des contenus éditoriaux et administratifs'
    },
    audioContent: [
      {
        id: 'nexus-1',
        title: 'Transmission Primordiale',
        artist: 'Archive Collective',
        duration: 301,
        type: 'podcast'
      }
    ]
  }
};
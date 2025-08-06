import { ContainerType } from '@/types/common';
import { images } from '@/assets/images';

// Interface pour les NFT et leurs métadonnées
export interface NFTMetadata {
  id: number;           // ID unique de la NFT
  name: string;         // Nom de la NFT
  reference: string;    // Référence de la NFT (ex: CHM-042)
  description: string;  // Description de la NFT
  imageUrl: string;     // URL de l'image de la NFT
  containerType: ContainerType; // Type de container associé
  price: string;        // Prix ou statut (FREE, OWNED, 0.25 ETH ~C, etc.)
  collection: string;   // Collection à laquelle appartient la NFT
  tokenId: string;      // ID du token sur la blockchain
  owner: string;        // Adresse du propriétaire
  creationDate: string; // Date de création
  rarity: number;       // Rareté (0-100)
  popularity: number;   // Popularité (0-100)
  activity: number;     // Activité (0-100)
  energy: number;       // Énergie (0-100)
  location: {
    name: string;
    latitude: number;
    longitude: number;
    description: string;
  };
  audio?: {
    title: string;
    duration: number;
  }[];
}

// Base de données fictive de NFTs pour l'application
export const nftDatabase: NFTMetadata[] = [
  // NFT pour les containers de type FREE
  {
    id: 1,
    name: 'Nebula',
    reference: 'CHM-102',
    description: 'Une chimère libre aux formes abstraites qui évoque la structure des nébuleuses stellaires.',
    imageUrl: images.free,
    containerType: ContainerType.FREE,
    price: 'FREE ~C',
    collection: 'Les Castings de Chimères',
    tokenId: '8723',
    owner: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    creationDate: '2024-02-12',
    rarity: 63,
    popularity: 78,
    activity: 91,
    energy: 87,
    location: {
      name: 'San Francisco Digital Hub',
      latitude: 37.7749,
      longitude: -122.4194,
      description: 'Centre de création des chimères libres de dernière génération'
    },
    audio: [
      {
        title: 'Résonances cosmiques',
        duration: 225
      }
    ]
  },
  
  // NFT pour les containers de type ADOPT
  {
    id: 2,
    name: 'Phoenix',
    reference: 'CHM-317',
    description: 'Une chimère disponible pour adoption, rayonnante d\'une énergie ardente et transformatrice.',
    imageUrl: images.adopt,
    containerType: ContainerType.ADOPT,
    price: '0.25 ETH ~C',
    collection: 'Les Castings de Chimères',
    tokenId: '4218',
    owner: '0x731F9650b69FE063B05a7cA819A3cdb6Dd0686E1',
    creationDate: '2023-12-05',
    rarity: 85,
    popularity: 72,
    activity: 68,
    energy: 94,
    location: {
      name: 'Paris Numérique',
      latitude: 48.8566,
      longitude: 2.3522,
      description: 'Zone centrale de génération des chimères adoptables'
    },
    audio: [
      {
        title: 'Aura flamboyante',
        duration: 187
      }
    ]
  },
  
  // NFT pour les containers de type ADOPTED
  {
    id: 3,
    name: 'Vortex',
    reference: 'CHM-042',
    description: 'Une chimère déjà adoptée qui génère autour d\'elle un champ d\'énergie spiralé unique.',
    imageUrl: images.adopted,
    containerType: ContainerType.ADOPTED,
    price: 'OWNED',
    collection: 'Les Castings de Chimères',
    tokenId: '7349',
    owner: '0x9e25CBE8ca6c0cA61D8AA3FD53A2bdFF71917251',
    creationDate: '2024-01-18',
    rarity: 76,
    popularity: 88,
    activity: 54,
    energy: 65,
    location: {
      name: 'New York Digital Museum',
      latitude: 40.7128,
      longitude: -74.0060,
      description: 'Espace de conservation des chimères adoptées de haute valeur'
    },
    audio: [
      {
        title: 'Spirale Dimensionnelle',
        duration: 225
      }
    ]
  },
  
  // NFT pour les containers de type EDITORIAL
  {
    id: 4,
    name: 'Nexus',
    reference: 'CHM-001',
    description: 'Une chimère éditoriale qui connecte toutes les autres à travers l\'espace et le temps.',
    imageUrl: images.free, // Utiliser une image par défaut
    containerType: ContainerType.EDITORIAL,
    price: 'SPECIAL',
    collection: 'Les Castings de Chimères',
    tokenId: '1001',
    owner: 'Yhom Foundation',
    creationDate: '2023-09-30',
    rarity: 100,
    popularity: 95,
    activity: 100,
    energy: 100,
    location: {
      name: 'London Digital Archives',
      latitude: 51.5074,
      longitude: -0.1278,
      description: 'Quartier général des contenus éditoriaux et administratifs'
    },
    audio: [
      {
        title: 'Transmission Primordiale',
        duration: 301
      }
    ]
  }
];

// Fonction pour récupérer les métadonnées d'une NFT en fonction du type de container
export function getNFTMetadataByContainerType(type: ContainerType): NFTMetadata {
  const nft = nftDatabase.find(nft => nft.containerType === type);
  if (!nft) {
    // Fallback sur le premier NFT de la base de données
    return nftDatabase[0];
  }
  return nft;
}

// Fonction pour récupérer les métadonnées d'une NFT en fonction de son ID
export function getNFTMetadataById(id: number): NFTMetadata | undefined {
  return nftDatabase.find(nft => nft.id === id);
}

// Fonction pour récupérer les métadonnées d'une NFT en fonction de l'ID du container
// Cela simule une correspondance entre containers et NFTs
export function getNFTMetadataByContainerId(containerId: number): NFTMetadata {
  // Logique spécifique pour les containers de test
  if (containerId === 19) {
    // Le container 19 doit être un container ADOPTED (selon les logs)
    return nftDatabase.find(nft => nft.containerType === ContainerType.ADOPTED) || nftDatabase[0];
  } 
  else if (containerId === 17) {
    // Le container 17 serait un container FREE
    return nftDatabase.find(nft => nft.containerType === ContainerType.FREE) || nftDatabase[0];
  }
  else if (containerId % 3 === 0) {
    return nftDatabase.find(nft => nft.containerType === ContainerType.ADOPTED) || nftDatabase[0];
  }
  else if (containerId % 3 === 1) {
    return nftDatabase.find(nft => nft.containerType === ContainerType.FREE) || nftDatabase[0];
  }
  else {
    return nftDatabase.find(nft => nft.containerType === ContainerType.ADOPT) || nftDatabase[0];
  }
}
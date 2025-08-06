import { ChimereData, PanelTab } from '@/types/chimereTypes';
import { images } from '@/assets/images';

// Données d'exemple pour les Chimères
export const chimeresData: ChimereData[] = [
  {
    id: 1,
    name: 'Chimère Alpha',
    reference: 'CHM-001',
    description: 'Une chimère majestueuse, fusion parfaite entre technologie et nature organique. Ses particules luminescentes créent une aura saisissante qui captive tous ceux qui la regardent.',
    imageUrl: images.adopt,
    type: 'adopt',
    indicators: {
      rarity: 85,
      popularity: 72,
      activity: 68,
      energy: 90,
      harmony: 60,
      complexity: 88
    },
    nftData: {
      tokenId: '4218',
      contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
      owner: '0x731F9650b69FE063B05a7cA819A3cdb6Dd0686E1',
      creationDate: '2023-12-05',
      metadata: {
        name: 'Chimère Alpha #4218',
        description: 'Création originale du programme Grille Chimérique',
        attributes: [
          { trait_type: 'Rareté', value: 'Légendaire' },
          { trait_type: 'Type', value: 'Cristallin' },
          { trait_type: 'Génération', value: 1 }
        ]
      }
    },
    audioContent: [
      {
        id: 'audio-1',
        title: 'Résonance des particules',
        artist: 'Echo Digital',
        duration: 187,
        url: 'https://example.com/audio/resonance.mp3',
        type: 'music'
      },
      {
        id: 'audio-2',
        title: 'Histoire de la Chimère Alpha',
        artist: 'Dr. Synthia',
        duration: 361,
        url: 'https://example.com/audio/histoire.mp3',
        type: 'podcast'
      }
    ],
    location: {
      latitude: 48.8566,
      longitude: 2.3522,
      name: 'Paris Numérique',
      description: 'Centre de création de la première vague de Chimères'
    },
    administratedContent: {
      title: 'Révélation initiaque',
      body: 'La Chimère Alpha fut la première à émerger du programme Grille Chimérique. Sa signature énergétique unique a inspiré toutes les générations suivantes. Les chercheurs l\'étudient encore aujourd\'hui pour comprendre les mécanismes profonds de l\'émergence chimérique.',
      tags: ['Première génération', 'Cristallin', 'Haute énergie'],
      lastUpdate: '2025-04-29'
    }
  },
  {
    id: 2,
    name: 'Fleur Quantique',
    reference: 'CHM-042',
    description: 'Une chimère évolutive qui s\'adapte à son environnement. Ses motifs floraux se métamorphosent lentement au fil du temps, créant un spectacle hypnotique de couleurs et de formes.',
    imageUrl: images.adopted,
    type: 'adopted',
    indicators: {
      rarity: 76,
      popularity: 88,
      activity: 54,
      energy: 65,
      flux: 92,
      adaptation: 85
    },
    nftData: {
      tokenId: '7349',
      contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
      owner: '0x9e25CBE8ca6c0cA61D8AA3FD53A2bdFF71917251',
      creationDate: '2024-01-18',
      metadata: {
        name: 'Fleur Quantique #7349',
        description: 'Chimère adaptative de la collection Grille Chimérique',
        attributes: [
          { trait_type: 'Rareté', value: 'Épique' },
          { trait_type: 'Type', value: 'Floral' },
          { trait_type: 'Génération', value: 2 }
        ]
      }
    },
    audioContent: [
      {
        id: 'audio-3',
        title: 'Symphonie florale',
        artist: 'Blossom Bits',
        duration: 246,
        url: 'https://example.com/audio/symphonie.mp3',
        type: 'music'
      }
    ],
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      name: 'San Francisco Biodigital',
      description: 'Jardin expérimental où les chimères florales ont été conçues'
    },
    administratedContent: {
      title: 'Cycle d\'adaptation',
      body: 'La Fleur Quantique évolue selon des cycles de 28 jours, changeant subtilement de couleur et de motif. Les collectionneurs documentent ces cycles avec passion, créant un atlas des variations jamais observées auparavant.',
      tags: ['Évolutive', 'Cyclique', 'Ornementale'],
      lastUpdate: '2025-05-10'
    }
  },
  {
    id: 3,
    name: 'Nébulon',
    reference: 'CHM-107',
    description: 'Une chimère cosmique dont la structure rappelle une nébuleuse stellaire. Des particules gazeuses dansent autour de son noyau, créant des motifs similaires aux formations spatiales lointaines.',
    imageUrl: images.free,
    type: 'free',
    indicators: {
      rarity: 93,
      popularity: 61,
      activity: 42,
      energy: 87,
      stabilité: 35,
      expansion: 78
    },
    location: {
      latitude: 55.6761,
      longitude: 12.5683,
      name: 'Observatoire Nordic',
      description: 'Centre d\'observation des phénomènes chimériques cosmiques'
    },
    audioContent: [
      {
        id: 'audio-4',
        title: 'Échos du cosmos',
        artist: 'Stellar Wave',
        duration: 312,
        url: 'https://example.com/audio/cosmos.mp3',
        type: 'music'
      },
      {
        id: 'audio-5',
        title: 'Méditation nébulaire',
        artist: 'Cosmic Mind',
        duration: 498,
        url: 'https://example.com/audio/meditation.mp3',
        type: 'podcast'
      }
    ],
    administratedContent: {
      title: 'État sauvage',
      body: 'Nébulon reste l\'une des rares chimères encore à l\'état sauvage. Son comportement imprévisible et sa nature volatile la rendent difficile à étudier. Certains chercheurs passent des années à tenter de déchiffrer ses schémas d\'expansion.',
      tags: ['Cosmique', 'Volatile', 'Non adoptée'],
      lastUpdate: '2025-03-22'
    }
  }
];

// Configuration de démo pour les panels
export const demoConfig = {
  columnIndex: 5,
  chimereId: 1,
  position: {
    left: 640, // Position à calculer dynamiquement dans l'implémentation finale
    top: 0
  },
  activeTab: PanelTab.INFO
};
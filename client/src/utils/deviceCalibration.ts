/**
 * Système de calibration automatique pour l'échelle humaine
 * Base de données des appareils et calcul du facteur d'échelle
 */

interface DeviceSpecs {
  name: string;
  screenSizeInches: number; // Taille diagonale en pouces
  resolution: {
    width: number;
    height: number;
  };
  pixelDensity: number; // PPI (pixels per inch)
  category: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'tv';
}

// Base de données des appareils populaires
const DEVICE_DATABASE: DeviceSpecs[] = [
  // iPhones
  {
    name: 'iPhone 15 Pro Max',
    screenSizeInches: 6.7,
    resolution: { width: 1290, height: 2796 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone 15 Pro',
    screenSizeInches: 6.1,
    resolution: { width: 1179, height: 2556 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone 15',
    screenSizeInches: 6.1,
    resolution: { width: 1179, height: 2556 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone 14 Pro Max',
    screenSizeInches: 6.7,
    resolution: { width: 1290, height: 2796 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone 14 Pro',
    screenSizeInches: 6.1,
    resolution: { width: 1179, height: 2556 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone 13 Pro Max',
    screenSizeInches: 6.7,
    resolution: { width: 1284, height: 2778 },
    pixelDensity: 458,
    category: 'mobile'
  },
  {
    name: 'iPhone 13',
    screenSizeInches: 6.1,
    resolution: { width: 1170, height: 2532 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone 12 Pro Max',
    screenSizeInches: 6.7,
    resolution: { width: 1284, height: 2778 },
    pixelDensity: 458,
    category: 'mobile'
  },
  {
    name: 'iPhone 12',
    screenSizeInches: 6.1,
    resolution: { width: 1170, height: 2532 },
    pixelDensity: 460,
    category: 'mobile'
  },
  {
    name: 'iPhone SE 3rd gen',
    screenSizeInches: 4.7,
    resolution: { width: 750, height: 1334 },
    pixelDensity: 326,
    category: 'mobile'
  },

  // Samsung Galaxy
  {
    name: 'Samsung Galaxy S24 Ultra',
    screenSizeInches: 6.8,
    resolution: { width: 1440, height: 3120 },
    pixelDensity: 505,
    category: 'mobile'
  },
  {
    name: 'Samsung Galaxy S24+',
    screenSizeInches: 6.7,
    resolution: { width: 1440, height: 3120 },
    pixelDensity: 513,
    category: 'mobile'
  },
  {
    name: 'Samsung Galaxy S24',
    screenSizeInches: 6.2,
    resolution: { width: 1080, height: 2340 },
    pixelDensity: 416,
    category: 'mobile'
  },
  {
    name: 'Samsung Galaxy S23 Ultra',
    screenSizeInches: 6.8,
    resolution: { width: 1440, height: 3088 },
    pixelDensity: 500,
    category: 'mobile'
  },

  // Google Pixel
  {
    name: 'Google Pixel 8 Pro',
    screenSizeInches: 6.7,
    resolution: { width: 1344, height: 2992 },
    pixelDensity: 489,
    category: 'mobile'
  },
  {
    name: 'Google Pixel 8',
    screenSizeInches: 6.2,
    resolution: { width: 1080, height: 2400 },
    pixelDensity: 428,
    category: 'mobile'
  },

  // iPads
  {
    name: 'iPad Pro 12.9"',
    screenSizeInches: 12.9,
    resolution: { width: 2048, height: 2732 },
    pixelDensity: 264,
    category: 'tablet'
  },
  {
    name: 'iPad Pro 11"',
    screenSizeInches: 11,
    resolution: { width: 1668, height: 2388 },
    pixelDensity: 264,
    category: 'tablet'
  },
  {
    name: 'iPad Air',
    screenSizeInches: 10.9,
    resolution: { width: 1640, height: 2360 },
    pixelDensity: 264,
    category: 'tablet'
  },
  {
    name: 'iPad',
    screenSizeInches: 10.2,
    resolution: { width: 1620, height: 2160 },
    pixelDensity: 264,
    category: 'tablet'
  },

  // MacBooks
  {
    name: 'MacBook Pro 16"',
    screenSizeInches: 16,
    resolution: { width: 3456, height: 2234 },
    pixelDensity: 254,
    category: 'laptop'
  },
  {
    name: 'MacBook Pro 14"',
    screenSizeInches: 14.2,
    resolution: { width: 3024, height: 1964 },
    pixelDensity: 254,
    category: 'laptop'
  },
  {
    name: 'MacBook Air 15"',
    screenSizeInches: 15.3,
    resolution: { width: 2880, height: 1864 },
    pixelDensity: 224,
    category: 'laptop'
  },
  {
    name: 'MacBook Air 13"',
    screenSizeInches: 13.6,
    resolution: { width: 2560, height: 1664 },
    pixelDensity: 224,
    category: 'laptop'
  },
  
  // Configuration spéciale avec bypass système
  {
    name: 'MacBook Air 15" (Bypass 3840×2486)',
    screenSizeInches: 15.3,
    resolution: { width: 3840, height: 2486 },
    pixelDensity: 300, // PPI ajusté pour bypass
    category: 'laptop'
  },

  // Moniteurs Desktop populaires
  {
    name: 'Dell UltraSharp 24"',
    screenSizeInches: 24,
    resolution: { width: 1920, height: 1080 },
    pixelDensity: 92,
    category: 'desktop'
  },
  {
    name: 'Dell UltraSharp 27" QHD',
    screenSizeInches: 27,
    resolution: { width: 2560, height: 1440 },
    pixelDensity: 109,
    category: 'desktop'
  },
  {
    name: 'LG UltraFine 27" 4K',
    screenSizeInches: 27,
    resolution: { width: 3840, height: 2160 },
    pixelDensity: 163,
    category: 'desktop'
  },
  {
    name: 'Samsung Odyssey 32" 4K',
    screenSizeInches: 32,
    resolution: { width: 3840, height: 2160 },
    pixelDensity: 138,
    category: 'desktop'
  },
  {
    name: 'Studio Display 27"',
    screenSizeInches: 27,
    resolution: { width: 5120, height: 2880 },
    pixelDensity: 218,
    category: 'desktop'
  }
];

// Tailles de référence moyennes pour l'échelle humaine (en centimètres)
const HUMAN_SCALE_REFERENCES = {
  face: {
    width: 14,    // Largeur moyenne d'un visage humain
    height: 20    // Hauteur moyenne d'un visage humain
  },
  hand: {
    width: 8,     // Largeur moyenne d'une main
    height: 18    // Longueur moyenne d'une main
  },
  eye: {
    width: 2.5,   // Largeur moyenne d'un œil
    height: 1.2   // Hauteur moyenne d'un œil
  }
};

interface DeviceInfo {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  platform: string;
}

interface CalibrationResult {
  device: DeviceSpecs | null;
  scaleFactor: number;
  confidence: 'high' | 'medium' | 'low';
  physicalScreenSize: {
    widthCm: number;
    heightCm: number;
  };
  recommendedZoomLevel: number;
}

/**
 * Détecte l'appareil utilisé basé sur les informations du navigateur
 * Amélioration pour détecter les résolutions bypass système
 */
export function detectDevice(): DeviceInfo {
  // Détecter la vraie résolution d'affichage effective
  const effectiveWidth = Math.max(
    screen.width,
    window.screen.width,
    document.documentElement.clientWidth,
    window.innerWidth
  );
  
  const effectiveHeight = Math.max(
    screen.height,
    window.screen.height,
    document.documentElement.clientHeight,
    window.innerHeight
  );

  // Pour les configurations bypass, essayer de détecter via les media queries
  let detectedResolution = { width: effectiveWidth, height: effectiveHeight };
  
  // Test pour résolutions courantes avec bypass
  const commonBypassResolutions = [
    { width: 3840, height: 2486 }, // Votre configuration
    { width: 3840, height: 2160 }, // 4K UHD
    { width: 2560, height: 1600 }, // QHD+
    { width: 3024, height: 1964 }, // MacBook Pro 14"
    { width: 3456, height: 2234 }  // MacBook Pro 16"
  ];

  // Tester chaque résolution via media query
  for (const res of commonBypassResolutions) {
    if (window.matchMedia(`(max-width: ${res.width}px) and (max-height: ${res.height}px)`).matches &&
        window.matchMedia(`(min-width: ${res.width - 100}px) and (min-height: ${res.height - 100}px)`).matches) {
      detectedResolution = res;
      break;
    }
  }

  return {
    userAgent: navigator.userAgent,
    screenWidth: detectedResolution.width,
    screenHeight: detectedResolution.height,
    devicePixelRatio: window.devicePixelRatio || 1,
    platform: navigator.platform
  };
}

/**
 * Identifie l'appareil dans la base de données
 */
export function identifyDevice(deviceInfo: DeviceInfo): DeviceSpecs | null {
  const { userAgent, screenWidth, screenHeight, devicePixelRatio } = deviceInfo;
  
  // Résolution effective (prenant en compte le pixel ratio)
  const effectiveWidth = screenWidth * devicePixelRatio;
  const effectiveHeight = screenHeight * devicePixelRatio;
  
  // Recherche par User Agent d'abord (plus précis)
  for (const device of DEVICE_DATABASE) {
    // Vérification iPhone
    if (userAgent.includes('iPhone')) {
      if (userAgent.includes('iPhone15,5') || userAgent.includes('iPhone15,4')) { // iPhone 15 Pro Max/Plus
        if (device.name.includes('iPhone 15 Pro Max')) return device;
      }
      if (userAgent.includes('iPhone15,3') || userAgent.includes('iPhone15,2')) { // iPhone 15 Pro/15
        if (device.name.includes('iPhone 15 Pro') && !device.name.includes('Max')) return device;
        if (device.name.includes('iPhone 15') && !device.name.includes('Pro')) return device;
      }
      // Continuer pour les autres modèles...
    }
    
    // Vérification iPad
    if (userAgent.includes('iPad')) {
      if (userAgent.includes('iPad13') && device.name.includes('iPad Pro 12.9')) return device;
      if (userAgent.includes('iPad13') && device.name.includes('iPad Pro 11')) return device;
    }
    
    // Vérification Android
    if (userAgent.includes('Android')) {
      if (userAgent.includes('SM-S928') && device.name.includes('Galaxy S24 Ultra')) return device;
      if (userAgent.includes('SM-S926') && device.name.includes('Galaxy S24+')) return device;
      if (userAgent.includes('Pixel 8 Pro') && device.name.includes('Pixel 8 Pro')) return device;
    }
    
    // Vérification Mac
    if (userAgent.includes('Macintosh')) {
      // Approximation basée sur la résolution pour les Mac
      const tolerance = 50;
      if (Math.abs(effectiveWidth - device.resolution.width) < tolerance && 
          Math.abs(effectiveHeight - device.resolution.height) < tolerance) {
        return device;
      }
    }
  }
  
  // Si pas de correspondance exacte, recherche par résolution
  return findDeviceByResolution(effectiveWidth, effectiveHeight);
}

/**
 * Trouve un appareil par résolution avec tolérance
 */
function findDeviceByResolution(width: number, height: number): DeviceSpecs | null {
  const tolerance = 100; // Tolérance en pixels
  
  for (const device of DEVICE_DATABASE) {
    const widthMatch = Math.abs(device.resolution.width - width) < tolerance ||
                       Math.abs(device.resolution.width - height) < tolerance;
    const heightMatch = Math.abs(device.resolution.height - height) < tolerance ||
                        Math.abs(device.resolution.height - width) < tolerance;
    
    if (widthMatch && heightMatch) {
      return device;
    }
  }
  
  return null;
}

/**
 * Estime les caractéristiques d'un appareil inconnu
 */
function estimateUnknownDevice(deviceInfo: DeviceInfo): DeviceSpecs {
  const { screenWidth, screenHeight, devicePixelRatio, userAgent } = deviceInfo;
  
  // Catégorisation basée sur la taille d'écran
  const diagonal = Math.sqrt(screenWidth * screenWidth + screenHeight * screenHeight);
  let category: DeviceSpecs['category'];
  let estimatedPPI: number;
  let estimatedSize: number;
  
  if (userAgent.includes('Mobile') || screenWidth < 768) {
    category = 'mobile';
    estimatedPPI = 400; // PPI moyen pour mobile
    estimatedSize = diagonal / (estimatedPPI / devicePixelRatio); // Estimation grossière
  } else if (screenWidth < 1200) {
    category = 'tablet';
    estimatedPPI = 264; // PPI moyen pour tablette
    estimatedSize = diagonal / (estimatedPPI / devicePixelRatio);
  } else if (userAgent.includes('Mac') || screenWidth < 2000) {
    category = 'laptop';
    estimatedPPI = 220; // PPI moyen pour laptop
    estimatedSize = diagonal / (estimatedPPI / devicePixelRatio);
  } else {
    category = 'desktop';
    estimatedPPI = 110; // PPI moyen pour desktop
    estimatedSize = diagonal / (estimatedPPI / devicePixelRatio);
  }
  
  return {
    name: `Appareil ${category} estimé`,
    screenSizeInches: Math.max(4, Math.min(32, estimatedSize)), // Limites raisonnables
    resolution: {
      width: screenWidth * devicePixelRatio,
      height: screenHeight * devicePixelRatio
    },
    pixelDensity: estimatedPPI,
    category
  };
}

/**
 * Calcule le facteur d'échelle pour l'échelle humaine
 */
export function calculateHumanScaleFactor(referenceType: keyof typeof HUMAN_SCALE_REFERENCES = 'face'): CalibrationResult {
  const deviceInfo = detectDevice();
  let device = identifyDevice(deviceInfo);
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (!device) {
    device = estimateUnknownDevice(deviceInfo);
    confidence = 'low';
  }
  
  // Calcul des dimensions physiques de l'écran
  const screenWidthCm = (device.screenSizeInches * 2.54) * Math.cos(Math.atan(device.resolution.height / device.resolution.width));
  const screenHeightCm = (device.screenSizeInches * 2.54) * Math.sin(Math.atan(device.resolution.height / device.resolution.width));
  
  // Plus précis : utiliser le PPI pour calculer les dimensions physiques
  const actualScreenWidthCm = (device.resolution.width / device.pixelDensity) * 2.54;
  const actualScreenHeightCm = (device.resolution.height / device.pixelDensity) * 2.54;
  
  // Référence humaine choisie
  const reference = HUMAN_SCALE_REFERENCES[referenceType];
  
  // Calcul du facteur d'échelle pour qu'un visage de 14cm de large 
  // occupe réellement 14cm sur l'écran physique
  const pixelsPerCm = device.resolution.width / actualScreenWidthCm;
  const targetPixelsForReference = reference.width * pixelsPerCm;
  
  // Le facteur d'échelle dépend de la taille de l'image de base
  // Supposons qu'une image "normale" fait 300px de large et représente un visage
  const baseImageWidthPx = 300;
  const scaleFactor = targetPixelsForReference / baseImageWidthPx;
  
  // Ajustement du niveau de zoom recommandé (en pourcentage)
  const recommendedZoomLevel = Math.round(scaleFactor * 100);
  
  return {
    device,
    scaleFactor,
    confidence,
    physicalScreenSize: {
      widthCm: actualScreenWidthCm,
      heightCm: actualScreenHeightCm
    },
    recommendedZoomLevel: Math.max(100, Math.min(1000, recommendedZoomLevel)) // Limites raisonnables
  };
}

/**
 * Fonction utilitaire pour déboguer les informations de calibration
 */
export function getCalibrationDebugInfo(): any {
  const deviceInfo = detectDevice();
  const device = identifyDevice(deviceInfo);
  const calibration = calculateHumanScaleFactor();
  
  return {
    deviceInfo,
    detectedDevice: device,
    calibration,
    rawScreen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      pixelDepth: screen.pixelDepth,
      colorDepth: screen.colorDepth
    },
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      devicePixelRatio: window.devicePixelRatio
    }
  };
}
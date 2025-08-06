import { useEffect, useRef, useState } from 'react';

export default function AudioVisualizerPOC() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [asciiArt, setAsciiArt] = useState<string>('');
  const [testGrid, setTestGrid] = useState<string>('');
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>('/attached_assets/Yhom_Doublures/idlespoppoppopofficialvideoyoutube_1748287098911.mp3');
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);
  const [asciiLayer1, setAsciiLayer1] = useState<string>('');
  const [asciiLayer2, setAsciiLayer2] = useState<string>('');
  
  // Système de lissage pour adoucir les transitions
  const [smoothedIntensity, setSmoothedIntensity] = useState<number>(0);
  const [intensityHistory, setIntensityHistory] = useState<number[]>([]);
  
  // Mots paramétrables pour la couche voix
  const [voiceWords, setVoiceWords] = useState(['VOICE', 'SOUND', 'ECHO', 'FREQ', 'WAVE']);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // Nom de la NFT pour l'ASCII principal
  const nftName = 'JOSCOIS';
  const nftNameChars = nftName.split(''); // ['J', 'O', 'S', 'C', 'O', 'I', 'S']

  // Générer une grille de test 40x25 pour taille 7px
  const generateTestGrid = () => {
    let grid = '';
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 40; col++) {
        const char = String.fromCharCode(65 + ((row + col) % 26)); // A-Z cyclique
        grid += char;
      }
      grid += '\n';
    }
    
    return grid;
  };



  // Fonction pour appliquer des mouvements naturels au portrait
  const applyNaturalMovement = (ctx: CanvasRenderingContext2D, width: number, height: number, audioIntensity: number, timestamp: number) => {
    const time = timestamp * 0.001; // Convertir en secondes
    
    // Amplifier les mouvements pour qu'ils soient plus visibles
    // Mouvement de tête subtil (translation horizontale)
    const headSway = Math.sin(time * 1.5 + audioIntensity * 5) * (3 + audioIntensity * 8); // Jusqu'à ±11px
    
    // Léger zoom avant/arrière basé sur l'audio
    const breathingZoom = 1 + Math.sin(time * 2) * 0.03 + audioIntensity * 0.08; // Jusqu'à ±11%
    
    // Rotation subtile de la tête
    const headTilt = Math.sin(time * 1.8 + audioIntensity * 4) * (1 + audioIntensity * 4); // Jusqu'à ±5°
    
    // Compression horizontale pour simuler la parole
    const horizontalCompress = 1 - audioIntensity * 0.08; // Compression jusqu'à 8%
    
    // Mouvement vertical subtil
    const verticalBob = Math.sin(time * 1.3 + audioIntensity * 3) * (1 + audioIntensity * 3); // Jusqu'à ±4px
    
    // Sauvegarder l'état actuel
    ctx.save();
    
    // Appliquer les transformations depuis le centre
    ctx.translate(width / 2, height / 2);
    ctx.rotate((headTilt * Math.PI) / 180);
    ctx.scale(horizontalCompress * breathingZoom, breathingZoom);
    ctx.translate(headSway, verticalBob);
    ctx.translate(-width / 2, -height / 2);
    
    // Retourner une fonction pour restaurer l'état
    return () => {
      ctx.restore();
    };
  };

  // Pixelisation suivant la grille ASCII avec postérisation pochoir
  const pixelizeImage = (ctx: CanvasRenderingContext2D, width: number, height: number, audioIntensity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Grille ASCII 40x25
    const cols = 40;
    const rows = 25;
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    // Traitement par cellule pour pixelisation
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const startX = Math.floor(col * cellWidth);
        const endX = Math.floor((col + 1) * cellWidth);
        const startY = Math.floor(row * cellHeight);
        const endY = Math.floor((row + 1) * cellHeight);
        
        // Calculer la luminosité moyenne de la cellule
        let totalLuminosity = 0;
        let pixelCount = 0;
        
        for (let y = startY; y < endY && y < height; y++) {
          for (let x = startX; x < endX && x < width; x++) {
            const idx = (y * width + x) * 4;
            const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            totalLuminosity += gray;
            pixelCount++;
          }
        }
        
        const avgLuminosity = pixelCount > 0 ? totalLuminosity / pixelCount : 0;
        
        // Postérisation style pochoir - seulement 3 niveaux très tranchés
        let finalColor;
        const audioVariation = audioIntensity * 20; // Variation audio plus marquée
        const adjustedLuminosity = avgLuminosity + audioVariation;
        
        if (adjustedLuminosity < 80) {        // NOIR PUR (zones d'ombre)
          finalColor = 0;
        } else if (adjustedLuminosity < 160) { // GRIS MOYEN (tons moyens)
          finalColor = 128;
        } else {                               // BLANC PUR (zones de lumière)
          finalColor = 255;
        }
        
        // Appliquer la couleur à toute la cellule
        for (let y = startY; y < endY && y < height; y++) {
          for (let x = startX; x < endX && x < width; x++) {
            const idx = (y * width + x) * 4;
            data[idx] = finalColor;     // Rouge
            data[idx + 1] = finalColor; // Vert  
            data[idx + 2] = finalColor; // Bleu
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Fonction convertImageToASCII avec intégration du nom de chimère
  const convertImageToASCII = (imageData: ImageData, width: number, height: number, audioIntensity: number = 0, timestamp: number = 0, layer: 'main' | 'voice' = 'main') => {
    const cols = 40;
    const rows = 25;
    const stepX = width / cols;
    const stepY = height / rows;
    
    // Intégrer les caractères du nom de la chimère de manière très subtile
    const nameCharsForASCII = nftNameChars.map(char => char.toUpperCase());
    
    const chars = {
      black: ['█', '▉', '▊', '▋', '▌', '▍', '▎', '▏', '█', '▉', '▊', '▋', ...nameCharsForASCII], // Diluer le nom dans les caractères pleins
      darkGray: ['▓', '▒', '░', '▓', '▒', '▓', '▒', '░', ...nameCharsForASCII],
      mediumGray: ['▒', '░', '▓', '▒', '░', '▒', '░', '▓', ...nameCharsForASCII],
      lightGray: ['░', '▒', '░', '·', '˙', '░', '▒', '░', ...nameCharsForASCII],
      white: [' ', '·', '˙', '¨', '°'] // Pas de nom dans le blanc pour préserver la lisibilité
    };
    
    // Fonction pour générer du bruit blanc subtil sur fond blanc
    const generateWhiteNoise = (position: number, audioIntensity: number) => {
      // Réduire le bruit pendant les pauses sonores
      const noiseIntensity = Math.max(0.02, audioIntensity * 0.1); // Minimum 2%, max 10% avec audio
      const shouldAddNoise = Math.random() < noiseIntensity;
      
      if (shouldAddNoise) {
        const noiseChars = ['·', '˙', '¨', '°', '‧', '∘'];
        return noiseChars[Math.floor(Math.random() * noiseChars.length)];
      }
      return ' ';
    };
    
    let ascii = '';
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const pixelX = Math.floor(col * stepX);
        const pixelY = Math.floor(row * stepY);
        
        const pixelIndex = (pixelY * width + pixelX) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];
        
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        
        // Pour la couche voix avec fade
        if (layer === 'voice') {
          // Système de fade avec caractères horizontaux pour transitions douces
          if (audioIntensity < 0.1) {
            ascii += ' ';
            continue;
          } else if (audioIntensity < 0.2) {
            // Fade très léger avec tirets fins
            const fadeChars = ['˙', '·', '¨', '°', '‧'];
            const fadeIndex = (row * col + Math.floor(timestamp / 200)) % fadeChars.length;
            const shouldFade = Math.random() < 0.3;
            ascii += shouldFade ? fadeChars[fadeIndex] : ' ';
            continue;
          } else if (audioIntensity < 0.3) {
            // Fade moyen avec tirets horizontaux
            const fadeChars = ['-', '–', '—', '_', '‾', '˜', '~'];
            const fadeIndex = (row * col + Math.floor(timestamp / 150)) % fadeChars.length;
            const shouldFade = Math.random() < (audioIntensity * 2);
            ascii += shouldFade ? fadeChars[fadeIndex] : ' ';
            continue;
          }
          
          const centerX = cols / 2;
          const centerY = rows / 2;
          
          // Zone ovale concentrée sur le bas du visage
          const ovalWidth = cols * 0.25;
          const ovalHeight = rows * 0.20;
          const ovalCenterY = centerY + rows * 0.05;
          
          // Test d'appartenance à l'ovale avec zones de transition
          const dx = (col - centerX) / ovalWidth;
          const dy = (row - ovalCenterY) / ovalHeight;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const isInCore = distance <= 0.7;
          const isInFade = distance > 0.7 && distance <= 1.2;
          
          if (distance > 1.2) {
            ascii += ' ';
            continue;
          }
          
          // Zone de fade avec tirets horizontaux progressifs
          if (isInFade) {
            const fadeIntensity = (1.2 - distance) / 0.5;
            const fadeChars = ['-', '–', '—', '_', '‾', '˜', '~', '⁓'];
            const fadeIndex = (row * col + Math.floor(timestamp / 100)) % fadeChars.length;
            const shouldFade = Math.random() < (fadeIntensity * audioIntensity * 1.5);
            ascii += shouldFade ? fadeChars[fadeIndex] : ' ';
            continue;
          }
          
          // Système de mots paramétrables avec grossissement
          const currentWord = voiceWords[currentWordIndex];
          const wordLength = currentWord.length;
          const startCol = Math.floor(centerX - wordLength / 2);
          
          // Zone centrale pour afficher le mot avec effet de grossissement
          const isWordZone = Math.abs(row - ovalCenterY) <= 1 && 
                            col >= startCol && 
                            col < startCol + wordLength;
          
          if (isWordZone && audioIntensity > 0.4) {
            const charPosition = col - startCol;
            if (charPosition >= 0 && charPosition < wordLength) {
              // Utiliser des caractères légers pour les mots au lieu de caractères pleins
              const lightChars = ['-', '–', '—', '_', '‾', '˜', '~', '⁓'];
              const lightCharIndex = (charPosition + Math.floor(timestamp / 100)) % lightChars.length;
              const selectedLightChar = lightChars[lightCharIndex];
              
              // Répéter le caractère léger selon l'intensité
              const scale = 1 + audioIntensity * 1.5;
              ascii += selectedLightChar.repeat(Math.floor(scale));
              continue;
            }
          }
        }
        
        // Sélection du caractère avec intégration du nom et bruit blanc
        const position = row * cols + col;
        let selectedChar;
        
        if (brightness < 0.20) {
          // Zones sombres : utiliser caractères noirs avec nom de chimère
          const charArray = chars.black;
          // Stabilité accrue pendant les pauses (moins de changements)
          const stabilityFactor = Math.max(0.2, audioIntensity); // Min 20% de variation
          const variation = Math.sin(timestamp * 0.002 * stabilityFactor + audioIntensity * 6 + position) * stabilityFactor;
          const charIndex = Math.floor(Math.abs(variation) * charArray.length) % charArray.length;
          selectedChar = charArray[charIndex];
        } else if (brightness < 0.40) {
          const charArray = chars.darkGray;
          const stabilityFactor = Math.max(0.25, audioIntensity);
          const variation = Math.sin(timestamp * 0.002 * stabilityFactor + audioIntensity * 6 + position) * stabilityFactor;
          const charIndex = Math.floor(Math.abs(variation) * charArray.length) % charArray.length;
          selectedChar = charArray[charIndex];
        } else if (brightness < 0.60) {
          const charArray = chars.mediumGray;
          const stabilityFactor = Math.max(0.3, audioIntensity);
          const variation = Math.sin(timestamp * 0.002 * stabilityFactor + audioIntensity * 6 + position) * stabilityFactor;
          const charIndex = Math.floor(Math.abs(variation) * charArray.length) % charArray.length;
          selectedChar = charArray[charIndex];
        } else if (brightness < 0.80) {
          const charArray = chars.lightGray;
          const stabilityFactor = Math.max(0.35, audioIntensity);
          const variation = Math.sin(timestamp * 0.002 * stabilityFactor + audioIntensity * 6 + position) * stabilityFactor;
          const charIndex = Math.floor(Math.abs(variation) * charArray.length) % charArray.length;
          selectedChar = charArray[charIndex];
        } else {
          // Zones blanches : utiliser bruit blanc subtil
          selectedChar = generateWhiteNoise(position, audioIntensity);
        }
        
        ascii += selectedChar;
      }
      ascii += '\n';
    }
    
    return ascii;
  };

  // Initialisation de l'image de base
  useEffect(() => {
    const canvas = hiddenCanvasRef.current;
    const visibleCanvas = canvasRef.current;
    
    console.log('🔧 Initialisation - Canvas hidden:', canvas);
    console.log('🔧 Initialisation - Canvas visible:', visibleCanvas);
    
    if (!canvas || !visibleCanvas) {
      console.error('❌ Canvas non trouvés');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const visibleCtx = visibleCanvas.getContext('2d');
    if (!ctx || !visibleCtx) {
      console.error('❌ Contextes canvas non obtenus');
      return;
    }
    
    console.log('✅ Contextes canvas obtenus');
    
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image chargée:', img.width, 'x', img.height);
      
      // Canvas caché pour traitement ASCII avec zoom 130% et mouvements naturels
      ctx.clearRect(0, 0, 304, 304);
      const restoreHiddenTransform = applyNaturalMovement(ctx, 304, 304, 0, Date.now());
      const zoomFactor = 1.30;
      const scaledWidth = 304 * zoomFactor;
      const scaledHeight = 304 * zoomFactor;
      const offsetX = (scaledWidth - 304) / 2;
      const offsetY = (scaledHeight - 304) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height, -offsetX, -offsetY, scaledWidth, scaledHeight);
      restoreHiddenTransform();
      
      // Canvas visible avec pixelisation et même transformations
      visibleCtx.clearRect(0, 0, 304, 304);
      const restoreVisibleTransform = applyNaturalMovement(visibleCtx, 304, 304, 0, Date.now());
      visibleCtx.drawImage(img, 0, 0, img.width, img.height, -offsetX, -offsetY, scaledWidth, scaledHeight);
      restoreVisibleTransform();
      
      // Appliquer la pixelisation pochoir au canvas visible
      pixelizeImage(visibleCtx, 304, 304, 0);
      
      // Récupérer les données pour l'ASCII depuis le canvas caché
      const imageData = ctx.getImageData(0, 0, 304, 304);
      const ascii = convertImageToASCII(imageData, 304, 304);
      setAsciiArt(ascii);
      
      // Générer les couches initiales
      const layer1 = convertImageToASCII(imageData, 304, 304, 0, Date.now(), 'main');
      const layer2 = convertImageToASCII(imageData, 304, 304, 0, Date.now(), 'voice');
      
      setAsciiLayer1(layer1);
      setAsciiLayer2(layer2);
      
      // Sauvegarder les données de base pour l'animation
      setBaseImageData(imageData);
      
      console.log('✅ Image traitée et ASCII généré');
    };
    
    img.onerror = () => {
      console.error('❌ Erreur de chargement image');
    };
    
    // Générer la grille de test
    setTestGrid(generateTestGrid());
    
    // Utiliser JOSCOIS
    img.src = '/attached_assets/Yhom_Chimeres/JOSCOIS_0058_1024.jpg';
    console.log('🔧 Chargement de l\'image:', img.src);
  }, []);

  // Initialiser l'analyse audio
  const initAudioContext = async () => {
    if (!audioRef.current || audioInitialized) return;
    
    try {
      // Nettoyer l'ancien contexte si il existe
      if (audioContext) {
        await audioContext.close();
      }
      
      const ctx = new AudioContext();
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.3;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyserNode);
      analyserNode.connect(ctx.destination);
      
      setAudioContext(ctx);
      setAnalyser(analyserNode);
      setAudioSource(source);
      setAudioData(new Uint8Array(analyserNode.frequencyBinCount));
      setAudioInitialized(true);
      
      console.log('✅ Audio contexte initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation audio:', error);
    }
  };

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    
    if (!audioContext) {
      await initAudioContext();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Animation en temps réel avec l'audio
  useEffect(() => {
    if (!isPlaying || !analyser || !baseImageData) return;
    
    const updateVisualization = () => {
      if (!analyser || !baseImageData) return;
      
      // Analyser les fréquences audio
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      // Calculer l'intensité pour les fréquences vocales
      const sampleRate = 44100;
      const nyquist = sampleRate / 2;
      const binWidth = nyquist / analyser.frequencyBinCount;
      
      const voiceStartBin = Math.floor(85 / binWidth);
      const voiceEndBin = Math.floor(3400 / binWidth);
      
      // Intensité des fréquences vocales
      let voiceSum = 0;
      for (let i = voiceStartBin; i < voiceEndBin && i < dataArray.length; i++) {
        voiceSum += dataArray[i];
      }
      const voiceIntensity = voiceSum / ((voiceEndBin - voiceStartBin) * 255);
      
      // Beat de base : oscillation continue même sans audio
      const timestamp = Date.now();
      const baseBeat = (Math.sin(timestamp / 200) + 1) / 2 * 0.15;
      
      // Intensité combinée avec lissage
      const rawCombinedIntensity = Math.min(1, baseBeat + voiceIntensity * 0.85);
      
      // Système de lissage pour adoucir les transitions
      setIntensityHistory(prev => {
        const newHistory = [...prev, rawCombinedIntensity];
        if (newHistory.length > 8) {
          newHistory.shift();
        }
        return newHistory;
      });
      
      // Calculer l'intensité lissée
      const weights = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4];
      let weightedSum = 0;
      let totalWeight = 0;
      
      intensityHistory.forEach((intensity, index) => {
        const weight = weights[index] || 0.1;
        weightedSum += intensity * weight;
        totalWeight += weight;
      });
      
      const smoothedIntensityValue = totalWeight > 0 ? weightedSum / totalWeight : rawCombinedIntensity;
      setSmoothedIntensity(smoothedIntensityValue);
      
      const combinedIntensity = smoothedIntensityValue;
      
      // Rotation des mots
      const wordChangeThreshold = 0.4;
      if (combinedIntensity > wordChangeThreshold) {
        const shouldChangeWord = Math.random() < 0.02;
        if (shouldChangeWord) {
          setCurrentWordIndex((prev) => (prev + 1) % voiceWords.length);
        }
      }
      
      // Appliquer les mouvements au canvas caché pour l'ASCII en temps réel
      if (hiddenCanvasRef.current) {
        const hiddenCanvas = hiddenCanvasRef.current;
        const hiddenCtx = hiddenCanvas.getContext('2d');
        if (hiddenCtx) {
          // Redessiner l'image avec les transformations de mouvement
          hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
          
          const img = new Image();
          img.onload = () => {
            // Appliquer les mouvements naturels
            const restoreTransform = applyNaturalMovement(hiddenCtx, hiddenCanvas.width, hiddenCanvas.height, combinedIntensity, timestamp);
            
            // Dessiner avec zoom 130% centré
            const zoomFactor = 1.30;
            const scaledWidth = hiddenCanvas.width * zoomFactor;
            const scaledHeight = hiddenCanvas.height * zoomFactor;
            const offsetX = (scaledWidth - hiddenCanvas.width) / 2;
            const offsetY = (scaledHeight - hiddenCanvas.height) / 2;
            
            hiddenCtx.drawImage(
              img, 
              0, 0, img.width, img.height, // Source complète
              -offsetX, -offsetY, scaledWidth, scaledHeight // Destination agrandie et centrée
            );
            restoreTransform();
            
            // Obtenir les données d'image transformées
            const transformedImageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            
            // Mettre à jour les deux couches ASCII avec les données transformées
            const layer1 = convertImageToASCII(transformedImageData, hiddenCanvas.width, hiddenCanvas.height, combinedIntensity, timestamp, 'main');
            const layer2 = convertImageToASCII(transformedImageData, hiddenCanvas.width, hiddenCanvas.height, voiceIntensity, timestamp, 'voice');
            
            setAsciiArt(layer1);
            setAsciiLayer1(layer1);
            setAsciiLayer2(layer2);
          };
          img.src = '/attached_assets/Yhom_Chimeres/JOSCOIS_0058_1024.jpg';
        }
      }
      
      // Mettre à jour le canvas visible avec pixelisation et mouvements
      if (canvasRef.current) {
        const visibleCanvas = canvasRef.current;
        const visibleCtx = visibleCanvas.getContext('2d');
        if (visibleCtx) {
          visibleCtx.clearRect(0, 0, visibleCanvas.width, visibleCanvas.height);
          
          // Dessiner l'image de base d'abord
          const img = new Image();
          img.onload = () => {
            // Dessiner l'image avec zoom 130% sur un canvas temporaire
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = visibleCanvas.width;
            tempCanvas.height = visibleCanvas.height;
            const tempCtx = tempCanvas.getContext('2d')!;
            
            const zoomFactor = 1.30;
            const scaledWidth = visibleCanvas.width * zoomFactor;
            const scaledHeight = visibleCanvas.height * zoomFactor;
            const offsetX = (scaledWidth - visibleCanvas.width) / 2;
            const offsetY = (scaledHeight - visibleCanvas.height) / 2;
            
            tempCtx.drawImage(img, 0, 0, img.width, img.height, -offsetX, -offsetY, scaledWidth, scaledHeight);
            
            // Appliquer la pixelisation sur le canvas temporaire
            pixelizeImage(tempCtx, visibleCanvas.width, visibleCanvas.height, combinedIntensity);
            
            // Maintenant appliquer les mouvements sur le résultat pixelisé
            const restoreTransform = applyNaturalMovement(visibleCtx, visibleCanvas.width, visibleCanvas.height, combinedIntensity, timestamp);
            visibleCtx.drawImage(tempCanvas, 0, 0);
            restoreTransform();
          };
          img.src = '/attached_assets/Yhom_Chimeres/JOSCOIS_0058_1024.jpg';
        }
      }
      
      // Continuer l'animation
      requestAnimationFrame(updateVisualization);
    };
    
    const animationId = requestAnimationFrame(updateVisualization);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, analyser, baseImageData, intensityHistory, voiceWords, currentWordIndex]);

  // Forcer les curseurs système sur cette page
  useEffect(() => {
    const resetCursor = () => {
      // Supprimer tous les styles de curseur personnalisés
      document.body.style.cursor = 'auto !important';
      document.documentElement.style.cursor = 'auto !important';
      
      // Créer et injecter du CSS pour forcer les curseurs système
      const style = document.createElement('style');
      style.id = 'audio-visualizer-cursor-override';
      style.textContent = `
        .audio-visualizer-page, .audio-visualizer-page * {
          cursor: auto !important;
        }
        .audio-visualizer-page button,
        .audio-visualizer-page select,
        .audio-visualizer-page input[type="text"] {
          cursor: pointer !important;
        }
        .audio-visualizer-page canvas {
          cursor: crosshair !important;
        }
      `;
      document.head.appendChild(style);
    };
    
    resetCursor();
    
    return () => {
      // Nettoyer au démontage
      const style = document.getElementById('audio-visualizer-cursor-override');
      if (style) {
        style.remove();
      }
    };
  }, []);

  return (
    <div className="audio-visualizer-page min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Audio Visualizer POC - Pixelisation Pochoir</h1>
        
        {/* Contrôles */}
        <div className="mb-6 space-y-4">
          <div>
            <h3 className="text-sm font-mono mb-2">Mots paramétrables (Couche 2):</h3>
            <div className="flex gap-2 flex-wrap">
              {voiceWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentWordIndex(index)}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    index === currentWordIndex 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
            <input 
              type="text"
              placeholder="Ajouter un mot (5 char max)"
              maxLength={5}
              className="mt-2 px-2 py-1 border text-xs font-mono w-32"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const newWord = e.currentTarget.value.trim().toUpperCase();
                  setVoiceWords(prev => [...prev, newWord]);
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>

          <div className="flex gap-4 items-center">
            <select 
              value={currentAudioSrc}
              onChange={(e) => {
                setCurrentAudioSrc(e.target.value);
                setIsPlaying(false);
                setAudioInitialized(false);
                if (audioContext) {
                  audioContext.close();
                }
                setAudioContext(null);
                setAnalyser(null);
                setAudioSource(null);
              }}
              className="px-3 py-2 border border-gray-300 font-mono text-sm"
            >
              <option value="/attached_assets/Yhom_Doublures/idlespoppoppopofficialvideoyoutube_1748287098911.mp3">
                Musique - Idle Pop
              </option>
              <option value="/attached_assets/Yhom Audio/2L3-job-interview.mp3">
                Podcast - Job Interview
              </option>
            </select>
            
            <button 
              onClick={toggleAudio}
              className="px-4 py-2 bg-black text-white font-mono hover:bg-gray-800"
              style={{ cursor: 'pointer' }}
            >
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
          </div>
          
          <audio 
            ref={audioRef}
            src={currentAudioSrc}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
        
        {/* Ligne 1 : Comparaison de base */}
        <div className="flex gap-4 mb-4">
          {/* Grille de test 40x40 */}
          <div className="bg-blue-50 border border-blue-300" style={{ width: '304px', height: '304px' }}>
            <div className="w-full h-full overflow-hidden p-2">
              <h4 className="text-xs mb-1">Test Grid 40x25</h4>
              <pre className="font-mono" style={{ 
                fontSize: '9px', 
                lineHeight: '11px', 
                letterSpacing: '1px'
              }}>
                {testGrid}
              </pre>
            </div>
          </div>
          
          {/* ASCII principal */}
          <div className="bg-white border border-gray-300" style={{ width: '304px', height: '304px' }}>
            <div className="w-full h-full overflow-hidden p-2">
              <h4 className="text-xs mb-1">ASCII Principal</h4>
              <pre className="font-mono" style={{ fontSize: '9px', lineHeight: '11px', letterSpacing: '1px' }}>
                {asciiArt}
              </pre>
            </div>
          </div>
          
          {/* Canvas pixelisé */}
          <div className="bg-white border border-gray-300" style={{ width: '304px', height: '304px' }}>
            <h4 className="text-xs mb-1">Canvas Pixelisé (Pochoir)</h4>
            <canvas ref={canvasRef} width="304" height="304" className="w-full h-full" />
            <canvas ref={hiddenCanvasRef} width="304" height="304" className="hidden" />
          </div>
          
          {/* Image originale */}
          <div className="bg-white border border-gray-300" style={{ width: '304px', height: '304px' }}>
            <img 
              src="/attached_assets/Yhom_Chimeres/JOSCOIS_0058_1024.jpg" 
              alt="JOSCOIS Original"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Ligne 2 : Système de couches */}
        <div className="flex gap-4">
          {/* Superposition décalée */}
          <div className="bg-white border border-gray-300 relative" style={{ width: '304px', height: '304px' }}>
            <div className="w-full h-full overflow-hidden p-2">
              <h4 className="text-xs mb-1">Couches superposées</h4>
              <div className="relative">
                <pre className="text-black absolute" style={{ 
                  fontSize: '9px', 
                  lineHeight: '11px',
                  letterSpacing: '1px',
                  top: '0px',
                  left: '0px',
                  fontFamily: '"Source Code Pro", monospace',
                  fontWeight: 400
                }}>
                  {asciiLayer1}
                </pre>
                <pre className="font-mono absolute" style={{ 
                  fontSize: '9px', 
                  lineHeight: '11px',
                  letterSpacing: '1px',
                  top: '1px',
                  left: '1px',
                  color: '#FF26BD',
                  fontFamily: '"Source Code Pro", monospace',
                  fontWeight: 700
                }}>
                  {asciiLayer2}
                </pre>

              </div>
            </div>
          </div>
          
          {/* Couche voix seule */}
          <div className="bg-white border border-gray-300" style={{ width: '304px', height: '304px' }}>
            <div className="w-full h-full overflow-hidden p-2">
              <h4 className="text-xs mb-1">Couche 2 (Voix)</h4>
              <pre className="font-mono" style={{ 
                fontSize: '9px', 
                lineHeight: '11px',
                letterSpacing: '1px',
                color: '#FF26BD',
                fontFamily: '"Source Code Pro", monospace',
                fontWeight: 700
              }}>
                {asciiLayer2}
              </pre>
            </div>
          </div>
          
          {/* Couche principale seule */}
          <div className="bg-white border border-gray-300" style={{ width: '304px', height: '304px' }}>
            <div className="w-full h-full overflow-hidden p-2">
              <h4 className="text-xs mb-1">Couche 1 (Principal)</h4>
              <pre style={{ 
                fontSize: '9px', 
                lineHeight: '11px',
                letterSpacing: '1px',
                fontFamily: '"Source Code Pro", monospace',
                fontWeight: 400
              }}>
                {asciiLayer1}
              </pre>
            </div>
          </div>
          

        </div>
        
        {/* Informations de debug */}
        <div className="mt-4 text-sm font-mono text-gray-600">
          <p>Status: {isPlaying ? 'Playing' : 'Stopped'}</p>
          <p>ASCII Lines: {asciiArt.split('\n').length}</p>
          <p>ASCII Characters per line: {asciiArt.split('\n')[0]?.length || 0} (should be 40)</p>
          <p>Canvas dimensions: 304x304</p>
          <p>Smoothed Intensity: {smoothedIntensity.toFixed(3)}</p>
        </div>
      </div>
    </div>
  );
}
import { useRef, useState, useEffect } from 'react';

export default function AudioVisualizerSimple() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseImageData, setBaseImageData] = useState<ImageData | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [asciiLayer1, setAsciiLayer1] = useState<string>('');
  const [asciiLayer2, setAsciiLayer2] = useState<string>('');
  const [currentAudioSrc, setCurrentAudioSrc] = useState<string>('/attached_assets/Yhom_Doublures/idlespoppoppopofficialvideoyoutube_1748287098911.mp3');
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);
  const [smoothedIntensity, setSmoothedIntensity] = useState<number>(0);
  const [intensityHistory, setIntensityHistory] = useState<number[]>([]);
  const [voiceWords] = useState(['VOICE', 'SOUND', 'ECHO', 'FREQ', 'WAVE']);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const nftName = 'JOSCOIS';
  const nftNameChars = nftName.split('');

  // Pixelisation avec postérisation pochoir
  const pixelizeImage = (ctx: CanvasRenderingContext2D, width: number, height: number, audioIntensity: number) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const cols = 40;
    const rows = 25;
    const stepX = width / cols;
    const stepY = height / rows;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const startX = Math.floor(col * stepX);
        const startY = Math.floor(row * stepY);
        const endX = Math.floor((col + 1) * stepX);
        const endY = Math.floor((row + 1) * stepY);
        
        let totalR = 0, totalG = 0, totalB = 0, pixelCount = 0;
        
        for (let y = startY; y < endY && y < height; y++) {
          for (let x = startX; x < endX && x < width; x++) {
            const idx = (y * width + x) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            pixelCount++;
          }
        }
        
        if (pixelCount > 0) {
          const avgR = totalR / pixelCount;
          const avgG = totalG / pixelCount;
          const avgB = totalB / pixelCount;
          
          const brightness = (avgR * 0.299 + avgG * 0.587 + avgB * 0.114);
          
          let finalColor;
          if (brightness < 64) {
            finalColor = 0;
          } else if (brightness < 128) {
            finalColor = 85;
          } else if (brightness < 192) {
            finalColor = 170;
          } else {
            finalColor = 255;
          }
          
          for (let y = startY; y < endY && y < height; y++) {
            for (let x = startX; x < endX && x < width; x++) {
              const idx = (y * width + x) * 4;
              data[idx] = finalColor;
              data[idx + 1] = finalColor;
              data[idx + 2] = finalColor;
            }
          }
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Initialisation de l'image de base
  useEffect(() => {
    if (!hiddenCanvasRef.current || !canvasRef.current) return;

    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const visibleCanvas = canvasRef.current;
    const visibleCtx = visibleCanvas.getContext('2d');
    
    if (!ctx || !visibleCtx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 304, 304);
      const restoreHiddenTransform = applyNaturalMovement(ctx, 304, 304, 0, Date.now());
      const zoomFactor = 1.30;
      const scaledWidth = 304 * zoomFactor;
      const scaledHeight = 304 * zoomFactor;
      const offsetX = (scaledWidth - 304) / 2;
      const offsetY = (scaledHeight - 304) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height, -offsetX, -offsetY, scaledWidth, scaledHeight);
      restoreHiddenTransform();
      
      visibleCtx.clearRect(0, 0, 304, 304);
      const restoreVisibleTransform = applyNaturalMovement(visibleCtx, 304, 304, 0, Date.now());
      visibleCtx.drawImage(img, 0, 0, img.width, img.height, -offsetX, -offsetY, scaledWidth, scaledHeight);
      restoreVisibleTransform();
      
      pixelizeImage(visibleCtx, 304, 304, 0);
      
      const imageData = ctx.getImageData(0, 0, 304, 304);
      setBaseImageData(imageData);
    };
    img.src = '/attached_assets/Yhom_Chimeres/JOSCOIS_0058_1024.jpg';
  }, []);

  // Forcer les curseurs système
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'audio-visualizer-cursor-override';
    style.textContent = `
      .audio-visualizer-simple, .audio-visualizer-simple * {
        cursor: auto !important;
      }
      .audio-visualizer-simple button,
      .audio-visualizer-simple select {
        cursor: pointer !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const style = document.getElementById('audio-visualizer-cursor-override');
      if (style) style.remove();
    };
  }, []);

  // Mouvements naturels optimisés
  const applyNaturalMovement = (ctx: CanvasRenderingContext2D, width: number, height: number, audioIntensity: number, timestamp: number) => {
    const time = timestamp * 0.001;
    const headSway = Math.sin(time * 1.5 + audioIntensity * 5) * (3 + audioIntensity * 8);
    const breathingZoom = 1 + Math.sin(time * 2) * 0.03 + audioIntensity * 0.08;
    const headTilt = Math.sin(time * 1.8 + audioIntensity * 4) * (1 + audioIntensity * 4);
    const horizontalCompress = 1 - audioIntensity * 0.08;
    const verticalBob = Math.sin(time * 1.3 + audioIntensity * 3) * (1 + audioIntensity * 3);
    
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((headTilt * Math.PI) / 180);
    ctx.scale(horizontalCompress * breathingZoom, breathingZoom);
    ctx.translate(headSway, verticalBob);
    ctx.translate(-width / 2, -height / 2);
    
    return () => ctx.restore();
  };

  // Fonction convertImageToASCII avec intégration du nom de chimère (COPIE EXACTE)
  const convertImageToASCII = (imageData: ImageData, width: number, height: number, audioIntensity: number = 0, timestamp: number = 0, layer: 'main' | 'voice' = 'main') => {
    const cols = 40;
    const rows = 25;
    const stepX = width / cols;
    const stepY = height / rows;
    
    // Intégrer les caractères du nom de la chimère de manière très subtile
    const nameCharsForASCII = nftNameChars.map(char => char.toUpperCase());
    
    const chars = {
      black: ['█', '▉', '▊', '▋', '▌', '▍', '▎', '▏', '█', '▉', '▊', '▋', ...nameCharsForASCII],
      darkGray: ['▓', '▒', '░', '▓', '▒', '▓', '▒', '░', ...nameCharsForASCII],
      mediumGray: ['▒', '░', '▓', '▒', '░', '▒', '░', '▓', ...nameCharsForASCII],
      lightGray: ['░', '▒', '░', '·', '˙', '░', '▒', '░', ...nameCharsForASCII],
      white: [' ', '·', '˙', '¨', '°']
    };
    
    // Fonction pour générer du bruit blanc subtil sur fond blanc
    const generateWhiteNoise = (position: number, audioIntensity: number) => {
      const noiseIntensity = Math.max(0.02, audioIntensity * 0.1);
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

  const toggleAudio = async () => {
    if (!audioRef.current) return;

    if (!audioInitialized) {
      try {
        const context = new AudioContext();
        const source = context.createMediaElementSource(audioRef.current);
        const analyserNode = context.createAnalyser();
        
        source.connect(analyserNode);
        analyserNode.connect(context.destination);
        analyserNode.fftSize = 2048;
        
        setAudioContext(context);
        setAnalyser(analyserNode);
        setAudioSource(source);
        setAudioInitialized(true);
        
        audioRef.current.play();
      } catch (error) {
        console.error('Erreur audio:', error);
      }
    } else {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Animation principale
  useEffect(() => {
    if (!isPlaying || !analyser) return;

    let animationId: number;
    
    const updateVisualization = (timestamp: number) => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      
      const averageIntensity = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length / 255;
      const voiceIntensity = dataArray.slice(80, 300).reduce((sum, value) => sum + value, 0) / 220 / 255;
      
      setIntensityHistory(prev => [...prev.slice(-9), averageIntensity]);
      const smoothed = intensityHistory.reduce((sum, val) => sum + val, 0) / intensityHistory.length;
      setSmoothedIntensity(smoothed);
      
      const combinedIntensity = Math.max(averageIntensity, smoothed);
      
      if (voiceIntensity > 0.25 && Math.random() < 0.1) {
        setCurrentWordIndex((prev) => (prev + 1) % voiceWords.length);
      }
      
      // Appliquer les mouvements au canvas caché pour l'ASCII en temps réel
      if (hiddenCanvasRef.current) {
        const hiddenCanvas = hiddenCanvasRef.current;
        const hiddenCtx = hiddenCanvas.getContext('2d');
        if (hiddenCtx) {
          hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
          
          const img = new Image();
          img.onload = () => {
            const restoreTransform = applyNaturalMovement(hiddenCtx, hiddenCanvas.width, hiddenCanvas.height, combinedIntensity, timestamp);
            
            const zoomFactor = 1.30;
            const scaledWidth = hiddenCanvas.width * zoomFactor;
            const scaledHeight = hiddenCanvas.height * zoomFactor;
            const offsetX = (scaledWidth - hiddenCanvas.width) / 2;
            const offsetY = (scaledHeight - hiddenCanvas.height) / 2;
            
            hiddenCtx.drawImage(img, 0, 0, img.width, img.height, -offsetX, -offsetY, scaledWidth, scaledHeight);
            restoreTransform();
            
            const transformedImageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
            
            const layer1 = convertImageToASCII(transformedImageData, hiddenCanvas.width, hiddenCanvas.height, combinedIntensity, timestamp, 'main');
            const layer2 = convertImageToASCII(transformedImageData, hiddenCanvas.width, hiddenCanvas.height, voiceIntensity, timestamp, 'voice');
            
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
          
          const img = new Image();
          img.onload = () => {
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
            pixelizeImage(tempCtx, visibleCanvas.width, visibleCanvas.height, combinedIntensity);
            
            const restoreTransform = applyNaturalMovement(visibleCtx, visibleCanvas.width, visibleCanvas.height, combinedIntensity, timestamp);
            visibleCtx.drawImage(tempCanvas, 0, 0);
            restoreTransform();
          };
          img.src = '/attached_assets/Yhom_Chimeres/JOSCOIS_0058_1024.jpg';
        }
      }
      
      animationId = requestAnimationFrame(updateVisualization);
    };
    
    animationId = requestAnimationFrame(updateVisualization);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, analyser, intensityHistory, voiceWords, currentWordIndex]);

  return (
    <div className="audio-visualizer-simple min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Portrait Audio-Réactif - Version Optimisée</h1>
        
        {/* Contrôles simplifiés */}
        <div className="mb-6 flex gap-4 items-center">
          <select 
            value={currentAudioSrc}
            onChange={(e) => {
              setCurrentAudioSrc(e.target.value);
              setIsPlaying(false);
              setAudioInitialized(false);
              if (audioContext) audioContext.close();
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

        {/* Canvas cachés pour le traitement */}
        <canvas ref={hiddenCanvasRef} width="304" height="304" className="hidden" />
        <canvas ref={canvasRef} width="304" height="304" className="hidden" />

        {/* Visualisation principale */}
        <div className="flex gap-6">
          <div className="bg-white border border-gray-300 relative" style={{ width: '304px', height: '304px' }}>
            <div className="w-full h-full overflow-hidden p-2">
              <h4 className="text-black text-xs mb-1">Couches Superposées</h4>
              <div className="relative">
                <pre className="text-black absolute" style={{ 
                  fontSize: '11px', 
                  lineHeight: '11px',
                  letterSpacing: '1px',
                  top: '20px',
                  left: '8px',
                  fontFamily: '"Source Code Pro", monospace',
                  fontWeight: 400
                }}>
                  {asciiLayer1}
                </pre>
                <pre className="font-mono absolute" style={{ 
                  fontSize: '11px', 
                  lineHeight: '11px',
                  letterSpacing: '1px',
                  top: '21px',
                  left: '9px',
                  color: '#FF26BD',
                  fontFamily: '"Source Code Pro", monospace',
                  fontWeight: 600
                }}>
                  {asciiLayer2}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 p-4" style={{ width: '400px', height: '304px' }}>
            <h4 className="text-lg font-semibold mb-3">Configuration</h4>
            
            <div className="space-y-2 text-xs h-64">
              <div className="bg-white p-1 rounded border">
                <span className="font-medium text-gray-800 text-xs">Pipeline Traitement</span>
                <div className="mt-1 text-xs text-gray-600">
                  1024x1024 → Zoom 130% → Mouvements → Grille 40x25 → ASCII
                </div>
              </div>
              
              <div className="bg-white p-1 rounded border">
                <span className="font-medium text-gray-800 text-xs">Couche Principale</span>
                <div className="mt-1 text-xs text-gray-600">
                  █▉▊▋▌▍▎▏ + {nftName} • Stabilité 20-35% • Bruit blanc
                </div>
              </div>
              
              <div className="bg-pink-50 p-1 rounded border">
                <span className="font-medium text-pink-800 text-xs">Couche Voix</span>
                <div className="mt-1 text-xs text-pink-600">
                  - – — _ ‾ ˜ ~ ⁓ • Zone ovale • Fade progressif
                </div>
              </div>
              
              <div className="bg-blue-50 p-1 rounded border">
                <span className="font-medium text-blue-800 text-xs">Audio</span>
                <div className="mt-1 text-xs text-blue-600">
                  FFT 2048 • 80-300Hz • Lissage 10f • Seuil {'>'} 0.25
                </div>
              </div>
              
              <div className="bg-green-50 p-1 rounded border">
                <span className="font-medium text-green-800 text-xs">Intensité: {(smoothedIntensity * 100).toFixed(1)}%</span>
                <div className="w-full bg-green-200 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-600 h-1 rounded-full transition-all duration-100" 
                    style={{ width: `${smoothedIntensity * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
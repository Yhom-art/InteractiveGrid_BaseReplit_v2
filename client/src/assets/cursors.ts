// Import des fichiers SVG pour les curseurs
import grabCursorSvg from '../assets/cursors/cursor-grab.svg';
import closeCursorSvg from '../assets/cursors/cursor-close.svg';
import adoptCursorSvg from '../assets/cursors/cursor-adopt.svg';
import meetCursorSvg from '../assets/cursors/cursor-meet.svg';
import knokCursorSvg from '../assets/cursors/cursor-knok.svg';

// Import des curseurs pill-like pour les états OPEN
import adoptPillCursorSvg from '../assets/cursors/cursor-pill-adopt.svg';
import meetPillCursorSvg from '../assets/cursors/cursor-pill-meet.svg';
import knokPillCursorSvg from '../assets/cursors/cursor-pill-knok.svg';

// Import du GIF animé KNOK
import knokKnokGif from '../assets/cursors/KNOK-KNOK.gif';

// Import des nouveaux curseurs personnalisés
import infoCursorSvg from '../assets/cursors/cursor-info.svg';
import panelCursorSvg from '../assets/cursors/cursor-panel.svg';
import panel2CursorSvg from '@assets/Yhom_PictosMarket/cursor-panel2.svg';
import scaleCursorSvg from '@assets/Yhom_PictosMarket/cursor-scale.svg';

// Création d'URLs pour les SVGs et GIFs
export const cursors = {
  // Curseur GRAB pour les containers fermés
  grab: `url('${grabCursorSvg}')`,
  
  // Curseur CLOSE pour la zone X
  close: `url('${closeCursorSvg}')`,
  
  // Curseurs pour les containers FERMÉS
  adopt: `url('${adoptCursorSvg}')`,
  meet: `url('${meetCursorSvg}')`,
  knok: `url('${knokCursorSvg}')`,
  
  // Curseurs pill-like pour les containers OUVERTS
  adoptPill: `url('${adoptPillCursorSvg}')`,
  meetPill: `url('${meetPillCursorSvg}')`,
  // On utilise maintenant le GIF animé pour KNOK-KNOK
  knokPill: `url('${knokKnokGif}')`,
  
  // Nouveaux curseurs personnalisés
  info: `url('${infoCursorSvg}')`,
  panel: `url('${panelCursorSvg}')`,
  panel2: `url('${panel2CursorSvg}')`,
  scaleTimer: `url('${scaleCursorSvg}')`
};

// Afficher les URLs des curseurs pour le débogage
console.log("Cursor URLs:", {
  grab: grabCursorSvg,
  close: closeCursorSvg,
  adopt: adoptCursorSvg,
  meet: meetCursorSvg,
  knok: knokCursorSvg,
  adoptPill: adoptPillCursorSvg,
  meetPill: meetPillCursorSvg,
  knokPill: knokKnokGif,
  info: infoCursorSvg,
  panel: panelCursorSvg,
  panel2: panel2CursorSvg,
  scaleTimer: scaleCursorSvg
});
// Export des images pour l'application
import chimera1 from './chimera1.jpg';
import chimera2 from './chimera2.jpg';
import chimera3 from './chimera3.jpg';
import dallia from './dallia.jpg';
import floramin from './floramin.jpg';
import joscois from './joscois.jpg';
import bense from './BENSÉ_0063_1024.jpg'; // Import de l'image BENSÉ

// Import des images éditoriales
import rencontres from './editorial/Rencontres1-1_128x128@4x-8.png';
import yhom from './editorial/Yhom_128x128@4x-8.png';

// Groups d'images par type de container
const adoptImages = [chimera1, floramin];
const adoptedImages = [chimera2, dallia];
const freeImages = [chimera3, joscois];
const editorialImages = [rencontres, yhom];

// Fonction pour obtenir une image aléatoire d'un groupe
const getRandomImage = (imageArray: string[]) => {
  const randomIndex = Math.floor(Math.random() * imageArray.length);
  return imageArray[randomIndex];
};

// Object d'images pour faciliter l'accès
export const images = {
  // Pour les différents types de containers - version simple
  adopt: chimera1,
  adopted: chimera2,
  free: chimera3,
  
  // Images éditoriales
  editorial: rencontres,
  editorialAlt: yhom,
  
  // Versions alternatives pour chaque type
  adoptAlt: floramin,
  adoptedAlt: dallia,
  freeAlt: joscois,
  
  // Image spécifique BENSÉ
  bense: bense,
  
  // Pour obtenir des images aléatoires par type
  getRandomAdopt: () => getRandomImage(adoptImages),
  getRandomAdopted: () => getRandomImage(adoptedImages),
  getRandomFree: () => getRandomImage(freeImages),
  getRandomEditorial: () => getRandomImage(editorialImages),
};

export default images;
/**
 * Utilitaire pour traiter correctement les URLs d'images
 * Gère les chemins relatifs et absolus
 */

/**
 * Traite l'URL d'une image pour assurer son affichage correct
 * @param url URL de l'image à traiter
 * @returns URL corrigée pour l'affichage
 */
export const processImageUrl = (url: string): string => {
  if (!url) return '';
  
  // Si l'URL est une URL complète (commence par http:// ou https://), la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si c'est un chemin relatif, le convertir en URL absolue
  // Dans le cas des assets locaux, enlever le premier '/' s'il existe
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  
  // Assurer que le chemin est correctement formaté
  return `/${cleanPath}`;
};
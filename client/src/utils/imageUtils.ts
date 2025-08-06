/**
 * Utilitaires pour la gestion des images
 */

/**
 * Traite un chemin d'image pour l'affichage cohérent dans l'interface
 * @param url Chemin d'image brut
 * @returns Chemin d'image formaté pour l'affichage
 */
export function formatImagePathForDisplay(url: string): string {
  if (!url) return '';
  
  // Si l'URL est une URL complète, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let cleanPath = url;
  
  // Nettoyer agressivement tous les préfixes d'admin, même répétés
  while (cleanPath.includes('/admin/')) {
    cleanPath = cleanPath.replace(/\/admin\/[^\/]*\//, '/');
    cleanPath = cleanPath.replace(/\/admin\//, '/');
  }
  
  // Supprimer le premier slash s'il existe
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  // Extraire la partie attached_assets si elle existe
  if (cleanPath.includes('attached_assets')) {
    const attachedIndex = cleanPath.indexOf('attached_assets');
    cleanPath = cleanPath.substring(attachedIndex);
  }
  
  // Si le chemin ne commence toujours pas par attached_assets et contient un fichier
  if (!cleanPath.startsWith('attached_assets') && cleanPath.includes('.')) {
    cleanPath = `attached_assets/Yhom_Doublures/${cleanPath}`;
  }
  
  // Construire une URL absolue pour éviter les intercepteurs de routage
  const origin = window.location.origin;
  const finalUrl = `${origin}/${cleanPath}`;
  
  // Debug spécifique pour les composants de panel
  console.log('🔧 formatImagePathForDisplay - URL originale:', url);
  console.log('🔧 formatImagePathForDisplay - Chemin nettoyé:', cleanPath);
  console.log('🔧 formatImagePathForDisplay - URL finale:', finalUrl);
  
  return finalUrl;
}
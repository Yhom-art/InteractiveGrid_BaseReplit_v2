import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Grille Chimérique V3
          </h1>
          <p className="text-xl text-gray-600">Système NFT avec Architecture Container</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <Link href="/admin/container-types">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Types de Container</h3>
              <p className="text-gray-600 text-sm">Gestion des modèles de containers pour l'écosystème NFT</p>
            </div>
          </Link>

          <Link href="/admin/container-layers-v3">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-green-500">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Configuration Layers</h3>
              <p className="text-gray-600 text-sm">Interface granulaire pour mapping des zones d'interaction</p>
            </div>
          </Link>

          <Link href="/admin/grid-map-distribution-v3">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Distribution Grille</h3>
              <p className="text-gray-600 text-sm">Règles de déploiement sur grille 32x32 native</p>
            </div>
          </Link>

          <Link href="/admin/chimeras">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Gestion NFT</h3>
              <p className="text-gray-600 text-sm">Administration des fiches NFT et métadonnées</p>
            </div>
          </Link>

          <Link href="/admin/music-containers">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-red-500">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Containers Musicaux</h3>
              <p className="text-gray-600 text-sm">Système audio spatial et contenus musicaux</p>
            </div>
          </Link>

          <Link href="/v2">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-l-4 border-gray-500">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Grille V2</h3>
              <p className="text-gray-600 text-sm">Interface utilisateur principale avec grille interactive</p>
            </div>
          </Link>

        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 text-blue-900">Architecture V3</h2>
            <p className="text-blue-700 text-sm mb-4">
              NFT → Container Type → Distribution → Grille Fluide 32x32
            </p>
            <div className="flex justify-center gap-8 text-xs text-blue-600">
              <span>✓ Mapping granulaire connecté BDD</span>
              <span>✓ Zones d'interaction codées</span>
              <span>✓ Système de sauvegarde fonctionnel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
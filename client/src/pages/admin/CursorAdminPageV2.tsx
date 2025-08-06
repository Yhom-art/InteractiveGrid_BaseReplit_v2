import React, { useState, useRef, useEffect } from 'react';
import { Upload, MousePointer2, Monitor, Tablet, Smartphone, Eye, EyeOff, Move, Target, Settings, Save, Plus, Lock, Zap, ZapOff, Wrench } from 'lucide-react';

import { AdminHeaderTemplate } from '@/components/admin/AdminHeaderTemplate';
import { AdminLayoutTemplate } from '@/components/admin/AdminLayoutTemplate';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { CursorV2 } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { AdminCursorProvider } from '@/components/admin/AdminCursorProvider';
import { useAdminCursor } from '@/hooks/useCursorBlocking';

export default function CursorAdminPageV2() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États pour la gestion des curseurs
  const [selectedCursor, setSelectedCursor] = useState<CursorV2 | null>(null);
  const [uploadMode, setUploadMode] = useState(true);
  const [cursorRefresh, setCursorRefresh] = useState(0);
  
  // États pour les paramètres d'affichage
  const [scaleSettings, setScaleSettings] = useState({
    desktop: 32,
    tablet: 28,
    mobile: 24
  });
  
  const [centeringOffset, setCenteringOffset] = useState({
    x: 0,
    y: 0
  });

  // Hook pour le curseur admin centralisé
  useAdminCursor(true);

  // Auto-sauvegarde des paramètres après modification
  const autoSaveSettings = async () => {
    if (!selectedCursor) return;

    try {
      console.log("💾 Auto-sauvegarde des paramètres...");
      
      // Supprimer les anciens paramètres
      await fetch(`/api/cursor-sizes?cursorId=${selectedCursor.id}`, { method: 'DELETE' });
      
      // Créer les nouveaux paramètres
      const devices = [
        { type: 'DESKTOP', size: scaleSettings.desktop },
        { type: 'TABLET', size: scaleSettings.tablet },
        { type: 'SMARTPHONE', size: scaleSettings.mobile }
      ];

      for (const device of devices) {
        await fetch('/api/cursor-sizes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cursorId: selectedCursor.id,
            deviceType: device.type,
            resolutionCategory: 'STANDARD',
            standardSize: device.size,
            scale: 100,
            offsetX: centeringOffset.x,
            offsetY: centeringOffset.y,
            enabled: true
          })
        });
      }
      
      console.log('Auto-sauvegarde terminée');
    } catch (error) {
      console.error('Erreur auto-sauvegarde:', error);
    }
  };

  useEffect(() => {
    if (selectedCursor && (scaleSettings.desktop !== 32 || scaleSettings.tablet !== 28 || scaleSettings.mobile !== 24 || centeringOffset.x !== 0 || centeringOffset.y !== 0)) {
      const timeoutId = setTimeout(() => {
        autoSaveSettings();
        window.dispatchEvent(new CustomEvent('cursor-admin-updated'));
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [scaleSettings, centeringOffset, selectedCursor]);

  // Récupération des curseurs depuis la base de données
  const cursorsQuery = useQuery({
    queryKey: ['/api/cursors-v2'],
    queryFn: () => fetch('/api/cursors-v2').then(res => res.json())
  });

  // Chargement des paramètres de taille pour le curseur sélectionné
  const loadCursorSettings = async (cursorId: number) => {
    try {
      console.log('🔄 Chargement des paramètres pour curseur ID:', cursorId);
      const response = await fetch(`/api/cursor-sizes?cursorId=${cursorId}`);
      const sizes = await response.json();
      
      console.log('📊 Tailles récupérées:', sizes);
      
      if (sizes && sizes.length > 0) {
        const desktopEntry = sizes.find((s: any) => s.cursor_sizes.deviceType === 'DESKTOP')?.cursor_sizes;
        const tabletEntry = sizes.find((s: any) => s.cursor_sizes.deviceType === 'TABLET')?.cursor_sizes;
        const mobileEntry = sizes.find((s: any) => s.cursor_sizes.deviceType === 'SMARTPHONE')?.cursor_sizes;
        
        const desktopSize = desktopEntry?.standardSize || 32;
        const tabletSize = tabletEntry?.standardSize || 28;
        const mobileSize = mobileEntry?.standardSize || 24;
        
        // Charger aussi les offsets
        const offsetX = desktopEntry?.offsetX || tabletEntry?.offsetX || mobileEntry?.offsetX || 0;
        const offsetY = desktopEntry?.offsetY || tabletEntry?.offsetY || mobileEntry?.offsetY || 0;
        
        console.log('📐 Tailles extraites - Desktop:', desktopSize, 'Tablet:', tabletSize, 'Mobile:', mobileSize);
        console.log('📐 Offsets extraits - X:', offsetX, 'Y:', offsetY);
        
        setScaleSettings({
          desktop: desktopSize,
          tablet: tabletSize,
          mobile: mobileSize
        });
        
        setCenteringOffset({
          x: offsetX,
          y: offsetY
        });
        
        console.log('✅ Paramètres et offsets mis à jour dans l\'état');
      } else {
        console.log('⚠️ Aucune taille trouvée, utilisation des valeurs par défaut');
        setScaleSettings({
          desktop: 32,
          tablet: 28,
          mobile: 24
        });
        setCenteringOffset({
          x: 0,
          y: 0
        });
      }
    } catch (error) {
      console.error('❌ Erreur chargement paramètres:', error);
    }
  };

  // Mutation pour sauvegarder les curseurs
  const saveCursorMutation = useMutation({
    mutationFn: async (cursor: Partial<CursorV2>) => {
      const response = await fetch(`/api/cursors-v2/${cursor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cursor)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cursors-v2'] });
      setCursorRefresh(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('cursor-admin-updated'));
      toast({ title: "Curseur sauvegardé", description: "Les modifications ont été enregistrées." });
    }
  });

  // Gestion de l'upload de fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedCursor) return;

    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Format invalide", 
        description: "Veuillez sélectionner un fichier image (SVG, PNG, JPG)",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      toast({ title: "Upload en cours", description: `Téléchargement de ${file.name}...` });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      // Mettre à jour l'état local avec les nouvelles données
      setSelectedCursor(prev => prev ? {
        ...prev,
        filename: file.name,
        assetPath: result.filePath
      } : null);

      toast({ 
        title: "Upload terminé", 
        description: `${file.name} uploadé avec succès. Cliquez sur "Valider le fichier" pour enregistrer.`
      });

    } catch (error) {
      console.error('Erreur upload:', error);
      toast({ 
        title: "Erreur d'upload", 
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    }
  };

  // Enregistrement des paramètres d'affichage (tailles et offsets)
  const handleSaveDisplaySettings = async () => {
    if (!selectedCursor) return;

    try {
      console.log("💾 Enregistrement des paramètres d'affichage...");
      console.log("📊 Valeurs actuelles - Desktop:", scaleSettings.desktop, "Tablet:", scaleSettings.tablet, "Mobile:", scaleSettings.mobile);
      console.log("📊 Offsets - X:", centeringOffset.x, "Y:", centeringOffset.y);
      
      // Supprimer les anciens paramètres pour ce curseur
      await fetch(`/api/cursor-sizes?cursorId=${selectedCursor.id}`, { method: 'DELETE' });
      
      // Créer les nouveaux paramètres avec les valeurs actuelles
      const devices = [
        { type: 'DESKTOP', size: scaleSettings.desktop },
        { type: 'TABLET', size: scaleSettings.tablet },
        { type: 'SMARTPHONE', size: scaleSettings.mobile }
      ];

      console.log("📝 Envoi des nouvelles tailles:", devices);

      for (const device of devices) {
        const response = await fetch('/api/cursor-sizes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cursorId: selectedCursor.id,
            deviceType: device.type,
            resolutionCategory: 'STANDARD',
            standardSize: device.size,
            scale: 100,
            offsetX: centeringOffset.x,
            offsetY: centeringOffset.y,
            enabled: true
          })
        });
        
        if (!response.ok) {
          const error = await response.json();
          console.error('❌ Erreur sauvegarde device:', device.type, error);
        } else {
          const result = await response.json();
          console.log("✅ Sauvegardé:", device.type, "→", result);
        }
      }
      
      toast({ 
        title: "Paramètres enregistrés", 
        description: "Rechargement de la page pour appliquer les changements..."
      });
      
      console.log('✅ Paramètres d\'affichage sauvegardés pour curseur:', selectedCursor.name);
      
      // Déclencher les événements de mise à jour selon le type de curseur
      if (selectedCursor.type === 'GRAB') {
        window.dispatchEvent(new CustomEvent('cursor-grab-updated'));
        console.log('🔄 Événement cursor-grab-updated déclenché');
      }
      if (selectedCursor.name === 'Cursor Admin') {
        window.dispatchEvent(new CustomEvent('cursor-admin-updated'));
        console.log('🔄 Événement cursor-admin-updated déclenché');
      }
      
      // Rechargement complet de la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Erreur sauvegarde paramètres d\'affichage:', error);
      toast({ 
        title: "Erreur de sauvegarde", 
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    }
  };

  // Validation manuelle du fichier uploadé
  const handleValidateFile = () => {
    if (!selectedCursor) return;
    
    console.log("🔧 Validation du fichier - assetPath:", selectedCursor.assetPath);
    
    const cursorUpdateData = {
      assetPath: selectedCursor.assetPath,
      filename: selectedCursor.filename
    };
    
    console.log("🔧 Données envoyées pour mise à jour:", cursorUpdateData);
    
    saveCursorMutation.mutateAsync({ id: selectedCursor.id, ...cursorUpdateData })
      .then(() => {
        toast({ 
          title: "Fichier validé", 
          description: "Le curseur a été mis à jour avec le nouveau fichier"
        });
      })
      .catch((error) => {
        console.error("❌ Erreur validation fichier:", error);
        toast({ 
          title: "Erreur de validation", 
          description: "Impossible de sauvegarder le curseur",
          variant: "destructive"
        });
      });
  };

  const cursors = cursorsQuery.data || [];

  return (
    <AdminCursorProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <AdminHeaderTemplate title="DYNAMIC CURSORS SYSTEM" filePath="client/src/pages/admin/CursorAdminPageV2.tsx" />
          
          <AdminLayoutTemplate leftColumn={
            <>
              {/* Actions rapides */}
              <div className="bg-white rounded-lg p-4 shadow space-y-3">
                <button
                  onClick={() => {/* Créer nouveau curseur */}}
                  className="w-full p-3 bg-transparent border-2 border-dashed border-blue-400 rounded text-sm text-blue-600 hover:border-blue-500 hover:text-blue-700 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Curseur
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/cursor-sizes/auto-create-defaults', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      const result = await response.json();
                      toast({
                        title: "Paramètres créés",
                        description: `Paramètres par défaut créés pour ${result.cursorsProcessed?.length || 0} curseurs`
                      });
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Impossible de créer les paramètres par défaut",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="w-full p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 hover:bg-green-100 transition-colors flex items-center justify-center"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Auto-Config Tous Curseurs
                </button>
              </div>

              {/* Preview du curseur sélectionné */}
              {selectedCursor && (
                <div className="bg-white rounded-lg p-4 shadow">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm admin-h2">
                    <Eye className="w-4 h-4 mr-2" />
                    CURSOR NATURAL STATE
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center min-h-[120px]">
                    <div className="relative cursor-pointer">
                      <img 
                        src={selectedCursor.assetPath} 
                        alt={selectedCursor.name}
                        className="transition-transform hover:scale-110"
                        style={{
                          width: `${scaleSettings.desktop}px`,
                          height: `${scaleSettings.desktop}px`,
                          transform: `translate(${centeringOffset.x}px, ${centeringOffset.y}px)`,
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-red-400 opacity-40"></div>
                        <div className="absolute left-1/2 top-0 w-px h-full bg-red-400 opacity-40"></div>
                        <div 
                          className="absolute w-1 h-1 bg-red-600 rounded-full"
                          style={{
                            left: `calc(50% + ${centeringOffset.x}px)`,
                            top: `calc(50% + ${centeringOffset.y}px)`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-sm font-medium text-gray-900">{selectedCursor.name}</div>
                      <div className="text-xs text-gray-500">{selectedCursor.type}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste des curseurs - Séparation Système vs NFT */}
              <div className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm admin-h2">
                  <MousePointer2 className="w-4 h-4 mr-2" />
                  Curseurs Disponibles
                </h3>
                
                {/* CURSEURS SYSTÈME */}
                <div className="mb-4">
                  <div className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">Curseurs Système</div>
                  <div className="space-y-1">
                    {cursors
                      .filter((cursor: CursorV2) => cursor.name === 'Cursor Admin' || (cursor.type === 'GRAB' && cursor.name === 'Cursor Grab'))
                      .map((cursor: CursorV2) => (
                        <button
                          key={cursor.id}
                          onClick={() => {
                            setSelectedCursor(cursor);
                            loadCursorSettings(cursor.id);
                          }}
                          className={`w-full text-left p-3 rounded text-xs transition-colors border-l-4 ${
                            cursor.type === 'ADMIN' 
                              ? 'border-l-red-400 bg-red-50 hover:bg-red-100' 
                              : 'border-l-green-400 bg-green-50 hover:bg-green-100'
                          } ${
                            selectedCursor?.id === cursor.id
                              ? 'ring-2 ring-blue-300'
                              : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img src={cursor.assetPath} alt={cursor.name} className="w-6 h-6" />
                            <div className="flex-1">
                              <div className="font-medium admin-rule-name">{cursor.name}</div>
                              <div className="text-xs text-gray-600">
                                {cursor.name === 'Cursor Admin' && 'Fallback universel'}
                                {cursor.name === 'Cursor Grab' && 'Navigation grille'}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Lock className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <Wrench className="w-3 h-3 text-green-600 flex-shrink-0" />
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* CURSEURS NFT */}
                <div>
                  <div className="text-xs font-medium text-purple-700 mb-2 uppercase tracking-wide">Curseurs NFT</div>
                  <div className="space-y-1">
                    {cursors
                      .filter((cursor: CursorV2) => cursor.name !== 'Cursor Admin' && cursor.name !== 'Cursor Grab')
                      .filter((cursor: CursorV2) => cursor.enabled)
                      .map((cursor: CursorV2) => (
                        <button
                          key={cursor.id}
                          onClick={() => {
                            setSelectedCursor(cursor);
                            loadCursorSettings(cursor.id);
                          }}
                          className={`w-full text-left p-2 rounded text-xs transition-colors ${
                            selectedCursor?.id === cursor.id
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img src={cursor.assetPath} alt={cursor.name} className="w-5 h-5" />
                            <div className="flex-1">
                              <div className="font-medium admin-rule-name">{cursor.name}</div>
                              <div className="text-gray-500 admin-programmatic text-xs">{cursor.type}</div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <Wrench className="w-3 h-3 text-blue-500 flex-shrink-0" />
                            </div>
                          </div>
                        </button>
                      ))}
                  
                    {/* Curseurs NFT inactifs */}
                    {cursors.filter((cursor: CursorV2) => cursor.name !== 'Cursor Admin' && cursor.name !== 'Cursor Grab' && !cursor.enabled).length > 0 && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="text-xs text-gray-500 mb-1">Inactifs</div>
                        {cursors
                          .filter((cursor: CursorV2) => cursor.name !== 'Cursor Admin' && cursor.name !== 'Cursor Grab' && !cursor.enabled)
                          .map((cursor: CursorV2) => (
                            <button
                              key={cursor.id}
                              onClick={() => {
                                setSelectedCursor(cursor);
                                loadCursorSettings(cursor.id);
                              }}
                              className={`w-full text-left p-2 rounded text-xs transition-colors opacity-60 ${
                                selectedCursor?.id === cursor.id
                                  ? 'bg-blue-100 border border-blue-300'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <img src={cursor.assetPath} alt={cursor.name} className="w-5 h-5" />
                                <div className="flex-1">
                                  <div className="font-medium admin-rule-name">{cursor.name}</div>
                                  <div className="text-gray-500 admin-programmatic text-xs">{cursor.type}</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <ZapOff className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  <Wrench className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                </div>
                              </div>
                            </button>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          }>
            {selectedCursor ? (
              <div className="space-y-6">
                
                {/* 1. SECTION VISUEL */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MousePointer2 className="w-5 h-5 mr-2" />
                    CURSOR NATURAL STATE
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload et adressage */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 admin-h2">Fichier Source</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img src={selectedCursor.assetPath} alt={selectedCursor.name} className="w-8 h-8" />
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-1/2 left-0 w-full h-px bg-red-400 opacity-60"></div>
                              <div className="absolute left-1/2 top-0 w-px h-full bg-red-400 opacity-60"></div>
                              <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium admin-rule-name">{selectedCursor.filename}</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700">Mode d'adressage</div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setUploadMode(true)}
                              className={`flex-1 p-2 text-xs rounded transition-colors ${
                                uploadMode 
                                  ? 'bg-blue-100 border border-blue-300 text-blue-700' 
                                  : 'bg-gray-100 border border-gray-300 text-gray-600'
                              }`}
                            >
                              Upload Fichier
                            </button>
                            <button
                              onClick={() => setUploadMode(false)}
                              className={`flex-1 p-2 text-xs rounded transition-colors ${
                                !uploadMode 
                                  ? 'bg-blue-100 border border-blue-300 text-blue-700' 
                                  : 'bg-gray-100 border border-gray-300 text-gray-600'
                              }`}
                            >
                              URL Directe
                            </button>
                          </div>
                        </div>

                        {uploadMode ? (
                          <div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center justify-center text-sm text-gray-600"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Choisir un fichier
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="url"
                              placeholder="https://exemple.com/curseur.svg"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded admin-programmatic"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Paramètres de taille */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 admin-h2">Device Scale Settings</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Monitor className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Desktop</div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                value={scaleSettings.desktop}
                                onChange={(e) => setScaleSettings(prev => ({ ...prev, desktop: parseInt(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded admin-programmatic"
                              />
                              <span className="text-xs text-gray-500">px</span>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Tablet className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Tablet</div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                value={scaleSettings.tablet}
                                onChange={(e) => setScaleSettings(prev => ({ ...prev, tablet: parseInt(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded admin-programmatic"
                              />
                              <span className="text-xs text-gray-500">px</span>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                              <Smartphone className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="text-xs font-medium text-gray-700 mb-1">Mobile</div>
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                value={scaleSettings.mobile}
                                onChange={(e) => setScaleSettings(prev => ({ ...prev, mobile: parseInt(e.target.value) }))}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded admin-programmatic"
                              />
                              <span className="text-xs text-gray-500">px</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Offset X</label>
                            <input
                              type="number"
                              value={centeringOffset.x}
                              onChange={(e) => setCenteringOffset(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded admin-programmatic"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Offset Y</label>
                            <input
                              type="number"
                              value={centeringOffset.y}
                              onChange={(e) => setCenteringOffset(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded admin-programmatic"
                            />
                          </div>
                        </div>

                        {/* Bouton pour enregistrer les paramètres d'affichage */}
                        <div className="pt-4 border-t">
                          <button
                            onClick={handleSaveDisplaySettings}
                            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center text-sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save & Apply Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. SECTION ADVANCED STATES */}
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    ADVANCED STATES
                  </h2>
                  
                  {/* Note sur l'architecture future */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">🎯 Pour curseurs élaborés</div>
                      <div className="text-xs space-y-1">
                        <div>• Animations CSS et transitions complexes</div>
                        <div>• Curseurs multi-états et adaptatifs</div>
                        <div>• Effets visuels et interactions spéciales</div>
                        <div>• Gestion des zones d'activation → Admin Container Layers</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 admin-h2">État et Visibilité</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedCursor.enabled}
                            onChange={() => {/* Toggle enabled */}}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label className="text-sm text-gray-900">Curseur activé</label>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Priorité</label>
                          <input
                            type="number"
                            value={selectedCursor.priority}
                            className="w-20 px-2 py-1 text-xs border border-gray-300 rounded admin-programmatic"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-3 admin-h2">Animations CSS (À venir)</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded border">
                          <div className="text-xs text-gray-600">
                            <div className="font-medium mb-1">Fonctionnalités futures:</div>
                            <div>• Transitions on hover/click</div>
                            <div>• Keyframes personnalisées</div>
                            <div>• États multi-visuels</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-900 mb-3 admin-h2">Informations système</h3>
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 admin-programmatic">
                        <div>Type: {selectedCursor.type}</div>
                        <div>ID: {selectedCursor.id}</div>
                        <div>Créé: {new Date(selectedCursor.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleValidateFile}
                    disabled={saveCursorMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saveCursorMutation.isPending ? 'Validation...' : 'Valider le fichier'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MousePointer2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un curseur</h3>
                <p className="text-gray-600">Choisissez un curseur dans la liste pour configurer ses paramètres visuels et zones d'activation.</p>
              </div>
            )}
          </AdminLayoutTemplate>
        </div>
      </div>
    </AdminCursorProvider>
  );
}
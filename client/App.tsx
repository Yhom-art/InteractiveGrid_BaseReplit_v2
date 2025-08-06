import React, { useEffect } from "react";

// Déclaration des types globaux pour Window
declare global {
  interface Window {
    audioContexts?: AudioContext[];
  }
}
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DebugProvider } from "@/components/DebugSystem";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { PanelDemo } from "@/components/panels/PanelDemo";
import { OnePagePanelDemo } from "@/components/panels/OnePagePanelDemo";
import { SpiralGridDemo as OldSpiralGridDemo } from "@/components/SpiralGridDemo";
import { SpiralChimeriqueDemo } from "@/components/SpiralChimeriqueDemo";
import GridPoc from "@/pages/GridPoc";
import GridDemo from "@/pages/GridDemo";
import FluidGridDemo from "@/pages/FluidGridDemo";
import OrganizedGridDemo from "@/pages/OrganizedGridDemo";
import SpiralGridDemo from "@/pages/SpiralGridDemo";
import GridPanelPocPage from "@/pages/GridPanelPocPage";
import SimplePanelPocPage from "@/pages/SimplePanelPocPage";
import FluidColumnPocPage from "@/pages/FluidColumnPocPage";
import FluidGridPage from "@/pages/FluidGridPage";
import SimplifiedFluidGrid from "@/pages/SimplifiedFluidGrid";
import GrilleChimeriquePage from "@/pages/GrilleChimeriquePage";
import GrilleChimeriqueV2Page from "@/pages/GrilleChimeriqueV2Page";
import GridRulesAdminPage from "@/pages/admin/GridRulesAdminPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import { NavigationMenu } from "@/components/NavigationMenu";
import { CustomCursorV2 } from "@/components/CustomCursorV2";
import { MenuRoueFrontend } from "@/components/MenuRoueFrontend";

import { TestBlurPage } from "@/pages/TestBlurPage";
import AudioVisualizerPOC from "@/pages/AudioVisualizerPOC";
import AudioVisualizerSimple from "@/pages/AudioVisualizerSimple";

// Import des pages d'administration
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { ChimerasPage } from "@/pages/admin/ChimerasPage";
import { ChimeraEditPage } from "@/pages/admin/ChimeraEditPage";
import { PanelEditPage } from "@/pages/admin/PanelEditPage";
import { PanelsListPage } from "@/pages/admin/PanelsListPage";
import { ComponentsExamplePage } from "@/pages/admin/ComponentsExamplePage";
import { ChimerasGalleryPage } from "@/pages/admin/ChimerasGalleryPage";
import { ChimeraCreationChoicePage } from "@/pages/admin/ChimeraCreationChoicePage";
import { ChimeraNFTImportPage } from "@/pages/admin/ChimeraNFTImportPage";
import { EditorialsPage } from "@/pages/admin/EditorialsPage";
import { EditorialEditPage } from "@/pages/admin/EditorialEditPage";
import { EditorialCreatePage } from "@/pages/admin/EditorialCreatePage";
import { MusicContainersPage } from "@/pages/admin/MusicContainersPage";
import { default as ContainerTypesPageV2 } from "@/pages/admin/ContainerTypesPageV2";
import { TempGridPage } from "@/pages/TempGridPage";
import { default as CursorAdminPage } from "@/pages/admin/CursorAdminPageV2";
import { default as ContainerLayersAdminPage } from "@/pages/admin/ContainerLayersAdminPage";
import { default as ContainerLayersNewPage } from "@/pages/admin/ContainerLayersNewPage";
import { default as ContainerTypesIndexPage } from "@/pages/admin/ContainerTypesIndexPage";
import ContainerLayersV3Page from "@/pages/admin/ContainerLayersV3Page";
import AdminGrilleFluide from "@/pages/admin/AdminGrilleFluide";
import HeaderTemplatePage from "@/pages/admin/HeaderTemplatePage";
import AdminButtonsPage from "@/pages/admin/AdminButtonsPage";
import AdminBackOfficePage from "@/pages/admin/AdminBackOfficePage";
import DashboardV2Page from "@/pages/DashboardV2Page";
import { GridMapV2Page } from "@/pages/GridMapV2Page";
import { GridMapModelsPage } from "@/pages/admin/GridMapModelsPage";
import GridMapModelsPageV2 from "@/pages/admin/GridMapModelsPageV2";
import { GridMapDistributionUnified } from "@/pages/admin/GridMapDistributionUnified";
import { GridMapDistribution32Native } from "@/pages/admin/GridMapDistribution32Native";
import { GridMapDistributionV3 } from "@/pages/admin/GridMapDistributionV3";
import { ContainersAdminPage } from "@/pages/admin/ContainersAdminPage";
import { PanelsAdminPage } from "@/pages/admin/PanelsAdminPage";
import { DeploymentModelsPage } from "@/pages/admin/DeploymentModelsPage";
import { AdminHomePage } from "@/pages/admin/AdminHomePage";
import { GridPagesPage } from "@/pages/admin/GridPagesPage";
import ArchitectureDiagnosticPage from "@/pages/admin/ArchitectureDiagnosticPage";
import GrilleGenereeV3Page from "@/pages/GrilleGenereeV3Page";
import ContainerPagesIndex from "@/pages/admin/ContainerPagesIndex";
import { MenuRoueAdminPage } from "@/pages/admin/MenuRoueAdminPage";
import { StylesSystemPage } from "@/pages/admin/StylesSystemPage";
import StylesGlobalPage from "@/pages/admin/StylesGlobalPage";
import TagsAdminPage from "@/pages/admin/TagsAdminPage";

import { CreatePageWizard } from "@/pages/admin/CreatePageWizard";
import ReadmeV3Page from "@/pages/admin/ReadmeV3Page";
import PlanDeploiementPage from "@/pages/admin/PlanDeploiementPage";
import PlanCompletV3Page from "@/pages/admin/PlanCompletV3Page";
import PageManagerPage from "@/pages/admin/PageManagerPage";
import { AdminPagesManager } from "@/pages/admin/AdminPagesManager";
import HeaderAdminPage from "@/pages/admin/HeaderAdminPage";


function Router() {
  return (
    <Switch>
      {/* Page d'accueil - V2 temporaire (à connecter plus tard) */}
      <Route path="/" component={GrilleChimeriqueV2Page} />
      
      {/* Ancien accueil temporaire */}
      <Route path="/home" component={Home} />
      
      {/* Version V2 - Grille 32x32 */}
      <Route path="/v2" component={GrilleChimeriqueV2Page} />
      
      {/* Grille Générée V3 - Test système complet */}
      <Route path="/grille-generee-v3" component={GrilleGenereeV3Page} />
      
      {/* GridMap V2 - Page admin */}
      <Route path="/gridmap-v2" component={GridMapV2Page} />
      
      {/* Archive V1 - Grille Chimérique complète */}
      <Route path="/v1" component={GrilleChimeriquePage} />
      <Route path="/v1/grille-chimerique" component={GrilleChimeriquePage} />
      
      {/* Pages de développement et tests V1 archivées */}
      <Route path="/v1/panel-demo" component={PanelDemo} />
      <Route path="/v1/one-page-panel" component={OnePagePanelDemo} />
      <Route path="/v1/spiral-grid" component={OldSpiralGridDemo} />
      <Route path="/v1/spiral-chimerique" component={SpiralChimeriqueDemo} />
      <Route path="/v1/grid-poc" component={GridPoc} />
      <Route path="/v1/grid-demo" component={GridDemo} />
      <Route path="/v1/fluid-grid" component={FluidGridDemo} />
      <Route path="/v1/organized-grid" component={OrganizedGridDemo} />
      <Route path="/v1/spiral-grid-demo" component={SpiralGridDemo} />
      <Route path="/v1/grid-panel-poc" component={GridPanelPocPage} />
      <Route path="/v1/simple-panel-poc" component={SimplePanelPocPage} />
      <Route path="/v1/fluid-column-poc" component={FluidColumnPocPage} />
      <Route path="/v1/new-fluid-grid" component={FluidGridPage} />
      <Route path="/v1/simplified-fluid-grid" component={SimplifiedFluidGrid} />
      <Route path="/v1/test-blur" component={TestBlurPage} />
      <Route path="/audio-visualizer-poc" component={AudioVisualizerPOC} />
      <Route path="/audio-visualizer" component={AudioVisualizerSimple} />
      
      {/* Pages d'administration des fiches fantômes */}
      <Route path="/admin/chimeras" component={ChimerasPage} />
      <Route path="/admin/chimeras/new" component={ChimeraEditPage} />
      <Route path="/admin/chimeras/new/manual" component={ChimeraEditPage} />
      <Route path="/admin/chimeras/new/nft" component={ChimeraNFTImportPage} />
      <Route path="/admin/chimeras/:id" component={ChimeraEditPage} />
      <Route path="/admin/:itemType/:itemId/panels" component={PanelsListPage} />
      <Route path="/admin/:itemType/:itemId/panels/new" component={PanelEditPage} />
      <Route path="/admin/:itemType/:itemId/panels/:id" component={PanelEditPage} />
      <Route path="/admin/components-examples" component={ComponentsExamplePage} />
      <Route path="/admin/chimeras-gallery" component={ChimerasGalleryPage} />
      
      {/* Routes pour la gestion des éléments éditoriaux */}
      <Route path="/admin/editorials" component={EditorialsPage} />
      <Route path="/admin/editorials/new" component={EditorialCreatePage} />
      <Route path="/admin/editorials/:id" component={EditorialEditPage} />
      
      {/* Routes pour la gestion des containers musicaux */}
      <Route path="/admin/music-containers" component={MusicContainersPage} />
      
      {/* Route pour l'admin des règles de grille */}
      <Route path="/admin/grid-rules" component={GridRulesAdminPage} />
      
      {/* Route pour les modèles de grilles V2 */}
      <Route path="/admin/grid-models" component={GridMapModelsPage} />
      
      {/* Route pour les types de containers */}
      <Route path="/admin/container-types" component={ContainerTypesPageV2} />
      
      {/* Route pour la page temporaire de test */}
      <Route path="/temp-grid" component={TempGridPage} />
      
      {/* Route pour l'admin des curseurs */}
      <Route path="/admin/cursors" component={CursorAdminPage} />
      
      {/* Routes pour la gestion des types de containers */}
      <Route path="/admin/container-types" component={ContainerTypesIndexPage} />
      
      {/* Route pour l'admin du Menu Roue */}
      <Route path="/admin/menu-roue" component={MenuRoueAdminPage} />
      <Route path="/admin/container-layers" component={ContainerLayersV3Page} />
      <Route path="/admin/container-layers-v3" component={ContainerLayersV3Page} />
      <Route path="/admin/container-layers-old" component={ContainerLayersNewPage} />
      <Route path="/admin/grille-fluide" component={AdminGrilleFluide} />
      
      {/* Route pour tester le template header */}
      <Route path="/admin/header-template" component={HeaderTemplatePage} />
      
      {/* Route pour l'admin du header */}
      <Route path="/admin/header-admin" component={HeaderAdminPage} />
      
      {/* Route pour la gestion des boutons admin */}
      <Route path="/admin/buttons" component={AdminButtonsPage} />
      
      {/* Route pour le système de styles */}
      <Route path="/admin/styles-system" component={StylesSystemPage} />
      <Route path="/admin/styles-global" component={StylesGlobalPage} />
      <Route path="/admin/tags-admin" component={TagsAdminPage} />

      {/* Routes Admin Page Management */}
      <Route path="/admin/create-page" component={CreatePageWizard} />
      <Route path="/admin/manage-pages" component={AdminPagesManager} />
      <Route path="/admin/page-manager" component={PageManagerPage} />
      
      {/* Routes Documentation */}
      <Route path="/admin/readme-v3" component={ReadmeV3Page} />
      <Route path="/admin/plan-deploiement" component={PlanDeploiementPage} />
      <Route path="/admin/plan-complet-v3" component={PlanCompletV3Page} />
      
      {/* Route pour l'interface Admin BackOffice */}
      <Route path="/admin/backoffice" component={AdminBackOfficePage} />
      
      {/* Page d'accueil admin */}
      <Route path="/admin" component={AdminHomePage} />
      
      {/* Routes GRID MAP */}
      <Route path="/admin/grid-pages" component={GridPagesPage} />
      <Route path="/admin/grid-map-distribution-v3" component={GridMapDistributionV3} />
      <Route path="/admin/grid-distribution-v3" component={GridMapDistributionV3} />
      
      {/* Route Diagnostic Architecture */}
      <Route path="/admin/architecture-diagnostic" component={ArchitectureDiagnosticPage} />
      
      {/* Routes Container Layers - TOUTES VERSIONS ACCESSIBLES */}
      <Route path="/admin/container-pages-index" component={ContainerPagesIndex} />
      <Route path="/admin/container-layers-admin" component={ContainerLayersAdminPage} />
      <Route path="/admin/container-layers-v3" component={ContainerLayersV3Page} />
      <Route path="/admin/container-layers-new" component={ContainerLayersNewPage} />
      <Route path="/admin/container-types-index" component={ContainerTypesIndexPage} />

      
      {/* Routes archivées */}
      <Route path="/admin/grid/models" component={GridMapModelsPage} />
      <Route path="/admin/grid/models-v2" component={GridMapModelsPageV2} />

      <Route path="/admin/grid-map-distribution-32" component={GridMapDistribution32Native} />
      <Route path="/admin/grid-map-v2" component={GridMapV2Page} />
      <Route path="/admin/containers" component={ContainersAdminPage} />
      <Route path="/admin/panels" component={PanelsAdminPage} />
      <Route path="/admin/deployment-models" component={DeploymentModelsPage} />
      <Route path="/admin/dashboard" component={AdminDashboardPage} />
      

      
      {/* Fallback pour les routes non trouvées */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Suppression des détections admin/app - comportement unifié maintenant
  
  // NETTOYAGE AUDIO GLOBAL - Éliminer toutes les pistes fantômes au démarrage
  useEffect(() => {
    console.log('🧹 NETTOYAGE GLOBAL - Élimination des pistes audio fantômes');
    
    // Arrêter tous les éléments audio du DOM
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach((audio, index) => {
      console.log(`🧹 Audio trouvé ${index}:`, audio.src, 'paused:', audio.paused);
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`🧹 Audio ${index} arrêté et remis à zéro`);
      }
    });
    
    // Nettoyer aussi les AudioContext globaux
    if ((window as any).audioContexts) {
      (window as any).audioContexts.forEach((ctx: AudioContext, index: number) => {
        if (ctx.state !== 'closed') {
          ctx.close();
          console.log(`🧹 AudioContext ${index} fermé`);
        }
      });
      (window as any).audioContexts = [];
    }
    
    console.log('🧹 NETTOYAGE GLOBAL terminé');
  }, []);
  
  return (
    <div className="app-root">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DebugProvider>
            <Toaster />
            <Router />
            
            {/* Curseur personnalisé V2 */}
            <CustomCursorV2 />
            
            {/* Menu Roue Frontend */}
            <MenuRoueFrontend />

          </DebugProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;

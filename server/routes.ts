import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChimeraSchema, 
  insertEditorialSchema, 
  insertGridConfigSchema,
  insertGridModelSchema,
  insertDistributionRuleSchema,
  insertAppPageSchema,
  insertModelPageAssignmentSchema,
  insertGridV3ConfigurationSchema,
  insertContainerTypeSchema,
  insertContainerLayerConfigurationSchema,
  insertInteractionZoneSchema,
  insertCursorV2Schema,
  updateCursorV2Schema,
  insertCursorAssignmentSchema,
  insertCursorSizeSchema,
  insertMenuRoueConfigurationSchema,
  insertHeaderConfigSchema,
  insertLayoutTemplateSchema,
  insertAdminPageSchema,
  insertGlobalStyleSchema,
  insertTagConfigurationSchema,
  panels,
  panelComponents,
  gridV3Configurations,
  containerLayerConfigurations,
  interactionZones,
  cursorsV2,
  cursorAssignments,
  cursorSizes,
  menuRoueConfigurations,
  headerConfigs,
  layoutTemplates,
  adminPages,
  containerTypes,
  globalStyles,
  tagConfigurations
} from "@shared/schema";
import { uploadMiddleware, uploadFileHandler, handleUploadErrors } from './upload';
import { ZodError } from "zod";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import express from "express";
import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // ****** MIDDLEWARE POUR SERVIR LES FICHIERS STATIQUES ******
  
  // Servir les fichiers attached_assets directement
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets'), {
    setHeaders: (res, filePath) => {
      console.log(`📸 Requête d'image: ${filePath}`);
    }
  }));

  // ****** ROUTES POUR L'ADMINISTRATION DES FICHES FANTÔMES ******

  // Routes pour les chimères (NFTs)
  app.get("/api/chimeras", async (_req: Request, res: Response) => {
    try {
      const chimeras = await storage.getAllChimeras();
      res.json(chimeras);
    } catch (error) {
      console.error("Erreur lors de la récupération des chimères:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/chimeras/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const chimera = await storage.getChimera(id);
      if (!chimera) {
        return res.status(404).json({ error: "Chimère non trouvée" });
      }
      
      res.json(chimera);
    } catch (error) {
      console.error("Erreur lors de la récupération de la chimère:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/chimeras", async (req: Request, res: Response) => {
    try {
      const validatedData = insertChimeraSchema.parse(req.body);
      const newChimera = await storage.createChimera(validatedData);
      
      // Créer automatiquement un panel de base pour chaque nouvelle chimère
      if (newChimera.type !== 'EDITORIAL') {
        const panelData = {
          title: `Panel de ${newChimera.name}`,
          chimeraId: newChimera.id,
          description: `Panel automatique pour ${newChimera.reference}`,
          position: 0,
          isVisible: true,
          style: null
        };
        
        // Note: La création automatique de panel sera implémentée plus tard
        console.log("Panel automatique sera créé pour:", newChimera.name);
      }
      
      res.status(201).json(newChimera);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la création de la chimère:", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  });

  app.put("/api/chimeras/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      // Vérification partielle des données
      const validatedData = insertChimeraSchema.partial().parse(req.body);
      const updatedChimera = await storage.updateChimera(id, validatedData);
      
      if (!updatedChimera) {
        return res.status(404).json({ error: "Chimère non trouvée" });
      }
      
      res.json(updatedChimera);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la mise à jour de la chimère:", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  });

  app.delete("/api/chimeras/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const success = await storage.deleteChimera(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de la chimère:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Routes pour les éléments éditoriaux
  app.get("/api/editorials", async (_req: Request, res: Response) => {
    try {
      const editorials = await storage.getAllEditorials();
      res.json(editorials);
    } catch (error) {
      console.error("Erreur lors de la récupération des éléments éditoriaux:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/editorials/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const editorial = await storage.getEditorial(id);
      if (!editorial) {
        return res.status(404).json({ error: "Élément éditorial non trouvé" });
      }
      
      res.json(editorial);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'élément éditorial:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/editorials", async (req: Request, res: Response) => {
    try {
      const validatedData = insertEditorialSchema.parse(req.body);
      const newEditorial = await storage.createEditorial(validatedData);
      res.status(201).json(newEditorial);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la création de l'élément éditorial:", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  });

  app.put("/api/editorials/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      // Vérification partielle des données
      const validatedData = insertEditorialSchema.partial().parse(req.body);
      const updatedEditorial = await storage.updateEditorial(id, validatedData);
      
      if (!updatedEditorial) {
        return res.status(404).json({ error: "Élément éditorial non trouvé" });
      }
      
      res.json(updatedEditorial);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la mise à jour de l'élément éditorial:", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  });

  app.delete("/api/editorials/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const success = await storage.deleteEditorial(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élément éditorial:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Routes pour la configuration de la grille
  app.get("/api/grid-config", async (_req: Request, res: Response) => {
    try {
      const configs = await storage.getAllGridConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Erreur lors de la récupération des configurations de grille:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/grid-config", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGridConfigSchema.parse(req.body);
      const newConfig = await storage.createGridConfig(validatedData);
      res.status(201).json(newConfig);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la création de la configuration:", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  });

  app.put("/api/grid-config/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const validatedData = insertGridConfigSchema.partial().parse(req.body);
      const updatedConfig = await storage.updateGridConfig(id, validatedData);
      
      if (!updatedConfig) {
        return res.status(404).json({ error: "Configuration non trouvée" });
      }
      
      res.json(updatedConfig);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la mise à jour de la configuration:", error);
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  });

  app.delete("/api/grid-config/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const success = await storage.deleteGridConfig(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Routes pour les panels
  app.get("/api/panels", async (req: Request, res: Response) => {
    try {
      // Récupérer tous les panels de la base de données
      const chimeraId = req.query.chimeraId ? parseInt(req.query.chimeraId as string) : undefined;
      
      // Si un chimeraId est spécifié, filtrer les panels par chimère
      if (chimeraId && !isNaN(chimeraId)) {
        // Récupérer seulement le panel le plus récent pour cette chimère
        // en utilisant l'ID le plus élevé (qui correspond au plus récent)
        const [latestPanel] = await db.select()
          .from(panels)
          .where(eq(panels.chimeraId, chimeraId))
          .orderBy(desc(panels.id))
          .limit(1);
          
        // Renvoyer un tableau avec uniquement le panel le plus récent
        // (ou un tableau vide s'il n'y a pas de panel)
        return res.json(latestPanel ? [latestPanel] : []);
      }
      
      // Pour une requête sans filtre, nous allons récupérer le panel le plus récent
      // pour chaque chimère avec leurs composants
      const allPanels = await db.select().from(panels);
      
      // Trouver le panel le plus récent pour chaque chimère
      const latestPanelsByChimera = new Map();
      
      allPanels.forEach(panel => {
        const currentLatestPanel = latestPanelsByChimera.get(panel.chimeraId);
        
        // Si nous n'avons pas encore de panel pour cette chimère ou si ce panel a un ID plus élevé
        if (!currentLatestPanel || panel.id > currentLatestPanel.id) {
          latestPanelsByChimera.set(panel.chimeraId, panel);
        }
      });
      
      // Convertir la Map en tableau
      const uniquePanels = Array.from(latestPanelsByChimera.values());
      
      // Ajouter les composants à chaque panel
      const panelsWithComponents = await Promise.all(
        uniquePanels.map(async (panel) => {
          const components = await db.select()
            .from(panelComponents)
            .where(eq(panelComponents.panelId, panel.id))
            .orderBy(panelComponents.order);
          
          // Debug: affichage des composants du panel
          if (panel.chimeraId === 36) { // PAULCIS
            console.log("🔍 Debug PAULCIS - Panel ID:", panel.id);
            console.log("🔍 Debug PAULCIS - Composants trouvés:", components);
            components.forEach((comp, idx) => {
              console.log(`🔍 Composant ${idx}:`, JSON.stringify(comp, null, 2));
            });
          }
          
          return {
            ...panel,
            components: components
          };
        })
      );
      
      res.json(panelsWithComponents);
    } catch (error) {
      console.error("Erreur lors de la récupération des panels:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/panels/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Si l'id est undefined, on renvoie un panel vide
      if (id === 'undefined' || isNaN(parseInt(id))) {
        return res.json({
          id: 0,
          title: "Nouveau panel",
          description: "",
          components: [],
          theme: "light",
          isPublished: false
        });
      }
      
      const panelId = parseInt(id);
      // Récupérer le panel de la base de données
      const [panel] = await db.select().from(panels).where(eq(panels.id, panelId));
      
      if (!panel) {
        return res.status(404).json({ error: "Panel non trouvé" });
      }
      
      // Récupérer les composants associés au panel
      const components = await db.select().from(panelComponents).where(eq(panelComponents.panelId, panelId)).orderBy(panelComponents.order);
      
      // Ajouter les composants au panel
      const fullPanel = {
        ...panel,
        components: components.map(comp => {
          // Traitement adapté selon le type de composant
          let processedContent = comp.content;
          
          // Pour les composants de type texte, on conserve le contenu textuel brut
          if (comp.type === 'text') {
            // Pour les textes, on conserve le contenu tel quel, sans parsing
            processedContent = comp.content ? comp.content.toString() : '';
          } else {
            // Pour tous les autres types, on essaie de parser le JSON
            try {
              if (comp.content) {
                // Si le contenu est une chaîne, tenter de le parser comme JSON
                if (typeof comp.content === 'string' && comp.content.trim() !== '') {
                  processedContent = JSON.parse(comp.content.toString());
                } else if (typeof comp.content === 'object' && comp.content !== null) {
                  // Si c'est déjà un objet, on le garde tel quel
                  processedContent = comp.content;
                } else {
                  // Si rien d'autre n'a fonctionné, on utilise un objet vide
                  processedContent = {};
                }
              } else {
                // Si content est falsy, utiliser un objet vide
                processedContent = {};
              }
            } catch (err) {
              console.error(`Erreur lors du parsing du contenu pour le composant ${comp.id}:`, err);
              // En cas d'erreur, on utilise un objet vide
              processedContent = {};
            }
          }
          
          return {
            ...comp,
            content: processedContent
          };
        })
      };
      
      res.json(fullPanel);
    } catch (error) {
      console.error("Erreur lors de la récupération du panel:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/panels", async (req: Request, res: Response) => {
    try {
      const { title, chimeraId, editorialId, theme, customTheme, isPublished, components = [] } = req.body;
      
      // Validation basique
      if (!title) {
        return res.status(400).json({ error: "Le titre est requis" });
      }
      
      if (!chimeraId && !editorialId) {
        return res.status(400).json({ error: "Une chimère ou un éditorial associé est requis" });
      }
      
      // Créer un nouveau panel dans la base de données
      console.log("Sauvegarde d'un panel:", { title, chimeraId, editorialId, theme, customTheme, isPublished });
      
      // Créer l'objet à insérer
      const insertData = {
        title: title,
        chimeraId: chimeraId || null,
        editorialId: editorialId || null,
        theme: theme || "light",
        customTheme: customTheme ? 
          (typeof customTheme === 'string' ? JSON.parse(customTheme) : customTheme) 
          : null,
        isPublished: isPublished || false
      };
      
      console.log("Données à insérer:", insertData);
      const [newPanel] = await db.insert(panels).values(insertData).returning();
      
      // Si des composants sont fournis, les ajouter
      if (components && components.length > 0) {
        console.log(`Ajout de ${components.length} composants pour le panel ${newPanel.id}`);
        
        for (let i = 0; i < components.length; i++) {
          const comp = components[i];
          console.log(`Composant ${i+1}:`, comp);
          
          // Prépare le contenu pour l'enregistrement selon le type
          let contentToStore = '';
          
          // Pour les composants de type texte, on conserve le contenu textuel brut
          if (comp.type === 'text') {
            // Pour les textes, on stocke le contenu brut tel quel (sans conversion JSON)
            contentToStore = comp.content || '';
          } else {
            // Pour tous les autres types de composants, on s'assure d'avoir un JSON valide
            let contentObject = {};
            
            // Si le contenu est déjà une chaîne JSON, on essaie de la parser
            if (typeof comp.content === 'string') {
              try {
                // Vérifions si c'est déjà un JSON valide
                if (comp.content.trim().startsWith('{') || comp.content.trim().startsWith('[')) {
                  contentObject = JSON.parse(comp.content);
                } else {
                  // Si ce n'est pas du JSON formaté, on crée un objet avec le contenu
                  contentObject = { value: comp.content };
                }
              } catch (e) {
                console.log(`Erreur de parsing JSON pour le composant ${i+1}, création d'un objet vide:`, e);
                contentObject = { value: comp.content || '' };
              }
            } else if (typeof comp.content === 'object' && comp.content !== null) {
              // Si c'est déjà un objet, on l'utilise directement
              contentObject = comp.content;
            }
            
            // Convertir l'objet en chaîne JSON pour stockage
            contentToStore = JSON.stringify(contentObject);
          }
          
          // Insère le composant
          await db.insert(panelComponents).values({
            panelId: newPanel.id,
            type: comp.type,
            order: comp.order !== undefined ? comp.order : i,
            title: comp.title || null,
            description: comp.description || null,
            isVisible: comp.isVisible !== undefined ? comp.isVisible : true,
            content: contentToStore // Utiliser le contenu correctement formaté
          });
        }
      }
      
      // Récupérer le panel complet avec ses composants
      const fullPanel = {
        ...newPanel,
        components: components || []
      };
      
      res.status(201).json(fullPanel);
    } catch (error) {
      console.error("Erreur lors de la création du panel:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/panels/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Si l'ID est undefined ou new, on redirige vers POST
      if (id === 'undefined' || id === 'new') {
        return res.status(400).json({ error: "Utilisez la route POST pour créer un nouveau panel" });
      }
      
      const panelId = parseInt(id);
      if (isNaN(panelId)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      // Vérifier si le panel existe
      const [existingPanel] = await db.select().from(panels).where(eq(panels.id, panelId));
      if (!existingPanel) {
        return res.status(404).json({ error: "Panel non trouvé" });
      }
      
      const { title, theme, customTheme, isPublished, components = [] } = req.body;
      
      // Mettre à jour le panel
      const [updatedPanel] = await db.update(panels)
        .set({
          title: title || existingPanel.title,
          theme: theme || existingPanel.theme,
          customTheme: customTheme ? JSON.stringify(customTheme) : existingPanel.customTheme,
          isPublished: isPublished !== undefined ? isPublished : existingPanel.isPublished,
          updatedAt: new Date()
        })
        .where(eq(panels.id, panelId))
        .returning();
      
      // Si des composants sont fournis, les mettre à jour
      if (components && components.length > 0) {
        // Supprimer les anciens composants
        await db.delete(panelComponents).where(eq(panelComponents.panelId, panelId));
        
        // Ajouter les nouveaux composants
        for (let i = 0; i < components.length; i++) {
          const comp = components[i];
          // Prépare le contenu pour l'enregistrement selon le type
          let contentToStore = '';
          
          // Pour les composants de type texte, on conserve le contenu textuel brut
          if (comp.type === 'text') {
            // Pour les textes, on stocke le contenu brut tel quel (sans conversion JSON)
            contentToStore = comp.content || '';
          } else {
            // Pour tous les autres types de composants, on s'assure d'avoir un JSON valide
            let contentObject = {};
            
            // Si le contenu est déjà une chaîne JSON, on essaie de la parser
            if (typeof comp.content === 'string') {
              try {
                // Vérifions si c'est déjà un JSON valide
                if (comp.content.trim().startsWith('{') || comp.content.trim().startsWith('[')) {
                  contentObject = JSON.parse(comp.content);
                } else {
                  // Si ce n'est pas du JSON formaté, on crée un objet avec le contenu
                  contentObject = { value: comp.content };
                }
              } catch (e) {
                console.log(`Erreur de parsing JSON pour le composant ${i+1}, création d'un objet vide:`, e);
                contentObject = { value: comp.content || '' };
              }
            } else if (typeof comp.content === 'object' && comp.content !== null) {
              // Si c'est déjà un objet, on l'utilise directement
              contentObject = comp.content;
            }
            
            // Convertir l'objet en chaîne JSON pour stockage
            contentToStore = JSON.stringify(contentObject);
          }

          await db.insert(panelComponents).values({
            panelId: panelId,
            type: comp.type,
            order: comp.order !== undefined ? comp.order : i,
            title: comp.title || null,
            description: comp.description || null,
            isVisible: comp.isVisible !== undefined ? comp.isVisible : true,
            content: contentToStore
          });
        }
      }
      
      // Récupérer le panel complet mis à jour
      const fullPanel = {
        ...updatedPanel,
        components: components
      };
      
      res.json(fullPanel);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du panel:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/panels/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      // Vérifier si le panel existe
      const [existingPanel] = await db.select().from(panels).where(eq(panels.id, id));
      if (!existingPanel) {
        return res.status(404).json({ error: "Panel non trouvé" });
      }
      
      // Supprimer d'abord les composants associés au panel
      await db.delete(panelComponents).where(eq(panelComponents.panelId, id));
      
      // Ensuite supprimer le panel lui-même
      await db.delete(panels).where(eq(panels.id, id));
      
      res.status(200).json({ success: true, message: "Panel supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du panel:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Route pour l'upload de fichiers
  app.post("/api/upload", (req: Request, res: Response) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        return handleUploadErrors(err, req, res, () => {});
      }
      uploadFileHandler(req, res);
    });
  });

  // Route API simple pour vérifier que tout fonctionne
  app.get("/api", (_req: Request, res: Response) => {
    res.json({ 
      message: "API de Grille Chimérique fonctionnelle",
      endpoints: [
        "/api/chimeras",
        "/api/editorials",
        "/api/grid-config",
        "/api/panels",
        "/api/upload"
      ]
    });
  });

  // ****** ROUTES POUR LES CONTAINERS MUSICAUX ******

  // GET tous les containers musicaux
  app.get("/api/music-containers", async (_req: Request, res: Response) => {
    try {
      const musicContainers = await storage.getAllMusicContainers();
      res.json(musicContainers);
    } catch (error) {
      console.error("Erreur lors de la récupération des containers musicaux:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET un container musical par ID
  app.get("/api/music-containers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const musicContainer = await storage.getMusicContainer(id);
      if (!musicContainer) {
        return res.status(404).json({ error: "Container musical non trouvé" });
      }
      
      res.json(musicContainer);
    } catch (error) {
      console.error("Erreur lors de la récupération du container musical:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer un nouveau container musical
  app.post("/api/music-containers", async (req: Request, res: Response) => {
    try {
      const { title, artist, audioUrl } = req.body;
      
      // Validation basique
      if (!title || !audioUrl) {
        return res.status(400).json({ error: "Le titre et l'URL audio sont requis" });
      }
      
      const musicContainer = await storage.createMusicContainer({
        title,
        artist: artist || null,
        audioUrl,
        chimeraId: null,
        editorialId: null,
        album: null,
        genre: null,
        duration: null,
        coverImageUrl: null,
        autoplay: false,
        proximitySettings: {
          maxDistance: 500,
          falloffCurve: 'smooth' as const,
          minVolume: 0.1
        }
      });
      
      res.json(musicContainer);
    } catch (error) {
      console.error("Erreur lors de la création du container musical:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT modifier un container musical
  app.put("/api/music-containers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const { title, artist, audioUrl, autoplay, loop, isVisible } = req.body;
      
      const musicContainer = await storage.updateMusicContainer(id, {
        title,
        artist,
        audioUrl,
        autoplay,
        loop,
        isVisible
      });
      
      if (!musicContainer) {
        return res.status(404).json({ error: "Container musical non trouvé" });
      }
      
      res.json(musicContainer);
    } catch (error) {
      console.error("Erreur lors de la modification du container musical:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer un container musical
  app.delete("/api/music-containers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const success = await storage.deleteMusicContainer(id);
      if (!success) {
        return res.status(404).json({ error: "Container musical non trouvé" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur lors de la suppression du container musical:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES MODÈLES DE GRILLE ******

  // GET tous les modèles de grille
  app.get("/api/grid-models", async (_req: Request, res: Response) => {
    try {
      const models = await storage.getAllGridModels();
      res.json(models);
    } catch (error) {
      console.error("Erreur lors de la récupération des modèles:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET un modèle de grille par ID
  app.get("/api/grid-models/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const model = await storage.getGridModel(id);
      if (!model) {
        return res.status(404).json({ error: "Modèle non trouvé" });
      }
      
      res.json(model);
    } catch (error) {
      console.error("Erreur lors de la récupération du modèle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer un nouveau modèle de grille
  app.post("/api/grid-models", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGridModelSchema.parse(req.body);
      const model = await storage.createGridModel(validatedData);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la création du modèle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT mettre à jour un modèle de grille
  app.put("/api/grid-models/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const validatedData = insertGridModelSchema.partial().parse(req.body);
      const model = await storage.updateGridModel(id, validatedData);
      
      if (!model) {
        return res.status(404).json({ error: "Modèle non trouvé" });
      }
      
      res.json(model);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la mise à jour du modèle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer un modèle de grille
  app.delete("/api/grid-models/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const success = await storage.deleteGridModel(id);
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du modèle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LA CONFIGURATION GRILLE V3 ******

  // GET configuration pour une page donnée
  app.get("/api/grid-v3-config/:pageName", async (req: Request, res: Response) => {
    try {
      const pageName = req.params.pageName;
      const [config] = await db.select()
        .from(gridV3Configurations)
        .where(eq(gridV3Configurations.pageName, pageName))
        .orderBy(desc(gridV3Configurations.updatedAt))
        .limit(1);
      
      if (config) {
        res.json(config);
      } else {
        res.status(404).json({ error: "Configuration non trouvée" });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST/PUT sauvegarder la configuration pour une page
  app.post("/api/grid-v3-config", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGridV3ConfigurationSchema.parse(req.body);
      
      // Vérifier si une configuration existe déjà pour cette page
      const [existingConfig] = await db.select()
        .from(gridV3Configurations)
        .where(eq(gridV3Configurations.pageName, validatedData.pageName));
      
      if (existingConfig) {
        // Mettre à jour la configuration existante
        const [updatedConfig] = await db.update(gridV3Configurations)
          .set({
            ...validatedData,
            updatedAt: new Date()
          })
          .where(eq(gridV3Configurations.pageName, validatedData.pageName))
          .returning();
        
        res.json(updatedConfig);
      } else {
        // Créer une nouvelle configuration
        const [newConfig] = await db.insert(gridV3Configurations)
          .values(validatedData)
          .returning();
        
        res.status(201).json(newConfig);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la sauvegarde de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES RÈGLES DE DISTRIBUTION ******

  // GET règles de distribution par modèle
  app.get("/api/grid-models/:modelId/distribution-rules", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.modelId);
      if (isNaN(modelId)) {
        return res.status(400).json({ error: "ID de modèle invalide" });
      }
      
      const rules = await storage.getDistributionRulesByModelId(modelId);
      res.json(rules);
    } catch (error) {
      console.error("Erreur lors de la récupération des règles:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer une nouvelle règle de distribution
  app.post("/api/distribution-rules", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDistributionRuleSchema.parse(req.body);
      const rule = await storage.createDistributionRule(validatedData);
      res.status(201).json(rule);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la création de la règle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT mettre à jour une règle de distribution
  app.put("/api/distribution-rules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const validatedData = insertDistributionRuleSchema.partial().parse(req.body);
      const rule = await storage.updateDistributionRule(id, validatedData);
      
      if (!rule) {
        return res.status(404).json({ error: "Règle non trouvée" });
      }
      
      res.json(rule);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la mise à jour de la règle:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES PAGES D'APPLICATION ******

  // GET toutes les pages
  app.get("/api/app-pages", async (_req: Request, res: Response) => {
    try {
      const pages = await storage.getAllAppPages();
      res.json(pages);
    } catch (error) {
      console.error("Erreur lors de la récupération des pages:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer une nouvelle page
  app.post("/api/app-pages", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAppPageSchema.parse(req.body);
      const page = await storage.createAppPage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la création de la page:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES ASSIGNATIONS MODÈLE-PAGE ******

  // GET assignations pour un modèle
  app.get("/api/grid-models/:modelId/page-assignments", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.modelId);
      if (isNaN(modelId)) {
        return res.status(400).json({ error: "ID de modèle invalide" });
      }
      
      const assignments = await storage.getModelPageAssignments(modelId);
      res.json(assignments);
    } catch (error) {
      console.error("Erreur lors de la récupération des assignations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer une assignation modèle-page
  app.post("/api/model-page-assignments", async (req: Request, res: Response) => {
    try {
      const validatedData = insertModelPageAssignmentSchema.parse(req.body);
      const assignment = await storage.createModelPageAssignment(validatedData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Données invalides", 
          details: error.errors 
        });
      }
      console.error("Erreur lors de la création de l'assignation:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer une assignation modèle-page
  app.delete("/api/model-page-assignments/:modelId/:pageId", async (req: Request, res: Response) => {
    try {
      const modelId = parseInt(req.params.modelId);
      const pageId = parseInt(req.params.pageId);
      
      if (isNaN(modelId) || isNaN(pageId)) {
        return res.status(400).json({ error: "IDs invalides" });
      }
      
      const success = await storage.deleteModelPageAssignment(modelId, pageId);
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'assignation:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES CURSEURS V2 ******

  // GET tous les curseurs V2
  app.get("/api/cursors-v2", async (_req: Request, res: Response) => {
    try {
      const cursors = await db.select().from(cursorsV2).orderBy(cursorsV2.priority);
      res.json(cursors);
    } catch (error) {
      console.error("Erreur lors de la récupération des curseurs:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET un curseur V2 par ID
  app.get("/api/cursors-v2/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const [cursor] = await db.select().from(cursorsV2).where(eq(cursorsV2.id, id));
      if (!cursor) {
        return res.status(404).json({ error: "Curseur non trouvé" });
      }
      
      res.json(cursor);
    } catch (error) {
      console.error("Erreur lors de la récupération du curseur:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer un nouveau curseur V2
  app.post("/api/cursors-v2", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCursorV2Schema.parse(req.body);
      const [cursor] = await db.insert(cursorsV2).values(validatedData).returning();
      res.status(201).json(cursor);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la création du curseur:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT modifier un curseur V2
  app.put("/api/cursors-v2/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      console.log("🔧 PUT /api/cursors-v2 - Body reçu:", JSON.stringify(req.body, null, 2));
      
      const validatedData = updateCursorV2Schema.parse(req.body);
      console.log("✅ Données validées:", JSON.stringify(validatedData, null, 2));
      
      const [cursor] = await db.update(cursorsV2)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(cursorsV2.id, id))
        .returning();
      
      if (!cursor) {
        return res.status(404).json({ error: "Curseur non trouvé" });
      }
      
      console.log("✅ Curseur mis à jour:", JSON.stringify(cursor, null, 2));
      res.json(cursor);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("❌ Erreur de validation Zod:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la modification du curseur:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PATCH toggle enabled state d'un curseur V2
  app.patch("/api/cursors-v2/:id/toggle", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      // Get current cursor state
      const [currentCursor] = await db.select().from(cursorsV2).where(eq(cursorsV2.id, id));
      if (!currentCursor) {
        return res.status(404).json({ error: "Curseur non trouvé" });
      }
      
      // Toggle enabled state
      const [cursor] = await db.update(cursorsV2)
        .set({ 
          enabled: !currentCursor.enabled, 
          updatedAt: new Date() 
        })
        .where(eq(cursorsV2.id, id))
        .returning();
      
      res.json(cursor);
    } catch (error) {
      console.error("Erreur lors du toggle du curseur:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer un curseur V2
  app.delete("/api/cursors-v2/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      await db.delete(cursorsV2).where(eq(cursorsV2.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du curseur:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET assignations de curseurs
  app.get("/api/cursor-assignments", async (_req: Request, res: Response) => {
    try {
      const assignments = await db.select().from(cursorAssignments)
        .innerJoin(cursorsV2, eq(cursorAssignments.cursorId, cursorsV2.id))
        .orderBy(cursorAssignments.priority);
      res.json(assignments);
    } catch (error) {
      console.error("Erreur lors de la récupération des assignations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer une assignation de curseur
  app.post("/api/cursor-assignments", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCursorAssignmentSchema.parse(req.body);
      
      // Vérifier les conflits d'assignation
      const existing = await db.select().from(cursorAssignments)
        .where(and(
          eq(cursorAssignments.contextType, validatedData.contextType),
          eq(cursorAssignments.contextValue, validatedData.contextValue),
          eq(cursorAssignments.isActive, true)
        ));
      
      if (existing.length > 0) {
        return res.status(409).json({ error: "Conflit d'assignation - Un curseur est déjà assigné à ce contexte" });
      }
      
      const [assignment] = await db.insert(cursorAssignments).values(validatedData).returning();
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la création de l'assignation:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET paramètres de taille des curseurs
  app.get("/api/cursor-sizes", async (req: Request, res: Response) => {
    try {
      const { cursorId } = req.query;
      
      if (cursorId) {
        const sizes = await db.select().from(cursorSizes)
          .innerJoin(cursorsV2, eq(cursorSizes.cursorId, cursorsV2.id))
          .where(eq(cursorSizes.cursorId, parseInt(cursorId as string)));
        res.json(sizes);
      } else {
        const sizes = await db.select().from(cursorSizes)
          .innerJoin(cursorsV2, eq(cursorSizes.cursorId, cursorsV2.id));
        res.json(sizes);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des tailles:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer paramètres de taille
  app.post("/api/cursor-sizes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCursorSizeSchema.parse(req.body);
      const [size] = await db.insert(cursorSizes).values(validatedData).returning();
      res.status(201).json(size);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la création des paramètres de taille:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer paramètres de taille pour un curseur
  app.delete("/api/cursor-sizes", async (req: Request, res: Response) => {
    try {
      const { cursorId } = req.query;
      if (cursorId) {
        await db.delete(cursorSizes).where(eq(cursorSizes.cursorId, parseInt(cursorId as string)));
        res.status(204).send();
      } else {
        res.status(400).json({ error: "ID du curseur requis" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des paramètres:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST initialiser la base de données des curseurs V2 avec les assets existants
  app.post("/api/cursors-v2/initialize", async (_req: Request, res: Response) => {
    try {
      const initialCursors = [
        // Famille INTERACTION_HOVER
        { name: "Cursor Adopt", filename: "cursor-adopt.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-adopt.svg", family: "INTERACTION_HOVER", type: "ADOPT", enabled: true, priority: 1, description: "Curseur pour interactions d'adoption" },
        { name: "Cursor Meet", filename: "cursor-meet.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-meet.svg", family: "INTERACTION_HOVER", type: "FREE", enabled: true, priority: 2, description: "Curseur pour interactions de rencontre" },
        { name: "Cursor Knok", filename: "cursor-knok.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-knok.svg", family: "INTERACTION_HOVER", type: "A_ADOPTER", enabled: true, priority: 3, description: "Curseur pour interactions knok" },
        
        // Famille FUNCTIONAL_ZONES
        { name: "Cursor Panel", filename: "cursor-panel.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-panel.svg", family: "FUNCTIONAL_ZONES", type: "PANEL", enabled: true, priority: 4, description: "Curseur pour ouverture de panels" },
        { name: "Cursor Panel 2", filename: "cursor-panel2.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-panel2.svg", family: "FUNCTIONAL_ZONES", type: "PANEL", enabled: false, priority: 5, description: "Curseur panel alternatif" },
        { name: "Cursor Info", filename: "cursor-info.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-info.svg", family: "FUNCTIONAL_ZONES", type: "INFO", enabled: true, priority: 6, description: "Curseur d'information contextuelle" },
        { name: "Cursor Close", filename: "cursor-close.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-close.svg", family: "FUNCTIONAL_ZONES", type: "NAVIGATION", enabled: true, priority: 7, description: "Curseur de fermeture" },
        
        // Famille GRAB_GENERAL
        { name: "Cursor Grab", filename: "cursor-grab.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-grab.svg", family: "GRAB_GENERAL", type: "GRAB", enabled: true, priority: 8, description: "Curseur de manipulation général" },
        { name: "Cursor Bring", filename: "cursor-bring.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-bring.svg", family: "GRAB_GENERAL", type: "GRAB", enabled: false, priority: 9, description: "Curseur de récupération" },
        { name: "Cursor Scale", filename: "cursor-scale.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-scale.svg", family: "GRAB_GENERAL", type: "GRAB", enabled: true, priority: 10, description: "Curseur de redimensionnement" },
        
        // Famille PILL_BUTTONS
        { name: "Pill Adopt", filename: "cursor-pill-adopt.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-pill-adopt.svg", family: "PILL_BUTTONS", type: "PILL", enabled: true, priority: 11, description: "Bouton pill adoption" },
        { name: "Pill Meet", filename: "cursor-pill-meet.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-pill-meet.svg", family: "PILL_BUTTONS", type: "PILL", enabled: true, priority: 12, description: "Bouton pill rencontre" },
        { name: "Pill Knok", filename: "cursor-pill-knok.svg", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/cursor-pill-knok.svg", family: "PILL_BUTTONS", type: "PILL", enabled: true, priority: 13, description: "Bouton pill knok" },
        { name: "Knok Animé", filename: "KNOK-KNOK.gif", assetPath: "/@fs/home/runner/workspace/attached_assets/Yhom_PictosMarket/KNOK-KNOK.gif", family: "PILL_BUTTONS", type: "PILL", enabled: true, priority: 14, description: "Animation knok pour boutons pill" },
        
        // Famille ADMIN_INTERFACE
        { name: "Admin Cursor", filename: "cursor-admin.svg", assetPath: "/src/assets/cursors/cursor-admin.svg", family: "ADMIN_INTERFACE", type: "ADMIN", enabled: true, priority: 1, description: "Curseur pour les interfaces d'administration" }
      ];
      
      const insertedCursors = [];
      for (const cursorData of initialCursors) {
        const validatedData = insertCursorV2Schema.parse(cursorData);
        const [cursor] = await db.insert(cursorsV2).values(validatedData).returning();
        insertedCursors.push(cursor);
      }
      
      res.status(201).json({ 
        message: "Base de données des curseurs V2 initialisée", 
        cursors: insertedCursors,
        count: insertedCursors.length 
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation des curseurs:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES TYPES DE CONTAINERS DE BASE ******

  // GET tous les types de containers
  app.get("/api/container-types", async (_req: Request, res: Response) => {
    try {
      const types = await db.select().from(containerTypes)
        .orderBy(containerTypes.name);
      res.json(types);
    } catch (error) {
      console.error("Erreur lors de la récupération des types:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET un type de container spécifique
  app.get("/api/container-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const [type] = await db.select().from(containerTypes)
        .where(eq(containerTypes.id, id));
      
      if (!type) {
        return res.status(404).json({ error: "Type non trouvé" });
      }
      
      res.json(type);
    } catch (error) {
      console.error("Erreur lors de la récupération du type:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer un nouveau type de container
  app.post("/api/container-types", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContainerTypeSchema.parse(req.body);
      
      const [newType] = await db.insert(containerTypes)
        .values(validatedData)
        .returning();
      
      res.status(201).json(newType);
    } catch (error) {
      console.error("Erreur lors de la création du type:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT mettre à jour un type de container
  app.put("/api/container-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const validatedData = insertContainerTypeSchema.parse(req.body);
      
      const [updatedType] = await db.update(containerTypes)
        .set(validatedData)
        .where(eq(containerTypes.id, id))
        .returning();
      
      if (!updatedType) {
        return res.status(404).json({ error: "Type non trouvé" });
      }
      
      res.json(updatedType);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du type:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer un type de container
  app.delete("/api/container-types/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      await db.delete(containerTypes)
        .where(eq(containerTypes.id, id));
      
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du type:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST initialiser les types de containers de base
  app.post("/api/container-types/init", async (_req: Request, res: Response) => {
    try {
      // Vérifier si des types existent déjà
      const existing = await db.select().from(containerTypes).limit(1);
      if (existing.length > 0) {
        return res.json({ message: "Types déjà initialisés", count: existing.length });
      }

      // Créer les 4 types de base
      const baseTypes = [
        {
          name: 'OneOne_up',
          displayName: 'Extension vers le haut',
          description: 'Container qui s\'étend d\'une cellule vers le haut',
          expansionBehavior: 'up',
          baseWidth: 1,
          baseHeight: 1,
          expandedWidth: 1,
          expandedHeight: 2,
          hasGrabZone: true,
          hasClickZone: true,
          defaultCursorType: 'grab',
          isActive: true
        },
        {
          name: 'OneOne_dwn',
          displayName: 'Extension vers le bas',
          description: 'Container qui s\'étend d\'une cellule vers le bas',
          expansionBehavior: 'down',
          baseWidth: 1,
          baseHeight: 1,
          expandedWidth: 1,
          expandedHeight: 2,
          hasGrabZone: true,
          hasClickZone: true,
          defaultCursorType: 'grab',
          isActive: true
        },
        {
          name: 'OneHalf_dwn',
          displayName: 'Extension partielle vers le bas',
          description: 'Container qui s\'étend partiellement vers le bas',
          expansionBehavior: 'half_down',
          baseWidth: 1,
          baseHeight: 1,
          expandedWidth: 1,
          expandedHeight: 1.5,
          hasGrabZone: true,
          hasClickZone: true,
          defaultCursorType: 'grab',
          isActive: true
        },
        {
          name: 'One',
          displayName: 'Taille fixe',
          description: 'Container de taille fixe sans extension',
          expansionBehavior: 'none',
          baseWidth: 1,
          baseHeight: 1,
          expandedWidth: null,
          expandedHeight: null,
          hasGrabZone: true,
          hasClickZone: true,
          defaultCursorType: 'grab',
          isActive: true
        }
      ];

      const created = await db.insert(containerTypes)
        .values(baseTypes)
        .returning();

      res.json({ message: "Types de containers initialisés", types: created });
    } catch (error) {
      console.error("Erreur lors de l'initialisation:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES CONFIGURATIONS DE CONTAINERS V3 ******

  // GET toutes les configurations de containers
  app.get("/api/container-layer-configurations", async (_req: Request, res: Response) => {
    try {
      const configurations = await db.select().from(containerLayerConfigurations)
        .orderBy(desc(containerLayerConfigurations.updatedAt));
      res.json(configurations);
    } catch (error) {
      console.error("Erreur lors de la récupération des configurations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET une configuration spécifique
  app.get("/api/container-layer-configurations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const [configuration] = await db.select().from(containerLayerConfigurations)
        .where(eq(containerLayerConfigurations.id, id));
      
      if (!configuration) {
        return res.status(404).json({ error: "Configuration non trouvée" });
      }
      
      // Récupérer les zones d'interaction associées
      const zones = await db.select().from(interactionZones)
        .where(eq(interactionZones.configurationId, id));
      
      res.json({ ...configuration, interactionZones: zones });
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer une nouvelle configuration
  app.post("/api/container-layer-configurations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertContainerLayerConfigurationSchema.parse(req.body);
      
      const [configuration] = await db.insert(containerLayerConfigurations)
        .values(validatedData)
        .returning();
      
      res.status(201).json(configuration);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la création de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT modifier une configuration
  app.put("/api/container-layer-configurations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      const validatedData = insertContainerLayerConfigurationSchema.parse(req.body);
      
      const [configuration] = await db.update(containerLayerConfigurations)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(containerLayerConfigurations.id, id))
        .returning();
      
      if (!configuration) {
        return res.status(404).json({ error: "Configuration non trouvée" });
      }
      
      res.json(configuration);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la modification de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer une configuration
  app.delete("/api/container-layer-configurations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }
      
      // Supprimer d'abord les zones d'interaction associées
      await db.delete(interactionZones).where(eq(interactionZones.configurationId, id));
      
      // Puis supprimer la configuration
      await db.delete(containerLayerConfigurations).where(eq(containerLayerConfigurations.id, id));
      
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression de la configuration:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES ZONES D'INTERACTION ******

  // POST sauvegarder les zones d'interaction pour une configuration
  app.post("/api/container-layer-configurations/:id/interaction-zones", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.id);
      if (isNaN(configId)) {
        return res.status(400).json({ error: "ID de configuration invalide" });
      }
      
      const { actionName, containerState, zones } = req.body;
      
      // Supprimer les zones existantes pour cette action/état
      await db.delete(interactionZones)
        .where(and(
          eq(interactionZones.configurationId, configId),
          eq(interactionZones.actionName, actionName),
          eq(interactionZones.containerState, containerState)
        ));
      
      // Insérer les nouvelles zones
      const [savedZones] = await db.insert(interactionZones)
        .values({
          configurationId: configId,
          actionName,
          containerState,
          zones,
          isActive: true
        })
        .returning();
      
      res.status(201).json(savedZones);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des zones:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET zones d'interaction pour une configuration
  app.get("/api/container-layer-configurations/:id/interaction-zones", async (req: Request, res: Response) => {
    try {
      const configId = parseInt(req.params.id);
      if (isNaN(configId)) {
        return res.status(400).json({ error: "ID de configuration invalide" });
      }
      
      const zones = await db.select().from(interactionZones)
        .where(eq(interactionZones.configurationId, configId));
      
      res.json(zones);
    } catch (error) {
      console.error("Erreur lors de la récupération des zones:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Route pour créer automatiquement les paramètres par défaut pour tous les curseurs
  app.post('/api/cursor-sizes/auto-create-defaults', async (_req, res) => {
    try {
      console.log("🔧 Creating default parameters for all cursors...");
      
      // Récupérer tous les curseurs
      const cursors = await db.select().from(cursorsV2);
      console.log(`Found ${cursors.length} cursors`);
      
      // Récupérer tous les paramètres existants
      const existingSizes = await db.select().from(cursorSizes);
      const existingCursorIds = new Set(existingSizes.map(s => s.cursorId));
      
      // Curseurs sans paramètres
      const cursorsWithoutParams = cursors.filter(cursor => !existingCursorIds.has(cursor.id));
      console.log(`Found ${cursorsWithoutParams.length} cursors without parameters`);
      
      const createdParams = [];
      
      for (const cursor of cursorsWithoutParams) {
        // Créer les paramètres pour les 3 types d'appareils
        const deviceTypes = ['DESKTOP', 'TABLET', 'SMARTPHONE'] as const;
        
        for (const deviceType of deviceTypes) {
          const standardSize = deviceType === 'DESKTOP' ? 32 : deviceType === 'TABLET' ? 28 : 24;
          
          const [newParam] = await db.insert(cursorSizes).values({
            cursorId: cursor.id,
            deviceType,
            resolutionCategory: 'STANDARD',
            standardSize,
            scale: 100,
            offsetX: 0,
            offsetY: 0,
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }).returning();
          
          createdParams.push(newParam);
        }
        
        console.log(`✅ Created default parameters for cursor: ${cursor.name} (ID: ${cursor.id})`);
      }
      
      res.json({
        message: `Created default parameters for ${cursorsWithoutParams.length} cursors`,
        createdCount: createdParams.length,
        cursorsProcessed: cursorsWithoutParams.map(c => ({ id: c.id, name: c.name }))
      });
      
    } catch (error) {
      console.error("❌ Error creating default cursor parameters:", error);
      res.status(500).json({ error: "Failed to create default parameters" });
    }
  });

  // ****** ROUTES POUR LA CONFIGURATION DU MENU ROUE ******

  // Récupérer la configuration active du menu roue
  app.get("/api/menu-roue-config", async (_req: Request, res: Response) => {
    try {
      const configs = await db
        .select()
        .from(menuRoueConfigurations)
        .where(eq(menuRoueConfigurations.isActive, true))
        .orderBy(desc(menuRoueConfigurations.updatedAt))
        .limit(1);

      if (configs.length === 0) {
        // Retourner une configuration par défaut si aucune n'existe
        const defaultConfig = {
          id: 0,
          name: "Default Configuration",
          displayMode: "full",
          buttonPosition: "bottom-right",
          sections: {},
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        res.json(defaultConfig);
      } else {
        res.json(configs[0]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration du menu roue:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la configuration" });
    }
  });

  // Sauvegarder ou mettre à jour la configuration du menu roue
  app.post("/api/menu-roue-config", async (req: Request, res: Response) => {
    try {
      const validatedData = insertMenuRoueConfigurationSchema.parse(req.body);

      // Désactiver toutes les configurations existantes
      await db
        .update(menuRoueConfigurations)
        .set({ isActive: false })
        .where(eq(menuRoueConfigurations.isActive, true));

      // Créer la nouvelle configuration active
      const [newConfig] = await db
        .insert(menuRoueConfigurations)
        .values({ ...validatedData, isActive: true })
        .returning();

      console.log("✅ Configuration du menu roue sauvegardée:", newConfig.name);
      res.json(newConfig);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Données invalides", details: error.errors });
      } else {
        console.error("Erreur lors de la sauvegarde de la configuration du menu roue:", error);
        res.status(500).json({ error: "Erreur lors de la sauvegarde" });
      }
    }
  });

  // Récupérer toutes les configurations du menu roue
  app.get("/api/menu-roue-configs", async (_req: Request, res: Response) => {
    try {
      const configs = await db
        .select()
        .from(menuRoueConfigurations)
        .orderBy(desc(menuRoueConfigurations.updatedAt));

      res.json(configs);
    } catch (error) {
      console.error("Erreur lors de la récupération des configurations:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des configurations" });
    }
  });

  // ****** ROUTES POUR LA CONFIGURATION DES HEADERS ******

  // GET toutes les configurations de headers
  app.get("/api/header-configs", async (_req: Request, res: Response) => {
    try {
      const configs = await db.select().from(headerConfigs).orderBy(headerConfigs.pagePath);
      res.json(configs);
    } catch (error) {
      console.error("Erreur lors de la récupération des configs headers:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET configuration header pour une page spécifique
  app.get("/api/header-configs/:pagePath", async (req: Request, res: Response) => {
    try {
      const pagePath = decodeURIComponent(req.params.pagePath);
      const [config] = await db.select().from(headerConfigs)
        .where(eq(headerConfigs.pagePath, pagePath));
      
      if (!config) {
        return res.status(404).json({ error: "Configuration non trouvée" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Erreur lors de la récupération de la config header:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer ou mettre à jour une configuration header
  app.post("/api/header-configs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertHeaderConfigSchema.parse(req.body);
      
      // Vérifier si la configuration existe déjà
      const [existing] = await db.select().from(headerConfigs)
        .where(eq(headerConfigs.pagePath, validatedData.pagePath));
      
      if (existing) {
        // Mettre à jour
        const [config] = await db.update(headerConfigs)
          .set({ ...validatedData, updatedAt: new Date() })
          .where(eq(headerConfigs.pagePath, validatedData.pagePath))
          .returning();
        res.json(config);
      } else {
        // Créer
        const [config] = await db.insert(headerConfigs)
          .values(validatedData)
          .returning();
        res.status(201).json(config);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la sauvegarde de la config header:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES TEMPLATES DE LAYOUT ******

  // GET tous les templates de layout
  app.get("/api/layout-templates", async (_req: Request, res: Response) => {
    try {
      const templates = await db.select().from(layoutTemplates)
        .where(eq(layoutTemplates.isActive, true))
        .orderBy(layoutTemplates.columns, layoutTemplates.layoutId);
      res.json(templates);
    } catch (error) {
      console.error("Erreur lors de la récupération des templates:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST initialiser les templates de layout par défaut
  app.post("/api/layout-templates/initialize", async (_req: Request, res: Response) => {
    try {
      const { DEFAULT_LAYOUTS } = await import("@shared/schema");
      
      const insertedTemplates = [];
      for (const templateData of DEFAULT_LAYOUTS) {
        const [template] = await db.insert(layoutTemplates)
          .values(templateData)
          .onConflictDoNothing()
          .returning();
        if (template) insertedTemplates.push(template);
      }
      
      res.status(201).json({ 
        message: "Templates de layout initialisés", 
        templates: insertedTemplates,
        count: insertedTemplates.length 
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation des templates:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES PAGES ADMIN ******

  // GET toutes les pages admin
  app.get("/api/admin-pages", async (_req: Request, res: Response) => {
    try {
      const pages = await db.select().from(adminPages)
        .leftJoin(headerConfigs, eq(adminPages.headerConfigId, headerConfigs.id))
        .orderBy(adminPages.category, adminPages.name);
      res.json(pages);
    } catch (error) {
      console.error("Erreur lors de la récupération des pages admin:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer une nouvelle page admin
  app.post("/api/admin-pages", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAdminPageSchema.parse(req.body);
      const [page] = await db.insert(adminPages).values(validatedData).returning();
      res.status(201).json(page);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la création de la page admin:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES STYLES GLOBAUX ******

  // GET tous les styles globaux
  app.get("/api/styles-global", async (req: Request, res: Response) => {
    try {
      const styles = await db.select().from(globalStyles).orderBy(globalStyles.category, globalStyles.name);
      res.json(styles);
    } catch (error) {
      console.error("Erreur lors de la récupération des styles:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // GET styles par catégorie
  app.get("/api/styles-global/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const styles = await db.select().from(globalStyles)
        .where(eq(globalStyles.category, category))
        .orderBy(globalStyles.name);
      res.json(styles);
    } catch (error) {
      console.error("Erreur lors de la récupération des styles par catégorie:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST créer un nouveau style
  app.post("/api/styles-global", async (req: Request, res: Response) => {
    try {
      const validatedData = insertGlobalStyleSchema.parse(req.body);
      const [style] = await db.insert(globalStyles).values(validatedData).returning();
      res.status(201).json(style);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la création du style:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // PUT mettre à jour un style
  app.put("/api/styles-global/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }

      const validatedData = insertGlobalStyleSchema.parse(req.body);
      const [updatedStyle] = await db.update(globalStyles)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(globalStyles.id, id))
        .returning();

      if (!updatedStyle) {
        return res.status(404).json({ error: "Style non trouvé" });
      }

      res.json(updatedStyle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la mise à jour du style:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // DELETE supprimer un style
  app.delete("/api/styles-global/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }

      await db.delete(globalStyles).where(eq(globalStyles.id, id));
      res.status(204).send();
    } catch (error) {
      console.error("Erreur lors de la suppression du style:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST générer les variables CSS depuis les styles
  app.post("/api/styles-global/generate-css", async (req: Request, res: Response) => {
    try {
      const styles = await db.select().from(globalStyles)
        .where(eq(globalStyles.isActive, true))
        .orderBy(globalStyles.category, globalStyles.name);

      let cssContent = ":root {\n";
      styles.forEach(style => {
        cssContent += `  ${style.cssVariable}: ${style.value};\n`;
      });
      cssContent += "}\n";

      res.json({ css: cssContent, stylesCount: styles.length });
    } catch (error) {
      console.error("Erreur lors de la génération CSS:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ****** ROUTES POUR LES CONFIGURATIONS DE TAGS ******

  // GET toutes les configurations de tags
  app.get("/api/tag-configurations", async (_req: Request, res: Response) => {
    try {
      const configs = await db.select().from(tagConfigurations).orderBy(tagConfigurations.category, tagConfigurations.name);
      res.json(configs);
    } catch (error) {
      console.error("Erreur lors de la récupération des configurations de tags:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST sauvegarder les configurations de tags
  app.post("/api/tag-configurations/save", async (req: Request, res: Response) => {
    try {
      const { tags } = req.body;
      
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: "Format de données invalide" });
      }

      const savedTags = [];
      
      for (const tag of tags) {
        const validatedData = insertTagConfigurationSchema.parse(tag);
        
        // Vérifier si le tag existe déjà
        const [existing] = await db.select().from(tagConfigurations)
          .where(eq(tagConfigurations.tagId, validatedData.tagId));
        
        if (existing) {
          // Mettre à jour
          const [updated] = await db.update(tagConfigurations)
            .set({ 
              ...validatedData, 
              updatedAt: new Date() 
            })
            .where(eq(tagConfigurations.tagId, validatedData.tagId))
            .returning();
          savedTags.push(updated);
        } else {
          // Créer nouveau
          const [created] = await db.insert(tagConfigurations)
            .values(validatedData)
            .returning();
          savedTags.push(created);
        }
      }
      
      res.json({ 
        message: "Configurations sauvegardées avec succès",
        tags: savedTags,
        count: savedTags.length
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Données invalides", details: error.errors });
      }
      console.error("Erreur lors de la sauvegarde des configurations:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // POST synchroniser les configurations avec le système par défaut
  app.post("/api/tag-configurations/sync", async (_req: Request, res: Response) => {
    try {
      const { TAG_CONFIGS } = await import("@shared/tags-system");
      
      const syncedTags = [];
      
      for (const [tagId, config] of Object.entries(TAG_CONFIGS)) {
        const tagData = {
          tagId,
          name: config.name,
          color: config.color,
          category: config.category,
          usage: config.usage,
          isActive: config.isActive
        };
        
        const [existing] = await db.select().from(tagConfigurations)
          .where(eq(tagConfigurations.tagId, tagId));
        
        if (existing) {
          // Mettre à jour uniquement les champs par défaut, préserver les personnalisations
          const [updated] = await db.update(tagConfigurations)
            .set({ 
              name: tagData.name,
              usage: tagData.usage,
              updatedAt: new Date() 
            })
            .where(eq(tagConfigurations.tagId, tagId))
            .returning();
          syncedTags.push(updated);
        } else {
          // Créer nouveau
          const [created] = await db.insert(tagConfigurations)
            .values(tagData)
            .returning();
          syncedTags.push(created);
        }
      }
      
      res.json({ 
        message: "Synchronisation terminée",
        tags: syncedTags,
        count: syncedTags.length
      });
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Gestion globale des erreurs
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Erreur non gérée:", err);
    res.status(500).json({ error: "Erreur serveur interne" });
  });

  const httpServer = createServer(app);
  return httpServer;
}

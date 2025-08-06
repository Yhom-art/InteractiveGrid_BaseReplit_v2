import { 
  users, type User, type InsertUser, 
  chimeras, type Chimera, type InsertChimera,
  editorials, type Editorial, type InsertEditorial,
  gridConfig, type GridConfig, type InsertGridConfig,
  musicComponents, type MusicComponent, type InsertMusicComponent,
  gridModels, type GridModel, type InsertGridModel,
  distributionRules, type DistributionRule, type InsertDistributionRule,
  appPages, type AppPage, type InsertAppPage,
  modelPageAssignments, type ModelPageAssignment, type InsertModelPageAssignment
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Gestion des utilisateurs
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Gestion des chimères (fiches fantômes)
  getAllChimeras(): Promise<Chimera[]>;
  getChimera(id: number): Promise<Chimera | undefined>;
  getChimeraByReference(reference: string): Promise<Chimera | undefined>;
  createChimera(chimera: InsertChimera): Promise<Chimera>;
  updateChimera(id: number, chimera: Partial<InsertChimera>): Promise<Chimera | undefined>;
  deleteChimera(id: number): Promise<boolean>;
  
  // Gestion des éléments éditoriaux
  getAllEditorials(): Promise<Editorial[]>;
  getEditorial(id: number): Promise<Editorial | undefined>;
  createEditorial(editorial: InsertEditorial): Promise<Editorial>;
  updateEditorial(id: number, editorial: Partial<InsertEditorial>): Promise<Editorial | undefined>;
  deleteEditorial(id: number): Promise<boolean>;
  
  // Gestion de la configuration de la grille
  getAllGridConfigs(): Promise<GridConfig[]>;
  getGridConfig(id: number): Promise<GridConfig | undefined>;
  createGridConfig(config: InsertGridConfig): Promise<GridConfig>;
  updateGridConfig(id: number, config: Partial<InsertGridConfig>): Promise<GridConfig | undefined>;
  deleteGridConfig(id: number): Promise<boolean>;
  
  // Gestion des containers musicaux
  getAllMusicContainers(): Promise<MusicComponent[]>;
  getMusicContainer(id: number): Promise<MusicComponent | undefined>;
  createMusicContainer(musicContainer: InsertMusicComponent): Promise<MusicComponent>;
  updateMusicContainer(id: number, musicContainer: Partial<InsertMusicComponent>): Promise<MusicComponent | undefined>;
  deleteMusicContainer(id: number): Promise<boolean>;
  
  // Gestion des modèles de grille
  getAllGridModels(): Promise<GridModel[]>;
  getGridModel(id: number): Promise<GridModel | undefined>;
  getGridModelBySlug(slug: string): Promise<GridModel | undefined>;
  createGridModel(model: InsertGridModel): Promise<GridModel>;
  updateGridModel(id: number, model: Partial<InsertGridModel>): Promise<GridModel | undefined>;
  deleteGridModel(id: number): Promise<boolean>;
  
  // Gestion des règles de distribution
  getDistributionRulesByModelId(modelId: number): Promise<DistributionRule[]>;
  getDistributionRule(id: number): Promise<DistributionRule | undefined>;
  createDistributionRule(rule: InsertDistributionRule): Promise<DistributionRule>;
  updateDistributionRule(id: number, rule: Partial<InsertDistributionRule>): Promise<DistributionRule | undefined>;
  deleteDistributionRule(id: number): Promise<boolean>;
  
  // Gestion des pages de l'application
  getAllAppPages(): Promise<AppPage[]>;
  getAppPage(id: number): Promise<AppPage | undefined>;
  getAppPageBySlug(slug: string): Promise<AppPage | undefined>;
  createAppPage(page: InsertAppPage): Promise<AppPage>;
  updateAppPage(id: number, page: Partial<InsertAppPage>): Promise<AppPage | undefined>;
  deleteAppPage(id: number): Promise<boolean>;
  
  // Gestion des assignations modèle-page
  getModelPageAssignments(modelId: number): Promise<ModelPageAssignment[]>;
  getPageModelAssignments(pageId: number): Promise<ModelPageAssignment[]>;
  createModelPageAssignment(assignment: InsertModelPageAssignment): Promise<ModelPageAssignment>;
  deleteModelPageAssignment(modelId: number, pageId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Gestion des utilisateurs
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Gestion des chimères (fiches fantômes)
  async getAllChimeras(): Promise<Chimera[]> {
    return await db.select().from(chimeras);
  }
  
  async getChimera(id: number): Promise<Chimera | undefined> {
    const [chimera] = await db.select().from(chimeras).where(eq(chimeras.id, id));
    return chimera;
  }
  
  async getChimeraByReference(reference: string): Promise<Chimera | undefined> {
    const [chimera] = await db.select().from(chimeras).where(eq(chimeras.reference, reference));
    return chimera;
  }
  
  async createChimera(insertChimera: InsertChimera): Promise<Chimera> {
    const [chimera] = await db.insert(chimeras).values({
      ...insertChimera
    }).returning();
    return chimera;
  }
  
  async updateChimera(id: number, updateData: Partial<InsertChimera>): Promise<Chimera | undefined> {
    // Ne pas mettre à jour les attributs directement s'ils sont présents
    // car ils nécessitent un traitement spécial
    const { attributes, ...otherData } = updateData;
    
    // Récupérer d'abord l'enregistrement existant
    const existingChimera = await this.getChimera(id);
    if (!existingChimera) return undefined;
    
    // Mettre à jour les attributs séparément si nécessaire
    let updatedAttributes = existingChimera.attributes;
    if (attributes) {
      updatedAttributes = attributes as unknown as typeof updatedAttributes;
    }
    
    // Effectuer la mise à jour
    const [updated] = await db.update(chimeras)
      .set({
        ...otherData,
        attributes: updatedAttributes,
        updatedAt: new Date()
      })
      .where(eq(chimeras.id, id))
      .returning();
    return updated;
  }
  
  async deleteChimera(id: number): Promise<boolean> {
    const result = await db.delete(chimeras).where(eq(chimeras.id, id));
    return true; // PostgreSQL ne retourne pas facilement le nombre de lignes supprimées
  }
  
  // Gestion des éléments éditoriaux
  async getAllEditorials(): Promise<Editorial[]> {
    return await db.select().from(editorials);
  }
  
  async getEditorial(id: number): Promise<Editorial | undefined> {
    const [editorial] = await db.select().from(editorials).where(eq(editorials.id, id));
    return editorial;
  }
  
  async createEditorial(insertEditorial: InsertEditorial): Promise<Editorial> {
    const [editorial] = await db.insert(editorials).values(insertEditorial).returning();
    return editorial;
  }
  
  async updateEditorial(id: number, updateData: Partial<InsertEditorial>): Promise<Editorial | undefined> {
    const [updated] = await db.update(editorials)
      .set(updateData)
      .where(eq(editorials.id, id))
      .returning();
    return updated;
  }
  
  async deleteEditorial(id: number): Promise<boolean> {
    const result = await db.delete(editorials).where(eq(editorials.id, id));
    return true;
  }
  
  // Gestion de la configuration de la grille
  async getAllGridConfigs(): Promise<GridConfig[]> {
    return await db.select().from(gridConfig);
  }
  
  async getGridConfig(id: number): Promise<GridConfig | undefined> {
    const [config] = await db.select().from(gridConfig).where(eq(gridConfig.id, id));
    return config;
  }
  
  async createGridConfig(insertConfig: InsertGridConfig): Promise<GridConfig> {
    const [config] = await db.insert(gridConfig).values(insertConfig).returning();
    return config;
  }
  
  async updateGridConfig(id: number, updateData: Partial<InsertGridConfig>): Promise<GridConfig | undefined> {
    const [updated] = await db.update(gridConfig)
      .set(updateData)
      .where(eq(gridConfig.id, id))
      .returning();
    return updated;
  }
  
  async deleteGridConfig(id: number): Promise<boolean> {
    const result = await db.delete(gridConfig).where(eq(gridConfig.id, id));
    return true;
  }

  // Gestion des containers musicaux
  async getAllMusicContainers(): Promise<MusicComponent[]> {
    const containers = await db.select().from(musicComponents);
    return containers;
  }

  async getMusicContainer(id: number): Promise<MusicComponent | undefined> {
    const [container] = await db.select().from(musicComponents).where(eq(musicComponents.id, id));
    return container;
  }

  async createMusicContainer(insertData: InsertMusicComponent): Promise<MusicComponent> {
    const [container] = await db.insert(musicComponents).values(insertData).returning();
    return container;
  }

  async updateMusicContainer(id: number, updateData: Partial<InsertMusicComponent>): Promise<MusicComponent | undefined> {
    const [updated] = await db.update(musicComponents)
      .set(updateData)
      .where(eq(musicComponents.id, id))
      .returning();
    return updated;
  }

  async deleteMusicContainer(id: number): Promise<boolean> {
    const result = await db.delete(musicComponents).where(eq(musicComponents.id, id));
    return true;
  }

  // Gestion des modèles de grille
  async getAllGridModels(): Promise<GridModel[]> {
    const models = await db.select().from(gridModels);
    return models;
  }

  async getGridModel(id: number): Promise<GridModel | undefined> {
    const [model] = await db.select().from(gridModels).where(eq(gridModels.id, id));
    return model;
  }

  async getGridModelBySlug(slug: string): Promise<GridModel | undefined> {
    const [model] = await db.select().from(gridModels).where(eq(gridModels.slug, slug));
    return model;
  }

  async createGridModel(insertData: InsertGridModel): Promise<GridModel> {
    const [model] = await db.insert(gridModels).values(insertData).returning();
    return model;
  }

  async updateGridModel(id: number, updateData: Partial<InsertGridModel>): Promise<GridModel | undefined> {
    const [updated] = await db.update(gridModels)
      .set(updateData)
      .where(eq(gridModels.id, id))
      .returning();
    return updated;
  }

  async deleteGridModel(id: number): Promise<boolean> {
    await db.delete(gridModels).where(eq(gridModels.id, id));
    return true;
  }

  // Gestion des règles de distribution
  async getDistributionRulesByModelId(modelId: number): Promise<DistributionRule[]> {
    const rules = await db.select().from(distributionRules).where(eq(distributionRules.modelId, modelId));
    return rules;
  }

  async getDistributionRule(id: number): Promise<DistributionRule | undefined> {
    const [rule] = await db.select().from(distributionRules).where(eq(distributionRules.id, id));
    return rule;
  }

  async createDistributionRule(insertData: InsertDistributionRule): Promise<DistributionRule> {
    const [rule] = await db.insert(distributionRules).values(insertData).returning();
    return rule;
  }

  async updateDistributionRule(id: number, updateData: Partial<InsertDistributionRule>): Promise<DistributionRule | undefined> {
    const [updated] = await db.update(distributionRules)
      .set(updateData)
      .where(eq(distributionRules.id, id))
      .returning();
    return updated;
  }

  async deleteDistributionRule(id: number): Promise<boolean> {
    await db.delete(distributionRules).where(eq(distributionRules.id, id));
    return true;
  }

  // Gestion des pages de l'application
  async getAllAppPages(): Promise<AppPage[]> {
    const pages = await db.select().from(appPages);
    return pages;
  }

  async getAppPage(id: number): Promise<AppPage | undefined> {
    const [page] = await db.select().from(appPages).where(eq(appPages.id, id));
    return page;
  }

  async getAppPageBySlug(slug: string): Promise<AppPage | undefined> {
    const [page] = await db.select().from(appPages).where(eq(appPages.slug, slug));
    return page;
  }

  async createAppPage(insertData: InsertAppPage): Promise<AppPage> {
    const [page] = await db.insert(appPages).values(insertData).returning();
    return page;
  }

  async updateAppPage(id: number, updateData: Partial<InsertAppPage>): Promise<AppPage | undefined> {
    const [updated] = await db.update(appPages)
      .set(updateData)
      .where(eq(appPages.id, id))
      .returning();
    return updated;
  }

  async deleteAppPage(id: number): Promise<boolean> {
    await db.delete(appPages).where(eq(appPages.id, id));
    return true;
  }

  // Gestion des assignations modèle-page
  async getModelPageAssignments(modelId: number): Promise<ModelPageAssignment[]> {
    const assignments = await db.select().from(modelPageAssignments).where(eq(modelPageAssignments.modelId, modelId));
    return assignments;
  }

  async getPageModelAssignments(pageId: number): Promise<ModelPageAssignment[]> {
    const assignments = await db.select().from(modelPageAssignments).where(eq(modelPageAssignments.pageId, pageId));
    return assignments;
  }

  async createModelPageAssignment(insertData: InsertModelPageAssignment): Promise<ModelPageAssignment> {
    const [assignment] = await db.insert(modelPageAssignments).values(insertData).returning();
    return assignment;
  }

  async deleteModelPageAssignment(modelId: number, pageId: number): Promise<boolean> {
    await db.delete(modelPageAssignments)
      .where(and(eq(modelPageAssignments.modelId, modelId), eq(modelPageAssignments.pageId, pageId)));
    return true;
  }
}

export const storage = new DatabaseStorage();

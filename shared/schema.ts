import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Énumération pour les types de containers
export const containerTypeEnum = pgEnum('container_type', [
  'FREE', 'ADOPT', 'ADOPTED', 'EDITORIAL', 'INACTIVE'
]);

// Énumération pour les niveaux de rareté
export const rarityEnum = pgEnum('rarity', [
  'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Unique'
]);

// Énumération pour les types de composants de panel
export const panelComponentTypeEnum = pgEnum('panel_component_type', [
  'text', 'image', 'button', 'divider',
  'map', 'podcast', 'wallet', 'gallery', 'video', 'audio',
  'form', 'social', 'link'
]);

// Énumération pour les catégories de styles
export const styleCategoryEnum = pgEnum('style_category', [
  'typography', 'colors', 'spacing', 'components', 'icons'
]);

// Tableau principal pour les chimères (fiches fantômes)
export const chimeras = pgTable("chimeras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  reference: text("reference").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  price: text("price").notNull(),
  collection: text("collection").notNull(),
  type: containerTypeEnum("type").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  creator: text("creator").notNull(),
  rarity: rarityEnum("rarity").notNull(),
  attributes: json("attributes").notNull().$type<{ trait_type: string, value: string }[]>(),
  isHidden: boolean("is_hidden").default(false).notNull(),
});

// Tableau pour les éléments éditoriaux (différents des chimères)
export const editorials = pgTable("editorials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  reference: text("reference").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  type: containerTypeEnum("type").notNull(),
  externalUrl: text("external_url"),
  videoUrl: text("video_url"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  creator: text("creator").notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
});

// Tableau pour configurer la grille chimérique
export const gridConfig = pgTable("grid_config", {
  id: serial("id").primaryKey(),
  position: integer("position").notNull(),
  chimeraId: integer("chimera_id").references(() => chimeras.id),
  editorialId: integer("editorial_id").references(() => editorials.id),
  col: integer("col").notNull(),
  row: integer("row").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Table des panels (composés de plusieurs composants)
export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  chimeraId: integer("chimera_id").references(() => chimeras.id),
  editorialId: integer("editorial_id").references(() => editorials.id),
  theme: text("theme").default("light"),
  customTheme: json("custom_theme").$type<{
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  }>().default({}),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des composants de panel
export const panelComponents = pgTable("panel_components", {
  id: serial("id").primaryKey(),
  panelId: integer("panel_id").references(() => panels.id).notNull(),
  type: panelComponentTypeEnum("type").notNull(),
  order: integer("order").notNull(),
  title: text("title"),
  description: text("description"),
  isVisible: boolean("is_visible").default(true).notNull(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des mappers pour les composants spécialisés
export const mapComponents = pgTable("map_components", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id").references(() => panelComponents.id).notNull(),
  lat: text("lat").notNull(),
  lng: text("lng").notNull(),
  zoom: integer("zoom").default(10).notNull(),
  markers: json("markers").$type<{
    id: string;
    lat: number;
    lng: number;
    label?: string;
  }[]>(),
  mapStyle: text("map_style").default("standard"),
  interactive: boolean("interactive").default(true),
});

// Table des composants podcast
export const podcastComponents = pgTable("podcast_components", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id").references(() => panelComponents.id).notNull(),
  audioUrl: text("audio_url").notNull(),
  coverImageUrl: text("cover_image_url"),
  author: text("author"),
  duration: integer("duration"),
  chapters: json("chapters").$type<{
    title: string;
    startTime: number;
  }[]>(),
  transcriptUrl: text("transcript_url"),
});

// Table des composants wallet
export const walletComponents = pgTable("wallet_components", {
  id: serial("id").primaryKey(),
  componentId: integer("component_id").references(() => panelComponents.id).notNull(),
  address: text("address").notNull(),
  network: text("network").notNull(),
  displayBalance: boolean("display_balance").default(true),
  actions: json("actions").$type<{
    type: string;
    enabled: boolean;
  }[]>(),
});

// Table des utilisateurs pour l'administration
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("editor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table des composants musicaux (système audio)
export const musicComponents = pgTable("music_components", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist"),
  audioUrl: text("audio_url").notNull(),
  loop: boolean("loop").default(false).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tables pour le système V3 de grille

// Table des modèles de grille
export const gridModels = pgTable("grid_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  dimensions: json("dimensions").notNull().$type<{ width: number; height: number }>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des règles de distribution
export const distributionRules = pgTable("distribution_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'spiral', 'random-active', 'random-inactive'
  contentTypes: json("content_types").notNull().$type<string[]>(),
  priority: integer("priority").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  description: text("description"),
  maxItems: integer("max_items"),
  config: json("config").notNull().$type<any>(),
  modelId: integer("model_id").references(() => gridModels.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des pages d'application
export const appPages = pgTable("app_pages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table d'assignation modèle-page
export const modelPageAssignments = pgTable("model_page_assignments", {
  id: serial("id").primaryKey(),
  modelId: integer("model_id").references(() => gridModels.id).notNull(),
  pageId: integer("page_id").references(() => appPages.id).notNull(),
  priority: integer("priority").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table des configurations V3 de grille
export const gridV3Configurations = pgTable("grid_v3_configurations", {
  id: serial("id").primaryKey(),
  pageName: text("page_name").notNull().unique(),
  modelId: integer("model_id").references(() => gridModels.id).notNull(),
  settings: json("settings").notNull().$type<any>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tables pour le système de containers et couches V3

// Table des types de containers de base (modèles d'expansion)
export const containerTypes = pgTable("container_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // OneOne_up, OneOne_dwn, OneHalf_dwn, One
  displayName: text("display_name").notNull(),
  description: text("description"),
  expansionBehavior: text("expansion_behavior").notNull(), // up, down, half_down, none
  baseWidth: integer("base_width").default(1).notNull(),
  baseHeight: integer("base_height").default(1).notNull(),
  expandedWidth: integer("expanded_width"),
  expandedHeight: integer("expanded_height"),
  hasGrabZone: boolean("has_grab_zone").default(true).notNull(),
  hasClickZone: boolean("has_click_zone").default(true).notNull(),
  defaultCursorType: text("default_cursor_type").default("grab"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des configurations de containers par couches
export const containerLayerConfigurations = pgTable("container_layer_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  containerType: text("container_type").notNull(),
  baseImageUrl: text("base_image_url").notNull(),
  dimensions: json("dimensions").notNull().$type<{ width: number; height: number }>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des zones d'interaction
export const interactionZones = pgTable("interaction_zones", {
  id: serial("id").primaryKey(),
  configurationId: integer("configuration_id").references(() => containerLayerConfigurations.id).notNull(),
  actionName: text("action_name").notNull(),
  containerState: text("container_state").notNull(),
  zones: json("zones").notNull().$type<any[]>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tables pour le système de curseurs V2

// Table des curseurs V2
export const cursorsV2 = pgTable("cursors_v2", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  assetPath: text("asset_path").notNull(),
  family: text("family").notNull(),
  type: text("type").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  priority: integer("priority").default(1).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Table des assignations de curseurs
export const cursorAssignments = pgTable("cursor_assignments", {
  id: serial("id").primaryKey(),
  cursorId: integer("cursor_id").references(() => cursorsV2.id).notNull(),
  contextType: text("context_type").notNull(),
  contextValue: text("context_value").notNull(),
  priority: integer("priority").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Table des paramètres de taille des curseurs
export const cursorSizes = pgTable("cursor_sizes", {
  id: serial("id").primaryKey(),
  cursorId: integer("cursor_id").references(() => cursorsV2.id).notNull(),
  sizeType: text("size_type").notNull(), // 'default', 'hover', 'active'
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  offsetX: integer("offset_x").default(0).notNull(),
  offsetY: integer("offset_y").default(0).notNull(),
});

// Table des configurations du menu roue
export const menuRoueConfigurations = pgTable("menu_roue_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  config: json("config").notNull().$type<any>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ========== NOUVELLES TABLES POUR LAYOUT ET HEADERS ==========

// Table pour la configuration des headers
export const headerConfigs = pgTable('header_configs', {
  id: serial('id').primaryKey(),
  pagePath: text('page_path').notNull().unique(), // Ex: '/admin/styles-global'
  title: text('title').notNull(),
  filePath: text('file_path'),
  backLink: text('back_link').default('/admin'),
  backLabel: text('back_label').default('Retour Admin'),
  logoText: text('logo_text').default('YHOM'),
  logoSubtext: text('logo_subtext').default('.APP'),
  logoImageUrl: text('logo_image_url'), // URL vers un logo personnalisé
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Table pour les modèles de layout
export const layoutTemplates = pgTable('layout_templates', {
  id: serial('id').primaryKey(),
  layoutId: text('layout_id').notNull().unique(), // '1-3', '2-2', '1-2-1', etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  columns: integer('columns').notNull(),
  distribution: json('distribution').notNull().$type<string[]>(), // ['1fr', '2fr', '1fr']
  useCases: json('use_cases').notNull().$type<string[]>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Table pour les pages admin
export const adminPages = pgTable('admin_pages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // 'creation', 'configuration', 'styles', etc.
  layoutId: text('layout_id').references(() => layoutTemplates.layoutId),
  headerConfigId: integer('header_config_id').references(() => headerConfigs.id),
  componentPath: text('component_path'), // Chemin vers le composant React
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ========== SCHÉMAS D'INSERTION ==========

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertChimeraSchema = createInsertSchema(chimeras).omit({
  id: true,
  timestamp: true,
}).extend({
  name: z.string().min(1, "Le nom est obligatoire"),
  reference: z.string().min(1, "La référence est obligatoire")
});

export const insertEditorialSchema = createInsertSchema(editorials).omit({
  id: true, 
  timestamp: true,
});

export const insertGridConfigSchema = createInsertSchema(gridConfig).omit({
  id: true,
});

export const insertPanelSchema = createInsertSchema(panels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPanelComponentSchema = createInsertSchema(panelComponents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMapComponentSchema = createInsertSchema(mapComponents).omit({
  id: true,
});

export const insertPodcastComponentSchema = createInsertSchema(podcastComponents).omit({
  id: true,
});

export const insertWalletComponentSchema = createInsertSchema(walletComponents).omit({
  id: true,
});

export const insertMusicComponentSchema = createInsertSchema(musicComponents).omit({
  id: true,
  createdAt: true,
});

export const insertContainerTypeSchema = createInsertSchema(containerTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGridModelSchema = createInsertSchema(gridModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDistributionRuleSchema = createInsertSchema(distributionRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppPageSchema = createInsertSchema(appPages).omit({
  id: true,
  createdAt: true,
});

export const insertModelPageAssignmentSchema = createInsertSchema(modelPageAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertGridV3ConfigurationSchema = createInsertSchema(gridV3Configurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContainerLayerConfigurationSchema = createInsertSchema(containerLayerConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInteractionZoneSchema = createInsertSchema(interactionZones).omit({
  id: true,
  createdAt: true,
});

export const insertCursorV2Schema = createInsertSchema(cursorsV2).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCursorV2Schema = createInsertSchema(cursorsV2).omit({
  id: true,
  createdAt: true,
}).partial();

export const insertCursorAssignmentSchema = createInsertSchema(cursorAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertCursorSizeSchema = createInsertSchema(cursorSizes).omit({
  id: true,
});

export const insertMenuRoueConfigurationSchema = createInsertSchema(menuRoueConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Nouveaux schémas pour headers et layouts
export const insertHeaderConfigSchema = createInsertSchema(headerConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLayoutTemplateSchema = createInsertSchema(layoutTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertAdminPageSchema = createInsertSchema(adminPages).omit({
  id: true,
  createdAt: true,
});

// Table pour la gestion des styles globaux
export const globalStyles = pgTable("global_styles", {
  id: serial("id").primaryKey(),
  category: styleCategoryEnum("category").notNull(),
  name: text("name").notNull(), // ex: "primary-color", "heading-font-size"
  value: text("value").notNull(), // ex: "#3b82f6", "2rem"
  cssVariable: text("css_variable").notNull(), // ex: "--color-primary", "--font-size-xl"
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGlobalStyleSchema = createInsertSchema(globalStyles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tableau pour les configurations de tags
export const tagConfigurations = pgTable("tag_configurations", {
  id: serial("id").primaryKey(),
  tagId: text("tag_id").notNull().unique(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  category: text("category").notNull(),
  usage: text("usage").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertTagConfigurationSchema = createInsertSchema(tagConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ========== TYPES TYPESCRIPT ==========

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertChimera = z.infer<typeof insertChimeraSchema>;
export type Chimera = typeof chimeras.$inferSelect;
export type InsertEditorial = z.infer<typeof insertEditorialSchema>;
export type Editorial = typeof editorials.$inferSelect;
export type InsertGridConfig = z.infer<typeof insertGridConfigSchema>;
export type GridConfig = typeof gridConfig.$inferSelect;
export type InsertPanel = z.infer<typeof insertPanelSchema>;
export type Panel = typeof panels.$inferSelect;
export type InsertPanelComponent = z.infer<typeof insertPanelComponentSchema>;
export type PanelComponent = typeof panelComponents.$inferSelect;
export type InsertMapComponent = z.infer<typeof insertMapComponentSchema>;
export type MapComponent = typeof mapComponents.$inferSelect;
export type InsertPodcastComponent = z.infer<typeof insertPodcastComponentSchema>;
export type PodcastComponent = typeof podcastComponents.$inferSelect;
export type InsertWalletComponent = z.infer<typeof insertWalletComponentSchema>;
export type WalletComponent = typeof walletComponents.$inferSelect;
export type InsertMusicComponent = z.infer<typeof insertMusicComponentSchema>;
export type MusicComponent = typeof musicComponents.$inferSelect;
export type InsertGridModel = z.infer<typeof insertGridModelSchema>;
export type GridModel = typeof gridModels.$inferSelect;
export type InsertDistributionRule = z.infer<typeof insertDistributionRuleSchema>;
export type DistributionRule = typeof distributionRules.$inferSelect;
export type InsertAppPage = z.infer<typeof insertAppPageSchema>;
export type AppPage = typeof appPages.$inferSelect;
export type InsertModelPageAssignment = z.infer<typeof insertModelPageAssignmentSchema>;
export type ModelPageAssignment = typeof modelPageAssignments.$inferSelect;
export type InsertGridV3Configuration = z.infer<typeof insertGridV3ConfigurationSchema>;
export type GridV3Configuration = typeof gridV3Configurations.$inferSelect;
export type InsertContainerLayerConfiguration = z.infer<typeof insertContainerLayerConfigurationSchema>;
export type ContainerLayerConfiguration = typeof containerLayerConfigurations.$inferSelect;
export type InsertInteractionZone = z.infer<typeof insertInteractionZoneSchema>;
export type InteractionZone = typeof interactionZones.$inferSelect;
export type InsertCursorV2 = z.infer<typeof insertCursorV2Schema>;
export type UpdateCursorV2 = z.infer<typeof updateCursorV2Schema>;
export type CursorV2 = typeof cursorsV2.$inferSelect;
export type InsertCursorAssignment = z.infer<typeof insertCursorAssignmentSchema>;
export type CursorAssignment = typeof cursorAssignments.$inferSelect;
export type InsertCursorSize = z.infer<typeof insertCursorSizeSchema>;
export type CursorSize = typeof cursorSizes.$inferSelect;
export type InsertMenuRoueConfiguration = z.infer<typeof insertMenuRoueConfigurationSchema>;
export type MenuRoueConfiguration = typeof menuRoueConfigurations.$inferSelect;

// Nouveaux types pour headers et layouts
export type HeaderConfig = typeof headerConfigs.$inferSelect;
export type InsertHeaderConfig = z.infer<typeof insertHeaderConfigSchema>;
export type LayoutTemplate = typeof layoutTemplates.$inferSelect;
export type InsertLayoutTemplate = z.infer<typeof insertLayoutTemplateSchema>;
export type AdminPage = typeof adminPages.$inferSelect;
export type InsertAdminPage = z.infer<typeof insertAdminPageSchema>;
export type GlobalStyle = typeof globalStyles.$inferSelect;
export type InsertGlobalStyle = z.infer<typeof insertGlobalStyleSchema>;
export type TagConfiguration = typeof tagConfigurations.$inferSelect;
export type InsertTagConfiguration = z.infer<typeof insertTagConfigurationSchema>;

// ========== DONNÉES PAR DÉFAUT ==========

export const DEFAULT_HEADER_CONFIG: Omit<InsertHeaderConfig, 'pagePath' | 'title'> = {
  backLink: '/admin',
  backLabel: 'Retour Admin',
  logoText: 'YHOM',
  logoSubtext: '.APP',
};

export const DEFAULT_LAYOUTS: InsertLayoutTemplate[] = [
  {
    layoutId: '1-3',
    name: 'Une colonne principale à droite',
    description: 'Sidebar étroite à gauche, contenu principal large à droite',
    columns: 2,
    distribution: ['1fr', '3fr'],
    useCases: ['Navigation + Contenu', 'Menu + Formulaire principal', 'Filtres + Liste'],
  },
  {
    layoutId: '2-2',
    name: 'Deux colonnes égales',
    description: 'Deux colonnes de même largeur',
    columns: 2,
    distribution: ['1fr', '1fr'],
    useCases: ['Formulaire double', 'Comparaison', 'Avant/Après'],
  },
  {
    layoutId: '1-2-1',
    name: 'Centre élargi avec sidebars',
    description: 'Colonne centrale large encadrée par deux colonnes plus étroites',
    columns: 3,
    distribution: ['1fr', '2fr', '1fr'],
    useCases: ['Dashboard', 'Éditeur avec panels', 'Interface complexe'],
  },
  {
    layoutId: '3-1',
    name: 'Contenu principal à gauche',
    description: 'Contenu principal large à gauche, sidebar à droite',
    columns: 2,
    distribution: ['3fr', '1fr'],
    useCases: ['Article + Sidebar', 'Contenu + Actions', 'Principal + Infos'],
  },
  {
    layoutId: '1-1-1-1',
    name: 'Quatre colonnes égales',
    description: 'Quatre colonnes de même largeur',
    columns: 4,
    distribution: ['1fr', '1fr', '1fr', '1fr'],
    useCases: ['Grille de cartes', 'Comparaison multiple', 'Dashboard stats'],
  },
  {
    layoutId: '2-1-1',
    name: 'Principale + deux secondaires',
    description: 'Colonne principale double largeur, deux colonnes secondaires',
    columns: 3,
    distribution: ['2fr', '1fr', '1fr'],
    useCases: ['Contenu + Actions', 'Principal + Détails', 'Formulaire + Infos'],
  },
  {
    layoutId: '1-1-2',
    name: 'Deux petites + une large',
    description: 'Deux colonnes étroites, une colonne large à droite',
    columns: 3,
    distribution: ['1fr', '1fr', '2fr'],
    useCases: ['Navigation + Filtres + Contenu', 'Double sidebar + Principal'],
  },
  {
    layoutId: 'full-width',
    name: 'Pleine largeur',
    description: 'Une seule colonne sur toute la largeur',
    columns: 1,
    distribution: ['1fr'],
    useCases: ['Contenu simple', 'Formulaire unique', 'Page d\'accueil'],
  },
];
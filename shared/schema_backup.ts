import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

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
  layoutId: text('layout_id').notNull().unique(), // '1-3', '2-2', etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  columns: integer('columns').notNull(),
  distribution: text('distribution').notNull(), // JSON string des proportions
  useCases: text('use_cases').notNull(), // JSON string des cas d'usage
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Table pour les pages créées avec leurs layouts
export const adminPages = pgTable('admin_pages', {
  id: serial('id').primaryKey(),
  path: text('path').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'GRID', 'COMPONENTS', 'CONTENTS', 'SETTINGS'
  layoutId: text('layout_id').notNull(),
  status: text('status').notNull().default('draft'), // 'draft', 'active', 'archived'
  headerConfigId: integer('header_config_id').references(() => headerConfigs.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Schémas Zod pour la validation
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
  updatedAt: true,
});

// Types TypeScript
export type HeaderConfig = typeof headerConfigs.$inferSelect;
export type InsertHeaderConfig = z.infer<typeof insertHeaderConfigSchema>;

export type LayoutTemplate = typeof layoutTemplates.$inferSelect;
export type InsertLayoutTemplate = z.infer<typeof insertLayoutTemplateSchema>;

export type AdminPage = typeof adminPages.$inferSelect;
export type InsertAdminPage = z.infer<typeof insertAdminPageSchema>;

// Configuration par défaut pour les headers
export const DEFAULT_HEADER_CONFIG: Omit<InsertHeaderConfig, 'pagePath' | 'title'> = {
  filePath: undefined,
  backLink: '/admin',
  backLabel: 'Retour Admin',
  logoText: 'YHOM',
  logoSubtext: '.APP',
  logoImageUrl: undefined,
};

// Layouts par défaut à insérer en base
export const DEFAULT_LAYOUTS: InsertLayoutTemplate[] = [
  {
    layoutId: 'full-width',
    name: 'Pleine largeur',
    description: 'Contenu sur toute la largeur, sans colonnes',
    columns: 1,
    distribution: JSON.stringify(['12/12']),
    useCases: JSON.stringify(['Dashboard principal', 'Galeries photos', 'Tableaux larges']),
    isActive: true,
  },
  {
    layoutId: '1-3',
    name: 'Configuration + Principal',
    description: 'Colonne gauche étroite pour configuration, principale large',
    columns: 2,
    distribution: JSON.stringify(['3/12', '9/12']),
    useCases: JSON.stringify(['Pages admin standards', 'Configuration + contenu']),
    isActive: true,
  },
  {
    layoutId: '2-2',
    name: 'Deux colonnes égales',
    description: 'Deux colonnes de même largeur',
    columns: 2,
    distribution: JSON.stringify(['6/12', '6/12']),
    useCases: JSON.stringify(['Comparaisons', 'Configuration + Aperçu']),
    isActive: true,
  },
  {
    layoutId: '1-2-1',
    name: 'Trois colonnes équilibrées',
    description: 'Colonnes latérales fines, centrale large',
    columns: 3,
    distribution: JSON.stringify(['3/12', '6/12', '3/12']),
    useCases: JSON.stringify(['Grid distribution', 'Filtres + contenu + outils']),
    isActive: true,
  },
  {
    layoutId: '1-1-1-1',
    name: 'Quatre colonnes égales',
    description: 'Quatre colonnes de même largeur',
    columns: 4,
    distribution: JSON.stringify(['3/12', '3/12', '3/12', '3/12']),
    useCases: JSON.stringify(['Galeries NFT', 'Grilles de cartes', 'Tableaux détaillés']),
    isActive: true,
  },
];
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configuration de connexion avec retry et timeout
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 secondes de timeout
  max: 10, // nombre max de connexions dans le pool
  idleTimeoutMillis: 30000, // 30 secondes de timeout d'inactivité
});

// Ajouter des logs pour diagnostiquer les problèmes de connexion
pool.on('error', (err) => {
  console.error('Erreur inattendue de la connexion PostgreSQL:', err);
});

// Wrapper avec gestion des erreurs
export const db = drizzle(pool, { schema });
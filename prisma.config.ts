import { config } from "dotenv"
// Next.js utilise .env.local — on charge les deux pour compatibilité
config({ path: ".env.local" })
config({ path: ".env" })
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node node_modules/tsx/dist/cli.mjs prisma/seed.ts",
  },
  datasource: {
    // DIRECT_URL = connexion directe (port 5432) pour les migrations
    // DATABASE_URL = pooler pgbouncer (port 6543) pour l'app runtime
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});

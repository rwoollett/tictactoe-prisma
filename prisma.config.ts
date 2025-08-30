import path from "node:path";
import type { PrismaConfig } from "prisma";
import "dotenv/config";

export default {
  schema: path.join("src/prisma", "schema.prisma"),
  migrations: {
    path: path.join("src/prisma", "migrations"),
    seed: path.join("ts-node ./src/prisma/seed.ts")
  }
} satisfies PrismaConfig;
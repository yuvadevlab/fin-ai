import dotenv from "dotenv";
import path from "node:path";
import { defineConfig } from "prisma/config";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});

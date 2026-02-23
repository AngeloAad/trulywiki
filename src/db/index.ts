import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import "dotenv/config";
import assert from "node:assert";

assert(process.env.DATABASE_URL, "YOU NEED A DATABASE_URL IN YOUR .env file!!");

export const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export default db;

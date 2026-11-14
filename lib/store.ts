import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { DB } from "./types";

/**
 * Stockage du prototype : un fichier JSON local (data/db.json).
 * Cible production : PostgreSQL + pgvector (cf. cahier des charges § 7.1).
 */
const DATA_DIR =
  process.env.CI_DATA_DIR || (process.env.VERCEL ? "/tmp/ci-data" : path.join(process.cwd(), "data"));
const DB_PATH = path.join(DATA_DIR, "db.json");

const empty = (): DB => ({ campaigns: {}, analyses: {}, searches: {}, projects: {} });

let queue: Promise<unknown> = Promise.resolve();

export async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

/** Mutation sérialisée (évite les écritures concurrentes dans le fichier). */
export function mutateDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB();
    const result = await fn(db);
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    const tmp = `${DB_PATH}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DB_PATH);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const newId = (prefix: string) => `${prefix}_${crypto.randomBytes(6).toString("hex")}`;

export const stableId = (prefix: string, key: string) =>
  `${prefix}_${crypto.createHash("sha1").update(key).digest("hex").slice(0, 12)}`;

export const now = () => new Date().toISOString();

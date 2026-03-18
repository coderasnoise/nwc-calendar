import { createClient } from "@supabase/supabase-js";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const TEMP_DIR_PREFIX = "supabase-backup-";
const DEFAULT_BUCKET = "db-backups";
const STORAGE_PREFIX = "database-backups";

function loadEnvFile(filename) {
  const fullPath = path.resolve(process.cwd(), filename);

  try {
    const content = readFileSync(fullPath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = line.slice(0, separatorIndex).trim();
      if (!key || process.env[key]) {
        continue;
      }

      let value = line.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

function loadLocalEnv() {
  loadEnvFile(".env");
  loadEnvFile(".env.local");
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function ensurePgDumpInstalled() {
  const result = spawnSync("pg_dump", ["--version"], { encoding: "utf8" });

  if (result.status !== 0) {
    throw new Error("pg_dump is required but was not found. Install PostgreSQL client tools first.");
  }
}

function timestampParts(date = new Date()) {
  const iso = date.toISOString();
  return {
    year: iso.slice(0, 4),
    month: iso.slice(5, 7),
    stamp: iso.replace(/:/g, "-").replace(/\.\d{3}Z$/, "Z")
  };
}

function runDump(databaseUrl, outputFile) {
  const result = spawnSync(
    "pg_dump",
    ["-Fc", "--file", outputFile, databaseUrl],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  if (result.status !== 0) {
    const details = result.stderr?.trim() || result.stdout?.trim() || "Unknown pg_dump failure.";
    throw new Error(`pg_dump failed: ${details}`);
  }
}

async function uploadDump({ supabaseUrl, serviceRoleKey, bucket, objectPath, localFile }) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const fileBuffer = readFileSync(localFile);

  const { error } = await supabase.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: "application/octet-stream",
    upsert: false
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }
}

async function main() {
  loadLocalEnv();

  const databaseUrl = requiredEnv("SUPABASE_DB_URL");
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.SUPABASE_BACKUP_BUCKET?.trim() || DEFAULT_BUCKET;

  ensurePgDumpInstalled();

  const tempRoot = mkdtempSync(path.join(tmpdir(), TEMP_DIR_PREFIX));
  const { year, month, stamp } = timestampParts();
  const filename = `db-backup-${stamp}.dump`;
  const localFile = path.join(tempRoot, filename);
  const objectPath = `${STORAGE_PREFIX}/${year}/${month}/${filename}`;

  try {
    console.log(`Creating database backup: ${filename}`);
    runDump(databaseUrl, localFile);

    console.log(`Uploading backup to bucket '${bucket}' at '${objectPath}'`);
    await uploadDump({
      supabaseUrl,
      serviceRoleKey,
      bucket,
      objectPath,
      localFile
    });

    console.log("Backup completed successfully.");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Backup failed.";
  console.error(message);
  process.exit(1);
});

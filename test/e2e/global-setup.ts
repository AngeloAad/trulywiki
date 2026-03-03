import { type ChildProcess, execSync, spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

let devServer: ChildProcess | null = null;

function killPort(port: number) {
  try {
    if (process.platform === "win32") {
      const result = execSync(
        `netstat -ano | findstr :${port} | findstr LISTENING`,
        { encoding: "utf-8" },
      );
      const lines = result.trim().split("\n");
      const pids = new Set(
        lines
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((pid): pid is string => !!pid && pid !== "0"),
      );
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
          console.log(`Killed process ${pid} on port ${port}`);
        } catch {
          // already dead
        }
      }
    } else {
      execSync(`lsof -ti:${port} | xargs kill -9`, { stdio: "ignore" });
    }
  } catch {
    // no process on that port
  }
}

async function globalSetup() {
  // Kill anything already on port 3000
  killPort(3000);
  await new Promise((r) => setTimeout(r, 1000));

  console.log("Building Next.js app for E2E tests...");
  await new Promise((resolve, reject) => {
    const build = spawn("bun", ["run", "build"], {
      env: { ...process.env, PLAYWRIGHT: "1" },
      stdio: "inherit",
      shell: true,
    });
    build.on("exit", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`bun run build failed with code ${code}`));
    });
  });

  console.log("Starting production server...");
  devServer = spawn("bun", ["run", "start"], {
    env: { ...process.env, PLAYWRIGHT: "1", PORT: "3000" },
    stdio: "inherit",
    shell: true,
  });

  await waitForServer("http://localhost:3000", 120000);
  console.log("✅ Server is ready");

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL || "");
    console.log(
      "🔁 Syncing articles sequence to MAX(id) to avoid PK collisions...",
    );
    await sql`SELECT setval(pg_get_serial_sequence('articles','id'), COALESCE((SELECT MAX(id) FROM articles), 1), true);`;
    console.log("✅ Sequence sync complete");
  } catch (err) {
    console.warn("⚠️ Failed to sync articles sequence:", err);
  }

  if (devServer.pid) {
    writeFileSync(
      join(process.cwd(), ".test-server-pid.json"),
      JSON.stringify({ pid: devServer.pid }, null, 2),
    );
  }
}

async function waitForServer(url: string, timeout: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404 || response.status === 401) {
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start within ${timeout}ms`);
}

export default globalSetup;
